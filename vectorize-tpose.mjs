/**
 * 1) Vectorize T-pose Joshua PNG
 * 2) Inject 14 named keypoint circles for pose-animator's Skeleton constructor
 * 3) Wrap in <g id="illustration"> required by bindSkeleton (line 147 of illustration.js)
 */
import { vectorize, ColorMode, Hierarchical, PathSimplifyMode } from '@neplex/vectorizer';
import { readFile, writeFile } from 'node:fs/promises';

const inputPath = '/tmp/path-b-test/joshua-tpose.png';
const outPath = './src/dalio/lotties/joshua-tpose-rigged.svg';

const png = await readFile(inputPath);
console.log(`Input PNG: ${png.length} bytes (1248×1664)`);

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

const pathCount = (svg.match(/<path/g) || []).length;
console.log(`Vectorized: ${(svg.length / 1024).toFixed(1)} KB / ${pathCount} paths`);

// Approximate keypoint positions (pixel coords, character's perspective:
// "left" = character's left = viewer's RIGHT side)
// Eyeballed from image inspection.
const keypoints = [
  { id: 'nose', cx: 624, cy: 220 },
  { id: 'rightEar', cx: 580, cy: 200 },     // viewer's left
  { id: 'leftEar', cx: 668, cy: 200 },      // viewer's right
  { id: 'rightShoulder', cx: 460, cy: 390 },
  { id: 'leftShoulder', cx: 790, cy: 390 },
  { id: 'rightElbow', cx: 240, cy: 430 },
  { id: 'leftElbow', cx: 1010, cy: 430 },
  { id: 'rightWrist', cx: 70, cy: 440 },
  { id: 'leftWrist', cx: 1180, cy: 440 },
  { id: 'rightHip', cx: 560, cy: 810 },
  { id: 'leftHip', cx: 700, cy: 810 },
  { id: 'rightKnee', cx: 560, cy: 1170 },
  { id: 'leftKnee', cx: 700, cy: 1170 },
  { id: 'rightAnkle', cx: 560, cy: 1530 },
  { id: 'leftAnkle', cx: 700, cy: 1530 },
];

const keypointMarkup = keypoints
  .map((kp) => `  <circle id="${kp.id}" cx="${kp.cx}" cy="${kp.cy}" r="8" fill="#ff0000" opacity="0.0"/>`)
  .join('\n');

// pose-animator's bindSkeleton walks items where parent.name starts with 'illustration'.
// We must wrap the whole vector content in <g id="illustration">.
// Open the existing <svg ...> tag, inject <g id="illustration"> right after, and close before </svg>.
const wrapped = svg
  .replace(/(<svg[^>]*>)/, `$1\n<g id="illustration">\n${keypointMarkup}`)
  .replace(/<\/svg>/, `</g>\n</svg>`);

await writeFile(outPath, wrapped);
console.log(`Wrote ${outPath} (${(wrapped.length / 1024).toFixed(1)} KB) with ${keypoints.length} keypoint markers + illustration wrapper`);
