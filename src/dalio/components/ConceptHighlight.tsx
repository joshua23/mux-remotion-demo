import React from 'react';
import { DrawPath } from './DrawPath';
import { COLORS, STROKE } from '../theme';

interface ConceptHighlightProps {
  readonly cx: number;
  readonly cy: number;
  readonly r?: number;
  readonly startFrame?: number;
  readonly durationInFrames?: number;
  readonly color?: string;
}

export const ConceptHighlight: React.FC<ConceptHighlightProps> = ({
  cx,
  cy,
  r = 40,
  startFrame = 0,
  durationInFrames = 22,
  color = COLORS.accent.red,
}) => {
  // Circle as two arcs: M cx-r,cy A r,r 0 1,1 cx+r,cy A r,r 0 1,1 cx-r,cy
  const d = `M ${cx - r},${cy} A ${r},${r} 0 1,1 ${cx + r},${cy} A ${r},${r} 0 1,1 ${cx - r},${cy}`;

  return (
    <DrawPath
      d={d}
      startFrame={startFrame}
      durationInFrames={durationInFrames}
      strokeColor={color}
      strokeWidth={STROKE.emphasis}
      fill="none"
      width={cx * 2 + r * 2}
      height={cy * 2 + r * 2}
    />
  );
};
