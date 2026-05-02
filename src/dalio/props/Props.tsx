/**
 * 场景道具库 — Principles 风格的简笔画 SVG 道具
 * 共用 viewBox 0 0 W H，stroke 用 COLORS.ink，无填充（除非语义需要）。
 */
import React from 'react';
import { COLORS, STROKE } from '../theme';

const stroke = (extra?: React.SVGProps<SVGPathElement>) => ({
  stroke: COLORS.ink,
  strokeWidth: STROKE.icon,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...extra,
});

interface PropProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

// === 桌子（侧视）===
export const Desk: React.FC<PropProps> = ({ size = 320, style }) => (
  <svg viewBox="0 0 200 100" width={size} height={(size * 100) / 200} style={style}>
    {/* 桌面 */}
    <path d="M 10 30 L 190 30 L 190 38 L 10 38 Z" {...stroke()} />
    {/* 桌腿 */}
    <path d="M 25 38 L 25 95" {...stroke()} />
    <path d="M 175 38 L 175 95" {...stroke()} />
    {/* 抽屉/底板 */}
    <path d="M 25 78 L 175 78" {...stroke({ strokeWidth: 1.5 })} />
  </svg>
);

// === 台灯（带光晕）===
export const Lamp: React.FC<PropProps & { glowing?: boolean }> = ({ size = 100, glowing = true, style }) => (
  <svg viewBox="0 0 80 140" width={size * 0.57} height={size} style={{ overflow: 'visible', ...style }}>
    {/* 光晕（如果开灯）*/}
    {glowing && (
      <ellipse cx="40" cy="48" rx="55" ry="35" fill={COLORS.accent.yellow} opacity="0.18" />
    )}
    {/* 灯罩 */}
    <path d="M 20 35 L 60 35 L 50 18 L 30 18 Z" {...stroke()} />
    {/* 灯杆 */}
    <path d="M 40 35 L 40 100" {...stroke()} />
    {/* 灯座 */}
    <path d="M 25 100 L 55 100 L 60 110 L 20 110 Z" {...stroke()} />
  </svg>
);

// === 账本（开页）===
export const Ledger: React.FC<PropProps> = ({ size = 240, style }) => (
  <svg viewBox="0 0 240 140" width={size} height={(size * 140) / 240} style={style}>
    {/* 左页 */}
    <path d="M 20 20 L 120 20 L 120 130 L 20 130 Z" {...stroke()} />
    {/* 右页 */}
    <path d="M 120 20 L 220 20 L 220 130 L 120 130 Z" {...stroke()} />
    {/* 中缝 */}
    <path d="M 120 20 L 120 130" {...stroke({ strokeWidth: 2.5 })} />
    {/* 左页文字行 */}
    <path d="M 30 40 L 110 40 M 30 55 L 90 55 M 30 70 L 105 70 M 30 85 L 80 85 M 30 100 L 100 100" {...stroke({ strokeWidth: 1, opacity: 0.5 })} />
    {/* 右页文字行 */}
    <path d="M 130 40 L 210 40 M 130 55 L 200 55 M 130 70 L 205 70 M 130 85 L 190 85 M 130 100 L 200 100" {...stroke({ strokeWidth: 1, opacity: 0.5 })} />
  </svg>
);

// === 时钟（圆形 + 指针）===
interface ClockProps extends PropProps {
  hour?: number; // 0-23
  minute?: number;
}
export const Clock: React.FC<ClockProps> = ({ size = 140, hour = 20, minute = 48, style }) => {
  const minuteAngle = (minute / 60) * 360 - 90;
  const hourAngle = (((hour % 12) + minute / 60) / 12) * 360 - 90;
  const minRad = (minuteAngle * Math.PI) / 180;
  const hourRad = (hourAngle * Math.PI) / 180;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={style}>
      <circle cx="50" cy="50" r="45" {...stroke()} />
      {/* 12 小时刻度 */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const a = (i / 12) * 360 - 90;
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={50 + Math.cos(r) * 40}
            y1={50 + Math.sin(r) * 40}
            x2={50 + Math.cos(r) * 44}
            y2={50 + Math.sin(r) * 44}
            stroke={COLORS.ink}
            strokeWidth={1.5}
          />
        );
      })}
      {/* 时针 */}
      <line x1="50" y1="50" x2={50 + Math.cos(hourRad) * 22} y2={50 + Math.sin(hourRad) * 22} {...stroke({ strokeWidth: 3 })} />
      {/* 分针 */}
      <line x1="50" y1="50" x2={50 + Math.cos(minRad) * 35} y2={50 + Math.sin(minRad) * 35} {...stroke({ strokeWidth: 2 })} />
      {/* 中心点 */}
      <circle cx="50" cy="50" r="2.5" fill={COLORS.ink} />
    </svg>
  );
};

// === 存钱罐（小猪）===
export const PiggyBank: React.FC<PropProps & { tilted?: boolean }> = ({ size = 180, tilted = false, style }) => (
  <svg viewBox="0 0 180 130" width={size} height={(size * 130) / 180} style={{ overflow: 'visible', transform: tilted ? 'rotate(-25deg)' : undefined, transformOrigin: 'center', ...style }}>
    {/* 身体 */}
    <ellipse cx="90" cy="70" rx="65" ry="42" {...stroke()} />
    {/* 鼻子 */}
    <ellipse cx="155" cy="65" rx="14" ry="18" {...stroke()} />
    {/* 鼻孔 */}
    <circle cx="151" cy="60" r="1.8" fill={COLORS.ink} />
    <circle cx="151" cy="70" r="1.8" fill={COLORS.ink} />
    {/* 眼睛 */}
    <circle cx="115" cy="48" r="2.5" fill={COLORS.ink} />
    {/* 耳朵 */}
    <path d="M 105 30 L 115 22 L 122 38" {...stroke()} />
    {/* 4 条腿 */}
    <path d="M 50 105 L 50 118" {...stroke({ strokeWidth: 3 })} />
    <path d="M 75 110 L 75 122" {...stroke({ strokeWidth: 3 })} />
    <path d="M 105 110 L 105 122" {...stroke({ strokeWidth: 3 })} />
    <path d="M 130 105 L 130 118" {...stroke({ strokeWidth: 3 })} />
    {/* 尾巴 */}
    <path d="M 27 60 Q 18 55 22 48" {...stroke()} />
    {/* 投币口 */}
    <path d="M 75 30 L 100 30" {...stroke({ strokeWidth: 3 })} />
  </svg>
);

// === 硬币 ===
export const Coin: React.FC<PropProps & { value?: string }> = ({ size = 32, value = '¥', style }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} style={style}>
    <circle cx="20" cy="20" r="17" {...stroke()} />
    <text x="20" y="26" textAnchor="middle" fontSize="14" fill={COLORS.ink} fontFamily="serif">{value}</text>
  </svg>
);

// === 茶杯 ===
export const TeaCup: React.FC<PropProps> = ({ size = 60, style }) => (
  <svg viewBox="0 0 80 80" width={size} height={size} style={style}>
    {/* 杯身 */}
    <path d="M 18 28 L 22 60 Q 22 68 30 70 L 50 70 Q 58 68 58 60 L 62 28 Z" {...stroke()} />
    {/* 杯口椭圆 */}
    <ellipse cx="40" cy="28" rx="22" ry="5" {...stroke()} />
    {/* 把手 */}
    <path d="M 62 35 Q 75 38 75 50 Q 75 60 60 60" {...stroke()} />
    {/* 茶气（淡）*/}
    <path d="M 30 18 Q 28 12 32 8 M 40 18 Q 38 12 42 8 M 50 18 Q 48 12 52 8" {...stroke({ opacity: 0.4, strokeWidth: 1.5 })} />
  </svg>
);

// === 钢笔 ===
export const Pen: React.FC<PropProps> = ({ size = 100, style }) => (
  <svg viewBox="0 0 200 30" width={size} height={(size * 30) / 200} style={{ overflow: 'visible', ...style }}>
    {/* 笔杆 */}
    <path d="M 30 15 L 170 15" {...stroke({ strokeWidth: 6 })} />
    {/* 笔尖 */}
    <path d="M 170 12 L 195 15 L 170 18 Z" fill={COLORS.ink} />
    {/* 笔帽 */}
    <path d="M 30 8 L 30 22 L 18 22 L 18 8 Z" {...stroke()} />
    {/* 夹子 */}
    <path d="M 28 8 L 28 25" {...stroke({ strokeWidth: 1.5 })} />
  </svg>
);

// === 路口标牌（左/右分叉路）===
interface RoadSignProps extends PropProps {
  leftLabel?: string;
  rightLabel?: string;
}
export const ForkedRoad: React.FC<RoadSignProps> = ({ size = 600, leftLabel = '银行卡 · 工资', rightLabel = '这个账户 · 消费', style }) => (
  <svg viewBox="0 0 600 320" width={size} height={(size * 320) / 600} style={style}>
    {/* 主干道 */}
    <path d="M 280 320 L 300 200" {...stroke({ strokeWidth: 4 })} />
    <path d="M 320 320 L 300 200" {...stroke({ strokeWidth: 4 })} />
    {/* 左分支 */}
    <path d="M 300 200 L 100 80" {...stroke({ strokeWidth: 5 })} />
    <path d="M 300 200 L 110 100" {...stroke({ strokeWidth: 5 })} />
    {/* 右分支（细一些） */}
    <path d="M 300 200 L 480 100" {...stroke({ strokeWidth: 2.5 })} />
    <path d="M 300 200 L 490 120" {...stroke({ strokeWidth: 2.5 })} />
    {/* 路牌-左 */}
    <path d="M 30 50 L 200 50 L 220 70 L 200 90 L 30 90 Z" {...stroke()} />
    <text x="115" y="76" textAnchor="middle" fontSize="14" fill={COLORS.ink} fontFamily="sans-serif">{leftLabel}</text>
    {/* 路牌-右 */}
    <path d="M 410 70 L 580 70 L 580 110 L 410 110 L 390 90 Z" {...stroke()} />
    <text x="495" y="96" textAnchor="middle" fontSize="14" fill={COLORS.ink} fontFamily="sans-serif">{rightLabel}</text>
  </svg>
);

// === 信封 ===
export const Envelope: React.FC<PropProps> = ({ size = 80, style }) => (
  <svg viewBox="0 0 100 70" width={size} height={(size * 70) / 100} style={style}>
    <path d="M 5 10 L 95 10 L 95 65 L 5 65 Z" {...stroke()} />
    <path d="M 5 10 L 50 40 L 95 10" {...stroke()} />
  </svg>
);

// === 童装小衣服 ===
export const ChildShirt: React.FC<PropProps> = ({ size = 80, style }) => (
  <svg viewBox="0 0 100 90" width={size} height={(size * 90) / 100} style={style}>
    {/* 领子 */}
    <path d="M 40 10 Q 50 18 60 10" {...stroke()} />
    {/* 主体 */}
    <path d="M 40 10 L 20 18 L 12 35 L 22 38 L 22 80 L 78 80 L 78 38 L 88 35 L 80 18 L 60 10" {...stroke()} />
  </svg>
);

// === 汽车（侧视）===
export const Car: React.FC<PropProps> = ({ size = 160, style }) => (
  <svg viewBox="0 0 200 80" width={size} height={(size * 80) / 200} style={style}>
    {/* 车身底 */}
    <path d="M 15 60 L 25 60 Q 30 30 50 30 L 130 30 Q 150 30 165 50 L 185 55 L 185 60 L 195 60" {...stroke()} />
    {/* 车顶 */}
    <path d="M 50 30 L 60 18 L 130 18 L 145 30" {...stroke()} />
    {/* 窗 */}
    <path d="M 60 22 L 95 22 L 95 30 M 100 22 L 130 22 L 138 30" {...stroke({ strokeWidth: 1.5 })} />
    {/* 车轮 */}
    <circle cx="55" cy="60" r="10" {...stroke()} />
    <circle cx="155" cy="60" r="10" {...stroke()} />
    <circle cx="55" cy="60" r="3" fill={COLORS.ink} />
    <circle cx="155" cy="60" r="3" fill={COLORS.ink} />
  </svg>
);
