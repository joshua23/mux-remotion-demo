/**
 * process-character.mjs — full pipeline for a Flux 2 Max T-pose PNG.
 *
 *   1. vectorize PNG → SVG (vtracer)
 *   2. inject 14 body keypoints (assumes T-pose anatomy roughly matches Joshua)
 *   3. inject 73 face keypoints (oval cluster around face center)
 *   4. wrap in <g id="illustration"> + <g id="skeleton"> for pose-animator
 *   5. strip cream-tone + outside-figure paths
 *   6. write final to public/<character>-tpose-clean.svg
 *
 * Usage: node scripts/process-character.mjs <character>
 *   <character>  short slug, e.g. "nana", "yanyan", "long", "guofa", "child"
 * Expects:  /tmp/path-b-test/<character>-tpose.png  (1248×1664)
 *
 * After running, update src/dalio/pose-animator/personas-registry.ts to point
 * the persona's svgPath at staticFile('<character>-tpose-clean.svg').
 *
 * Body & face keypoints assume the same approximate anatomy used for Joshua
 * (head ≈ y 80-300, shoulders ≈ y 390, hips ≈ y 810, ankles ≈ y 1530).
 * If a generated character has very different proportions (e.g. child), edit
 * the body keypoints below or pass --child-scale.
 */
import { vectorize, ColorMode, Hierarchical, PathSimplifyMode } from '@neplex/vectorizer';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const character = process.argv[2];
if (!character) {
  console.error('Usage: node scripts/process-character.mjs <character>');
  process.exit(1);
}

const childScale = process.argv.includes('--child-scale');

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..');
const inputPng = `/tmp/path-b-test/${character}-tpose.png`;
const intermediateSvg = path.join(PROJECT_ROOT, `tmp/${character}-tpose-rigged.svg`);
const outputSvg = path.join(PROJECT_ROOT, `public/${character}-tpose-clean.svg`);

// ────────────────────────────────────────────────────────────────────────────
// Step 1: vectorize PNG
// ────────────────────────────────────────────────────────────────────────────
console.log(`[1/4] Vectorizing ${inputPng}`);
const png = await readFile(inputPng);
console.log(`      Input: ${(png.length / 1024).toFixed(1)} KB`);

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
console.log(`      Vectorized: ${(svg.length / 1024).toFixed(1)} KB / ${pathCount} paths`);

// ────────────────────────────────────────────────────────────────────────────
// Step 2: build keypoints (body + face)
// ────────────────────────────────────────────────────────────────────────────
console.log(`[2/4] Injecting 14 body + 73 face keypoints`);

// Body keypoints — adult T-pose anatomy by default.
// `--child-scale` shrinks Y-axis to roughly 70% to match a smaller body.
const yScale = childScale ? 0.7 : 1.0;
const adjustY = (y) => Math.round(220 + (y - 220) * yScale);

const BODY_KEYPOINTS = [
  ['nose', 624, adjustY(220)],
  ['rightEar', 580, adjustY(200)],
  ['leftEar', 668, adjustY(200)],
  ['rightShoulder', 460, adjustY(390)],
  ['leftShoulder', 790, adjustY(390)],
  ['rightElbow', 240, adjustY(430)],
  ['leftElbow', 1010, adjustY(430)],
  ['rightWrist', 70, adjustY(440)],
  ['leftWrist', 1180, adjustY(440)],
  ['rightHip', 560, adjustY(810)],
  ['leftHip', 700, adjustY(810)],
  ['rightKnee', 560, adjustY(1170)],
  ['leftKnee', 700, adjustY(1170)],
  ['rightAnkle', 560, adjustY(1530)],
  ['leftAnkle', 700, adjustY(1530)],
];

// Face keypoints — same oval cluster recipe as Joshua's auto_rig.py
const FACE_CX = 624;
const FACE_CY = adjustY(220);
const FACE_W = 110;
const FACE_H = 80;

const FACE_LAYOUT = {
  topMid: [0, -FACE_H], rightTop0: [-30, -FACE_H + 5], rightTop1: [-50, -FACE_H + 15],
  leftTop0: [30, -FACE_H + 5], leftTop1: [50, -FACE_H + 15],
  rightJaw0: [-FACE_W + 20, -20], rightJaw1: [-FACE_W + 5, -10],
  rightJaw2: [-FACE_W, 0], rightJaw3: [-FACE_W, 10],
  rightJaw4: [-FACE_W + 5, 20], rightJaw5: [-FACE_W + 15, 35],
  rightJaw6: [-FACE_W + 25, 50], rightJaw7: [-FACE_W + 35, 60],
  jawMid: [0, FACE_H - 10],
  leftJaw7: [FACE_W - 35, 60], leftJaw6: [FACE_W - 25, 50],
  leftJaw5: [FACE_W - 15, 35], leftJaw4: [FACE_W - 5, 20],
  leftJaw3: [FACE_W, 10], leftJaw2: [FACE_W, 0],
  leftJaw1: [FACE_W - 5, -10], leftJaw0: [FACE_W - 20, -20],
  rightBrow0: [-50, -25], rightBrow1: [-40, -28], rightBrow2: [-30, -30],
  rightBrow3: [-20, -28], rightBrow4: [-15, -25],
  leftBrow4: [15, -25], leftBrow3: [20, -28], leftBrow2: [30, -30],
  leftBrow1: [40, -28], leftBrow0: [50, -25],
  nose0: [0, -10], nose1: [0, -5], nose2: [0, 0], nose3: [0, 5],
  rightNose0: [-12, 8], rightNose1: [-8, 12], nose4: [0, 15],
  leftNose1: [8, 12], leftNose0: [12, 8],
  rightEye0: [-50, -10], rightEye1: [-43, -13], rightEye2: [-35, -13],
  rightEye3: [-28, -10], rightEye4: [-35, -7], rightEye5: [-43, -7],
  leftEye3: [28, -10], leftEye2: [35, -13], leftEye1: [43, -13],
  leftEye0: [50, -10], leftEye5: [43, -7], leftEye4: [35, -7],
  rightMouthCorner: [-25, 35],
  rightUpperLipTop0: [-15, 30], rightUpperLipTop1: [-8, 28],
  upperLipTopMid: [0, 28], leftUpperLipTop1: [8, 28],
  leftUpperLipTop0: [15, 30], leftMouthCorner: [25, 35],
  leftLowerLipBottom0: [15, 42], leftLowerLipBottom1: [8, 45],
  lowerLipBottomMid: [0, 45], rightLowerLipBottom1: [-8, 45],
  rightLowerLipBottom0: [-15, 42],
  rightMiddleLip: [-20, 36], rightUpperLipBottom1: [-8, 35],
  upperLipBottomMid: [0, 35], leftUpperLipBottom1: [8, 35],
  leftMiddleLip: [20, 36],
  leftLowerLipTop0: [8, 40], lowerLipTopMid: [0, 40],
  rightLowerLipTop0: [-8, 40],
};

const bodyMarkup = BODY_KEYPOINTS.map(([id, cx, cy]) =>
  `  <circle id="${id}" cx="${cx}" cy="${cy}" r="8" fill="#0000ff" opacity="0"/>`
).join('\n');
const faceMarkup = Object.entries(FACE_LAYOUT).map(([name, [dx, dy]]) =>
  `  <circle id="${name}" cx="${(FACE_CX + dx).toFixed(1)}" cy="${(FACE_CY + dy).toFixed(1)}" r="3" fill="#ff0000" opacity="0"/>`
).join('\n');

// pose-animator wants: <g id="illustration">…paths…</g> + <g id="skeleton">…circles…</g>
const rigged = svg
  .replace(/(<svg[^>]*>)/, `$1\n<g id="illustration">`)
  .replace(/<\/svg>/, `</g>\n<g id="skeleton">\n${bodyMarkup}\n${faceMarkup}\n</g>\n</svg>`);

await mkdir(path.dirname(intermediateSvg), { recursive: true });
await writeFile(intermediateSvg, rigged);
console.log(`      Rigged → ${path.relative(PROJECT_ROOT, intermediateSvg)} (${(rigged.length / 1024).toFixed(1)} KB)`);

// ────────────────────────────────────────────────────────────────────────────
// Step 3: strip background using existing script
// ────────────────────────────────────────────────────────────────────────────
console.log(`[3/4] Stripping background paths`);
const result = spawnSync('node', [
  path.join(PROJECT_ROOT, 'scripts/strip-svg-background.mjs'),
  intermediateSvg,
  outputSvg,
], { stdio: 'inherit' });
if (result.status !== 0) {
  console.error('strip-svg-background.mjs failed');
  process.exit(result.status ?? 1);
}

// ────────────────────────────────────────────────────────────────────────────
// Step 4: report
// ────────────────────────────────────────────────────────────────────────────
console.log(`[4/4] Done.`);
console.log(`\nNext: update personas-registry.ts:`);
console.log(`  ${character}: { svgPath: staticFile('${character}-tpose-clean.svg'), ... }`);
