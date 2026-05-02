import React from 'react';
import { SceneCard } from '../components/SceneCard';
import { GrowBar } from '../components/GrowBar';
import { DrawPath } from '../components/DrawPath';
import { ConceptHighlight } from '../components/ConceptHighlight';
import { COLORS, FONTS } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface MonthlyDataPoint {
  month: string;
  value: number;
  isAnomaly?: boolean;
}

interface TimeSeriesProps {
  card: OutlineCard;
  data?: MonthlyDataPoint[];
}

const DEFAULT_DATA: MonthlyDataPoint[] = [
  { month: '1月', value: 12000 },
  { month: '2月', value: 28000, isAnomaly: true },
  { month: '3月', value: 11000 },
  { month: '4月', value: 13000 },
  { month: '5月', value: 15000 },
  { month: '6月', value: 14000 },
  { month: '7月', value: 16000 },
  { month: '8月', value: 12500 },
];

export const TimeSeries: React.FC<TimeSeriesProps> = ({ card, data = DEFAULT_DATA }) => {
  const maxValue = Math.max(...data.map((d) => d.value)) * 1.1;
  const barWidth = Math.floor(1400 / data.length) - 20;

  return (
    <SceneCard title={card.title}>
      <div style={{ position: 'relative', height: '80%' }}>
        {/* X axis */}
        <DrawPath
          d="M 0,300 L 1400,300"
          strokeColor={COLORS.ink}
          startFrame={0}
          width={1400}
          height={300}
        />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, paddingLeft: 40 }}>
          {data.map((point, i) => (
            <div key={i} style={{ position: 'relative', textAlign: 'center' }}>
              <GrowBar
                valueTo={point.value}
                maxValue={maxValue}
                label={point.month}
                color={point.isAnomaly ? COLORS.accent.red : COLORS.accent.blue}
                width={barWidth}
                delay={i * 3}
              />
              {point.isAnomaly && (
                <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)' }}>
                  <ConceptHighlight cx={20} cy={20} r={20} startFrame={i * 3 + 10} color={COLORS.accent.red} />
                </div>
              )}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 22, color: COLORS.ink, opacity: 0.6, fontFamily: FONTS.mono }}>
          {card.body}
        </p>
      </div>
    </SceneCard>
  );
};
