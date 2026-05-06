// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LayeredCharacter } from './LayeredCharacter';

vi.mock('remotion', async () => ({
  useCurrentFrame: () => 0,
  delayRender: (msg?: string) => msg ?? 'h',
  continueRender: vi.fn(),
}));

describe('LayeredCharacter', () => {
  it('renders without crashing when src not yet loaded', () => {
    const { container } = render(
      <LayeredCharacter
        src="/test.svg"
        imgWidth={100}
        imgHeight={100}
        displayHeight={400}
        parts={[]}
      />,
    );
    expect(container).toBeTruthy();
  });
});
