// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { interpolatePart } from './interpolatePart';
import type { PartTimeline } from './types';

describe('interpolatePart', () => {
  const tl: PartTimeline = {
    partId: 'head',
    keyframes: [
      { at: 0, rotate: 0, tx: 0, scale: 1, opacity: 1 },
      { at: 60, rotate: 10, tx: 20, scale: 1.1 },
      { at: 120, rotate: 0, tx: 0, scale: 1 },
    ],
  };

  it('returns first keyframe values before first.at', () => {
    expect(interpolatePart(tl, -10).rotate).toBe(0);
  });

  it('interpolates linearly halfway between keyframes', () => {
    const r = interpolatePart(tl, 30);
    expect(r.rotate).toBeCloseTo(5);
    expect(r.tx).toBeCloseTo(10);
  });

  it('returns exact keyframe values at keyframe time', () => {
    expect(interpolatePart(tl, 60).rotate).toBe(10);
  });

  it('clamps to last keyframe after end', () => {
    expect(interpolatePart(tl, 999).rotate).toBe(0);
  });

  it('defaults missing props to identity (rotate=0, scale=1, opacity=1)', () => {
    const sparse: PartTimeline = { partId: 'head', keyframes: [{ at: 0 }] };
    const r = interpolatePart(sparse, 0);
    expect(r.rotate).toBe(0);
    expect(r.scale).toBe(1);
    expect(r.opacity).toBe(1);
    expect(r.tx).toBe(0);
    expect(r.ty).toBe(0);
  });
});
