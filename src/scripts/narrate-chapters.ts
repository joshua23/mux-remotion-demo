/**
 * narrate-chapters.ts — generate narration audio for the 8 story chapters.
 *
 * Reads chapter narration from src/dalio/scenes/chapters.ts, calls MiniMax T2A v2
 * via the existing ttsCard primitive, and writes mp3 + manifest to public/narration/.
 *
 * Output filenames match what DalioStoryTimeline expects: ch1.mp3, ch2.mp3, ...
 *
 * Run: MINIMAX_API_KEY=… MINIMAX_GROUP_ID=… npx tsx src/scripts/narrate-chapters.ts
 */
import fs from 'node:fs/promises';
import path from 'node:path';

import { CHAPTERS } from '../dalio/scenes/chapters';
import { ttsCard } from './tts';

const OUT_DIR = path.join(process.cwd(), 'public', 'narration');

interface ChapterAudioManifest {
  chapterId: string;
  chapterNumber: number;
  title: string;
  mp3: string;
  durationMs: number;
  narration: string;
}

async function main(): Promise<void> {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const manifest: ChapterAudioManifest[] = [];

  for (const chapter of CHAPTERS) {
    process.stdout.write(`  TTS Ch${chapter.chapterNumber} ${chapter.title}: `);
    // ttsCard writes "card_NN.mp3" — we'll rename to "chN.mp3" after.
    const result = await ttsCard(
      {
        index: chapter.chapterNumber,
        title: chapter.title,
        body: '',
        narration: chapter.narration,
        rawHtml: '',
      },
      OUT_DIR
    );

    const finalPath = path.join(OUT_DIR, `${chapter.id}.mp3`);
    await fs.rename(result.mp3Path, finalPath);

    manifest.push({
      chapterId: chapter.id,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      mp3: path.relative(process.cwd(), finalPath),
      durationMs: result.durationMs,
      narration: chapter.narration,
    });

    console.log(`${result.durationMs}ms → ${path.basename(finalPath)}`);
    // Throttle MiniMax API politely
    await new Promise((r) => setTimeout(r, 600));
  }

  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Generated ${manifest.length} narration files`);
  console.log(`  Manifest: ${path.relative(process.cwd(), manifestPath)}`);
  const totalSec = manifest.reduce((s, m) => s + m.durationMs, 0) / 1000;
  console.log(`  Total estimated: ${totalSec.toFixed(1)}s of audio`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
