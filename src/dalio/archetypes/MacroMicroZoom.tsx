import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { SceneCard } from '../components/SceneCard';
import { CameraPan } from '../components/CameraPan';
import { COLORS, FONTS } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface MacroMicroZoomProps {
  readonly card: OutlineCard;
  readonly macroContent?: React.ReactNode;
  readonly microContent?: React.ReactNode;
}

const DefaultMacro = () => (
  <div style={{ textAlign: 'center', padding: 40 }}>
    <h2 style={{ fontFamily: FONTS.heading, fontSize: 48, color: COLORS.ink }}>全年总览</h2>
    <p style={{ fontFamily: FONTS.body, fontSize: 24, color: COLORS.ink }}>¥160,000 支出</p>
  </div>
);

const DefaultMicro = () => (
  <div style={{ textAlign: 'center', padding: 40 }}>
    <h3 style={{ fontFamily: FONTS.heading, fontSize: 36, color: COLORS.accent.red }}>最大单笔</h3>
    <p style={{ fontFamily: FONTS.body, fontSize: 28, color: COLORS.ink }}>¥12,800 · 机票</p>
  </div>
);

export const MacroMicroZoom: React.FC<MacroMicroZoomProps> = ({
  card,
  macroContent = <DefaultMacro />,
  microContent = <DefaultMicro />,
}) => {
  const frame = useCurrentFrame();

  // Crossfade at 45 frames
  const microOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const macroOpacity = 1 - microOpacity;

  return (
    <SceneCard title={card.title}>
      <div style={{ position: 'relative', height: '100%' }}>
        <CameraPan
          from={{ x: 0, y: 0, scale: 1 }}
          to={{ x: -100, y: 0, scale: 1.3 }}
          startFrame={30}
          durationInFrames={25}
        >
          <div style={{ opacity: macroOpacity, position: 'absolute', inset: 0 }}>
            {macroContent}
          </div>
          <div style={{ opacity: microOpacity, position: 'absolute', inset: 0 }}>
            {microContent}
          </div>
        </CameraPan>
      </div>
    </SceneCard>
  );
};
