/**
 * ConceptReveal — Ray Dalio 风格的极简概念帧
 *
 * 设计原则（替代 PPT 式 SceneCard）：
 * - 80% 米色留白
 * - 1 个主体动作（居中角色或图标）
 * - 1 行核心文字（屏幕下方居中，简洁）
 * - 动画突出（角色从无到有 snap-in，文字延后淡入）
 * - 不要标题栏、不要时间标签、不要列布局
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { SnapIcon } from '../components/SnapIcon';
import { StickFigure } from '../components/StickFigure';
import { COLORS, FONTS, EASING } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';
import type { CharacterKey } from '../utils/stickFigures';

interface ConceptRevealProps {
  readonly card: OutlineCard;
  /** 主角形象，默认 Joshua */
  readonly character?: CharacterKey;
}

export const ConceptReveal: React.FC<ConceptRevealProps> = ({
  card,
  character = 'joshua',
}) => {
  const frame = useCurrentFrame();

  // 文字延后 ~20 帧淡入，并轻微上移
  const textOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASING.snapIn),
  });
  const textTranslateY = interpolate(frame, [20, 40], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASING.snapIn),
  });

  return (
    <AbsoluteFill>
      <PaperBackground />

      {/* 主角：屏幕中央偏上，巨大，从舞台中突现 */}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 280, // 给底部文字留位置
        }}
      >
        <SnapIcon delay={4}>
          <StickFigure character={character} pose="walking" size={360} />
        </SnapIcon>
      </AbsoluteFill>

      {/* 文字：屏幕下方居中，单行，Hoefler-equivalent 衬线 */}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 140,
          opacity: textOpacity,
          transform: `translateY(${textTranslateY}px)`,
        }}
      >
        <h1
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 600,
            fontSize: 72,
            color: COLORS.ink,
            margin: 0,
            letterSpacing: '-0.01em',
            textAlign: 'center',
            maxWidth: 1400,
            lineHeight: 1.15,
          }}
        >
          {card.title}
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
