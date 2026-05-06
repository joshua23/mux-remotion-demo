import { describe, it, expect } from 'vitest';
import { mapCardToArchetype, buildTimeline, generateTimeline } from './build-timeline';
import type { OutlineCard } from './parse-gamma';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

describe('mapCardToArchetype', () => {
  it('card 0 → TitleSpotlight', () => {
    const card: OutlineCard = { index: 0, title: '开场', body: '', narration: '', rawHtml: '' };
    expect(mapCardToArchetype(card)).toBe('TitleSpotlight');
  });

  it('"对比/vs" → Comparison', () => {
    const card: OutlineCard = { index: 1, title: '支出 vs 被动收益对比', body: '', narration: '', rawHtml: '' };
    expect(mapCardToArchetype(card)).toBe('Comparison');
  });

  it('"月度/趋势" → TimeSeries', () => {
    const card: OutlineCard = { index: 2, title: '月度趋势分析', body: '', narration: '', rawHtml: '' };
    expect(mapCardToArchetype(card)).toBe('TimeSeries');
  });

  it('"循环/机器" → Cycle', () => {
    const card: OutlineCard = { index: 3, title: '资金循环引擎', body: '', narration: '', rawHtml: '' };
    expect(mapCardToArchetype(card)).toBe('Cycle');
  });

  it('default → ConceptReveal', () => {
    const card: OutlineCard = { index: 4, title: '财务总结', body: '综合洞见', narration: '', rawHtml: '' };
    expect(mapCardToArchetype(card)).toBe('ConceptReveal');
  });
});

describe('buildTimeline', () => {
  it('builds timeline cards with correct duration', () => {
    const outline: OutlineCard[] = [
      { index: 0, title: '开场', body: '', narration: '', rawHtml: '' },
      { index: 1, title: '收支结构', body: '', narration: '', rawHtml: '' },
    ];
    const manifest = [
      { index: 0, mp3: 'card_00.mp3', durationMs: 3000, narration: '' },
      { index: 1, mp3: 'card_01.mp3', durationMs: 4000, narration: '' },
    ];
    const cards = buildTimeline(outline, manifest, 30);
    expect(cards).toHaveLength(2);
    // card 0: 3000ms = 90 frames + 45 post-roll = 135
    expect(cards[0].durationFrames).toBe(135);
    // card 1: 4000ms = 120 frames + 45 post-roll = 165
    expect(cards[1].durationFrames).toBe(165);
  });
});

describe('generateTimeline', () => {
  it('generates Timeline.tsx with TitleSpotlight and durationFrames', async () => {
    const outline: OutlineCard[] = [
      { index: 0, title: '开场', body: '', narration: '旁白', rawHtml: '' },
      { index: 1, title: '总结', body: '综合洞见', narration: '旁白二', rawHtml: '' },
    ];
    const manifest = [
      { index: 0, mp3: 'card_00.mp3', durationMs: 3000, narration: '旁白' },
      { index: 1, mp3: 'card_01.mp3', durationMs: 4000, narration: '旁白二' },
    ];
    const cards = buildTimeline(outline, manifest, 30);
    const tmpPath = path.join(os.tmpdir(), `timeline-test-${Date.now()}.tsx`);
    await generateTimeline(cards, '/audio', tmpPath);
    const content = await fs.readFile(tmpPath, 'utf-8');
    expect(content).toContain('TitleSpotlight');
    expect(content).toContain('durationInFrames');
    await fs.unlink(tmpPath);
  });
});
