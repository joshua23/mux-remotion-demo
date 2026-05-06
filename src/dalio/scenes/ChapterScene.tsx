/**
 * ChapterScene — render any chapter from declarative chapter data.
 *
 * v2: cast members are either pose-animator (T-pose + LBS timeline) OR
 * key-pose (story-specific image with subtle motion). Branches per kind.
 */
import React, { useCallback } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

import { PosePerson } from '../components/PosePerson';
import { PaperBackground } from '../components/PaperBackground';
import { KeyPoseImage } from '../components/KeyPoseImage';
import { runPoseTimeline, type Pose } from '../pose-animator/poses';
import { PERSONAS } from '../pose-animator/personas-registry';
import { COLORS, FONTS } from '../theme';
import type { Chapter, CastMember, PoseAnimatorCast, KeyPoseCast } from './chapters';

interface ChapterSceneProps {
  readonly chapter: Chapter;
}

export const ChapterScene: React.FC<ChapterSceneProps> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const { width: vw, height: vh } = useVideoConfig();

  const titleOpacity = interpolate(
    frame,
    [0, 18, chapter.durationFrames - 24, chapter.durationFrames - 8],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  const subtitleY = interpolate(
    frame,
    [10, 30],
    [40, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );
  const subtitleOpacity = interpolate(
    frame,
    [10, 28, chapter.durationFrames - 24, chapter.durationFrames - 8],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <PaperBackground />

      {chapter.cast.map((member, i) => (
        <CastSlot key={`${chapter.id}-${i}`} member={member} vw={vw} vh={vh} />
      ))}

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
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
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

const CastSlot: React.FC<{ member: CastMember; vw: number; vh: number }> = ({ member, vw, vh }) => {
  const heightPx = vh * member.heightFraction;
  const cx = vw * member.xPercent;
  const bottom = vh * (1 - member.yPercent);

  if (member.kind === 'pose-animator') {
    return <PoseAnimatorSlot member={member} cx={cx} bottom={bottom} heightPx={heightPx} />;
  }
  return <KeyPoseSlot member={member} cx={cx} bottom={bottom} heightPx={heightPx} />;
};

const PoseAnimatorSlot: React.FC<{
  member: PoseAnimatorCast;
  cx: number;
  bottom: number;
  heightPx: number;
}> = ({ member, cx, bottom, heightPx }) => {
  const persona = PERSONAS[member.persona];
  const timeline = member.timeline;
  const driver = useCallback(
    (f: number): Pose =>
      runPoseTimeline(timeline.map((kf) => ({ at: kf.at, pose: kf.pose })), f),
    [timeline]
  );
  const aspect = persona.svgWidth / persona.svgHeight;
  const widthPx = heightPx * aspect;
  return (
    <div style={{ position: 'absolute', left: cx - widthPx / 2, bottom, width: widthPx, height: heightPx }}>
      <PosePerson
        svgSrc={persona.svgPath}
        svgWidth={persona.svgWidth}
        svgHeight={persona.svgHeight}
        getPose={driver}
        displayHeight={heightPx}
      />
    </div>
  );
};

const KeyPoseSlot: React.FC<{
  member: KeyPoseCast;
  cx: number;
  bottom: number;
  heightPx: number;
}> = ({ member, cx, bottom, heightPx }) => {
  const aspect = member.imgWidth / member.imgHeight;
  const widthPx = heightPx * aspect;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - widthPx / 2,
        bottom,
        width: widthPx,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <KeyPoseImage
        src={member.src}
        displayHeight={heightPx}
        imgWidth={member.imgWidth}
        imgHeight={member.imgHeight}
        motion={member.motion}
      />
      {member.label && (
        <div
          style={{
            marginTop: 8,
            padding: '4px 14px',
            borderRadius: 999,
            backgroundColor: member.accentColor ?? COLORS.ink,
            color: COLORS.paper,
            fontFamily: FONTS.body,
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          {member.label}
        </div>
      )}
    </div>
  );
};
