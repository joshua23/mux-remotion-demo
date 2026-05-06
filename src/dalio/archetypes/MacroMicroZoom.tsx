/**
 * MacroMicroZoom — Dalio 风格"放大/聚焦"帧
 * 一群小角色 → 镜头推进聚焦
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { StickFigure } from '../components/StickFigure';
import { COLORS, FONTS, EASING } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface MacroMicroZoomProps {
  readonly card: OutlineCard;
}

export const MacroMicroZoom: React.FC<MacroMicroZoomProps> = ({ card }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(...EASING.snapIn) });

  const scale = spring({ frame: frame - 40, fps, from: 1, to: 2.5, config: { damping: 200, stiffness: 80 } });

  return (
    <AbsoluteFill>
      <PaperBackground />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80, opacity: titleOp }}>
        <p style={{ fontFamily: FONTS.heading, fontSize: 44, color: COLORS.ink, margin: 0, fontWeight: 600 }}>{card.title}</p>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'center', display: 'flex', gap: 60, alignItems: 'flex-end' }}>
          <StickFigure character="family-female" size={130} />
          <StickFigure character="wife" size={130} />
          <StickFigure character="joshua" size={180} />
          <StickFigure character="family-male" size={130} />
          <StickFigure character="business" size={130} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
