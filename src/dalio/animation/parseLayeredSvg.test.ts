// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { parseLayeredSvg } from './parseLayeredSvg';

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g id="head" data-pivot-x="50" data-pivot-y="20"><circle cx="50" cy="20" r="10"/></g>
  <g id="torso" data-pivot-x="50" data-pivot-y="50"><rect x="40" y="30" width="20" height="40"/></g>
  <g id="bg-noise"><path d="M0 0"/></g>
</svg>`;

describe('parseLayeredSvg', () => {
  it('extracts only known PartIds', () => {
    const r = parseLayeredSvg(SAMPLE);
    expect(r.parts.map((p) => p.id).sort()).toEqual(['head', 'torso']);
  });

  it('parses pivot coords as numbers', () => {
    const r = parseLayeredSvg(SAMPLE);
    const head = r.parts.find((p) => p.id === 'head')!;
    expect(head.pivot).toEqual({ x: 50, y: 20 });
  });

  it('exposes child nodes as live DOM Nodes (not string)', () => {
    const r = parseLayeredSvg(SAMPLE);
    const head = r.parts.find((p) => p.id === 'head')!;
    expect(head.childNodes.length).toBeGreaterThan(0);
    expect(head.childNodes[0].nodeType).toBeDefined();
  });

  it('returns viewBox width/height', () => {
    const r = parseLayeredSvg(SAMPLE);
    expect(r.viewBox).toEqual({ width: 100, height: 100 });
  });
});
