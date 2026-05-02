import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { COLORS, FONTS } from '../theme';

interface TitleSpotlightProps {
  title: string;
  subtitle?: string;
}

export const TitleSpotlight: React.FC<TitleSpotlightProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();

  // Spotlight rotation: pivot at "400 130", ported from vibe-motion-skills light_spotlight_template
  const rotationAngle = interpolate(frame, [0, 60], [-15, 15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleOpacity = interpolate(frame, [10, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      {/* Spotlight SVG — mask + feGaussianBlur glow */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 1920 1080"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="spotlight-glow">
            <feGaussianBlur stdDeviation="0 19" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <mask id="spotlight-mask">
            <ellipse
              cx="960"
              cy="400"
              rx="500"
              ry="300"
              fill="white"
              filter="url(#spotlight-glow)"
              transform={`rotate(${rotationAngle}, 960, 400)`}
            />
          </mask>
        </defs>
        <rect width="1920" height="1080" fill={COLORS.ink} opacity="0.1" mask="url(#spotlight-mask)" />
      </svg>

      {/* Title text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        <h1
          style={{
            fontFamily: FONTS.heading,
            fontSize: 96,
            fontWeight: 700,
            color: COLORS.ink,
            textAlign: 'center',
            margin: 0,
            opacity: titleOpacity,
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: 36,
              color: COLORS.ink,
              opacity: subtitleOpacity * 0.7,
              textAlign: 'center',
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};
