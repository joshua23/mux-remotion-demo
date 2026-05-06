import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { COLORS, FONTS, STROKE } from '../theme';
import { CHARACTERS, CharacterKey, StickFigurePose } from '../utils/stickFigures';

interface StickFigureProps {
  /** 角色身份 — 不同的圆头 + 衬衫/裙子 + 头发组合 */
  readonly character?: CharacterKey;
  /** 姿势提示。当前所有 pose 都用同一组站立画法；保留接口，未来扩展用 */
  readonly pose?: StickFigurePose;
  /** 脚下名字标签 */
  readonly label?: string;
  readonly color?: string;
  readonly size?: number;
  /** 是否做"轻微呼吸/晃动"动画 */
  readonly animated?: boolean;
}

export const StickFigure: React.FC<StickFigureProps> = ({
  character = 'generic',
  pose, // eslint-disable-line @typescript-eslint/no-unused-vars
  label,
  color = COLORS.ink,
  size = 200,
  animated = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 微小的 idle 动画：身体在垂直方向呼吸式 ±0.5px，头部轻微 wobble
  const breathe = animated
    ? Math.sin(((frame % (fps * 3)) / (fps * 3)) * Math.PI * 2) * 0.4
    : 0;

  const { body, decoration } = CHARACTERS[character];

  const labelHeight = label ? 14 : 0;
  const viewBoxHeight = 100 + labelHeight;
  // viewBox 60×100；按高度等比缩放
  const renderHeight = (size * viewBoxHeight) / 60;

  return (
    <svg
      viewBox={`0 0 60 ${viewBoxHeight}`}
      width={size}
      height={renderHeight}
      style={{ overflow: 'visible' }}
    >
      <g transform={`translate(0, ${breathe})`}>
        <path
          d={body}
          stroke={color}
          strokeWidth={STROKE.icon}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {decoration && (
          <path
            d={decoration}
            stroke={color}
            strokeWidth={STROKE.icon}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </g>
      {label && (
        <text
          x="30"
          y={100 + 11}
          textAnchor="middle"
          fontFamily={FONTS.body}
          fontSize="7"
          fill={color}
          opacity={0.85}
        >
          {label}
        </text>
      )}
    </svg>
  );
};
