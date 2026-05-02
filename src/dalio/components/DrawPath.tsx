import React, { useRef, useEffect, useState } from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS, STROKE, TIMING, EASING } from '../theme';

interface DrawPathProps {
  d: string;
  pathLength?: number;
  startFrame?: number;
  durationInFrames?: number;
  strokeColor?: string;
  strokeWidth?: number;
  fill?: string;
  width?: number;
  height?: number;
}

export const DrawPath: React.FC<DrawPathProps> = ({
  d,
  pathLength,
  startFrame = 0,
  durationInFrames = TIMING.drawPathFrames,
  strokeColor = COLORS.ink,
  strokeWidth = STROKE.icon,
  fill = 'none',
  width = 400,
  height = 300,
}) => {
  const frame = useCurrentFrame();
  const pathRef = useRef<SVGPathElement>(null);
  const [measuredLength, setMeasuredLength] = useState<number>(pathLength ?? 300);

  useEffect(() => {
    if (!pathLength && pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        if (len > 0) setMeasuredLength(len);
      } catch {
        // getTotalLength unavailable in non-browser env
      }
    }
  }, [pathLength]);

  const length = pathLength ?? measuredLength;

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(...EASING.snapIn),
    }
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}
      width={width}
      height={height}
    >
      <path
        ref={pathRef}
        d={d}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill={fill}
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
