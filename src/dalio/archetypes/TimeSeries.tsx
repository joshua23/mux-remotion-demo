/**
 * TimeSeries — Dalio 风格月度趋势帧
 * 12 根柱子横排，12月红色高亮（异常）
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { GrowBar } from '../components/GrowBar';
import { DrawPath } from '../components/DrawPath';
import { COLORS, FONTS, EASING } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface TimeSeriesProps {
  readonly card: OutlineCard;
}

const MONTHS = [
  { label: '9月', value: 8200 },
  { label: '10月', value: 9100 },
  { label: '11月', value: 7800 },
  { label: '12月', value: 66176, anomaly: true },
  { label: '1月', value: 9500 },
  { label: '2月', value: 8900 },
  { label: '3月', value: 7600 },
  { label: '4月', value: 8300 },
  { label: '5月', value: 9200 },
  { label: '6月', value: 8700 },
  { label: '7月', value: 8900 },
  { label: '8月', value: 7873 },
];

export const TimeSeries: React.FC<TimeSeriesProps> = ({ card }) => {
  const frame = useCurrentFrame();
  const titleOp = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp', easing: Easing.bezier(...EASING.snapIn) });
  const max = Math.max(...MONTHS.map((m) => m.value));

  return (
    <AbsoluteFill>
      <PaperBackground />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80, opacity: titleOp }}>
        <p style={{ fontFamily: FONTS.heading, fontSize: 44, color: COLORS.ink, margin: 0, fontWeight: 600 }}>{card.title}</p>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 1500 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 480 }}>
            <DrawPath d="M 0,0 L 1500,0" startFrame={20} durationInFrames={30} strokeColor={COLORS.ink} strokeWidth={1.5} width={1500} height={4} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 480 }}>
            {MONTHS.map((m, i) => (
              <div key={m.label} style={{ textAlign: 'center' }}>
                <GrowBar
                  valueTo={m.value}
                  maxValue={max}
                  color={m.anomaly ? COLORS.accent.red : COLORS.ink}
                  delay={50 + i * 4}
                  maxHeight={400}
                  width={70}
                />
                <div style={{ fontFamily: FONTS.body, fontSize: 16, color: COLORS.ink, marginTop: 12, opacity: m.anomaly ? 1 : 0.6 }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
