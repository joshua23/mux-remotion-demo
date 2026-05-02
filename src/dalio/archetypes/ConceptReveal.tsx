import React from 'react';
import { SceneCard } from '../components/SceneCard';
import { SnapIcon } from '../components/SnapIcon';
import { DrawPath } from '../components/DrawPath';
import { COLORS } from '../theme';
import type { OutlineCard } from '../../scripts/parse-gamma';

interface ConceptRevealProps {
  readonly card: OutlineCard;
  readonly icon?: React.ReactNode;
}

export const ConceptReveal: React.FC<ConceptRevealProps> = ({ card, icon }) => {
  return (
    <SceneCard title={card.title}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 40,
        }}
      >
        {icon && (
          <SnapIcon delay={5}>
            {icon}
          </SnapIcon>
        )}
        {/* Circle frame around concept */}
        <DrawPath
          d="M 200,100 A 100,100 0 1,1 200,100.01"
          strokeColor={COLORS.accent.teal}
          startFrame={8}
          width={400}
          height={200}
        />
        <p style={{ fontSize: 28, color: COLORS.ink, textAlign: 'center', maxWidth: 800 }}>
          {card.body}
        </p>
      </div>
    </SceneCard>
  );
};
