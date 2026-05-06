// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import type { Keyframe, PartTimeline } from './types';
import { PART_IDS } from './types';

describe('animation types', () => {
  it('PART_IDS includes all 8 expected ids', () => {
    expect(PART_IDS).toEqual(['head', 'face', 'torso', 'L-arm', 'R-arm', 'L-leg', 'R-leg', 'prop-1']);
  });

  it('Keyframe shape compiles', () => {
    const kf: Keyframe = { at: 0, rotate: 5, tx: 10, ty: -2, scale: 1.05, opacity: 1, easing: 'inOut' };
    expect(kf.at).toBe(0);
  });

  it('PartTimeline shape compiles', () => {
    const pt: PartTimeline = { partId: 'head', keyframes: [{ at: 0 }, { at: 60, rotate: 10 }] };
    expect(pt.keyframes).toHaveLength(2);
  });
});
