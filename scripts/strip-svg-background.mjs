/**
 * strip-svg-background.mjs — remove cream/parchment paths from a vtracer SVG
 *
 * vtracer vectorizes EVERY pixel including the paper texture, producing
 * thousands of cream-tone paths. When the SVG is bound to pose-animator's
 * skeleton, these paper paths get LBS-deformed along with the figure,
 * creating visible "background ghost" rectangles around the character
 * during deformed frames.
 *
 * This script strips paths whose fill is paper-colored (high RGB, low
 * saturation, R≥G≥B with small spread) so only the ink paths remain.
 * The figure can then be composited over a clean PaperBackground component.
 *
 * Usage: node scripts/strip-svg-background.mjs <input.svg> <output.svg>
 */
import { readFile, writeFile } from 'node:fs/promises';

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error('Usage: node strip-svg-background.mjs <input.svg> <output.svg>');
  process.exit(1);
}

const svg = await readFile(inPath, 'utf8');

const isCreamFill = (fillHex) => {
  if (!fillHex || fillHex.length !== 7) return false;
  const r = parseInt(fillHex.slice(1, 3), 16);
  const g = parseInt(fillHex.slice(3, 5), 16);
  const b = parseInt(fillHex.slice(5, 7), 16);
  // High overall brightness + warm tone (R ≥ G ≥ B) + low saturation (small R-B spread)
  return r > 200 && g > 180 && b > 160 && r >= g && g >= b && r - b < 80;
};

// Figure bounding box (slightly padded). Anything entirely outside is noise
// (corner specks, edge texture vtracer mistook for content).
const FIG_X_MIN = 60;
const FIG_X_MAX = 1190;
const FIG_Y_MIN = 70;
const FIG_Y_MAX = 1610;

const isOutsideFigure = (transformAttr) => {
  // vtracer emits every path with M 0 0 + a transform="translate(X,Y)" that
  // positions it. So the path's actual location is the transform offset.
  if (!transformAttr) return false;
  const m = transformAttr.match(/translate\(\s*(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)\s*\)/);
  if (!m) return false;
  const x = +m[1];
  const y = +m[2];
  return x < FIG_X_MIN || x > FIG_X_MAX || y < FIG_Y_MIN || y > FIG_Y_MAX;
};

let removedCream = 0;
let removedOutside = 0;
let kept = 0;
const cleaned = svg.replace(/<path\b[^/>]*\/>|<path\b[^>]*>.*?<\/path>/g, (match) => {
  const fill = match.match(/fill="(#[A-Fa-f0-9]{6})"/)?.[1];
  if (fill && isCreamFill(fill)) {
    removedCream += 1;
    return '';
  }
  const transformAttr = match.match(/\btransform="([^"]+)"/)?.[1];
  if (transformAttr && isOutsideFigure(transformAttr)) {
    removedOutside += 1;
    return '';
  }
  kept += 1;
  return match;
});

const removed = removedCream + removedOutside;
console.log(`  Cream-tone paths stripped: ${removedCream}`);
console.log(`  Outside-figure paths stripped: ${removedOutside}`);

await writeFile(outPath, cleaned);

const sizeKb = (buf) => (Buffer.byteLength(buf) / 1024).toFixed(1);
console.log(`Removed ${removed} background paths, kept ${kept} ink paths`);
console.log(`Size: ${sizeKb(svg)} KB → ${sizeKb(cleaned)} KB (${(100 * (1 - cleaned.length / svg.length)).toFixed(1)}% smaller)`);
console.log(`Wrote ${outPath}`);
