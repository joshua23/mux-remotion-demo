import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, STROKE } from '../theme';
import { STICK_FIGURE_PATHS, StickFigurePose } from '../utils/stickFigures';

interface StickFigureProps {
  readonly pose?: StickFigurePose;
  readonly color?: string;
  readonly size?: number;
}

export const StickFigure: React.FC<StickFigureProps> = ({
  pose = 'standing',
  color = COLORS.ink,
  size = 80,
}) => {
  const frame = useCurrentFrame();
  // Walking animates between walking/standing at 2-frame intervals
  const activePose =
    pose === 'walking' ? (Math.floor(frame / 2) % 2 === 0 ? 'walking' : 'standing') : pose;

  const d = STICK_FIGURE_PATHS[activePose];

  return (
    <svg viewBox="0 0 50 50" width={size} height={size}>
      <path
        d={d}
        stroke={color}
        strokeWidth={STROKE.icon}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
