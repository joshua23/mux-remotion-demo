// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CameraStage } from './CameraStage';

vi.mock('remotion', async () => ({
  useCurrentFrame: () => 30,
  useVideoConfig: () => ({ width: 1920, height: 1080, fps: 30, durationInFrames: 240 }),
  AbsoluteFill: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={style}>{children}</div>
  ),
}));

describe('CameraStage', () => {
  it('renders children', () => {
    const { getByTestId } = render(
      <CameraStage moves={[{ at: 0, zoom: 1 }, { at: 60, zoom: 1.2 }]}>
        <div data-testid="kid">hi</div>
      </CameraStage>,
    );
    expect(getByTestId('kid')).toBeTruthy();
  });

  it('applies a transform style at frame=30 (halfway between zoom=1 and zoom=1.2)', () => {
    const { container } = render(
      <CameraStage moves={[{ at: 0, zoom: 1 }, { at: 60, zoom: 1.2 }]}>
        <div />
      </CameraStage>,
    );
    const inner = container.querySelector('[data-camera="inner"]') as HTMLElement;
    expect(inner.style.transform).toMatch(/scale\(1\.1/);
  });
});
