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
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...headers },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export async function ttsCard(card: OutlineCard, outDir: string): Promise<TtsResult> {
  const apiKey = requireEnv('MINIMAX_API_KEY');
  const groupId = requireEnv('MINIMAX_GROUP_ID');

  const payload = JSON.stringify({
    model: 'speech-02-hd',
    text: card.narration,
    voice_id: 'male-qn-jingying-jingpin',
    speed: 0.95,
    audio_setting: { format: 'mp3', sample_rate: 32000, bitrate: 128000 },
  });

  const url = `https://api.minimax.chat/v1/t2a_v2?GroupId=${groupId}`;
  const responseBuffer = await httpsPost(url, payload, { Authorization: `Bearer ${apiKey}` });

  let responseJson: { base_resp?: { status_code?: number; status_msg?: string }; audio_file?: string; data?: { audio?: string } };
  try {
    responseJson = JSON.parse(responseBuffer.toString('utf-8'));
  } catch {
    throw new Error(`MiniMax API returned non-JSON: ${responseBuffer.slice(0, 200)}`);
  }

  if (responseJson.base_resp?.status_code && responseJson.base_resp.status_code !== 0) {
    throw new Error(`MiniMax TTS error ${responseJson.base_resp.status_code}: ${responseJson.base_resp.status_msg}`);
  }

  const audioBase64 = responseJson.data?.audio ?? responseJson.audio_file;
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

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , outlineJson, outDir] = process.argv;
  if (!outlineJson || !outDir) { console.error('Usage: tsx tts.ts <outline.json> <outDir>'); process.exit(1); }

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
        // Retry once
        await new Promise((r) => setTimeout(r, 500));
        try {
          result = await ttsCard(card, outDir);
        } catch (err2) {
          console.error(`  ✗ card ${card.index} retry failed, aborting:`, err2);
          process.exit(2);
        }
      }
      manifest.push({ index: card.index, mp3: result.mp3Path, durationMs: result.durationMs, narration: card.narration });
      await new Promise((r) => setTimeout(r, 500));
    }

    const manifestPath = path.join(outDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`✓ Generated ${manifest.length} audio files, manifest at ${manifestPath}`);
  })().catch((err) => { console.error(err); process.exit(2); });
}
