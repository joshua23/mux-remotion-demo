import React from 'react';
import { Sequence } from 'remotion';
import { SnapIcon } from './SnapIcon';

interface StackBuilderProps {
  readonly items: React.ReactNode[];
  readonly staggerFrames?: number;
}

export const StackBuilder: React.FC<StackBuilderProps> = ({ items, staggerFrames = 8 }) => {
  return (
    <>
      {items.map((item, i) => (
        <Sequence key={i} from={i * staggerFrames}>
          <SnapIcon delay={0}>{item}</SnapIcon>
        </Sequence>
      ))}
    </>
  );
};
