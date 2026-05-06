/**
 * process-keypose.mjs — minimal pipeline for static key-pose images.
 *
 * Skips the skeleton rigging step (since these images are NOT used with
 * pose-animator's LBS — they're displayed as-is via KeyPoseImage with
 * subtle Remotion motion). Just vectorize + strip background paths.
 *
 * Usage: node scripts/process-keypose.mjs <slug>
 *   <slug>  basename of /tmp/path-b-test/<slug>.png
 *   Output: public/keypose/<slug>.svg
 */
import { vectorize, ColorMode, Hierarchical, PathSimplifyMode } from '@neplex/vectorizer';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/process-keypose.mjs <slug>');
  process.exit(1);
}

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..');
const inputPng = `/tmp/path-b-test/${slug}.png`;
const intermediateSvg = path.join(PROJECT_ROOT, `tmp/${slug}-raw.svg`);
const outputSvg = path.join(PROJECT_ROOT, `public/keypose/${slug}.svg`);

console.log(`[1/2] Vectorize ${slug}.png`);
const png = await readFile(inputPng);
const svg = await vectorize(png, {
  colorMode: ColorMode.Color,
  hierarchical: Hierarchical.Stacked,
  filterSpeckle: 6,
  colorPrecision: 6,
  layerDifference: 16,
  mode: PathSimplifyMode.Spline,
  cornerThreshold: 60,
  lengthThreshold: 4.0,
  maxIterations: 10,
  spliceThreshold: 45,
  pathPrecision: 8,
});
await mkdir(path.dirname(intermediateSvg), { recursive: true });
await writeFile(intermediateSvg, svg);
console.log(`      ${(svg.length / 1024).toFixed(1)} KB / ${(svg.match(/<path/g) || []).length} paths`);

console.log(`[2/2] Strip background`);
await mkdir(path.dirname(outputSvg), { recursive: true });
const result = spawnSync('node', [
  path.join(PROJECT_ROOT, 'scripts/strip-svg-background.mjs'),
  intermediateSvg,
  outputSvg,
], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);

console.log(`\nWrote public/keypose/${slug}.svg`);
