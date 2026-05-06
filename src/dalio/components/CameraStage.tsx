import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { CameraMove } from '../animation/types';

interface Props {
  readonly moves?: ReadonlyArray<CameraMove>;
  readonly children: React.ReactNode;
}

function resolve(m: CameraMove) {
  return { zoom: m.zoom ?? 1, panX: m.panX ?? 0, panY: m.panY ?? 0 };
}

function pickCamera(moves: ReadonlyArray<CameraMove>, frame: number) {
  if (moves.length === 0) return { zoom: 1, panX: 0, panY: 0 };
  if (frame <= moves[0].at) return resolve(moves[0]);
  if (frame >= moves[moves.length - 1].at) return resolve(moves[moves.length - 1]);
  for (let i = 0; i < moves.length - 1; i++) {
    const a = moves[i];
    const b = moves[i + 1];
    if (frame >= a.at && frame <= b.at) {
      const span = b.at - a.at;
      const t = span > 0 ? (frame - a.at) / span : 0;
      const ra = resolve(a);
      const rb = resolve(b);
      return {
        zoom: ra.zoom + (rb.zoom - ra.zoom) * t,
        panX: ra.panX + (rb.panX - ra.panX) * t,
        panY: ra.panY + (rb.panY - ra.panY) * t,
      };
    }
  }
  return { zoom: 1, panX: 0, panY: 0 };
}

export const CameraStage: React.FC<Props> = ({ moves = [], children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = pickCamera(moves, frame);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        data-camera="inner"
        style={{
          width,
          height,
          transformOrigin: 'center center',
          transform: `scale(${cam.zoom}) translate(${cam.panX}px, ${cam.panY}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
