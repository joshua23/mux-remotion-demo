/**
 * LottieTest — 验证 @remotion/lottie 管线 + 4 个免费 Lottie 样本
 * 一行排开看 toon 风格质感对比
 */
import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { Lottie, LottieAnimationData } from '@remotion/lottie';
import { PaperBackground } from '../components/PaperBackground';
import { COLORS, FONTS } from '../theme';

import hamsterAnim from '../lotties/hamster.json';
import gatinAnim from '../lotties/gatin.json';
import happyAnim from '../lotties/happy2016.json';
import bodymovinAnim from '../lotties/bodymovin.json';

const samples: { name: string; data: unknown }[] = [
  { name: 'Hamster', data: hamsterAnim },
  { name: 'Gatin', data: gatinAnim },
  { name: 'Happy 2016', data: happyAnim },
  { name: 'Bodymovin', data: bodymovinAnim },
];

export const LottieTest: React.FC = () => {
  return (
    <AbsoluteFill>
      <PaperBackground />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80 }}>
        <h1 style={{ fontFamily: FONTS.heading, fontSize: 56, color: COLORS.ink, margin: 0 }}>
          Lottie 测试 · 4 个 toon 样本
        </h1>
        <p style={{ fontFamily: FONTS.body, fontSize: 22, color: COLORS.ink, opacity: 0.6, marginTop: 12 }}>
          看动画质感是否符合预期
        </p>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 60, alignItems: 'center' }}>
          {samples.map((s) => (
            <div key={s.name} style={{ textAlign: 'center' }}>
              <div style={{ width: 360, height: 360, background: '#F9F6F0', border: `1px solid ${COLORS.ink}33`, borderRadius: 8, padding: 12 }}>
                <Lottie
                  animationData={s.data as LottieAnimationData}
                  loop
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <p style={{ fontFamily: FONTS.body, fontSize: 18, color: COLORS.ink, marginTop: 12 }}>{s.name}</p>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
