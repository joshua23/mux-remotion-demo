import { vectorize, ColorMode, Hierarchical, PathSimplifyMode, Preset } from '@neplex/vectorizer';
import { readFile, writeFile } from 'node:fs/promises';

const inputPath = '/tmp/path-b-test/joshua-flux.png';

console.log('Reading PNG...');
const png = await readFile(inputPath);
console.log(`  ${png.length} bytes`);

const presets = [
  { name: 'preset-photo', config: Preset.Photo },
  { name: 'preset-poster', config: Preset.Poster },
  {
    name: 'color-stacked',
    config: {
      colorMode: ColorMode.Color,
      hierarchical: Hierarchical.Stacked,
      filterSpeckle: 4,
      colorPrecision: 6,
      layerDifference: 16,
      mode: PathSimplifyMode.Spline,
      cornerThreshold: 60,
      lengthThreshold: 4.0,
      maxIterations: 10,
      spliceThreshold: 45,
      pathPrecision: 8,
    },
  },
  {
    name: 'color-cutout-detailed',
    config: {
      colorMode: ColorMode.Color,
      hierarchical: Hierarchical.Cutout,
      filterSpeckle: 8,
      colorPrecision: 8,
      layerDifference: 8,
      mode: PathSimplifyMode.Spline,
      cornerThreshold: 60,
      lengthThreshold: 4.0,
      maxIterations: 10,
      spliceThreshold: 45,
      pathPrecision: 8,
    },
  },
];

for (const { name, config } of presets) {
  console.log(`\nTracing "${name}"...`);
  const start = Date.now();
  const svg = await vectorize(png, config);
  const ms = Date.now() - start;
  const outPath = `/tmp/path-b-test/joshua-${name}.svg`;
  await writeFile(outPath, svg);
  const pathCount = (svg.match(/<path/g) || []).length;
  console.log(`  ${(svg.length / 1024).toFixed(1)} KB | ${pathCount} paths | ${ms}ms`);
  console.log(`  → ${outPath}`);
}
