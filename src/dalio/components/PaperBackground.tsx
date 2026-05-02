import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS } from '../theme';

export const PaperBackground: React.FC<{ readonly children?: React.ReactNode }> = ({ children }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" opacity="0.08" fill={COLORS.ink} />
      </svg>
      {children}
    </AbsoluteFill>
  );
};
