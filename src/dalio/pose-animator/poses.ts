/**
 * Pose presets for Joshua T-pose SVG (1248×1664 pixel space).
 *
 * Coordinates MUST match `auto_rig.py` BODY_KEYPOINTS for the T-pose baseline,
 * because pose-animator uses LBS where rig pose = rest pose. Any drift from rig
 * coordinates translates the whole bone group at runtime.
 *
 * Other poses (lean, write, point) are derived by adjusting specific joints
 * while leaving the rest at their T-pose anchors.
 */

export type Vec2 = { x: number; y: number };

export type PoseNetKeypoint = {
  part: string;
  position: Vec2;
  score: number;
};

export type Pose = {
  score: number;
  keypoints: PoseNetKeypoint[];
};

// SVG dimensions
export const SVG_W = 1248;
export const SVG_H = 1664;

/**
 * T-pose baseline — exact match with `/tmp/path-b-test/auto_rig.py` BODY_KEYPOINTS.
 * Edit ONLY if you re-rig the source SVG.
 */
const T_POSE_POSITIONS: Record<string, Vec2> = {
  nose: { x: 624, y: 220 },
  rightEar: { x: 580, y: 200 },
  leftEar: { x: 668, y: 200 },
  rightShoulder: { x: 460, y: 390 },
  leftShoulder: { x: 790, y: 390 },
  rightElbow: { x: 240, y: 430 },
  leftElbow: { x: 1010, y: 430 },
  rightWrist: { x: 70, y: 440 },
  leftWrist: { x: 1180, y: 440 },
  rightHip: { x: 560, y: 810 },
  leftHip: { x: 700, y: 810 },
  rightKnee: { x: 560, y: 1170 },
  leftKnee: { x: 700, y: 1170 },
  rightAnkle: { x: 560, y: 1530 },
  leftAnkle: { x: 700, y: 1530 },
};

const POSENET_PARTS = Object.keys(T_POSE_POSITIONS);

function makePose(overrides: Partial<Record<string, Vec2>> = {}): Pose {
  return {
    score: 1.0,
    keypoints: POSENET_PARTS.map((part) => ({
      part,
      position: overrides[part] ?? T_POSE_POSITIONS[part],
      score: 1.0,
    })),
  };
}

export const T_POSE: Pose = makePose();

/**
 * Pose-design rules (learned the hard way):
 *
 * 1. **Keep shoulders/hips ANCHORED** to T-pose. They're the root of upper/lower
 *    body bone chains. Moving them shifts huge swaths of skinned cloth → ugly
 *    distortion in the torso, neck, waist.
 * 2. **Head/face: keep ears within ~25px of T-pose y.** The ears define the
 *    face-bone baseline; large ear deltas shrink/skew the entire face.
 * 3. **Only move elbows + wrists liberally.** The arm chain (shoulder→elbow→
 *    wrist) tolerates large rotation around the fixed shoulder anchor.
 * 4. Don't pull both wrists toward the centerline simultaneously — both sleeves'
 *    LBS will compress the chest fabric. Stagger them or keep one anchored.
 */

/**
 * LEDGER_LEAN — Joshua's forearms lower onto the desk while his head dips
 * slightly. Shoulders + hips stay at T-pose to preserve torso silhouette.
 */
export const LEDGER_LEAN: Pose = makePose({
  // Subtle head dip (small y delta keeps face proportions)
  nose: { x: 624, y: 245 },
  rightEar: { x: 583, y: 220 },
  leftEar: { x: 665, y: 220 },
  // Right arm: elbow bends forward + slightly down (rotated ~30° from horizontal)
  rightElbow: { x: 320, y: 560 },
  rightWrist: { x: 430, y: 760 },
  // Left arm: mirrored
  leftElbow: { x: 930, y: 560 },
  leftWrist: { x: 820, y: 760 },
});

/**
 * WRITING_HEAD_DOWN — right hand brought slightly inward (writing position),
 * left hand stays planted further out. Head dips a bit more than LEDGER_LEAN.
 */
export const WRITING_HEAD_DOWN: Pose = makePose({
  nose: { x: 624, y: 270 },
  rightEar: { x: 585, y: 240 },
  leftEar: { x: 663, y: 240 },
  // Right hand: writing position (closer to body center, lower)
  rightElbow: { x: 360, y: 600 },
  rightWrist: { x: 540, y: 820 },
  // Left forearm: rests on desk, slightly inward
  leftElbow: { x: 920, y: 580 },
  leftWrist: { x: 800, y: 760 },
});

/**
 * POINT_RIGHT_DOWN — character's right arm (viewer's left) reaches forward+down.
 * Used to point at a ledger row, an object on the desk, etc.
 */
export const POINT_RIGHT_DOWN: Pose = makePose({
  rightElbow: { x: 360, y: 580 },
  rightWrist: { x: 480, y: 780 },
  leftElbow: { x: 1010, y: 530 },
  leftWrist: { x: 1100, y: 700 },
});

/**
 * POINT_LEFT_DOWN — mirror. Character's left arm (viewer's right) points down.
 * Useful when Joshua addresses NaNa/family on the right side of frame.
 */
export const POINT_LEFT_DOWN: Pose = makePose({
  leftElbow: { x: 890, y: 580 },
  leftWrist: { x: 770, y: 780 },
  rightElbow: { x: 240, y: 530 },
  rightWrist: { x: 150, y: 700 },
});

/**
 * ARMS_UP — both arms raised in celebration / "aha!" moment.
 * Used for Ch6 success + Ch8 finale.
 */
export const ARMS_UP: Pose = makePose({
  rightElbow: { x: 380, y: 250 },
  rightWrist: { x: 320, y: 90 },
  leftElbow: { x: 870, y: 250 },
  leftWrist: { x: 930, y: 90 },
});

/**
 * BOW — head tilts down + arms forward at hip-height (greeting elders).
 * Subtle — keeps shoulders/hips anchored to avoid LBS distortion.
 */
export const BOW: Pose = makePose({
  nose: { x: 624, y: 280 },
  rightEar: { x: 588, y: 245 },
  leftEar: { x: 660, y: 245 },
  rightElbow: { x: 410, y: 600 },
  rightWrist: { x: 540, y: 740 },
  leftElbow: { x: 840, y: 600 },
  leftWrist: { x: 710, y: 740 },
});

/**
 * HAND_TO_HEAD — character's right hand raises to temple (thinking, surprise,
 * realization). Left arm at side. Used for Ch4 reversal moment.
 */
export const HAND_TO_HEAD: Pose = makePose({
  rightElbow: { x: 470, y: 400 },
  rightWrist: { x: 580, y: 230 },
  leftElbow: { x: 1010, y: 530 },
  leftWrist: { x: 1100, y: 700 },
});

/**
 * LOOKING_DOWN — strong head tilt, arms relaxed at sides. Pensive / sad mood.
 * For Ch5 (commute fatigue) or Ch7 (respectful pause).
 */
export const LOOKING_DOWN: Pose = makePose({
  nose: { x: 620, y: 295 },
  rightEar: { x: 590, y: 260 },
  leftEar: { x: 658, y: 260 },
  rightElbow: { x: 250, y: 510 },
  rightWrist: { x: 200, y: 690 },
  leftElbow: { x: 1000, y: 510 },
  leftWrist: { x: 1050, y: 690 },
});

// ────────────────────────────────────────────────────────────────────────────
// Interpolation helpers
// ────────────────────────────────────────────────────────────────────────────

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const lerpVec = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});

/** Smoothstep easing (ease-in-out cubic) for natural motion. */
const smoothstep = (t: number): number => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

/**
 * Blend two poses at t∈[0,1] (smoothstep-eased). Both poses must have the
 * same keypoint set & order (use makePose-built constants).
 */
export function interpolatePose(a: Pose, b: Pose, t: number): Pose {
  const eased = smoothstep(t);
  return {
    score: 1.0,
    keypoints: a.keypoints.map((kpA, i) => {
      const kpB = b.keypoints[i];
      return {
        part: kpA.part,
        position: lerpVec(kpA.position, kpB.position, eased),
        score: 1.0,
      };
    }),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Face data — needed to satisfy pose-animator's updateFaceParts() if-branch.
//
// Background: pose-animator computes face bone positions via baseTransFunc
// whose reference frame is leftJaw2 ↔ rightJaw2 (≈220px apart). When `face`
// is null, it falls back to using ear positions (≈88px apart) as the same
// reference — shrinking the entire face to ~40% size. Passing a valid face
// object (positions matching the rig) keeps face bones at rig scale.
//
// Order MUST match `facePartNames` in skeleton.js (73 landmarks, 146 floats).
// Generated from public/joshua-tpose-rigged.svg — regenerate if SVG re-rigged.
// ────────────────────────────────────────────────────────────────────────────

const RIG_FACE_POSITIONS: readonly number[] = [
  624, 140, 594, 145, 574, 155, 654, 145, 674, 155, 534, 200, 519, 210, 514, 220, 514, 230, 519,
  240, 529, 255, 539, 270, 549, 280, 624, 290, 699, 280, 709, 270, 719, 255, 729, 240, 734, 230,
  734, 220, 729, 210, 714, 200, 574, 195, 584, 192, 594, 190, 604, 192, 609, 195, 639, 195, 644,
  192, 654, 190, 664, 192, 674, 195, 624, 210, 624, 215, 624, 220, 624, 225, 612, 228, 616, 232,
  624, 235, 632, 232, 636, 228, 574, 210, 581, 207, 589, 207, 596, 210, 589, 213, 581, 213, 652,
  210, 659, 207, 667, 207, 674, 210, 667, 213, 659, 213, 599, 255, 609, 250, 616, 248, 624, 248,
  632, 248, 639, 250, 649, 255, 639, 262, 632, 265, 624, 265, 616, 265, 609, 262, 604, 256, 616,
  255, 624, 255, 632, 255, 644, 256, 632, 260, 624, 260, 616, 260,
];

export type FaceFrame = {
  positions: number[];
  scaledMesh: number[][];
  faceInViewConfidence: number;
};

/**
 * Build a face object satisfying pose-animator's IF-branch in updateFaceParts.
 * Face landmarks stay at rig positions (so head proportions are preserved),
 * optionally translated by (dx, dy) to match a head-tilt in the body pose.
 */
export function buildRigFace(dx: number = 0, dy: number = 0): FaceFrame {
  const positions = RIG_FACE_POSITIONS.slice() as number[];
  if (dx !== 0 || dy !== 0) {
    for (let i = 0; i < positions.length; i += 2) {
      positions[i] += dx;
      positions[i + 1] += dy;
    }
  }
  return {
    positions,
    scaledMesh: [],
    faceInViewConfidence: 1.0,
  };
}

export type PoseKeyframe = { at: number; pose: Pose };

/**
 * Drive a pose animation from a list of keyframes. Holds at the first/last
 * pose outside the timeline. Each segment uses smoothstep easing.
 */
export function runPoseTimeline(keyframes: PoseKeyframe[], frame: number): Pose {
  if (keyframes.length === 0) return T_POSE;
  if (frame <= keyframes[0].at) return keyframes[0].pose;
  if (frame >= keyframes[keyframes.length - 1].at) return keyframes[keyframes.length - 1].pose;

  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (frame >= a.at && frame <= b.at) {
      const t = (frame - a.at) / (b.at - a.at);
      return interpolatePose(a.pose, b.pose, t);
    }
  }
  return keyframes[keyframes.length - 1].pose;
}
