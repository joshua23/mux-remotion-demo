/**
 * Hierarchy — Dalio 风格层级帧
 * Joshua 在顶部中央，4 个家人/业务节点向下扇形展开
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { StickFigure } from '../components/StickFigure';
import { SnapIcon } from '../components/SnapIcon';
import { DrawPath } from '../components/DrawPath';
import { COLORS, FONTS, EASING } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface HierarchyProps {
  readonly card: OutlineCard;
}

export const Hierarchy: React.FC<HierarchyProps> = ({ card }) => {
  const frame = useCurrentFrame();
  const titleOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(...EASING.snapIn) });

  const childCharacters = [
    { c: 'wife' as const, label: 'NaNa ¥61,503', delay: 35 },
    { c: 'family-female' as const, label: '燕燕 ¥20,000', delay: 50 },
    { c: 'family-male' as const, label: '龙 ¥5,000', delay: 65 },
    { c: 'business' as const, label: '皆柏 ¥10,676', delay: 80 },
  ];

  return (
    <AbsoluteFill>
      <PaperBackground />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80, opacity: titleOp }}>
        <p style={{ fontFamily: FONTS.heading, fontSize: 44, color: COLORS.ink, margin: 0, fontWeight: 600 }}>{card.title}</p>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 200 }}>
        <SnapIcon delay={5}><StickFigure character="joshua" label="Joshua" size={200} /></SnapIcon>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 100 }}>
        <div style={{ display: 'flex', gap: 100 }}>
          {childCharacters.map((kid) => (
            <SnapIcon key={kid.c} delay={kid.delay}>
              <StickFigure character={kid.c} label={kid.label} size={180} />
            </SnapIcon>
          ))}
        </div>
      </AbsoluteFill>

      {[420, 700, 980, 1260].map((targetX, i) => (
        <AbsoluteFill key={i}>
          <DrawPath
            d={`M 960,500 L ${targetX},760`}
            startFrame={25 + i * 15}
            durationInFrames={15}
            strokeColor={COLORS.ink}
            strokeWidth={1.5}
          />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};
