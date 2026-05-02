import React from 'react';
import { SceneCard } from '../components/SceneCard';
import { StackBuilder } from '../components/StackBuilder';
import { DrawPath } from '../components/DrawPath';
import { COLORS, FONTS } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface HierarchyNode {
  label: string;
  value?: string;
}

interface HierarchyProps {
  card: OutlineCard;
  rootLabel?: string;
  children?: HierarchyNode[];
}

const DEFAULT_CHILDREN: HierarchyNode[] = [
  { label: '餐饮外卖', value: '24%' },
  { label: '电商购物', value: '18%' },
  { label: '交通出行', value: '12%' },
  { label: '住房居家', value: '10%' },
  { label: '其他', value: '36%' },
];

export const Hierarchy: React.FC<HierarchyProps> = ({
  card,
  rootLabel = '总支出',
  children = DEFAULT_CHILDREN,
}) => {
  return (
    <SceneCard title={card.title}>
      <div style={{ position: 'relative', paddingTop: 40 }}>
        {/* Root node */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-block',
              backgroundColor: COLORS.accent.blue,
              color: '#fff',
              borderRadius: 8,
              padding: '16px 40px',
              fontFamily: FONTS.heading,
              fontSize: 28,
            }}
          >
            {rootLabel}
          </div>
        </div>

        {/* Connector lines */}
        <DrawPath
          d="M 540,0 L 540,40"
          strokeColor={COLORS.ink}
          startFrame={0}
          width={1080}
          height={40}
        />

        {/* Children nodes */}
        <StackBuilder
          items={children.map((child, i) => (
            <div
              key={i}
              style={{
                backgroundColor: COLORS.paper,
                border: `2px solid ${COLORS.ink}`,
                borderRadius: 8,
                padding: '12px 20px',
                fontFamily: FONTS.body,
                fontSize: 20,
                color: COLORS.ink,
                minWidth: 140,
                textAlign: 'center',
              }}
            >
              <div>{child.label}</div>
              {child.value && (
                <div style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.accent.blue }}>
                  {child.value}
                </div>
              )}
            </div>
          ))}
          staggerFrames={6}
        />
      </div>
    </SceneCard>
  );
};
