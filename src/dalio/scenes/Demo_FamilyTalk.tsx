/**
 * Demo_FamilyTalk — multi-character composition smoke test.
 *
 * Joshua (LEDGER_LEAN → POINT_RIGHT_DOWN) + NaNa (T_POSE) side-by-side, each
 * driven by their own pose timeline, sharing a single PaperBackground.
 *
 * Goal: prove that PosePerson is composable — multiple characters in one frame
 * with independent skeletons + paper.js scopes — before investing in real
 * per-character SVGs.
 */
import React, { useCallback } from 'react';
import { AbsoluteFill } from 'remotion';

import { PosePerson } from '../components/PosePerson';
import { PaperBackground } from '../components/PaperBackground';
import {
  T_POSE,
  LEDGER_LEAN,
  POINT_RIGHT_DOWN,
  runPoseTimeline,
  type Pose,
} from '../pose-animator/poses';
import { PERSONAS } from '../pose-animator/personas-registry';
import { COLORS, FONTS } from '../theme';

const JOSHUA_TIMELINE = [
  { at: 0, pose: T_POSE },
  { at: 30, pose: LEDGER_LEAN },
  { at: 90, pose: LEDGER_LEAN },
  { at: 120, pose: POINT_RIGHT_DOWN },
  { at: 180, pose: POINT_RIGHT_DOWN },
];

// NaNa stays at T_POSE for the mock — placeholder for future
// gesture timeline (e.g., crossing arms, pointing back, nodding).
const NANA_TIMELINE = [{ at: 0, pose: T_POSE }];

const BASE_DISPLAY_HEIGHT = 800;

export const Demo_FamilyTalk: React.FC = () => {
  const joshuaPose = useCallback((f: number): Pose => runPoseTimeline(JOSHUA_TIMELINE, f), []);
  const nanaPose = useCallback((f: number): Pose => runPoseTimeline(NANA_TIMELINE, f), []);
  const joshua = PERSONAS.joshua;
  const nana = PERSONAS.nana;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <PaperBackground />

      {/* Two characters anchored to bottom of frame, spaced ~30%/70% across */}
      <AbsoluteFill style={{ alignItems: 'flex-end', justifyContent: 'flex-end' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            width: '100%',
            paddingBottom: 40,
          }}
        >
          <Nameplate persona={joshua}>
            <PosePerson
              svgSrc={joshua.svgPath}
              svgWidth={joshua.svgWidth}
              svgHeight={joshua.svgHeight}
              getPose={joshuaPose}
              displayHeight={BASE_DISPLAY_HEIGHT * joshua.displayHeightFactor}
            />
          </Nameplate>

          <Nameplate persona={nana}>
            <PosePerson
              svgSrc={nana.svgPath}
              svgWidth={nana.svgWidth}
              svgHeight={nana.svgHeight}
              getPose={nanaPose}
              displayHeight={BASE_DISPLAY_HEIGHT * nana.displayHeightFactor}
            />
          </Nameplate>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Nameplate: React.FC<{
  persona: (typeof PERSONAS)[keyof typeof PERSONAS];
  children: React.ReactNode;
}> = ({ persona, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    {children}
    <div
      style={{
        marginTop: 12,
        padding: '6px 18px',
        borderRadius: 999,
        backgroundColor: persona.accentColor,
        color: COLORS.paper,
        fontFamily: FONTS.body,
        fontSize: 24,
        fontWeight: 600,
        letterSpacing: 0.5,
      }}
    >
      {persona.displayName}
    </div>
  </div>
);
