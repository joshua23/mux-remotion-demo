import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { EASING } from '../theme';

interface PanTarget {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

interface CameraPanProps {
  readonly from: PanTarget;
  readonly to: PanTarget;
  readonly startFrame?: number;
  readonly durationInFrames?: number;
  readonly children: React.ReactNode;
}

export const CameraPan: React.FC<CameraPanProps> = ({
  from,
  to,
  startFrame = 0,
  durationInFrames = 30,
  children,
}) => {
  const frame = useCurrentFrame();
  const easing = Easing.bezier(...EASING.cameraEase);

  const progress = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

  const x = from.x + (to.x - from.x) * progress;
  const y = from.y + (to.y - from.y) * progress;
  const scale = from.scale + (to.scale - from.scale) * progress;

  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        transformOrigin: 'center center',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
};
