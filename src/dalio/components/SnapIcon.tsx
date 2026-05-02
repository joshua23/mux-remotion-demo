import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { EASING } from '../theme';

interface SnapIconProps {
  readonly delay?: number;
  readonly children: React.ReactNode;
}

export const SnapIcon: React.FC<SnapIconProps> = ({ delay = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: EASING.growSpring,
    from: 0,
    to: 1,
  });

  const scale = 0.85 + 0.15 * progress;
  const opacity = progress;

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
};
