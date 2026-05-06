/**
 * Cycle — Dalio 风格循环帧
 * Joshua 在中央，4 条 DrawArrow 围绕成环
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { StickFigure } from '../components/StickFigure';
import { SnapIcon } from '../components/SnapIcon';
import { DrawArrow } from '../components/DrawArrow';
import { COLORS, FONTS, EASING } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface CycleProps {
  readonly card: OutlineCard;
}

export const Cycle: React.FC<CycleProps> = ({ card }) => {
  const frame = useCurrentFrame();
  const titleOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(...EASING.snapIn) });

  const arrows = [
    { d: 'M 960,260 Q 1200,260 1240,540', endX: 1240, endY: 540, angle: Math.PI / 2 },
    { d: 'M 1240,540 Q 1240,780 960,820', endX: 960, endY: 820, angle: Math.PI },
    { d: 'M 960,820 Q 720,820 680,540', endX: 680, endY: 540, angle: -Math.PI / 2 },
    { d: 'M 680,540 Q 680,300 960,260', endX: 960, endY: 260, angle: 0 },
  ];

  return (
    <AbsoluteFill>
      <PaperBackground />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80, opacity: titleOp }}>
        <p style={{ fontFamily: FONTS.heading, fontSize: 44, color: COLORS.ink, margin: 0, fontWeight: 600 }}>{card.title}</p>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <SnapIcon delay={5}>
          <StickFigure character="joshua" pose="standing" size={220} />
        </SnapIcon>
      </AbsoluteFill>

      {arrows.map((a, i) => (
        <AbsoluteFill key={i}>
          <DrawArrow
            d={a.d}
            endPoint={{ x: a.endX, y: a.endY, angle: a.angle }}
            startFrame={30 + i * 18}
            durationInFrames={20}
            strokeColor={COLORS.accent.teal}
          />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
