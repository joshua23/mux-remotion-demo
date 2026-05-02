/**
 * Chapter 4 · 第三个谜：余额宝不是引擎
 * 视觉：存钱罐倒过来，倒出 ¥430 硬币；旁边一个被划掉的 ¥144,702
 * 动画：罐子倾斜 → 硬币掉落 → 大数字被红笔划掉 → 真实数字浮现
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, spring, useVideoConfig } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { PiggyBank, Coin } from '../props/Props';
import { DrawPath } from '../components/DrawPath';
import { CountUp } from '../components/CountUp';
import { COLORS, FONTS, EASING } from '../theme';

export const Chapter4_NotEngine: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 标题
  const titleOp = interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 大错误数字 ¥144,702 (30-50帧出现)
  const wrongNumOp = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // 划掉线 (60-80帧)
  // 真实小数字 ¥430.89 (90-115帧)
  const realNumOp = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const realNumScale = spring({ frame: frame - 90, fps, config: { damping: 14, mass: 0.5, stiffness: 200 } });

  // 罐子倾斜（45-65帧）
  const tilt = interpolate(frame, [45, 70], [0, -22], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(...EASING.snapIn) });

  // 硬币掉落（70-130帧）— 多枚硬币按 stagger 落
  const coinDelays = [0, 5, 10, 16, 22, 30, 38];
  const coinPositions = [
    { x: 220, finalY: 180 },
    { x: 280, finalY: 220 },
    { x: 340, finalY: 200 },
    { x: 400, finalY: 230 },
    { x: 460, finalY: 195 },
    { x: 250, finalY: 240 },
    { x: 380, finalY: 250 },
  ];

  return (
    <AbsoluteFill>
      <PaperBackground />

      {/* 标题 */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80 }}>
        <div style={{ opacity: titleOp, textAlign: 'center' }}>
          <p style={{ fontFamily: FONTS.body, fontSize: 22, color: COLORS.ink, opacity: 0.6, margin: 0, letterSpacing: '0.15em' }}>
            第 四 章
          </p>
          <h1 style={{ fontFamily: FONTS.heading, fontSize: 60, fontWeight: 600, color: COLORS.ink, margin: '12px 0 0' }}>
            余额宝不是引擎
          </h1>
        </div>
      </AbsoluteFill>

      {/* 主舞台：左边猪 + 右边数字对比 */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 1500, height: 500 }}>
          {/* 存钱罐（左侧，会倾斜）*/}
          <div
            style={{
              position: 'absolute',
              left: 100,
              top: 100,
              transform: `rotate(${tilt}deg)`,
              transformOrigin: 'center bottom',
            }}
          >
            <PiggyBank size={360} />
          </div>

          {/* 散落的硬币（罐口下方）*/}
          {coinPositions.map((c, i) => {
            const startFrame = 70 + coinDelays[i];
            const fallProgress = interpolate(frame, [startFrame, startFrame + 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.5, 0.1, 0.3, 1) });
            const opacity = interpolate(frame, [startFrame, startFrame + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: c.x,
                  top: 100 + (c.finalY - 100) * fallProgress,
                  opacity,
                }}
              >
                <Coin size={36} />
              </div>
            );
          })}

          {/* 右侧：错误大数字（被划掉）*/}
          <div
            style={{
              position: 'absolute',
              left: 700,
              top: 80,
              opacity: wrongNumOp,
            }}
          >
            <p style={{ fontFamily: FONTS.body, fontSize: 22, color: COLORS.ink, opacity: 0.5, margin: 0 }}>
              我以为
            </p>
            <div style={{ position: 'relative', display: 'inline-block', marginTop: 8 }}>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 72,
                  color: COLORS.ink,
                  opacity: 0.55,
                  textDecorationLine: frame >= 80 ? 'line-through' : 'none',
                  textDecorationColor: COLORS.accent.red,
                  textDecorationThickness: '6px',
                }}
              >
                ¥144,702
              </span>
            </div>
            <p style={{ fontFamily: FONTS.body, fontSize: 18, color: COLORS.accent.red, marginTop: 8, opacity: frame >= 80 ? 1 : 0 }}>
              本金搬运 · 不算收益
            </p>
          </div>

          {/* 右侧：真实数字 */}
          <div
            style={{
              position: 'absolute',
              left: 700,
              top: 280,
              opacity: realNumOp,
              transform: `scale(${realNumScale})`,
              transformOrigin: 'left center',
            }}
          >
            <p style={{ fontFamily: FONTS.body, fontSize: 22, color: COLORS.ink, opacity: 0.7, margin: 0 }}>
              真实年收益
            </p>
            <h2 style={{ fontFamily: FONTS.mono, fontSize: 96, fontWeight: 700, color: COLORS.ink, margin: '8px 0 0', letterSpacing: '-0.02em' }}>
              {frame >= 90 ? <CountUp from={0} to={431} prefix="¥" durationInFrames={30} /> : '¥0'}
            </h2>
            <p style={{ fontFamily: FONTS.body, fontSize: 20, color: COLORS.ink, opacity: 0.6, marginTop: 8 }}>
              不到 ¥500 · 一台安静的储钱罐
            </p>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
