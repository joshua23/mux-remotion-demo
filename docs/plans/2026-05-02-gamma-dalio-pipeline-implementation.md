# Gamma → Ray Dalio 视频管线 · 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** 把支付宝财务 CSV 转成 Ray Dalio 风格的中文动画解说短片，全程 Claude Code 编排。

**Architecture:** 5 步线性管线（CSV→分析→Gamma→TTS→Remotion）+ 1 个 13 组件的 Dalio 视觉原语库。所有步骤通过 Claude Code slash commands + npm scripts 触发，本地单进程运行。

**Tech Stack:** Remotion 4.0.355 · TypeScript · papaparse · @remotion/paths · @remotion/media-utils · MiniMax T2A v2 · Gamma MCP · Vitest（单元测试）· Claude Code slash commands（Step 1.5 + 2 编排）

**前置阅读：** [设计文档](2026-05-02-gamma-dalio-pipeline-design.md) — 视觉规格、组件清单、12 维分析框架的详细描述都在那里。本文档只讲"怎么做"，不重复"为什么"。

---

## 任务索引（共 ~58 个任务，按依赖顺序）

| Phase | 任务区间 | 主题 |
|---|---|---|
| 0 | 0.1 – 0.6 | 项目骨架 + 依赖 + 主题常量 |
| 1 | 1.1 – 1.7 | CSV 预处理 → 聚合 JSON |
| 1.5 | 1.5.1 – 1.5.3 | 财务分析提示模板 + slash command |
| 2 | 2.1 – 2.6 | Gamma MCP 集成 + outline 解析 |
| 3 | 3.1 – 3.5 | MiniMax TTS 适配 |
| 4a | 4a.1 – 4a.13 | 13 个 Dalio 组件原语 |
| 4b | 4b.1 – 4b.7 | 7 种场景 archetype |
| 4c | 4c.1 – 4c.4 | Timeline 生成器 |
| 5 | 5.1 – 5.5 | 端到端联调 + 渲染验证 |

---

# Phase 0 — 项目骨架与依赖

## Task 0.1: 创建目录结构

**Files:** Create `src/dalio/{components,archetypes,prompts,utils}`, `src/scripts/`, `tests/dalio/`, `out/`.

**Step 1:** Run `mkdir -p src/dalio/{components,archetypes,prompts,utils} src/scripts tests/dalio out` then `touch` `.gitkeep` files in each.

**Step 2:** Verify: `find src/dalio src/scripts tests/dalio out -type d` shows 7 directories.

**Step 3:** Commit: `chore: scaffold dalio pipeline directories`

## Task 0.2: 安装新依赖

**Step 1:** `npm install --save papaparse @remotion/paths @remotion/media-utils js-yaml`

**Step 2:** `npm install --save-dev @types/papaparse @types/js-yaml vitest @types/node tsx`

**Step 3:** Verify: `npm ls papaparse @remotion/paths @remotion/media-utils vitest --depth=0`

**Step 4:** Commit: `chore(deps): add papaparse, remotion-paths, media-utils, vitest`

## Task 0.3: 设置 Vitest

**Files:** Create `vitest.config.ts` + `tests/sanity.test.ts`, modify `package.json`.

`vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
    globals: false,
    testTimeout: 10000,
  },
});
```

`package.json` scripts: add `"test:unit": "vitest run"` and `"test:watch": "vitest"`.

`tests/sanity.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
describe('sanity', () => {
  it('runs', () => { expect(1 + 1).toBe(2); });
});
```

Run `npm run test:unit` → expect 1 passed. Commit `chore(test): add vitest config and sanity test`.

## Task 0.4: 创建 Dalio 主题常量

**Files:** `src/dalio/theme.ts` + `src/dalio/theme.test.ts`

```typescript
// src/dalio/theme.ts — Ray Dalio visual specs locked from design doc Section 5
export const COLORS = {
  paper: '#F2EBD8',
  ink: '#2A2520',
  accent: { red: '#D9533A', yellow: '#D6A93B', teal: '#5A8C7B', blue: '#3E5C7A' },
  paperGrain: 'rgba(42, 37, 32, 0.08)',
} as const;

export const FONTS = {
  heading: '"Source Serif Pro", "Gelasio", "Hoefler Text", Georgia, serif',
  body: '"Inter", "Helvetica Neue", "PingFang SC", Arial, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", monospace',
} as const;

export const STROKE = { icon: 2.5, axis: 1.5, emphasis: 4 } as const;

export const TIMING = {
  snapInFrames: 10, drawPathFrames: 22, growBarFrames: 25,
  countUpFrames: 35, sceneTransitionFrames: 15, preRollFrames: 4,
  narrationWPM: 155,
} as const;

export const EASING = {
  snapIn: [0.25, 0.46, 0.45, 0.94] as const,
  cameraEase: [0.65, 0, 0.35, 1] as const,
  growSpring: { mass: 0.6, damping: 14, stiffness: 150 } as const,
} as const;

export const LAYOUT = { whitespaceRatio: 0.7, marginPx: 120, contentMaxWidth: 1680 } as const;
```

Test asserts paper is `#F2EBD8`, 4 accent colors, Source Serif Pro in heading, snapInFrames=10, icon stroke=2.5.

Run, expect 5 passed. Commit `feat(dalio): lock visual specs in theme constants`.

## Task 0.5: 迁移 MiniMax 凭据到 keychain

Use the MiniMax key from sister project `~/Documents/工作台/Remotion-Learning/播客故事/.env`. Move to keychain via `security add-generic-password -U -a $USER -s MINIMAX_API_KEY -w <key>` (and same for MINIMAX_GROUP_ID). Then add a loader to `~/.zshrc` similar to the HEYGEN_API_KEY pattern.

Update `.env.example` to document the two vars. Commit `.env.example` (NOT `.env`): `docs(env): document MiniMax credentials for TTS pipeline`.

## Task 0.6: 添加字体加载器

**File:** `src/dalio/utils/fonts.ts`

```typescript
import { continueRender, delayRender } from 'remotion';
const handle = delayRender('Loading Dalio fonts');
export async function loadDalioFonts() {
  const fonts = [
    { family: 'Source Serif Pro', weights: ['400', '600', '700'] },
    { family: 'Inter', weights: ['400', '500', '600'] },
  ];
  const links = fonts.map(({ family, weights }) =>
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(';')}&display=swap`
  );
  await Promise.all(links.map((href) =>
    new Promise<void>((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = href;
      link.onload = () => resolve(); link.onerror = () => resolve();
      document.head.appendChild(link);
    })
  ));
  continueRender(handle);
}
```

Test: just import smoke check (DOM-dependent runtime test deferred to Studio).

Commit `feat(dalio): add Google Fonts loader`.

---

# Phase 1 — CSV 预处理 → 聚合 JSON

## Task 1.1: 定义 AlipayTransaction + AggregatedFinance 类型

**File:** `src/dalio/types.ts`

```typescript
export type Direction = '支出' | '收入' | '不计收支';

export interface AlipayTransaction {
  txId: string; merchantOrderId: string; createdAt: string;
  paidAt: string | null; modifiedAt: string; source: string; txType: string;
  counterparty: string; itemName: string; amount: number; direction: Direction;
  status: string; serviceFee: number; refunded: number; note: string; fundStatus: string;
}

export interface AggregatedFinance {
  rangeStart: string; rangeEnd: string; totalCount: number;
  totalExpense: number; totalIncome: number; totalNeutral: number; netOutflow: number;
  byMonth: Array<{ month: string; expense: number; income: number }>;
  byCategory: Array<{ category: string; amount: number; count: number; pct: number }>;
  byMerchant: Array<{ name: string; amount: number; count: number }>;
  topSingleExpenses: Array<{ date: string; amount: number; counterparty: string; item: string }>;
  passiveIncome: { count: number; total: number; dailyAvg: number };
  anomalies: Array<{ month: string; amount: number; reason: string }>;
}
```

Commit `feat(dalio): define types`.

## Task 1.2: CSV 解析器 — 写失败测试

**Files:** `tests/fixtures/alipay-sample.csv` (minimal 4-row UTF-8 sample with 余额宝/工资/外卖/小卖部) + `src/scripts/preprocess.test.ts`

Tests assert: 4 rows parsed, amount as number, direction as enum, paidAt empty → null.

Run, expect FAIL ("Cannot find module './preprocess'"). Commit failing test: `test(preprocess): add failing parseAlipayCsv tests`.

## Task 1.3: 实现 parseAlipayCsv

**File:** `src/scripts/preprocess.ts`

```typescript
import fs from 'node:fs/promises';
import Papa from 'papaparse';
import type { AlipayTransaction, Direction } from '../dalio/types';

export async function parseAlipayCsv(filePath: string): Promise<AlipayTransaction[]> {
  let raw = await fs.readFile(filePath, 'utf-8');
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const result = Papa.parse(raw, {
    header: true, skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });
  return result.data.map((row: Record<string, string>): AlipayTransaction => ({
    txId: row['交易号']?.trim() ?? '',
    merchantOrderId: row['商家订单号']?.trim() ?? '',
    createdAt: row['交易创建时间']?.trim() ?? '',
    paidAt: row['交易付款时间']?.trim() || null,
    modifiedAt: row['最近修改时间']?.trim() ?? '',
    source: row['交易来源地']?.trim() ?? '',
    txType: row['交易类型']?.trim() ?? '',
    counterparty: row['交易对方']?.trim() ?? '',
    itemName: row['商品名称']?.trim() ?? '',
    amount: Number(row['金额']) || 0,
    direction: (row['收支']?.trim() as Direction) ?? '不计收支',
    status: row['交易状态']?.trim() ?? '',
    serviceFee: Number(row['服务费']) || 0,
    refunded: Number(row['成功退款']) || 0,
    note: row['备注']?.trim() ?? '',
    fundStatus: row['资金状态']?.trim() ?? '',
  }));
}
```

Run tests → 4 passed. Commit `feat(preprocess): implement parseAlipayCsv`.

## Task 1.4: aggregate() 失败测试

Append to `preprocess.test.ts`: tests assert totals (totalCount=4, totalExpense=40.50, totalIncome=5000, totalNeutral=1.50), monthly grouping (1 month entry), passive income detection (count=1), top merchants (美团 first).

Run → FAIL. Commit failing test.

## Task 1.5: 实现 aggregate()

Append to `preprocess.ts`: `categorize(itemName)` with CATEGORY_RULES (理财收益/交通出行/餐饮外卖/电商购物/工资薪酬/住房居家/通讯网络/云服务订阅/亲情转账/教育培训/医疗健康), then `aggregate(txs)` computing totals, monthly groupings, by-category, by-merchant (top 20), top-5 single expenses, passive income with dailyAvg, anomaly detection (months > 2× median expense).

Run → 8 passed. Commit `feat(preprocess): implement aggregate with category, merchant, anomaly`.

## Task 1.6: CLI 入口

Append CLI shim to `preprocess.ts`:
```typescript
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , input, output] = process.argv;
  if (!input || !output) { console.error('Usage: tsx preprocess.ts <in.csv> <out.json>'); process.exit(1); }
  parseAlipayCsv(input).then(aggregate).then(async (agg) => {
    const fs = await import('node:fs/promises');
    await fs.writeFile(output, JSON.stringify(agg, null, 2), 'utf-8');
    console.log(`✓ Wrote ${output} — ${agg.totalCount} txs, ¥${agg.totalExpense.toFixed(2)} expense, ¥${agg.passiveIncome.total.toFixed(2)} passive`);
  }).catch((err) => { console.error(err); process.exit(2); });
}
```

Commit `feat(preprocess): add CLI entry`.

## Task 1.7: 跑真实数据冒烟

Run `npx tsx src/scripts/preprocess.ts "<path-to-alipay-csv>" out/alipay-2024.json`.

Verify with `jq '.totalCount, .totalExpense, .passiveIncome.total' out/alipay-2024.json` → expect 1835, 160246.15, 144701.89.

No commit (output gitignored). 

---

# Phase 1.5 — 财务分析层

## Task 1.5.1: 写财务分析 prompt 模板

**File:** `src/dalio/prompts/financial-analysis.md`

12 维框架: 收支结构、类目细分增强（家庭/业务节点拆分）、月度变异 + 异常事件（z-score）、个人/业务储蓄率分离、投资有效本金推算、12 月现金流预测、集中度风险、节假日周期识别、被动/主动收入比、资金循环闭合度、异常交易标记、财务健康度 0-100 评分。

输出两份: `analysis.json`（结构化）+ `analysis.md`（约 800 字自然语言报告，含 3-5 条 narrative_hooks 钩子，Dalio "看似 X 实则 Y" 风格）。

约束：保留人民币元 2 位小数，不编造数据，中文输出，禁口语词，narrative_hooks 必须 Dalio 反转风。

Commit `feat(dalio): add 12-dimension financial analysis prompt template`.

## Task 1.5.2: 创建 /analyze-finance slash command

**File:** `.claude/commands/analyze-finance.md`

Command 读 `$ARGUMENTS`（aggregated.json）+ `src/dalio/prompts/financial-analysis.md`，在 context 里完成 12 维分析推理，Write 两份输出文件（同名加 `-analysis.json` / `-analysis.md` 后缀）。

Commit `feat(claude): add /analyze-finance slash command`.

## Task 1.5.3: 端到端验证 + 脱敏样本提交

用户跑 `/analyze-finance out/alipay-2024.json`。验证 `jq '.healthScore.total, .fundLoopClosure, (.narrativeHooks | length)' out/alipay-2024-analysis.json`，期待 health 0-100、闭合度约 0.9、hooks ≥ 3。

把脱敏后的样本（替换名字、模糊金额）保存到 `docs/plans/spike-results/sample-analysis.md`。Commit `docs(spike): add sample financial analysis output`.

---

# Phase 2 — Gamma MCP 集成

## Task 2.1: Gamma 叙事 prompt 模板

**File:** `src/dalio/prompts/gamma-narrative.md`

模板要求 Gamma 产出 8 卡，每卡四字段（title/key_points/visual_concept/narration），Ray Dalio 调性，禁口语词，必须围绕 narrative_hooks 展开。Commit `feat(dalio): add Gamma narrative prompt template`.

## Task 2.2: /narrate slash command

**File:** `.claude/commands/narrate.md`

Command 读 analysis.md + gamma-narrative.md 拼 prompt，调 `mcp__claude_ai_Gamma__generate`（参数: numCards=8, themeId=creme, dimensions=16x9, language=zh-cn, tone="calm instructional documentary Ray Dalio style", noImages, textMode=preserve），polling 每 30s，调 `read_gamma` 拿 HTML，跑 `npx tsx src/scripts/parse-gamma.ts <html-tmp> <outline.json>`，输出到 `out/<topic>-outline.json`。Commit `feat(claude): add /narrate slash command`.

## Task 2.3: parse-gamma 失败测试

**Files:** `tests/fixtures/gamma-sample.html`（spike 截取的 2-3 卡）+ `src/scripts/parse-gamma.test.ts`

Tests: 2 cards extracted, title from h1, narration separated by "旁白：" marker.

Run → FAIL. Commit failing test.

## Task 2.4: 实现 parse-gamma

**File:** `src/scripts/parse-gamma.ts`

```typescript
import fs from 'node:fs/promises';

export interface OutlineCard {
  index: number; title: string; body: string; narration: string;
  visualConcept?: string; rawHtml: string;
}

export function parseGammaHtml(html: string): OutlineCard[] {
  const cards: OutlineCard[] = [];
  const sectionRegex = /<section[^>]*>([\s\S]*?)<\/section>/g;
  let match; let index = 0;
  while ((match = sectionRegex.exec(html)) !== null) {
    const inner = match[1];
    const titleMatch = inner.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (!titleMatch) continue;
    const title = stripTags(titleMatch[1]).trim();
    const narrationMatch = inner.match(/<p[^>]*>(?:[^<]*<b>)?旁白[:：][^<]*<\/b>?\s*([\s\S]*?)<\/p>/);
    const narration = narrationMatch ? stripTags(narrationMatch[1]).trim() : '';
    let bodyHtml = inner
      .replace(/<h1[^>]*>[\s\S]*?<\/h1>/, '')
      .replace(/<p[^>]*>(?:[^<]*<b>)?旁白[:：][\s\S]*?<\/p>/, '');
    const body = stripTags(bodyHtml).replace(/\s+/g, ' ').trim();
    cards.push({ index: index++, title, body, narration, rawHtml: match[0] });
  }
  return cards;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , input, output] = process.argv;
  if (!input || !output) { console.error('Usage: tsx parse-gamma.ts <html> <json>'); process.exit(1); }
  fs.readFile(input, 'utf-8').then((html) => {
    const cards = parseGammaHtml(html);
    return fs.writeFile(output, JSON.stringify(cards, null, 2), 'utf-8').then(() => cards.length);
  }).then((n) => console.log(`✓ Parsed ${n} cards`)).catch((err) => { console.error(err); process.exit(2); });
}
```

Run → 3 passed. Commit `feat(parse-gamma): implement HTML to OutlineCard parser`.

## Task 2.5: 端到端验证

跑 `/narrate out/alipay-2024-analysis.md`。验证 8 cards、title 非空、narration > 20 字。手工评估中文质量；不满意调 `gamma-narrative.md` 重跑。Commit prompt 调整：`tune(prompts): adjust Gamma narrative prompt`.

## Task 2.6: 把 out/ 加入 .gitignore

`.gitignore` 追加 `out/` 和 `!out/.gitkeep`。Commit `chore(git): ignore pipeline outputs`.

---

# Phase 3 — MiniMax TTS 集成

## Task 3.1: 移植 sister 项目 TTS

**File:** `src/scripts/tts.ts` (改自 `~/Documents/工作台/Remotion-Learning/播客故事/generate-audio.js`)

ESM TypeScript 版本，使用 `node:https` 直连 `api.minimax.chat/v1/t2a_v2`，model=`speech-02-hd`，voice_id=`male-qn-jingying-jingpin`（沉稳男声），speed=0.95，从 `process.env.MINIMAX_API_KEY` + `MINIMAX_GROUP_ID` 读凭据。导出 `ttsCard(card, outDir)` 返回 `{ mp3Path, durationMs }`。CLI 模式接 outline.json + outDir，逐卡生成 `card_NN.mp3` + `manifest.json`。

Commit `feat(tts): port MiniMax T2A v2 from sister project`.

## Task 3.2: 写 env 检查测试

**File:** `src/scripts/tts.test.ts`

测试缺 `MINIMAX_API_KEY` 时 ttsCard 抛错（不真打 API）。Run → 1 passed. Commit.

## Task 3.3: 真实 API 单段冒烟（手动）

```
echo '[{"index":0,"title":"测试","body":"","narration":"看似花了十六万，但被动收益悄悄还回来十四万。","rawHtml":""}]' > /tmp/single.json
npx tsx src/scripts/tts.ts /tmp/single.json /tmp/tts-smoke
afplay /tmp/tts-smoke/card_00.mp3
```

主观评：是否符合"沉稳纪录片"调性。不满意调 `voice_id`（参考 [MiniMax 文档](https://platform.minimaxi.com/document/T2A%20V2)）。无 commit（冒烟）。

## Task 3.4: 全 outline TTS

```
npx tsx src/scripts/tts.ts out/alipay-2024-outline.json out/alipay-2024-audio
```

验证 8 mp3 + manifest.json. 无 commit（gitignored）。

## Task 3.5: /tts slash command

**File:** `.claude/commands/tts.md` — 包装上面 CLI 调用，自动推导输出目录。Commit `feat(claude): add /tts slash command`.

---

# Phase 4a — Dalio 组件原语（13 个）

> 每个组件遵循 4 步: 写 .tsx → 写 .test.tsx (render-without-error + 关键属性断言) → 注册 Studio Composition → 用户手眼验证 → commit。

## Task 4a.1: PaperBackground

`AbsoluteFill` + `backgroundColor: COLORS.paper` + 内嵌 SVG `<feTurbulence>` paper grain (opacity 0.08, mix-blend multiply)。Test 断言 render 含 `#F2EBD8`。Studio Composition 60 帧。Commit.

## Task 4a.2: SceneCard

`AbsoluteFill > PaperBackground + 内层 div (inset = LAYOUT.marginPx)` 含 header (title 用 FONTS.heading 56px, timeRange 用 mono 22px) + main 占满剩余空间。Test 断言 children 渲染。Commit.

## Task 4a.3: DrawPath（核心 Dalio 原语）

Props: `d, pathLength?, startFrame=0, durationInFrames=22, strokeColor=COLORS.ink, strokeWidth=STROKE.icon, fill='none'`。

实现要点：
- `useRef<SVGPathElement>` + `useEffect` 调 `getTotalLength()` 自动测长（pathLength 未提供时）
- `useCurrentFrame() + interpolate(frame, [startFrame, startFrame+duration], [0,1], {easing: Easing.bezier(...EASING.snapIn)})`
- `strokeDasharray={length}` + `strokeDashoffset={length * (1 - progress)}`

Test 断言 render 含 `d` + `stroke` 属性。Studio: 一条贝塞尔曲线 60 帧画完。Commit.

## Task 4a.4: DrawArrow

包 `<DrawPath>` + `<ArrowHead>` 组件（`<polygon>` 指向终点，rotate by tangent angle，opacity 在 path 90% 进度后 6 帧淡入）。Props: `d, endPoint: {x, y, angle}, ...`。Commit.

## Task 4a.5 - 4a.13: 其余 9 个

按相同模式（implement → test → Studio → commit）：

- **4a.5 SnapIcon** — `spring({mass:0.6, damping:14, stiffness:150})` 控 opacity 0→1 + scale 0.85→1
- **4a.6 CountUp** — interpolate + Math.round + `Intl.NumberFormat`，**必须用 `font-variant-numeric: tabular-nums` 防数字宽度抖动**
- **4a.7 GrowBar** — spring 控 scaleY，`transform-origin: bottom` 实现从底部生长
- **4a.8 StackBuilder** — `items.map((item, i) => <Sequence from={i*staggerFrames}><spring SnapIcon>{item}</></Sequence>)`
- **4a.9 StickFigure** — 4 个静态 SVG 字符串（standing/walking/waving/pointing），walking 用 2 帧 hold-2 切换。SVG 数据存 `src/dalio/utils/stickFigures.ts`
- **4a.10 CameraPan** — 包裹 div 用 `transform: translate(x,y) scale(s)` 插值。crossfade 子元素时用透明度交叉
- **4a.11 ConceptHighlight** — 用 DrawPath 画圆 (`M cx-r,cy A r,r 0 1,1 cx+r,cy A r,r 0 1,1 cx-r,cy`)
- **4a.12 TitleSpotlight** — 移植自 vibe-motion-skills `light_spotlight_template.html` 行 40-122：SVG `<mask>` + `<feGaussianBlur stdDeviation="0 19">` glow + interpolate 控 rotation pivot at "400 130"
- **4a.13 NarrationCue** — 读 manifest.json，把每段 mp3 包成 `<Sequence from durationInFrames>` + `<Audio src>`，自动累计帧时长

每完成一个 commit `feat(dalio): add <ComponentName> component`.

---

# Phase 4b — 场景 archetype（7 种）

每个 archetype 是组合多个原语的 React 组件，接收 `card: OutlineCard` props。单文件实现 + Studio Composition + 手眼验证 + commit。

| Archetype | 用到的原语 | 用例（Alipay 视频） |
|---|---|---|
| **4b.1** ConceptReveal | SceneCard + SnapIcon + DrawPath (圆框) | 卡 2 类目分布 |
| **4b.2** CauseEffect | SceneCard + SnapIcon × N + DrawArrow × N-1 | 资金流向链 |
| **4b.3** Comparison | SceneCard + GrowBar × 2 + DrawPath (等号) | 卡 5 支出 vs 被动收益 |
| **4b.4** Cycle | SceneCard + SnapIcon (中央) + DrawArrow × 4 | 资金循环引擎 |
| **4b.5** TimeSeries | SceneCard + DrawPath (轴) + GrowBar × 12 + ConceptHighlight | 卡 3 月度趋势 + 12月异常 |
| **4b.6** Hierarchy | SceneCard + StackBuilder + DrawPath | 卡 6 Top 商户表 |
| **4b.7** MacroMicroZoom | SceneCard + CameraPan + 双图层 crossfade | 总览 → 单笔放大 |

每个 commit `feat(dalio): add <ArchetypeName> archetype`。

---

# Phase 4c — Timeline 生成器

## Task 4c.1: 扩展 types

Append to `src/dalio/types.ts`:

```typescript
export type ArchetypeName = 'ConceptReveal' | 'CauseEffect' | 'Comparison' | 'Cycle'
  | 'TimeSeries' | 'Hierarchy' | 'MacroMicroZoom' | 'TitleSpotlight';

export interface TimelineCard {
  index: number; archetype: ArchetypeName;
  title: string; body: string; narration: string;
  durationFrames: number; audioPath?: string;
  data?: Record<string, unknown>;
}

export interface ManifestEntry {
  index: number; mp3: string; durationMs: number; narration: string;
}
```

Commit.

## Task 4c.2: 实现 archetype mapper（rule-based）

**Files:** `src/scripts/build-timeline.ts` + `.test.ts`

Tests: 第 0 卡 → TitleSpotlight, "对比/vs" → Comparison, "月度/趋势" → TimeSeries, "循环/机器" → Cycle, default → ConceptReveal. Run FAIL, commit failing.

```typescript
import type { OutlineCard } from './parse-gamma';
import type { ArchetypeName, TimelineCard, ManifestEntry } from '../dalio/types';

export function mapCardToArchetype(card: OutlineCard): ArchetypeName {
  if (card.index === 0) return 'TitleSpotlight';
  const text = (card.title + ' ' + card.body).toLowerCase();
  if (/对比|vs|两|比较/.test(text)) return 'Comparison';
  if (/月度|趋势|时序|增长|下降/.test(text)) return 'TimeSeries';
  if (/循环|机器|引擎|齿轮/.test(text)) return 'Cycle';
  if (/流向|因果|→|导致|引起/.test(text)) return 'CauseEffect';
  if (/层级|树|分布|结构/.test(text)) return 'Hierarchy';
  if (/放大|聚焦|从.+到/.test(text)) return 'MacroMicroZoom';
  return 'ConceptReveal';
}

export function buildTimeline(
  outline: OutlineCard[], manifest: ManifestEntry[], fps: number = 30,
): TimelineCard[] {
  return outline.map((card) => {
    const m = manifest.find((x) => x.index === card.index);
    const audioFrames = m ? Math.ceil((m.durationMs / 1000) * fps) : 90;
    const durationFrames = audioFrames + Math.ceil(1.5 * fps); // 1.5s post-roll
    return {
      index: card.index, archetype: mapCardToArchetype(card),
      title: card.title, body: card.body, narration: card.narration,
      durationFrames, audioPath: m?.mp3,
    };
  });
}
```

Run PASS. Commit `feat(timeline): implement archetype mapper + buildTimeline`.

## Task 4c.3: Timeline.tsx 代码生成器

Append `generateTimeline(cards, audioBaseUrl, outputPath)` 到 `build-timeline.ts`，写出 `src/dalio/Timeline.generated.tsx` 文件（含 import 所有 archetype + 一个 `Series` 包裹的 cards 数组）。CLI 模式: `tsx src/scripts/build-timeline.ts <outline> <manifest> <audio-base> <out.tsx>`。

Test: 写到 tmpfile，验证含 `TitleSpotlight` + `"durationFrames"`。Commit `feat(timeline): add codegen for Timeline.generated.tsx`.

## Task 4c.4: 注册 generated Timeline 到 Video.tsx

`src/Video.tsx` 添加 Composition `id="DalioFinanceVideo"`，import `Timeline.generated.tsx`，初始 durationInFrames=2400。`.gitignore` 加 `src/dalio/Timeline.generated.tsx`。Commit `feat(video): register DalioFinanceVideo composition`.

---

# Phase 5 — 端到端联调 + 渲染

## Task 5.1: /finance-video 编排 slash command

**File:** `.claude/commands/finance-video.md`

```
---
description: 端到端 CSV 到 Ray Dalio 视频
argument-hint: <csv-path> [<topic-slug>]
---

把 $1 (CSV) 一条龙渲染成 mp4。可选 $2 作为输出前缀。

步骤（每步报告进度）：
1. 预处理: npx tsx src/scripts/preprocess.ts $1 out/$2.json
2. 分析: 调 /analyze-finance out/$2.json
3. 叙事: 调 /narrate out/$2-analysis.md
4. TTS: npx tsx src/scripts/tts.ts out/$2-outline.json out/$2-audio
5. Timeline: npx tsx src/scripts/build-timeline.ts out/$2-outline.json out/$2-audio/manifest.json /audio src/dalio/Timeline.generated.tsx
6. 渲染: npx remotion render src/index.tsx DalioFinanceVideo out/$2.mp4
7. 总结
```

Commit `feat(claude): add /finance-video orchestrator command`.

## Task 5.2: 端到端跑

用户调 `/finance-video <alipay-csv-path> alipay-2024`。

验证: `ls -lah out/alipay-2024.mp4` 存在；`ffprobe` 报时长 60-100 秒。

播放: `open out/alipay-2024.mp4`，主观评分。

## Task 5.3: 视觉/旁白迭代

A: Gamma 叙事不满意 → 调 `gamma-narrative.md` → 重跑 /narrate 后续
B: TTS 调性不对 → 调 voice_id/speed/emotion → 重跑 /tts
C: 视觉不对 → 调对应 archetype/原语 → 重跑 5+6
D: 全 OK → Task 5.4

## Task 5.4: 写 README 一节

Append README.md "财务摘要 → Ray Dalio 风格视频" 节，含一条龙命令 + 分步命令。链到设计文档。Commit `docs(readme): add finance-video usage section`.

## Task 5.5: 标 v0.1.0

```
git tag -a v0.1.0 -m "Dalio 财务视频管线 v0.1.0：CSV → Gamma → TTS → Remotion 端到端打通"
```

不要 push（用户决定）。

---

# 验收标准（Definition of Done）

- [ ] `npm run test:unit` 全绿（约 25 测试）
- [ ] `/finance-video <CSV>` 一条龙能产出 mp4
- [ ] mp4 中文旁白清晰、Dalio 调性
- [ ] 视频画面遵守 Section 5 视觉规格（米色 #F2EBD8、Hoefler-equivalent 衬线、2-3px 平滑线条）
- [ ] 至少 1 张卡命中"反直觉洞见"模式（"看似 X，实则 Y"）
- [ ] 整支视频时长 60-120 秒，旁白与画面同步无错位 > 200ms
- [ ] README + 设计文档 + 实现计划三文档同步

---

# 风险与缓解

| 风险 | 触发 | 缓解 |
|---|---|---|
| Source Serif Pro 加载慢 | 首次启动 Studio | delayRender 包裹 fontLoader, timeout 5s |
| MiniMax T2A 速率限制 | 8 卡连发 | 每卡 sleep 500ms, 失败重试 1 次 |
| Gamma 偶尔生成 7 或 9 卡 | ~10% 概率 | parse-gamma 不假设固定数量, timeline 按实际 |
| 中文字体 fallback 断 | macOS 缺字体 | fonts.ts 加 'PingFang SC' fallback |
| Tailwind 没识别 src/dalio/ | 首次构建 | 检查 tailwind.config.js content glob 覆盖 ./src/**/*.{ts,tsx} |

---

# Plan saved.

## 两种执行方式

**1. Subagent-Driven（这条会话内）** — 我每个任务派一个新 subagent 实现 + 我审 review，task 间快速迭代。适合你想跟我边做边盯进度、随时调整的场景。

**2. Parallel Session（独立会话）** — 你打开一个新 Claude Code session（建议在 worktree 里），告诉它用 `superpowers:executing-plans` skill 执行本计划。批量推进、设 checkpoint，你过来看结果。适合你想"挂在后台跑、间歇性看进度"。

**你选哪个？**
