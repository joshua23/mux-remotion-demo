import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, EASING } from '../theme';

interface GrowBarProps {
  readonly valueFrom?: number;
  readonly valueTo: number;
  readonly maxValue: number;
  readonly label?: string;
  readonly color?: string;
  readonly width?: number;
  readonly maxHeight?: number;
  readonly delay?: number;
}

export const GrowBar: React.FC<GrowBarProps> = ({
  valueFrom = 0,
  valueTo,
  maxValue,
  label,
  color = COLORS.accent.blue,
  width = 80,
  maxHeight = 300,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: EASING.growSpring,
    from: 0,
    to: 1,
  });

  const currentValue = valueFrom + (valueTo - valueFrom) * progress;
  const barHeight = (currentValue / maxValue) * maxHeight;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width,
      }}
    >
      <div
        style={{
          width: '100%',
          height: maxHeight,
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            width: '100%',
            height: barHeight,
            backgroundColor: color,
            transformOrigin: 'bottom',
            borderRadius: '4px 4px 0 0',
          }}
        />
      </div>
      {label && (
        <span style={{ fontSize: 14, color: COLORS.ink, marginTop: 8, textAlign: 'center' }}>
          {label}
        </span>
      )}
    </div>
  );
};
