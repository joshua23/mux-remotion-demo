/**
 * CauseEffect — Dalio 风格因果链帧
 * 3 个角色横排，2 条箭头连接
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { StickFigure } from '../components/StickFigure';
import { SnapIcon } from '../components/SnapIcon';
import { DrawArrow } from '../components/DrawArrow';
import { COLORS, FONTS, EASING } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface CauseEffectProps {
  readonly card: OutlineCard;
}

export const CauseEffect: React.FC<CauseEffectProps> = ({ card }) => {
  const frame = useCurrentFrame();
  const titleOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(...EASING.snapIn) });

  return (
    <AbsoluteFill>
      <PaperBackground />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80, opacity: titleOp }}>
        <p style={{ fontFamily: FONTS.heading, fontSize: 44, color: COLORS.ink, margin: 0, fontWeight: 600 }}>{card.title}</p>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 220 }}>
          <SnapIcon delay={5}><StickFigure character="joshua" label="Joshua" size={220} /></SnapIcon>
          <SnapIcon delay={45}><StickFigure character="wife" label="NaNa" size={220} /></SnapIcon>
          <SnapIcon delay={85}><StickFigure character="family-female" label="燕燕" size={220} /></SnapIcon>
        </div>
      </AbsoluteFill>

      <AbsoluteFill>
        <DrawArrow
          d="M 660,540 L 870,540"
          endPoint={{ x: 870, y: 540, angle: 0 }}
          startFrame={28}
          durationInFrames={18}
          strokeColor={COLORS.accent.red}
        />
      </AbsoluteFill>
      <AbsoluteFill>
        <DrawArrow
          d="M 1110,540 L 1320,540"
          endPoint={{ x: 1320, y: 540, angle: 0 }}
          startFrame={68}
          durationInFrames={18}
          strokeColor={COLORS.accent.red}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
