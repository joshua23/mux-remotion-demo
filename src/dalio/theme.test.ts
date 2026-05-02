import { describe, it, expect } from 'vitest';
import { COLORS, FONTS, STROKE, TIMING } from './theme';

describe('Dalio theme constants', () => {
  it('paper color is #F2EBD8', () => {
    expect(COLORS.paper).toBe('#F2EBD8');
  });

  it('has 4 accent colors', () => {
    expect(Object.keys(COLORS.accent)).toHaveLength(4);
    expect(COLORS.accent.red).toBe('#D9533A');
    expect(COLORS.accent.yellow).toBe('#D6A93B');
    expect(COLORS.accent.teal).toBe('#5A8C7B');
    expect(COLORS.accent.blue).toBe('#3E5C7A');
  });

  it('heading font includes Source Serif Pro', () => {
    expect(FONTS.heading).toContain('Source Serif Pro');
  });

  it('snapInFrames is 10', () => {
    expect(TIMING.snapInFrames).toBe(10);
  });

  it('icon stroke is 2.5', () => {
    expect(STROKE.icon).toBe(2.5);
  });
});
