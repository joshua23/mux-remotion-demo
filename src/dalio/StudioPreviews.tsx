/**
 * Studio-only preview wrappers for visual QA of Dalio components.
 * These don't ship in the final video — they exist solely so the developer
 * can scrub through each primitive/archetype in Remotion Studio.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { OutlineCard } from '../scripts/parse-gamma';

import { PaperBackground } from './components/PaperBackground';
import { SceneCard } from './components/SceneCard';
import { DrawPath } from './components/DrawPath';
import { DrawArrow } from './components/DrawArrow';
import { GrowBar } from './components/GrowBar';
import { CountUp } from './components/CountUp';
import { SnapIcon } from './components/SnapIcon';
import { StickFigure } from './components/StickFigure';
import { TitleSpotlight } from './components/TitleSpotlight';

import { ConceptReveal } from './archetypes/ConceptReveal';
import { Comparison } from './archetypes/Comparison';
import { Cycle } from './archetypes/Cycle';
import { TimeSeries } from './archetypes/TimeSeries';

import { COLORS, FONTS } from './theme';

const sampleCard = (over: Partial<OutlineCard> = {}): OutlineCard => ({
  index: 0,
  title: '示例卡片',
  body: '这是组件视觉评审的示例正文。',
  narration: '这是旁白示例。',
  rawHtml: '',
  ...over,
});

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    {children}
  </AbsoluteFill>
);

// === Primitive previews ===

export const Preview_PaperBackground: React.FC = () => <PaperBackground />;

export const Preview_StickFigureGallery: React.FC = () => (
  <>
    <PaperBackground />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 80, alignItems: 'flex-end' }}>
        {/* Joshua walks (continuous subtle motion) — staggered snap-in */}
        <SnapIcon delay={0}>
          <StickFigure character="joshua" pose="walking" label="Joshua" size={200} />
        </SnapIcon>
        <SnapIcon delay={6}>
          <StickFigure character="wife" pose="standing" label="NaNa" size={200} />
        </SnapIcon>
        <SnapIcon delay={12}>
          <StickFigure character="family-female" pose="waving" label="燕燕（妹妹）" size={200} />
        </SnapIcon>
        <SnapIcon delay={18}>
          <StickFigure character="family-male" pose="standing" label="龙（小舅子）" size={200} />
        </SnapIcon>
        <SnapIcon delay={24}>
          <StickFigure character="business" pose="standing" label="皆柏贸易" size={200} />
        </SnapIcon>
      </div>
    </AbsoluteFill>
  </>
);

export const Preview_DrawPath: React.FC = () => (
  <>
    <PaperBackground />
    <Center>
      <DrawPath
        d="M 100,300 Q 500,50 900,300 T 1700,300"
        strokeColor={COLORS.ink}
        durationInFrames={60}
        width={1800}
        height={600}
      />
    </Center>
  </>
);

export const Preview_DrawArrow: React.FC = () => (
  <>
    <PaperBackground />
    <Center>
      <DrawArrow
        d="M 200,300 L 1500,300"
        endPoint={{ x: 1500, y: 300, angle: 0 }}
        durationInFrames={45}
      />
    </Center>
  </>
);

export const Preview_CountUp: React.FC = () => (
  <>
    <PaperBackground />
    <Center>
      <div style={{ fontFamily: FONTS.mono, fontSize: 200, color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>
        <CountUp from={0} to={144702} prefix="¥" durationInFrames={45} />
      </div>
    </Center>
  </>
);

export const Preview_GrowBarTrio: React.FC = () => (
  <>
    <PaperBackground />
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 120, alignItems: 'flex-end' }}>
        <GrowBar valueTo={61503} maxValue={70000} label="NaNa" color={COLORS.accent.red} delay={0} />
        <GrowBar valueTo={20000} maxValue={70000} label="燕燕" color={COLORS.accent.yellow} delay={8} />
        <GrowBar valueTo={5000} maxValue={70000} label="龙" color={COLORS.accent.teal} delay={16} />
      </div>
    </AbsoluteFill>
  </>
);

export const Preview_SnapIcon: React.FC = () => (
  <>
    <PaperBackground />
    <Center>
      <SnapIcon delay={5}>
        <div style={{ fontSize: 240, color: COLORS.ink }}>💰</div>
      </SnapIcon>
    </Center>
  </>
);

export const Preview_TitleSpotlight: React.FC = () => (
  <TitleSpotlight title="我是 Joshua，翻开这本账" subtitle="2023.09 — 2024.08" />
);

// === Archetype previews ===

export const Preview_ConceptReveal: React.FC = () => (
  <ConceptReveal
    card={sampleCard({
      title: '我是 Joshua，翻开这本账',
      body: '2023年9月 — 2024年8月，1835笔流水，一个关于钱与家的故事。',
    })}
  />
);

export const Preview_Comparison: React.FC = () => (
  <Comparison card={sampleCard({ title: '支出 vs 被动收益' })} />
);

export const Preview_Cycle: React.FC = () => (
  <Cycle card={sampleCard({ title: '资金循环引擎' })} />
);

export const Preview_TimeSeries: React.FC = () => (
  <TimeSeries card={sampleCard({ title: '12 月那个异常月' })} />
);
