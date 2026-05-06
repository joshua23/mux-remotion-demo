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
      parts: [],
    },
  ],
  camera: [
    { at: 0, zoom: 1.0 },
    { at: 240, zoom: 1.05 },
  ],
};
