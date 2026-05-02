import React from 'react';
import { SceneCard } from '../components/SceneCard';
import { SnapIcon } from '../components/SnapIcon';
import { DrawArrow } from '../components/DrawArrow';
import { COLORS, FONTS } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface CycleProps {
  readonly card: OutlineCard;
  readonly nodes?: string[];
  readonly centerLabel?: string;
}

const DEFAULT_NODES = ['收入', '消费', '储蓄', '投资'];

export const Cycle: React.FC<CycleProps> = ({
  card,
  nodes = DEFAULT_NODES,
  centerLabel = '资金\n循环',
}) => {
  const cx = 540;
  const cy = 300;
  const r = 220;

  const nodePositions = nodes.map((_, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <SceneCard title={card.title}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <svg style={{ position: 'absolute', inset: 0 }} width="100%" height="100%" viewBox="0 0 1080 600">
          {nodePositions.map((pos, i) => {
            const next = nodePositions[(i + 1) % nodePositions.length];
            const angle = Math.atan2(next.y - pos.y, next.x - pos.x) * (180 / Math.PI);
            const d = `M ${pos.x},${pos.y} Q ${cx},${cy} ${next.x},${next.y}`;
            return (
              <DrawArrow
                key={i}
                d={d}
                endPoint={{ x: next.x, y: next.y, angle }}
                startFrame={i * 10}
                strokeColor={COLORS.accent.blue}
                width={1080}
                height={600}
              />
            );
          })}
        </svg>

        {/* Center node */}
        <div
          style={{
            position: 'absolute',
            left: cx - 70,
            top: cy - 70,
            width: 140,
            height: 140,
            borderRadius: '50%',
            backgroundColor: COLORS.accent.teal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#fff', fontFamily: FONTS.heading, fontSize: 24, textAlign: 'center', whiteSpace: 'pre-line' }}>
            {centerLabel}
          </span>
        </div>

        {/* Peripheral nodes */}
        {nodes.map((label, i) => {
          const pos = nodePositions[i];
          return (
            <div
              key={i}
              style={{ position: 'absolute', left: pos.x - 60, top: pos.y - 30 }}
            >
              <SnapIcon delay={i * 8 + 5}>
                <div
                  style={{
                    backgroundColor: COLORS.paper,
                    border: `2px solid ${COLORS.ink}`,
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontFamily: FONTS.body,
                    fontSize: 20,
                    color: COLORS.ink,
                  }}
                >
                  {label}
                </div>
              </SnapIcon>
            </div>
          );
        })}
      </div>
    </SceneCard>
  );
};
