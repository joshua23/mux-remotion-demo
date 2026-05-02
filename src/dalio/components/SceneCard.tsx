import React from 'react';
import { AbsoluteFill } from 'remotion';
import { PaperBackground } from './PaperBackground';
import { FONTS, LAYOUT, COLORS } from '../theme';

interface SceneCardProps {
  title: string;
  timeRange?: string;
  children?: React.ReactNode;
}

export const SceneCard: React.FC<SceneCardProps> = ({ title, timeRange, children }) => {
  return (
    <AbsoluteFill>
      <PaperBackground>
        <div
          style={{
            position: 'absolute',
            inset: LAYOUT.marginPx,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <header style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontFamily: FONTS.heading,
                fontSize: 56,
                fontWeight: 700,
                color: COLORS.ink,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>
            {timeRange && (
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 22,
                  color: COLORS.ink,
                  opacity: 0.6,
                  marginTop: 8,
                  display: 'block',
                }}
              >
                {timeRange}
              </span>
            )}
          </header>
          <main style={{ flex: 1 }}>{children}</main>
        </div>
      </PaperBackground>
    </AbsoluteFill>
  );
};
