import { vi } from 'vitest';
import React from 'react';

// Full manual mock for Remotion — avoids ESM incompatibility with React 17 in vitest
vi.mock('remotion', () => ({
  useCurrentFrame: vi.fn(() => 0),
  useVideoConfig: vi.fn(() => ({ width: 1920, height: 1080, fps: 30, durationInFrames: 60 })),
  interpolate: vi.fn((value: number, input: number[], output: number[]) => {
    if (value <= input[0]) return output[0];
    if (value >= input[input.length - 1]) return output[output.length - 1];
    const t = (value - input[0]) / (input[input.length - 1] - input[0]);
    return output[0] + t * (output[output.length - 1] - output[0]);
  }),
  spring: vi.fn(() => 1),
  AbsoluteFill: ({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) =>
    React.createElement('div', { 'data-testid': 'absolute-fill', style: { position: 'absolute', inset: 0, ...style } }, children),
  Sequence: ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  Audio: () => React.createElement('audio'),
  delayRender: vi.fn(() => 0),
  continueRender: vi.fn(),
  Easing: { bezier: vi.fn(() => (t: number) => t) },
  Series: ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  staticFile: vi.fn((path: string) => path),
  Composition: () => React.createElement(React.Fragment),
}));
