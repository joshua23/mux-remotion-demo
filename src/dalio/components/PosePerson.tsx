/**
 * PosePerson — single character rendered via pose-animator LBS deformation.
 *
 * Deliberately NOT an AbsoluteFill — it's a sized, positionable building
 * block so multiple instances can coexist in one composition (e.g.,
 * Joshua + NaNa side-by-side in a Chapter 2 dialogue).
 *
 * Each instance owns its own paper.js PaperScope so multiple instances
 * don't share canvas state. The canvas itself is rendered into the DOM at
 * its native SVG resolution (1248×1664) and CSS-scaled to displayHeight —
 * skipping toDataURL → <img> round-trip that would cost ~150-300 ms / frame
 * per character (PNG encode + base64 + image decode).
 */
import React, { useRef, useEffect, useState } from 'react';
import { useCurrentFrame, delayRender, continueRender } from 'remotion';
// @ts-expect-error — pose-animator JS 没有 types
import paper from 'paper';
// @ts-expect-error
import { Skeleton } from '../pose-animator/skeleton';
// @ts-expect-error
import { PoseIllustration } from '../pose-animator/illustration';
// @ts-expect-error
import { SVGUtils } from '../pose-animator/svgUtils';

import type { Pose } from '../pose-animator/poses';
import { buildRigFace } from '../pose-animator/poses';

// Reference T-pose nose (must match the rigged SVG) — used to translate the
// face landmarks so the head follows the pose's nose offset.
const T_POSE_NOSE_X = 624;
const T_POSE_NOSE_Y = 220;

interface PosePersonProps {
  /** SVG asset URL (already rigged with skeleton group) */
  readonly svgSrc: string;
  /** Source SVG dimensions in its own coord space — used as canvas buffer size */
  readonly svgWidth: number;
  readonly svgHeight: number;
  /** Per-frame pose driver */
  readonly getPose: (frame: number) => Pose;
  /** Display height in composition pixels. Width auto-derived from aspect. */
  readonly displayHeight: number;
}

export const PosePerson: React.FC<PosePersonProps> = ({
  svgSrc,
  svgWidth,
  svgHeight,
  getPose,
  displayHeight,
}) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setupRef = useRef<{ scope: any; skeleton: any; illustration: any } | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    if (!canvasRef.current || setupRef.current) return;
    const handle = delayRender(`PosePerson init ${svgSrc}`);
    const init = async () => {
      try {
        const paperLib = paper.default ?? paper;
        const scope = new paperLib.PaperScope();
        scope.setup(canvasRef.current);
        // Force viewSize so paper.js draws into the FULL buffer, not the
        // CSS-shrunken display rectangle.
        scope.view.viewSize = new paperLib.Size(svgWidth, svgHeight);
        // paper.setup mutates canvas.style.width/height to the buffer's CSS
        // size (and doubles canvas.width for retina). React's inline style
        // doesn't reapply, so re-pin display dimensions explicitly here.
        canvasRef.current.style.width = `${displayHeight * (svgWidth / svgHeight)}px`;
        canvasRef.current.style.height = `${displayHeight}px`;
        const svgScope = await SVGUtils.importSVG(svgSrc);
        const skeleton = new Skeleton(svgScope);
        const illustration = new PoseIllustration(scope);
        illustration.bindSkeleton(skeleton, svgScope);
        setupRef.current = { scope, skeleton, illustration };
        setReady(true);
      } catch (e) {
        console.error('[PosePerson] init failed', svgSrc, e);
      } finally {
        continueRender(handle);
      }
    };
    void init();
  }, [svgSrc]);

  useEffect(() => {
    if (!ready || !setupRef.current || !canvasRef.current) return;
    // delayRender so render-mode waits for paper.js to finish drawing the
    // current frame before snapshotting the canvas. paper.js draws synchronously
    // so we can release the handle right after view.update().
    const handle = delayRender(`PosePerson frame ${frame}`);
    try {
      const { scope, skeleton, illustration } = setupRef.current;
      const pose = getPose(frame);
      const nose = pose.keypoints.find((kp) => kp.part === 'nose');
      const dx = nose ? nose.position.x - T_POSE_NOSE_X : 0;
      const dy = nose ? nose.position.y - T_POSE_NOSE_Y : 0;
      const face = buildRigFace(dx, dy);
      skeleton.reset();
      scope.project.clear();
      illustration.updateSkeleton(pose, face);
      illustration.draw();
      if (scope.view?.update) scope.view.update();
    } catch (e) {
      console.error('[PosePerson] frame failed', e);
    } finally {
      continueRender(handle);
    }
  }, [ready, frame, getPose]);

  const aspect = svgWidth / svgHeight;
  const displayWidth = displayHeight * aspect;

  // Canvas attribute width/height = drawing buffer (full SVG resolution).
  // CSS width/height = on-screen display size. Browser scales the buffer to
  // display, preserving pose-animator's high-res output without an img round-trip.
  return (
    <canvas
      ref={canvasRef}
      width={svgWidth}
      height={svgHeight}
      style={{ width: displayWidth, height: displayHeight, display: 'block' }}
    />
  );
};
