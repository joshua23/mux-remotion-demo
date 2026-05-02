import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { TIMING, COLORS, FONTS } from '../theme';

interface CountUpProps {
  from?: number;
  to: number;
  format?: (n: number) => string;
  startFrame?: number;
  durationInFrames?: number;
  style?: React.CSSProperties;
}

const defaultFormat = (n: number) =>
  new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(n);

export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  format = defaultFormat,
  startFrame = 0,
  durationInFrames = TIMING.countUpFrames,
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const value = Math.round(from + (to - from) * progress);

  return (
    <span
      style={{
        fontVariantNumeric: 'tabular-nums',
        fontFamily: FONTS.body,
        color: COLORS.ink,
        ...style,
      }}
    >
      {format(value)}
    </span>
  );
};
