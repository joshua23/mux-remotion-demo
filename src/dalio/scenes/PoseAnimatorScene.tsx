/**
 * PoseAnimatorScene — single-character full-screen wrapper around PosePerson.
 *
 * Kept for backward compat (Chapter1_Ledger + Z-PoseAnimator preview both
 * still mount this). Multi-character scenes should use PosePerson directly.
 */
import React, { useCallback } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

import { PosePerson } from '../components/PosePerson';
import type { Pose } from '../pose-animator/poses';
import { COLORS, FONTS } from '../theme';

interface PoseAnimatorSceneProps {
  readonly svgSrc: string;
  readonly svgWidth?: number;
  readonly svgHeight?: number;
  /** Per-frame pose driver. Falls back to legacy mock right-arm wave if omitted. */
  readonly getPose?: (frame: number) => Pose;
}

/**
 * Legacy mock pose — animates a right-arm wave. Used only by the
 * Z-PoseAnimator preview when no `getPose` prop is provided.
 */
function buildMockPose(frame: number, w: number, h: number): Pose {
  const cx = w / 2;
  const HEAD_Y = h * 0.18;
  const SHOULDER_Y = h * 0.32;
  const HIP_Y = h * 0.55;
  const KNEE_Y = h * 0.75;
  const ANKLE_Y = h * 0.95;
  const SHOULDER_OFFSET = w * 0.12;
  const HIP_OFFSET = w * 0.08;
  const ARM_LEN = h * 0.18;

  const waveAngle = interpolate(
    frame,
    [0, 30, 60, 90, 120],
    [0, -Math.PI / 2, 0, -Math.PI / 2, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.42, 0, 0.58, 1) }
  );

  const rightShoulder = { x: cx + SHOULDER_OFFSET, y: SHOULDER_Y };
  const rightElbow = {
    x: rightShoulder.x + ARM_LEN * 0.5 * Math.cos(waveAngle - Math.PI / 12),
    y: rightShoulder.y + ARM_LEN * 0.5 * Math.sin(waveAngle - Math.PI / 12),
  };
  const rightWrist = {
    x: rightElbow.x + ARM_LEN * 0.5 * Math.cos(waveAngle),
    y: rightElbow.y + ARM_LEN * 0.5 * Math.sin(waveAngle),
  };

  return {
    score: 1.0,
    keypoints: [
      { part: 'nose', position: { x: cx, y: HEAD_Y - h * 0.04 }, score: 1.0 },
      { part: 'leftEar', position: { x: cx - w * 0.05, y: HEAD_Y - h * 0.05 }, score: 1.0 },
      { part: 'rightEar', position: { x: cx + w * 0.05, y: HEAD_Y - h * 0.05 }, score: 1.0 },
      { part: 'leftShoulder', position: { x: cx - SHOULDER_OFFSET, y: SHOULDER_Y }, score: 1.0 },
      { part: 'rightShoulder', position: rightShoulder, score: 1.0 },
      { part: 'leftElbow', position: { x: cx - SHOULDER_OFFSET - 5, y: SHOULDER_Y + ARM_LEN * 0.5 }, score: 1.0 },
      { part: 'leftWrist', position: { x: cx - SHOULDER_OFFSET - 8, y: SHOULDER_Y + ARM_LEN }, score: 1.0 },
      { part: 'rightElbow', position: rightElbow, score: 1.0 },
      { part: 'rightWrist', position: rightWrist, score: 1.0 },
      { part: 'leftHip', position: { x: cx - HIP_OFFSET, y: HIP_Y }, score: 1.0 },
      { part: 'rightHip', position: { x: cx + HIP_OFFSET, y: HIP_Y }, score: 1.0 },
      { part: 'leftKnee', position: { x: cx - HIP_OFFSET, y: KNEE_Y }, score: 1.0 },
      { part: 'rightKnee', position: { x: cx + HIP_OFFSET, y: KNEE_Y }, score: 1.0 },
      { part: 'leftAnkle', position: { x: cx - HIP_OFFSET, y: ANKLE_Y }, score: 1.0 },
      { part: 'rightAnkle', position: { x: cx + HIP_OFFSET, y: ANKLE_Y }, score: 1.0 },
    ],
  };
}

export const PoseAnimatorScene: React.FC<PoseAnimatorSceneProps> = ({
  svgSrc,
  svgWidth = 1248,
  svgHeight = 1664,
  getPose,
}) => {
  const frame = useCurrentFrame();
  const { height: vh } = useVideoConfig();
  const driver = useCallback(
    (f: number): Pose => (getPose ? getPose(f) : buildMockPose(f, svgWidth, svgHeight)),
    [getPose, svgWidth, svgHeight]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, alignItems: 'center', justifyContent: 'center' }}>
      <PosePerson
        svgSrc={svgSrc}
        svgWidth={svgWidth}
        svgHeight={svgHeight}
        getPose={driver}
        displayHeight={vh * 0.95}
      />
      <div
        style={{
          position: 'absolute',
          left: 40,
          bottom: 40,
          fontFamily: FONTS.mono,
          fontSize: 18,
          color: COLORS.ink,
          opacity: 0.5,
        }}
      >
        frame {frame}
      </div>
    </AbsoluteFill>
  );
};
