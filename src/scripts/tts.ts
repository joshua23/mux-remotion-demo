import fs from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';
import type { OutlineCard } from './parse-gamma';

export interface TtsResult {
  mp3Path: string;
  durationMs: number;
}

export interface ManifestEntry {
  index: number;
  mp3: string;
  durationMs: number;
  narration: string;
}

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

function httpsPost(url: string, body: string, headers: Record<string, string>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...headers,
      },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      res.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Build MiniMax T2A v2 payload — voice_id MUST be inside voice_setting
// (top-level voice_id triggers "invalid params, empty field" error 2013)
function buildTtsPayload(text: string): string {
  const audioSetting = Object.fromEntries([
    ['format', 'mp3'],
    ['sample_rate', 32000],
    ['bitrate', 128000],
  ]);
  const voiceSetting = Object.fromEntries([
    ['voice_id', 'male-qn-jingying-jingpin'],
    ['speed', 0.95],
    ['vol', 1.0],
    ['pitch', 0],
  ]);
  const entries: Array<[string, unknown]> = [
    ['model', 'speech-02-hd'],
    ['text', text],
    ['voice_setting', voiceSetting],
    ['audio_setting', audioSetting],
  ];
  return JSON.stringify(Object.fromEntries(entries));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function prop(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];
}

export async function ttsCard(card: OutlineCard, outDir: string): Promise<TtsResult> {
  const apiKey = requireEnv('MINIMAX_API_KEY');
  const groupId = requireEnv('MINIMAX_GROUP_ID');
  const payload = buildTtsPayload(card.narration);
  const url = `https://api.minimax.chat/v1/t2a_v2?GroupId=${groupId}`;
  const responseBuffer = await httpsPost(url, payload, { Authorization: `Bearer ${apiKey}` });

  let resp: Record<string, unknown>;
  try {
    resp = JSON.parse(responseBuffer.toString('utf-8')) as Record<string, unknown>;
  } catch {
    throw new Error(`MiniMax API returned non-JSON: ${responseBuffer.slice(0, 200)}`);
  }

  const baseResp = prop(resp, 'base_resp') as Record<string, unknown> | undefined;
  const statusCode = baseResp ? prop(baseResp, 'status_code') : undefined;
  if (typeof statusCode === 'number' && statusCode !== 0) {
    const statusMsg = baseResp ? prop(baseResp, 'status_msg') : '';
    throw new Error(`MiniMax TTS error ${statusCode}: ${String(statusMsg)}`);
  }

  const dataField = prop(resp, 'data') as Record<string, unknown> | undefined;
  const audio = dataField ? prop(dataField, 'audio') : undefined;
  const audioBase64 = (audio ?? prop(resp, 'audio_file')) as string | undefined;
  if (!audioBase64) throw new Error('MiniMax API response missing audio data');

  await fs.mkdir(outDir, { recursive: true });
  const mp3Name = `card_${String(card.index).padStart(2, '0')}.mp3`;
  const mp3Path = path.join(outDir, mp3Name);
  await fs.writeFile(mp3Path, Buffer.from(audioBase64, 'hex'));

  // Estimate duration: ~155 WPM for Chinese (chars / 2.5 chars per word / 155 WPM * 60000 ms)
  const charCount = card.narration.length;
  const durationMs = Math.round((charCount / 2.5 / 155) * 60000);

  return { mp3Path, durationMs };
}

if (require.main === module) {
  const [, , outlineJson, outDir] = process.argv;
  if (!outlineJson || !outDir) {
    console.error('Usage: tsx tts.ts <outline.json> <outDir>');
    process.exit(1);
  }

  (async () => {
    const cards: OutlineCard[] = JSON.parse(await fs.readFile(outlineJson, 'utf-8'));
    const manifest: ManifestEntry[] = [];

    for (const card of cards) {
      console.log(`  TTS card ${card.index}: ${card.title}`);
      let result: TtsResult;
      try {
        result = await ttsCard(card, outDir);
      } catch (err) {
        console.error(`  ✗ card ${card.index} failed:`, err);
        await sleep(500);
        try {
          result = await ttsCard(card, outDir);
        } catch (err2) {
          console.error(`  ✗ card ${card.index} retry failed, aborting:`, err2);
          process.exit(2);
        }
      }
      manifest.push({
        index: card.index,
        mp3: result.mp3Path,
        durationMs: result.durationMs,
        narration: card.narration,
      });
      await sleep(500);
    }

    const manifestPath = path.join(outDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`✓ Generated ${manifest.length} audio files, manifest at ${manifestPath}`);
  })().catch((err) => {
    console.error(err);
    process.exit(2);
  });
}
