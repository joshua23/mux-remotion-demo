import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, FONTS, STROKE } from '../theme';
import {
  CHARACTER_DECORATIONS,
  CharacterKey,
  STICK_FIGURE_PATHS,
  StickFigurePose,
} from '../utils/stickFigures';

interface StickFigureProps {
  readonly pose?: StickFigurePose;
  /** 角色身份；不同身份会叠加不同装饰（眼镜/长发/平头等），方便观众跨场景识别 */
  readonly character?: CharacterKey;
  /** 脚下显示的名字标签（如 "Joshua"、"NaNa"），不传则不显示 */
  readonly label?: string;
  readonly color?: string;
  readonly size?: number;
}

export const StickFigure: React.FC<StickFigureProps> = ({
  pose = 'standing',
  character = 'generic',
  label,
  color = COLORS.ink,
  size = 80,
}) => {
  const frame = useCurrentFrame();
  // Walking animates between walking/standing at 2-frame intervals
  const activePose =
    pose === 'walking' ? (Math.floor(frame / 2) % 2 === 0 ? 'walking' : 'standing') : pose;

  const bodyPath = STICK_FIGURE_PATHS[activePose];
  const decorationPath = CHARACTER_DECORATIONS[character];

  // viewBox 高度: 50 (body) + 12 (label area) = 62 if label, else 50
  const labelHeight = label ? 12 : 0;
  const viewBoxHeight = 50 + labelHeight;

  return (
    <svg viewBox={`0 0 50 ${viewBoxHeight}`} width={size} height={size * (viewBoxHeight / 50)}>
      <path
        d={bodyPath}
        stroke={color}
        strokeWidth={STROKE.icon}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {decorationPath && (
        <path
          d={decorationPath}
          stroke={color}
          strokeWidth={STROKE.icon}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {label && (
        <text
          x="25"
          y={50 + 9}
          textAnchor="middle"
          fontFamily={FONTS.body}
          fontSize="6"
          fill={color}
          opacity={0.85}
        >
          {label}
        </text>
      )}
    </svg>
  );
};
