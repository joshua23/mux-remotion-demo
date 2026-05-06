/**
 * KeyPoseImage — display a story-specific character pose as a near-static image
 * with subtle motion (breathing scale, bob, sway).
 *
 * Counterpart to PosePerson. Use this when the source image is already in the
 * intended pose (e.g., NaNa swiping a phone) rather than T-pose for LBS rigging.
 * Pose-animator's LBS struggles when pose deltas are large; for "doing
 * something" scenes the right answer is to start with the right image.
 *
 * Subtle motion options:
 *   - 'breathe' (default) — gentle scale 1.000 → 1.005 over 4 s
 *   - 'bob' — vertical translate ±4 px over 3 s
 *   - 'sway' — slight rotate ±0.5° over 5 s
 *   - 'none' — fully static
 */
import React from 'react';
import { useCurrentFrame, useVideoConfig, Img } from 'remotion';

export type KeyPoseMotion = 'breathe' | 'bob' | 'sway' | 'none';

interface KeyPoseImageProps {
  readonly src: string;
  readonly displayHeight: number;
  /** Source image dimensions for aspect ratio */
  readonly imgWidth: number;
  readonly imgHeight: number;
  readonly motion?: KeyPoseMotion;
}

export const KeyPoseImage: React.FC<KeyPoseImageProps> = ({
  src,
  displayHeight,
  imgWidth,
  imgHeight,
  motion = 'breathe',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const breath =
    motion === 'breathe' ? 1 + 0.005 * Math.sin((2 * Math.PI * frame) / (fps * 4)) : 1;
  const bob = motion === 'bob' ? 4 * Math.sin((2 * Math.PI * frame) / (fps * 3)) : 0;
  const sway = motion === 'sway' ? 0.5 * Math.sin((2 * Math.PI * frame) / (fps * 5)) : 0;

  const aspect = imgWidth / imgHeight;
  const displayWidth = displayHeight * aspect;

  return (
    <Img
      src={src}
      alt=""
      style={{
        width: displayWidth,
        height: displayHeight,
        display: 'block',
        transform: `translateY(${bob}px) rotate(${sway}deg) scale(${breath})`,
        transformOrigin: 'center bottom',
      }}
    />
  );
};
