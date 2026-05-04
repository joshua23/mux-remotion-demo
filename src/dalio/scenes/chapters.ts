/**
 * chapters.ts — declarative 8-chapter story data, v2 (story-driven key poses).
 *
 * Each cast member can be either:
 *   - kind: 'pose-animator' — T-pose source SVG driven through LBS by a
 *     timeline of pose presets (use only when full skeletal animation is needed)
 *   - kind: 'key-pose' — story-specific PNG/SVG (e.g., NaNa swiping a phone)
 *     displayed via KeyPoseImage with subtle Remotion motion (breathe/bob/sway)
 *
 * v2 prefers 'key-pose' for almost everything because a person actually doing
 * the thing communicates the chapter's beat far better than a T-pose with LBS
 * deformation.
 */
import { staticFile } from 'remotion';

import type { Pose } from '../pose-animator/poses';
import { T_POSE, runPoseTimeline } from '../pose-animator/poses';
import type { PersonaKey } from '../pose-animator/personas-registry';
import { PERSONAS } from '../pose-animator/personas-registry';
import type { KeyPoseMotion } from '../components/KeyPoseImage';

export interface PoseKeyframeData {
  readonly at: number;
  readonly pose: Pose;
}

interface BaseCast {
  /** Horizontal position 0..1 (left edge → right edge of frame) */
  readonly xPercent: number;
  /** Vertical position 0..1 (top → bottom). 1 = bottom-anchored. */
  readonly yPercent: number;
  /** Display height as fraction of frame height (e.g., 0.85). */
  readonly heightFraction: number;
}

export interface PoseAnimatorCast extends BaseCast {
  readonly kind: 'pose-animator';
  readonly persona: PersonaKey;
  readonly timeline: ReadonlyArray<PoseKeyframeData>;
}

export interface KeyPoseCast extends BaseCast {
  readonly kind: 'key-pose';
  /** Display label for the nameplate (optional — omit to hide nameplate). */
  readonly label?: string;
  /** Accent color for nameplate (defaults to ink). */
  readonly accentColor?: string;
  /** Asset URL — typically staticFile('keypose/<slug>.svg') or a persona's clean tpose SVG */
  readonly src: string;
  /** Source dimensions for aspect ratio */
  readonly imgWidth: number;
  readonly imgHeight: number;
  readonly motion?: KeyPoseMotion;
}

export type CastMember = PoseAnimatorCast | KeyPoseCast;

export interface Chapter {
  readonly id: string;
  readonly chapterNumber: number;
  readonly title: string;
  readonly insight: string;
  readonly narration: string;
  readonly durationFrames: number;
  readonly cast: ReadonlyArray<CastMember>;
}

// Helpers — all key-pose images are 1248×1664
const SRC = (slug: string): KeyPoseCast => ({
  kind: 'key-pose',
  src: staticFile(`keypose/${slug}.svg`),
  imgWidth: 1248,
  imgHeight: 1664,
  motion: 'breathe',
  xPercent: 0.5,
  yPercent: 1.0,
  heightFraction: 0.95,
});

const personaImg = (persona: PersonaKey): KeyPoseCast => ({
  kind: 'key-pose',
  src: PERSONAS[persona].svgPath,
  imgWidth: PERSONAS[persona].svgWidth,
  imgHeight: PERSONAS[persona].svgHeight,
  motion: 'breathe',
  label: PERSONAS[persona].displayName,
  accentColor: PERSONAS[persona].accentColor,
  xPercent: 0.5,
  yPercent: 1.0,
  heightFraction: PERSONAS[persona].displayHeightFactor * 0.85,
});

// Re-runner for pose-animator (kept for completeness; unused in v2 chapters)
export function buildPoseTimeline(timeline: ReadonlyArray<PoseKeyframeData>) {
  return (frame: number): Pose => runPoseTimeline(timeline.map((k) => ({ at: k.at, pose: k.pose })), frame);
}

// ────────────────────────────────────────────────────────────────────────────
// Chapter 1 — 账本翻开 (8s)
// ────────────────────────────────────────────────────────────────────────────
const CH1: Chapter = {
  id: 'ch1',
  chapterNumber: 1,
  title: '账本翻开',
  insight: '一年 1,835 笔账，第一次完整翻开',
  narration: '一年下来，我有一千八百三十五笔支付宝交易。今晚，我决定第一次把它们摊开看清楚。',
  durationFrames: 240,
  cast: [
    { ...SRC('joshua-desk-lean'), xPercent: 0.5, heightFraction: 0.85, label: '张啸 / Joshua' },
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Chapter 2 — 家是宇宙中心 (11s)
// ────────────────────────────────────────────────────────────────────────────
const CH2: Chapter = {
  id: 'ch2',
  chapterNumber: 2,
  title: '家是宇宙中心',
  insight: '50% 流向家人 — 但流向家的哪里？',
  narration: '一半的钱，都流向了家。但流向家的哪一个角落？是 NaNa、是燕燕、是龙、是国法，还是孩子？',
  durationFrames: 330,
  cast: [
    // Joshua pointing on the left (the explainer)
    { ...SRC('joshua-pointing'), xPercent: 0.18, heightFraction: 0.78, label: '张啸 / Joshua' },
    // 5 family members as smaller portraits clustered on the right
    { ...personaImg('nana'),   xPercent: 0.45, heightFraction: 0.55 },
    { ...personaImg('yanyan'), xPercent: 0.58, heightFraction: 0.52 },
    { ...personaImg('long'),   xPercent: 0.71, heightFraction: 0.55 },
    { ...personaImg('guofa'),  xPercent: 0.84, heightFraction: 0.58 },
    { ...personaImg('child'),  xPercent: 0.52, yPercent: 1.0, heightFraction: 0.36 },
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Chapter 3 — NaNa 的小账本 (9.5s)
// ────────────────────────────────────────────────────────────────────────────
const CH3: Chapter = {
  id: 'ch3',
  chapterNumber: 3,
  title: 'NaNa 的小账本',
  insight: 'NaNa 的高频小额 ≠ 大额转账',
  narration: '我以为 NaNa 的钱来自我每月的转账。错了。NaNa 用的是亲情卡 — 每天几十块的高频小额，加起来才是真相。',
  durationFrames: 285,
  cast: [
    { ...SRC('joshua-facepalm'), xPercent: 0.27, heightFraction: 0.78, label: '张啸 / Joshua' },
    { ...SRC('nana-phone'),       xPercent: 0.72, heightFraction: 0.85, label: 'NaNa', motion: 'sway' },
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Chapter 4 — 这不是引擎 (8s)
// ────────────────────────────────────────────────────────────────────────────
const CH4: Chapter = {
  id: 'ch4',
  chapterNumber: 4,
  title: '这不是引擎',
  insight: '余额宝一年 ¥430 收益 ≠ 我以为的 ¥144,702',
  narration: '我以为余额宝替我赚了十四万。其实呢？四百三十块。它不是发动机，只是一个停车位。',
  durationFrames: 240,
  cast: [
    { ...SRC('joshua-facepalm'), xPercent: 0.5, heightFraction: 0.88, label: '张啸 / Joshua' },
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Chapter 5 — 通勤 8% 代价 (8.5s)
// ────────────────────────────────────────────────────────────────────────────
const CH5: Chapter = {
  id: 'ch5',
  chapterNumber: 5,
  title: '通勤 8% 的代价',
  insight: '8% 花在交通上 — 时间和钱的双账',
  narration: '8% 的钱，付给了交通。但更贵的是时间 — 那些路上的小时，也是从生命里扣出来的。',
  durationFrames: 255,
  cast: [
    { ...SRC('joshua-watch'), xPercent: 0.5, heightFraction: 0.88, label: '张啸 / Joshua' },
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Chapter 6 — 业务的微光 (8s)
// ────────────────────────────────────────────────────────────────────────────
const CH6: Chapter = {
  id: 'ch6',
  chapterNumber: 6,
  title: '业务的微光',
  insight: '6.7% 业务流水 — 微光但是真实',
  narration: '皆柏贸易，给了我 6.7% 的业务流水。不耀眼，但它是唯一一个我自己点燃的火苗。',
  durationFrames: 240,
  cast: [
    { ...SRC('joshua-handshake'), xPercent: 0.32, heightFraction: 0.85, label: '张啸 / Joshua' },
    { ...SRC('long-handshake'),   xPercent: 0.68, heightFraction: 0.85, label: '龙', accentColor: '#3E5C7A' },
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Chapter 7 — 国法的红包 (7.5s)
// ────────────────────────────────────────────────────────────────────────────
const CH7: Chapter = {
  id: 'ch7',
  chapterNumber: 7,
  title: '国法的红包',
  insight: '长辈往来 — 礼仪经济，账本之外的规则',
  narration: '国法长辈每年的红包来去，不在我的策略账本里 — 但它在另一本账上：礼。',
  durationFrames: 225,
  cast: [
    { ...SRC('joshua-bow'),       xPercent: 0.32, heightFraction: 0.82, label: '张啸 / Joshua' },
    { ...SRC('guofa-envelope'),   xPercent: 0.68, heightFraction: 0.88, label: '国法' },
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Chapter 8 — 原则浮现 (9.5s)
// ────────────────────────────────────────────────────────────────────────────
const CH8: Chapter = {
  id: 'ch8',
  chapterNumber: 8,
  title: '原则浮现',
  insight: '12 个月、3 条原则：先看清家，再造引擎，最后留时间',
  narration: '十二个月翻完，浮出三条原则：先看清家、再造发动机、最后，把时间留给真正在意的人。',
  durationFrames: 285,
  cast: [
    // Joshua hero on left, holding three fingers
    { ...SRC('joshua-three-fingers'), xPercent: 0.28, heightFraction: 0.92, label: '张啸 / Joshua' },
    // Family clustered on right, smaller, layered like a portrait
    { ...personaImg('nana'),   xPercent: 0.58, heightFraction: 0.65 },
    { ...personaImg('yanyan'), xPercent: 0.66, heightFraction: 0.62 },
    { ...personaImg('long'),   xPercent: 0.78, heightFraction: 0.65 },
    { ...personaImg('guofa'),  xPercent: 0.88, heightFraction: 0.68 },
    { ...personaImg('child'),  xPercent: 0.71, yPercent: 1.0, heightFraction: 0.42 },
  ],
};

export const CHAPTERS: ReadonlyArray<Chapter> = [CH1, CH2, CH3, CH4, CH5, CH6, CH7, CH8];

export const TOTAL_FRAMES = CHAPTERS.reduce((sum, c) => sum + c.durationFrames, 0);
