import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { DrawPath } from './DrawPath';
import { COLORS, STROKE, TIMING } from '../theme';

interface DrawArrowProps {
  d: string;
  endPoint: { x: number; y: number; angle: number };
  pathLength?: number;
  startFrame?: number;
  durationInFrames?: number;
  strokeColor?: string;
  strokeWidth?: number;
  width?: number;
  height?: number;
}

const ArrowHead: React.FC<{
  x: number; y: number; angle: number; color: string; strokeWidth: number; opacity: number;
}> = ({ x, y, angle, color, strokeWidth, opacity }) => {
  const size = strokeWidth * 4;
  return (
    <polygon
      points={`0,${-size} ${size * 0.7},${size} ${-size * 0.7},${size}`}
      fill={color}
      transform={`translate(${x},${y}) rotate(${angle - 90})`}
      opacity={opacity}
    />
  );
};

export const DrawArrow: React.FC<DrawArrowProps> = ({
  d,
  endPoint,
  pathLength,
  startFrame = 0,
  durationInFrames = TIMING.drawPathFrames,
  strokeColor = COLORS.ink,
  strokeWidth = STROKE.icon,
  width = 400,
  height = 300,
}) => {
  const frame = useCurrentFrame();

  // Arrowhead fades in during the last 10% of the path draw
  const arrowFadeStart = startFrame + Math.floor(durationInFrames * 0.9);
  const arrowFadeEnd = startFrame + durationInFrames + 6;
  const arrowOpacity = interpolate(frame, [arrowFadeStart, arrowFadeEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}
      width={width}
      height={height}
    >
      <DrawPath
        d={d}
        pathLength={pathLength}
        startFrame={startFrame}
        durationInFrames={durationInFrames}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        width={width}
        height={height}
      />
      <ArrowHead
        x={endPoint.x}
        y={endPoint.y}
        angle={endPoint.angle}
        color={strokeColor}
        strokeWidth={strokeWidth}
        opacity={arrowOpacity}
      />
    </svg>
  );
};
