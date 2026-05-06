import { staticFile } from 'remotion';
import type { ChapterV2 } from './ChapterSceneV2';

export const CH1_V2: ChapterV2 = {
  id: 'ch1-v2',
  chapterNumber: 1,
  title: '账本翻开',
  insight: '一年 1,835 笔账，第一次完整翻开',
  narration:
    '一年下来，我有一千八百三十五笔支付宝交易。今晚，我决定第一次把它们摊开看清楚。',
  durationFrames: 240,
  cast: [],
  layeredCast: [
    {
      src: staticFile('keypose-v2/joshua-desk-lean.svg'),
      imgWidth: 1509,
      imgHeight: 2048,
      xPercent: 0.5,
      yPercent: 1.0,
      heightFraction: 0.85,
      label: '张啸 / Joshua',
      enter: 'fadeUp',
      parts: [
        // Head: still while writing → lifts thoughtfully on "今晚我决定" → settles
        {
          partId: 'head',
          keyframes: [
            { at: 0, rotate: 0 },
            { at: 90, rotate: 0, easing: 'inOut' },
            { at: 130, rotate: -8, easing: 'inOut' },
            { at: 180, rotate: -3, easing: 'inOut' },
            { at: 240, rotate: 0 },
          ],
        },
        // Face follows the head one-for-one (same pivot)
        {
          partId: 'face',
          keyframes: [
            { at: 0, rotate: 0 },
            { at: 90, rotate: 0, easing: 'inOut' },
            { at: 130, rotate: -8, easing: 'inOut' },
            { at: 180, rotate: -3, easing: 'inOut' },
            { at: 240, rotate: 0 },
          ],
        },
        // Writing-arm wrist wobble during the "1835 笔" beat (frames 0-120)
        {
          partId: 'R-arm',
          keyframes: [
            { at: 0, rotate: 0 },
            { at: 30, rotate: 1, easing: 'inOut' },
            { at: 60, rotate: -1, easing: 'inOut' },
            { at: 90, rotate: 1, easing: 'inOut' },
            { at: 120, rotate: 0, easing: 'inOut' },
            { at: 240, rotate: 0 },
          ],
        },
        // Subtle drift on the chin-prop arm
        {
          partId: 'L-arm',
          keyframes: [
            { at: 0, rotate: 0 },
            { at: 240, rotate: 0.5, easing: 'inOut' },
          ],
        },
        // Breathing scale on torso (chest expand/contract)
        {
          partId: 'torso',
          keyframes: [
            { at: 0, scale: 1.0 },
            { at: 60, scale: 1.005, easing: 'inOut' },
            { at: 120, scale: 1.0, easing: 'inOut' },
            { at: 180, scale: 1.005, easing: 'inOut' },
            { at: 240, scale: 1.0 },
          ],
        },
      ],
    },
  ],
  camera: [
    { at: 0, zoom: 1.0 },
    { at: 240, zoom: 1.05 },
  ],
};
