/**
 * ChapterSceneV2 — uses LayeredCharacter + CameraStage. Otherwise mirrors
 * ChapterScene v1 (PaperBackground, title block, narration subtitle).
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

import { PaperBackground } from '../components/PaperBackground';
import { LayeredCharacter } from '../components/LayeredCharacter';
import { CameraStage } from '../components/CameraStage';
import { COLORS, FONTS } from '../theme';
import type { Chapter } from './chapters';
import type { LayeredCharacterDef, CameraMove } from '../animation/types';

export interface ChapterV2 extends Chapter {
  readonly layeredCast: ReadonlyArray<LayeredCharacterDef>;
  readonly camera?: ReadonlyArray<CameraMove>;
}

export const ChapterSceneV2: React.FC<{ readonly chapter: ChapterV2 }> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const { width: vw, height: vh } = useVideoConfig();

  const titleOpacity = interpolate(
    frame,
    [0, 18, chapter.durationFrames - 24, chapter.durationFrames - 8],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 0.2, 1) },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <PaperBackground />

      <CameraStage moves={chapter.camera}>
        {chapter.layeredCast.map((c, i) => {
          const heightPx = vh * c.heightFraction;
          const aspect = c.imgWidth / c.imgHeight;
          const widthPx = heightPx * aspect;
          const cx = vw * c.xPercent;
          const bottom = vh * (1 - c.yPercent);
          return (
            <div
              key={`${chapter.id}-lc-${i}`}
              style={{
                position: 'absolute',
                left: cx - widthPx / 2,
                bottom,
                width: widthPx,
                height: heightPx,
              }}
            >
              <LayeredCharacter
                src={c.src}
                imgWidth={c.imgWidth}
                imgHeight={c.imgHeight}
                displayHeight={heightPx}
                parts={c.parts}
              />
            </div>
          );
        })}
      </CameraStage>

      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 80,
          opacity: titleOpacity,
          fontFamily: FONTS.heading,
          color: COLORS.ink,
          maxWidth: vw * 0.55,
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.55, marginBottom: 6, fontFamily: FONTS.mono }}>
          第 {chapter.chapterNumber} 章 · {chapter.id.toUpperCase()}
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{chapter.title}</div>
        <div style={{ fontSize: 26, marginTop: 14, opacity: 0.7, fontFamily: FONTS.body }}>
          {chapter.insight}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 70,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 80px',
          opacity: titleOpacity,
          fontFamily: FONTS.body,
          color: COLORS.ink,
          fontSize: 32,
          lineHeight: 1.4,
          textShadow: `0 0 20px ${COLORS.paper}, 0 0 20px ${COLORS.paper}`,
        }}
      >
        {chapter.narration}
      </div>
    </AbsoluteFill>
  );
};
