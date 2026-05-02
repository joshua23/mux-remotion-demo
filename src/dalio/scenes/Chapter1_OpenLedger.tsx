/**
 * Chapter 1 · 翻开账本
 * 视觉：Joshua 坐在书桌前，台灯亮着，账本在桌上展开
 * 动画：台灯渐亮 → Joshua 入场 → 账本翻开 → 标题浮现
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { StickFigure } from '../components/StickFigure';
import { Desk, Lamp, Ledger, Pen, TeaCup } from '../props/Props';
import { COLORS, FONTS, EASING } from '../theme';

export const Chapter1_OpenLedger: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 台灯光晕 0→1（10-20帧）
  const lampGlow = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...EASING.snapIn) });
  // Joshua 弹入（15-30帧）
  const joshuaPop = spring({ frame: frame - 15, fps, config: { damping: 14, mass: 0.6, stiffness: 150 } });
  // 账本浮现（30-50帧）
  const ledgerOp = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ledgerScale = interpolate(frame, [30, 50], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // 标题（60-80帧）
  const titleOp = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [60, 80], [10, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // 副标题（80-100帧）
  const subtitleOp = interpolate(frame, [85, 105], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <PaperBackground />

      {/* 桌椅 + 道具 in center */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 60 }}>
        <div style={{ position: 'relative', width: 1200, height: 600 }}>
          {/* 桌子（底部）*/}
          <div style={{ position: 'absolute', left: 250, bottom: 0 }}>
            <Desk size={700} />
          </div>

          {/* 台灯（桌左角）— 带光晕 */}
          <div style={{ position: 'absolute', left: 280, bottom: 70, opacity: 0.3 + lampGlow * 0.7 }}>
            <Lamp size={220} glowing={lampGlow > 0.3} />
          </div>

          {/* 账本（桌中央）*/}
          <div
            style={{
              position: 'absolute',
              left: 480,
              bottom: 75,
              opacity: ledgerOp,
              transform: `scale(${ledgerScale})`,
              transformOrigin: 'center bottom',
            }}
          >
            <Ledger size={460} />
          </div>

          {/* 茶杯（桌右）*/}
          <div style={{ position: 'absolute', left: 1000, bottom: 75, opacity: 0.7 }}>
            <TeaCup size={90} />
          </div>

          {/* 钢笔 */}
          <div style={{ position: 'absolute', left: 530, bottom: 85, opacity: ledgerOp * 0.8 }}>
            <Pen size={140} />
          </div>

          {/* Joshua 站在桌右后方 */}
          <div
            style={{
              position: 'absolute',
              right: 60,
              bottom: 60,
              transform: `scale(${joshuaPop}) translateY(${(1 - joshuaPop) * 30}px)`,
              transformOrigin: 'bottom center',
              opacity: joshuaPop,
            }}
          >
            <StickFigure character="joshua" pose="standing" size={280} animated />
          </div>
        </div>
      </AbsoluteFill>

      {/* 顶部：第一章 / 标题 */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80 }}>
        <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, textAlign: 'center' }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 22, color: COLORS.ink, opacity: 0.6, margin: 0, letterSpacing: '0.15em' }}>
            第 一 章
          </p>
          <h1 style={{ fontFamily: FONTS.heading, fontSize: 72, fontWeight: 600, color: COLORS.ink, margin: '12px 0 0', letterSpacing: '-0.01em' }}>
            翻开账本
          </h1>
        </div>
      </AbsoluteFill>

      {/* 底部副标题：日期范围 */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 80 }}>
        <p style={{ fontFamily: FONTS.mono, fontSize: 24, color: COLORS.ink, opacity: subtitleOp * 0.65, margin: 0, letterSpacing: '0.05em' }}>
          2023.09 — 2024.08 · 1835 笔交易
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
