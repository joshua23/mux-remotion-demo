import React from 'react';
import { SceneCard } from '../components/SceneCard';
import { SnapIcon } from '../components/SnapIcon';
import { DrawArrow } from '../components/DrawArrow';
import { COLORS, FONTS } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface CauseEffectNode {
  readonly label: string;
  readonly x: number;
  readonly y: number;
}

interface CauseEffectProps {
  readonly card: OutlineCard;
  readonly nodes?: CauseEffectNode[];
}

const DEFAULT_NODES: CauseEffectNode[] = [
  { label: '收入', x: 150, y: 200 },
  { label: '消费', x: 500, y: 200 },
  { label: '储蓄', x: 850, y: 200 },
];

export const CauseEffect: React.FC<CauseEffectProps> = ({ card, nodes = DEFAULT_NODES }) => {
  return (
    <SceneCard title={card.title}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <svg style={{ position: 'absolute', inset: 0 }} width="100%" height="100%">
          {nodes.slice(0, -1).map((node, i) => {
            const next = nodes[i + 1];
            const d = `M ${node.x + 80},${node.y} L ${next.x - 80},${next.y}`;
            return (
              <DrawArrow
                key={i}
                d={d}
                endPoint={{ x: next.x - 80, y: next.y, angle: 0 }}
                startFrame={i * 10}
                strokeColor={COLORS.accent.blue}
                width={1200}
                height={400}
              />
            );
          })}
        </svg>
        {nodes.map((node, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: node.x - 80,
              top: node.y - 40,
              width: 160,
              height: 80,
            }}
          >
            <SnapIcon delay={i * 8}>
              <div
                style={{
                  backgroundColor: COLORS.accent.teal,
                  color: '#fff',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontFamily: FONTS.body,
                  fontSize: 22,
                  textAlign: 'center',
                }}
              >
                {node.label}
              </div>
            </SnapIcon>
          </div>
        ))}
      </div>
    </SceneCard>
  );
};
