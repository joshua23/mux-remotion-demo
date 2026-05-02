/**
 * Comparison — Dalio 风格对比帧
 * 两个柱子并排（左：支出，右：被动收益）+ 中间等号 + 上方一行标题
 * 80% 留白，全部动画显眼
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { GrowBar } from '../components/GrowBar';
import { DrawPath } from '../components/DrawPath';
import { COLORS, FONTS, EASING } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface ComparisonProps {
  readonly card: OutlineCard;
  readonly leftLabel?: string;
  readonly rightLabel?: string;
  readonly leftValue?: number;
  readonly rightValue?: number;
  readonly maxValue?: number;
}

export const Comparison: React.FC<ComparisonProps> = ({
  card,
  leftLabel = '我花的',
  rightLabel = '余额宝替我赚的',
  leftValue = 160246,
  rightValue = 144702,
  maxValue = 200000,
}) => {
  const frame = useCurrentFrame();
  const titleOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(...EASING.snapIn) });

  return (
    <AbsoluteFill>
      <PaperBackground />
      {/* 顶部小副标题（不是大 PPT 标题）*/}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 100, opacity: titleOp }}>
        <p style={{ fontFamily: FONTS.heading, fontSize: 44, color: COLORS.ink, margin: 0, fontWeight: 600 }}>
          {card.title}
        </p>
      </AbsoluteFill>

      {/* 居中：两柱 + 等号 */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 180 }}>
          <div style={{ textAlign: 'center' }}>
            <GrowBar valueTo={leftValue} maxValue={maxValue} color={COLORS.accent.red} delay={20} maxHeight={420} width={120} />
            <div style={{ fontFamily: FONTS.body, fontSize: 28, color: COLORS.ink, marginTop: 20 }}>{leftLabel}</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 36, color: COLORS.ink, marginTop: 4 }}>¥{(leftValue / 10000).toFixed(1)}万</div>
          </div>

          {/* 等号 */}
          <div style={{ marginBottom: 200 }}>
            <DrawPath d="M 0,30 L 80,30 M 0,60 L 80,60" startFrame={45} durationInFrames={20} strokeColor={COLORS.ink} strokeWidth={5} width={80} height={90} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <GrowBar valueTo={rightValue} maxValue={maxValue} color={COLORS.accent.teal} delay={32} maxHeight={420} width={120} />
            <div style={{ fontFamily: FONTS.body, fontSize: 28, color: COLORS.ink, marginTop: 20 }}>{rightLabel}</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 36, color: COLORS.ink, marginTop: 4 }}>¥{(rightValue / 10000).toFixed(1)}万</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
