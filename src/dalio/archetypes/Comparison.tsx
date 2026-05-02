import React from 'react';
import { SceneCard } from '../components/SceneCard';
import { GrowBar } from '../components/GrowBar';
import { DrawPath } from '../components/DrawPath';
import { COLORS, FONTS } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface ComparisonProps {
  card: OutlineCard;
  leftLabel?: string;
  rightLabel?: string;
  leftValue?: number;
  rightValue?: number;
  maxValue?: number;
}

export const Comparison: React.FC<ComparisonProps> = ({
  card,
  leftLabel = '支出',
  rightLabel = '被动收益',
  leftValue = 160000,
  rightValue = 144000,
  maxValue = 200000,
}) => {
  return (
    <SceneCard title={card.title}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          height: '70%',
          gap: 120,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <GrowBar
            valueTo={leftValue}
            maxValue={maxValue}
            label={leftLabel}
            color={COLORS.accent.red}
            delay={0}
          />
          <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: COLORS.ink, display: 'block', marginTop: 8 }}>
            ¥{(leftValue / 10000).toFixed(1)}万
          </span>
        </div>

        {/* Equals sign path */}
        <DrawPath
          d="M 0,30 L 60,30 M 0,50 L 60,50"
          strokeColor={COLORS.ink}
          startFrame={20}
          width={60}
          height={80}
        />

        <div style={{ textAlign: 'center' }}>
          <GrowBar
            valueTo={rightValue}
            maxValue={maxValue}
            label={rightLabel}
            color={COLORS.accent.teal}
            delay={8}
          />
          <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: COLORS.ink, display: 'block', marginTop: 8 }}>
            ¥{(rightValue / 10000).toFixed(1)}万
          </span>
        </div>
      </div>
    </SceneCard>
  );
};
