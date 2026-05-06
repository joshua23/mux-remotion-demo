// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NarrationCue } from './NarrationCue';

const SAMPLE_MANIFEST = [
  { index: 0, mp3: 'card_00.mp3', durationMs: 3000, narration: '旁白一' },
  { index: 1, mp3: 'card_01.mp3', durationMs: 4000, narration: '旁白二' },
];

describe('NarrationCue', () => {
  it('renders without error', () => {
    const { container } = render(<NarrationCue manifest={SAMPLE_MANIFEST} />);
    expect(container).toBeTruthy();
  });

  it('renders one audio element per manifest entry', () => {
    const { container } = render(<NarrationCue manifest={SAMPLE_MANIFEST} />);
    const audios = container.querySelectorAll('audio');
    expect(audios).toHaveLength(2);
  });
});
