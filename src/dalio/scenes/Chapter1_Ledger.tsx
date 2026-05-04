/**
 * Chapter 1 — "翻账本" (Open the ledger)
 *
 * Joshua leans over a desk, scans his Alipay ledger row-by-row, then
 * points at one entry that catches his attention. Final pose: writing.
 *
 * 180 frames @ 30fps = 6 seconds.
 *
 * Timeline (frames):
 *   0   T-pose                — initial
 *   30  LEDGER_LEAN           — bends down to read
 *   90  LEDGER_LEAN           — hold (scanning)
 *   120 POINT_RIGHT_DOWN      — notices an entry, points
 *   150 WRITING_HEAD_DOWN     — starts noting in margin
 *   180 WRITING_HEAD_DOWN     — hold
 */
import React, { useCallback } from 'react';
import { staticFile } from 'remotion';

import { PoseAnimatorScene } from './PoseAnimatorScene';
import {
  T_POSE,
  LEDGER_LEAN,
  WRITING_HEAD_DOWN,
  POINT_RIGHT_DOWN,
  runPoseTimeline,
  type Pose,
} from '../pose-animator/poses';

const TIMELINE = [
  { at: 0, pose: T_POSE },
  { at: 30, pose: LEDGER_LEAN },
  { at: 90, pose: LEDGER_LEAN },
  { at: 120, pose: POINT_RIGHT_DOWN },
  { at: 150, pose: WRITING_HEAD_DOWN },
  { at: 180, pose: WRITING_HEAD_DOWN },
];

export const Chapter1_Ledger: React.FC = () => {
  const getPose = useCallback((frame: number): Pose => runPoseTimeline(TIMELINE, frame), []);

  return (
    <PoseAnimatorScene
      svgSrc={staticFile('joshua-tpose-clean.svg')}
      svgWidth={1248}
      svgHeight={1664}
      getPose={getPose}
    />
  );
};
