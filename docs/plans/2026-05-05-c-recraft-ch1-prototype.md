# C-Recraft Ch1 Prototype Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render a working Ch1 prototype that replaces the static "PPT-style" Joshua image with a 7-part layered character animation (head/face/torso/L-arm/R-arm/L-leg/R-leg) plus chapter-level camera moves, then visually compare against the current Ch1.

**Architecture:** Recraft V4 SVG (already generated in spike) is hand-annotated in Inkscape into 7 named `<g>` groups with `data-pivot-x/y` attributes. New `LayeredCharacter` component fetches and parses the SVG into typed Part records, then re-emits an SVG with each part wrapped in an animated `<g>` whose contents are injected via ref + cloneNode (avoids React `dangerouslySetInnerHTML`). New `CameraStage` wraps the scene for zoom/pan. New `ChapterSceneV2` composes them. Ch1_V2 chapter data declares the per-part keyframes. Output is an MP4 of just Ch1 (240 frames) for visual comparison.

**Tech Stack:** Remotion 4.0.355, React 18, TypeScript, vitest + jsdom + @testing-library/react, Inkscape for SVG annotation, ffmpeg for render.

**Reference design doc:** [`docs/plans/2026-05-05-c-recraft-layered-animation-design.md`](./2026-05-05-c-recraft-layered-animation-design.md)

---

## User Contribution Opportunities (Learning Mode)

Two tasks need **your** judgment, not Claude's:

1. **Task 1 — Manual SVG layering in Inkscape.** Claude can write instructions but cannot click in Inkscape. You'll spend ~25 min lasso-grouping paths into body parts and setting pivot points. This is artistic judgment about "which path is part of which body part" and "where does the elbow rotate from."

2. **Task 9 — Ch1_V2 keyframe authoring.** Claude scaffolds the structure but **you author the actual animation** — what does Joshua's head do over 8 seconds? When does his right arm reach for the pen? When does the camera push in? This is where the storytelling happens. ~30 min of creative work.

Everything else is mechanical (TDD components, plumbing).

---

## Task 1: Manual SVG Layering (User Task — Inkscape)

**Goal:** Convert `tmp/spike/joshua-recraft-v4.svg` (flat, 258 paths) into `public/keypose-v2/joshua-desk-lean.svg` with 7 named groups and pivot annotations.

**Files:**
- Read: `tmp/spike/joshua-recraft-v4.svg`
- Create: `public/keypose-v2/joshua-desk-lean.svg`

**Step 1: Open in Inkscape**

```bash
mkdir -p public/keypose-v2
inkscape tmp/spike/joshua-recraft-v4.svg
```

**Step 2: Create 7 groups by lasso + Object → Group (Ctrl+G)**

For each body part, lasso-select all visually-belonging paths, then Object → Group. After grouping, click the group, open Object Properties (Ctrl+Shift+O), and set the `id`:

| Group id | What to lasso |
|---|---|
| `head` | Hair, ears, neck (everything above shoulder line, excluding face details) |
| `face` | Eyes, eyebrows, nose, mouth, glasses, blush — anything that sits *on* the head |
| `torso` | White shirt body only (no sleeves) |
| `L-arm` | Left sleeve + left forearm + left hand (the arm folded under chin in this pose) |
| `R-arm` | Right sleeve + right forearm + right hand (the writing arm) |
| `L-leg` | Left brown trouser + left shoe |
| `R-leg` | Right brown trouser + right shoe |
| `prop-1` | The pen + the desk + the ledger paper (everything Joshua interacts with) |

If a path crosses two parts (e.g., a shoulder seam between torso and arm), put it in whichever part it's mostly part of. Don't agonize.

**Step 3: Set pivot points via XML editor (Ctrl+Shift+X)**

For each group, click it, open the XML editor, and add these attributes:

| Group id | data-pivot-x | data-pivot-y | (anchor location) |
|---|---|---|---|
| `head` | (~750) | (~330) | base of skull / top of neck |
| `face` | (~750) | (~330) | same as head |
| `torso` | (~750) | (~700) | base of neck / top of shoulders |
| `L-arm` | (~590) | (~620) | left shoulder joint |
| `R-arm` | (~910) | (~620) | right shoulder joint |
| `L-leg` | (~640) | (~1100) | left hip joint |
| `R-leg` | (~860) | (~1100) | right hip joint |
| `prop-1` | (~1100) | (~1000) | wherever the pen meets paper |

**Coordinates are in SVG viewBox space (1509 × 2048).** Values above are estimates — eyeball the actual joint position and use that. Inkscape's status bar shows cursor coords as you hover.

**Step 4: Save as Plain SVG**

File → Save As → `public/keypose-v2/joshua-desk-lean.svg`, format "Plain SVG".

**Step 5: Verify with grep**

```bash
grep -oE '<g[^>]*id="[^"]*"' public/keypose-v2/joshua-desk-lean.svg | sort
```

Expected output (order doesn't matter):
```
<g ... id="L-arm"
<g ... id="L-leg"
<g ... id="R-arm"
<g ... id="R-leg"
<g ... id="face"
<g ... id="head"
<g ... id="prop-1"
<g ... id="torso"
```

```bash
grep -oE 'data-pivot-x="[^"]*"' public/keypose-v2/joshua-desk-lean.svg | wc -l
```

Expected: `8`

**Step 6: Commit**

```bash
git add public/keypose-v2/joshua-desk-lean.svg
git commit -m "feat(dalio): hand-layered Joshua desk-lean SVG (7 body parts + prop)"
```

---

## Task 2: Type definitions

**Files:**
- Create: `src/dalio/animation/types.ts`
- Create: `src/dalio/animation/types.test.ts`

**Step 1: Write the failing test**

```ts
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import type { Keyframe, PartTimeline } from './types';
import { PART_IDS } from './types';

describe('animation types', () => {
  it('PART_IDS includes all 8 expected ids', () => {
    expect(PART_IDS).toEqual(['head', 'face', 'torso', 'L-arm', 'R-arm', 'L-leg', 'R-leg', 'prop-1']);
  });

  it('Keyframe shape compiles', () => {
    const kf: Keyframe = { at: 0, rotate: 5, tx: 10, ty: -2, scale: 1.05, opacity: 1, easing: 'inOut' };
    expect(kf.at).toBe(0);
  });

  it('PartTimeline shape compiles', () => {
    const pt: PartTimeline = { partId: 'head', keyframes: [{ at: 0 }, { at: 60, rotate: 10 }] };
    expect(pt.keyframes).toHaveLength(2);
  });
});
```

**Step 2: Run test (expect FAIL — file doesn't exist)**

```bash
npx vitest run src/dalio/animation/types.test.ts
```

**Step 3: Implement**

Create `src/dalio/animation/types.ts`:

```ts
export const PART_IDS = ['head', 'face', 'torso', 'L-arm', 'R-arm', 'L-leg', 'R-leg', 'prop-1'] as const;
export type PartId = typeof PART_IDS[number];

export type Easing = 'linear' | 'in' | 'out' | 'inOut';

export interface Keyframe {
  readonly at: number;
  readonly rotate?: number;
  readonly tx?: number;
  readonly ty?: number;
  readonly scale?: number;
  readonly opacity?: number;
  readonly easing?: Easing;
}

export interface PartTimeline {
  readonly partId: PartId;
  readonly keyframes: ReadonlyArray<Keyframe>;
}

export type EnterAnimation = 'slideLeft' | 'slideRight' | 'fadeUp' | 'scaleIn' | 'none';
export type ExitAnimation = 'slideLeft' | 'slideRight' | 'fadeOut' | 'scaleOut' | 'none';

export interface LayeredCharacterDef {
  readonly src: string;
  readonly imgWidth: number;
  readonly imgHeight: number;
  readonly xPercent: number;
  readonly yPercent: number;
  readonly heightFraction: number;
  readonly label?: string;
  readonly accentColor?: string;
  readonly parts: ReadonlyArray<PartTimeline>;
  readonly enter?: EnterAnimation;
  readonly exit?: ExitAnimation;
}

export interface CameraMove {
  readonly at: number;
  readonly zoom?: number;
  readonly panX?: number;
  readonly panY?: number;
  readonly easing?: Easing;
}
```

**Step 4: Run test — expect PASS**

```bash
npx vitest run src/dalio/animation/types.test.ts
```

**Step 5: Commit**

```bash
git add src/dalio/animation/types.ts src/dalio/animation/types.test.ts
git commit -m "feat(dalio): animation type definitions for layered characters"
```

---

## Task 3: `interpolatePart` — keyframe interpolation

**Files:**
- Create: `src/dalio/animation/interpolatePart.ts`
- Create: `src/dalio/animation/interpolatePart.test.ts`

**Step 1: Write failing tests**

```ts
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { interpolatePart } from './interpolatePart';
import type { PartTimeline } from './types';

describe('interpolatePart', () => {
  const tl: PartTimeline = {
    partId: 'head',
    keyframes: [
      { at: 0, rotate: 0, tx: 0, scale: 1, opacity: 1 },
      { at: 60, rotate: 10, tx: 20, scale: 1.1 },
      { at: 120, rotate: 0, tx: 0, scale: 1 },
    ],
  };

  it('returns first keyframe values before first.at', () => {
    expect(interpolatePart(tl, -10).rotate).toBe(0);
  });

  it('interpolates linearly halfway between keyframes', () => {
    const r = interpolatePart(tl, 30);
    expect(r.rotate).toBeCloseTo(5);
    expect(r.tx).toBeCloseTo(10);
  });

  it('returns exact keyframe values at keyframe time', () => {
    expect(interpolatePart(tl, 60).rotate).toBe(10);
  });

  it('clamps to last keyframe after end', () => {
    expect(interpolatePart(tl, 999).rotate).toBe(0);
  });

  it('defaults missing props to identity (rotate=0, scale=1, opacity=1)', () => {
    const sparse: PartTimeline = { partId: 'head', keyframes: [{ at: 0 }] };
    const r = interpolatePart(sparse, 0);
    expect(r.rotate).toBe(0);
    expect(r.scale).toBe(1);
    expect(r.opacity).toBe(1);
    expect(r.tx).toBe(0);
    expect(r.ty).toBe(0);
  });
});
```

**Step 2: Run tests — expect FAIL**

**Step 3: Implement**

```ts
import type { PartTimeline, Easing } from './types';

export interface ResolvedTransform {
  rotate: number;
  tx: number;
  ty: number;
  scale: number;
  opacity: number;
}

const DEFAULTS: ResolvedTransform = { rotate: 0, tx: 0, ty: 0, scale: 1, opacity: 1 };

function ease(t: number, mode: Easing = 'linear'): number {
  if (mode === 'linear') return t;
  if (mode === 'in') return t * t;
  if (mode === 'out') return 1 - (1 - t) * (1 - t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function pick<K extends keyof ResolvedTransform>(
  k: K,
  a: Partial<ResolvedTransform>,
  b: Partial<ResolvedTransform>,
  t: number
): number {
  const av = a[k] ?? DEFAULTS[k];
  const bv = b[k] ?? DEFAULTS[k];
  return av + (bv - av) * t;
}

export function interpolatePart(tl: PartTimeline, frame: number): ResolvedTransform {
  const kfs = tl.keyframes;
  if (kfs.length === 0) return { ...DEFAULTS };
  if (frame <= kfs[0].at) return { ...DEFAULTS, ...kfs[0] };
  if (frame >= kfs[kfs.length - 1].at) return { ...DEFAULTS, ...kfs[kfs.length - 1] };

  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i];
    const b = kfs[i + 1];
    if (frame >= a.at && frame <= b.at) {
      const span = b.at - a.at;
      const raw = span > 0 ? (frame - a.at) / span : 0;
      const t = ease(raw, a.easing);
      return {
        rotate: pick('rotate', a, b, t),
        tx: pick('tx', a, b, t),
        ty: pick('ty', a, b, t),
        scale: pick('scale', a, b, t),
        opacity: pick('opacity', a, b, t),
      };
    }
  }
  return { ...DEFAULTS };
}
```

**Step 4: Run tests — expect PASS**

**Step 5: Commit**

```bash
git add src/dalio/animation/interpolatePart.ts src/dalio/animation/interpolatePart.test.ts
git commit -m "feat(dalio): interpolatePart — per-frame keyframe resolver with easings"
```

---

## Task 4: `parseLayeredSvg` — extract groups + pivots (returns nodes, not strings)

**Files:**
- Create: `src/dalio/animation/parseLayeredSvg.ts`
- Create: `src/dalio/animation/parseLayeredSvg.test.ts`

**Why nodes not strings:** keeping parsed SVG as live DOM nodes lets the consumer use `cloneNode(true)` + `appendChild` — equivalent power to `dangerouslySetInnerHTML` but expressed through standard DOM API, no React unsafe-prop warning.

**Step 1: Write failing tests**

```ts
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { parseLayeredSvg } from './parseLayeredSvg';

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g id="head" data-pivot-x="50" data-pivot-y="20"><circle cx="50" cy="20" r="10"/></g>
  <g id="torso" data-pivot-x="50" data-pivot-y="50"><rect x="40" y="30" width="20" height="40"/></g>
  <g id="bg-noise"><path d="M0 0"/></g>
</svg>`;

describe('parseLayeredSvg', () => {
  it('extracts only known PartIds', () => {
    const r = parseLayeredSvg(SAMPLE);
    expect(r.parts.map(p => p.id).sort()).toEqual(['head', 'torso']);
  });

  it('parses pivot coords as numbers', () => {
    const r = parseLayeredSvg(SAMPLE);
    const head = r.parts.find(p => p.id === 'head')!;
    expect(head.pivot).toEqual({ x: 50, y: 20 });
  });

  it('exposes child nodes as live DOM Nodes (not string)', () => {
    const r = parseLayeredSvg(SAMPLE);
    const head = r.parts.find(p => p.id === 'head')!;
    expect(head.childNodes.length).toBeGreaterThan(0);
    expect(head.childNodes[0].nodeType).toBeDefined();
  });

  it('returns viewBox width/height', () => {
    const r = parseLayeredSvg(SAMPLE);
    expect(r.viewBox).toEqual({ width: 100, height: 100 });
  });
});
```

**Step 2: Run — expect FAIL**

**Step 3: Implement**

```ts
import { PART_IDS, type PartId } from './types';

export interface ParsedPart {
  readonly id: PartId;
  /** Live DOM Nodes — consumer clones them via cloneNode(true) and appendChild. */
  readonly childNodes: ReadonlyArray<Node>;
  readonly pivot: { x: number; y: number };
}

export interface ParsedLayeredSvg {
  readonly viewBox: { width: number; height: number };
  readonly parts: ReadonlyArray<ParsedPart>;
}

const PART_SET = new Set<string>(PART_IDS);

export function parseLayeredSvg(svgText: string): ParsedLayeredSvg {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const root = doc.documentElement;

  const vbAttr = root.getAttribute('viewBox') ?? '0 0 0 0';
  const parts: number[] = vbAttr.split(/\s+/).map(Number);
  const vw = parts[2] ?? 0;
  const vh = parts[3] ?? 0;

  const result: ParsedPart[] = [];
  const groups = root.querySelectorAll('g[id]');
  groups.forEach((g) => {
    const id = g.getAttribute('id') ?? '';
    if (!PART_SET.has(id)) return;
    const pxAttr = g.getAttribute('data-pivot-x');
    const pyAttr = g.getAttribute('data-pivot-y');
    let pivot: { x: number; y: number };
    if (pxAttr !== null && pyAttr !== null) {
      pivot = { x: Number(pxAttr), y: Number(pyAttr) };
    } else {
      pivot = bboxFromChildAttrs(g);
    }
    result.push({
      id: id as PartId,
      childNodes: Array.from(g.childNodes),
      pivot,
    });
  });

  return { viewBox: { width: vw, height: vh }, parts: result };
}

function bboxFromChildAttrs(g: Element): { x: number; y: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  g.querySelectorAll('[x][y]').forEach((el) => {
    const x = Number(el.getAttribute('x'));
    const y = Number(el.getAttribute('y'));
    const w = Number(el.getAttribute('width') ?? 0);
    const h = Number(el.getAttribute('height') ?? 0);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }
  });
  if (!Number.isFinite(minX)) return { x: 0, y: 0 };
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}
```

**Step 4: Run tests — expect PASS**

**Step 5: Commit**

```bash
git add src/dalio/animation/parseLayeredSvg.ts src/dalio/animation/parseLayeredSvg.test.ts
git commit -m "feat(dalio): parseLayeredSvg — extract <g> body parts with live DOM nodes"
```

---

## Task 5: `LayeredCharacter` component (ref-based DOM injection)

**Files:**
- Create: `src/dalio/components/LayeredCharacter.tsx`
- Create: `src/dalio/components/LayeredCharacter.test.tsx`

**Step 1: Write failing test**

```tsx
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LayeredCharacter } from './LayeredCharacter';

vi.mock('remotion', async () => ({
  useCurrentFrame: () => 0,
  delayRender: (msg?: string) => msg ?? 'h',
  continueRender: vi.fn(),
}));

describe('LayeredCharacter', () => {
  it('renders without crashing when src not yet loaded', () => {
    const { container } = render(
      <LayeredCharacter
        src="/test.svg"
        imgWidth={100}
        imgHeight={100}
        displayHeight={400}
        parts={[]}
      />
    );
    expect(container).toBeTruthy();
  });
});
```

**Step 2: Run — expect FAIL**

**Step 3: Implement** (ref-based injection — no React `dangerouslySetInnerHTML`)

```tsx
/**
 * LayeredCharacter — renders a hand-layered SVG with per-body-part transforms.
 *
 * Replacement for KeyPoseImage. Loads SVG once via fetch (delayRender holds
 * Remotion until parsed), then re-emits an SVG where each body-part <g>
 * group is wrapped by an animated transform <g>. Inner content is injected
 * via ref + cloneNode rather than dangerouslySetInnerHTML — equivalent power,
 * no React unsafe-prop warning. Source SVGs come from public/ — they're
 * trusted assets we author, not user input.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useCurrentFrame, delayRender, continueRender } from 'remotion';
import { parseLayeredSvg, type ParsedLayeredSvg, type ParsedPart } from '../animation/parseLayeredSvg';
import { interpolatePart } from '../animation/interpolatePart';
import type { PartTimeline } from '../animation/types';

interface Props {
  readonly src: string;
  readonly imgWidth: number;
  readonly imgHeight: number;
  readonly displayHeight: number;
  readonly parts: ReadonlyArray<PartTimeline>;
}

export const LayeredCharacter: React.FC<Props> = ({
  src,
  imgWidth,
  imgHeight,
  displayHeight,
  parts,
}) => {
  const frame = useCurrentFrame();
  const [parsed, setParsed] = useState<ParsedLayeredSvg | null>(null);

  useEffect(() => {
    const handle = delayRender(`LayeredCharacter ${src}`);
    fetch(src)
      .then((r) => r.text())
      .then((txt) => setParsed(parseLayeredSvg(txt)))
      .catch((e) => console.error('[LayeredCharacter]', src, e))
      .finally(() => continueRender(handle));
  }, [src]);

  const aspect = imgWidth / imgHeight;
  const displayWidth = displayHeight * aspect;

  if (!parsed) {
    return <div style={{ width: displayWidth, height: displayHeight }} />;
  }

  const partById: Record<string, PartTimeline> = {};
  for (const p of parts) partById[p.partId] = p;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${parsed.viewBox.width} ${parsed.viewBox.height}`}
      width={displayWidth}
      height={displayHeight}
      style={{ display: 'block' }}
    >
      {parsed.parts.map((part) => (
        <PartGroup key={part.id} part={part} timeline={partById[part.id]} frame={frame} />
      ))}
    </svg>
  );
};

const PartGroup: React.FC<{
  part: ParsedPart;
  timeline: PartTimeline | undefined;
  frame: number;
}> = ({ part, timeline, frame }) => {
  const innerRef = useRef<SVGGElement>(null);

  // Inject parsed nodes once via ref + cloneNode (DOM API, not React unsafe prop).
  useEffect(() => {
    const host = innerRef.current;
    if (!host) return;
    while (host.firstChild) host.removeChild(host.firstChild);
    for (const node of part.childNodes) host.appendChild(node.cloneNode(true));
  }, [part]);

  const tx = timeline
    ? interpolatePart(timeline, frame)
    : { rotate: 0, tx: 0, ty: 0, scale: 1, opacity: 1 };

  const transform =
    `translate(${part.pivot.x + tx.tx}, ${part.pivot.y + tx.ty}) ` +
    `rotate(${tx.rotate}) scale(${tx.scale}) ` +
    `translate(${-part.pivot.x}, ${-part.pivot.y})`;

  return (
    <g transform={transform} opacity={tx.opacity}>
      <g ref={innerRef} />
    </g>
  );
};
```

**Step 4: Run test — expect PASS**

```bash
npx vitest run src/dalio/components/LayeredCharacter.test.tsx
```

**Step 5: Commit**

```bash
git add src/dalio/components/LayeredCharacter.tsx src/dalio/components/LayeredCharacter.test.tsx
git commit -m "feat(dalio): LayeredCharacter — per-part SVG transform animation via ref injection"
```

---

## Task 6: `CameraStage` component

**Files:**
- Create: `src/dalio/components/CameraStage.tsx`
- Create: `src/dalio/components/CameraStage.test.tsx`

**Step 1: Write failing test**

```tsx
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CameraStage } from './CameraStage';

vi.mock('remotion', async () => ({
  useCurrentFrame: () => 30,
  useVideoConfig: () => ({ width: 1920, height: 1080, fps: 30, durationInFrames: 240 }),
  AbsoluteFill: ({ children, style }: any) => <div style={style}>{children}</div>,
}));

describe('CameraStage', () => {
  it('renders children', () => {
    const { getByTestId } = render(
      <CameraStage moves={[{ at: 0, zoom: 1 }, { at: 60, zoom: 1.2 }]}>
        <div data-testid="kid">hi</div>
      </CameraStage>
    );
    expect(getByTestId('kid')).toBeTruthy();
  });

  it('applies a transform style at frame=30 (halfway between zoom=1 and zoom=1.2)', () => {
    const { container } = render(
      <CameraStage moves={[{ at: 0, zoom: 1 }, { at: 60, zoom: 1.2 }]}>
        <div />
      </CameraStage>
    );
    const inner = container.querySelector('[data-camera="inner"]') as HTMLElement;
    expect(inner.style.transform).toMatch(/scale\(1\.1/);
  });
});
```

**Step 2: Run — expect FAIL**

**Step 3: Implement**

```tsx
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { CameraMove } from '../animation/types';

interface Props {
  readonly moves?: ReadonlyArray<CameraMove>;
  readonly children: React.ReactNode;
}

function pickCamera(moves: ReadonlyArray<CameraMove>, frame: number) {
  if (moves.length === 0) return { zoom: 1, panX: 0, panY: 0 };
  if (frame <= moves[0].at) return resolve(moves[0]);
  if (frame >= moves[moves.length - 1].at) return resolve(moves[moves.length - 1]);
  for (let i = 0; i < moves.length - 1; i++) {
    const a = moves[i], b = moves[i + 1];
    if (frame >= a.at && frame <= b.at) {
      const span = b.at - a.at;
      const t = span > 0 ? (frame - a.at) / span : 0;
      const ra = resolve(a), rb = resolve(b);
      return {
        zoom: ra.zoom + (rb.zoom - ra.zoom) * t,
        panX: ra.panX + (rb.panX - ra.panX) * t,
        panY: ra.panY + (rb.panY - ra.panY) * t,
      };
    }
  }
  return { zoom: 1, panX: 0, panY: 0 };
}

function resolve(m: CameraMove) {
  return { zoom: m.zoom ?? 1, panX: m.panX ?? 0, panY: m.panY ?? 0 };
}

export const CameraStage: React.FC<Props> = ({ moves = [], children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cam = pickCamera(moves, frame);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        data-camera="inner"
        style={{
          width,
          height,
          transformOrigin: 'center center',
          transform: `scale(${cam.zoom}) translate(${cam.panX}px, ${cam.panY}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
```

**Step 4: Run — expect PASS**

**Step 5: Commit**

```bash
git add src/dalio/components/CameraStage.tsx src/dalio/components/CameraStage.test.tsx
git commit -m "feat(dalio): CameraStage — chapter-level zoom/pan camera moves"
```

---

## Task 7: `ChapterSceneV2` composition

**Files:**
- Create: `src/dalio/scenes/ChapterSceneV2.tsx`

**Step 1: Implement** (no separate unit test — exercised by Task 10 render)

```tsx
/**
 * ChapterSceneV2 — uses LayeredCharacter + CameraStage. Otherwise mirrors
 * ChapterScene v1 (PaperBackground, title block, narration subtitle).
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

import { PaperBackground } from '../components/PaperBackground';
import { LayeredCharacter } from '../components/LayeredCharacter';
import { CameraStage } from '../components/CameraStage';
import { COLORS, FONTS } from '../theme';
import type { Chapter } from './chapters';
import type { LayeredCharacterDef, CameraMove } from '../animation/types';

export interface ChapterV2 extends Chapter {
  readonly layeredCast: ReadonlyArray<LayeredCharacterDef>;
  readonly camera?: ReadonlyArray<CameraMove>;
}

export const ChapterSceneV2: React.FC<{ chapter: ChapterV2 }> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const { width: vw, height: vh } = useVideoConfig();

  const titleOpacity = interpolate(
    frame,
    [0, 18, chapter.durationFrames - 24, chapter.durationFrames - 8],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 0.2, 1) }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper }}>
      <PaperBackground />

      <CameraStage moves={chapter.camera}>
        {chapter.layeredCast.map((c, i) => {
          const heightPx = vh * c.heightFraction;
          const aspect = c.imgWidth / c.imgHeight;
          const widthPx = heightPx * aspect;
          const cx = vw * c.xPercent;
          const bottom = vh * (1 - c.yPercent);
          return (
            <div
              key={`${chapter.id}-lc-${i}`}
              style={{
                position: 'absolute',
                left: cx - widthPx / 2,
                bottom,
                width: widthPx,
                height: heightPx,
              }}
            >
              <LayeredCharacter
                src={c.src}
                imgWidth={c.imgWidth}
                imgHeight={c.imgHeight}
                displayHeight={heightPx}
                parts={c.parts}
              />
            </div>
          );
        })}
      </CameraStage>

      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 80,
          opacity: titleOpacity,
          fontFamily: FONTS.heading,
          color: COLORS.ink,
          maxWidth: vw * 0.55,
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.55, marginBottom: 6, fontFamily: FONTS.mono }}>
          第 {chapter.chapterNumber} 章 · {chapter.id.toUpperCase()}
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{chapter.title}</div>
        <div style={{ fontSize: 26, marginTop: 14, opacity: 0.7, fontFamily: FONTS.body }}>
          {chapter.insight}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 70,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 80px',
          opacity: titleOpacity,
          fontFamily: FONTS.body,
          color: COLORS.ink,
          fontSize: 32,
          lineHeight: 1.4,
          textShadow: `0 0 20px ${COLORS.paper}, 0 0 20px ${COLORS.paper}`,
        }}
      >
        {chapter.narration}
      </div>
    </AbsoluteFill>
  );
};
```

**Step 2: tsc passes**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/dalio/scenes/ChapterSceneV2.tsx
git commit -m "feat(dalio): ChapterSceneV2 — uses LayeredCharacter + CameraStage"
```

---

## Task 8: Register `Story-Ch1-V2` Composition (placeholder data)

**Files:**
- Modify: `src/Video.tsx`
- Create: `src/dalio/scenes/CH1_V2.ts` (placeholder — real keyframes come in Task 9)

**Step 1: Create CH1_V2 placeholder data**

Create `src/dalio/scenes/CH1_V2.ts`:

```ts
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
```

**Step 2: Register composition in Video.tsx**

Add imports near other ChapterScene imports:

```tsx
import { ChapterSceneV2 } from './dalio/scenes/ChapterSceneV2';
import { CH1_V2 } from './dalio/scenes/CH1_V2';
```

Add the composition after the existing `Story-Ch...` map block:

```tsx
<Composition
  id="Story-Ch1-V2"
  component={ChapterSceneV2}
  durationInFrames={CH1_V2.durationFrames}
  fps={FPS}
  width={W}
  height={H}
  defaultProps={{ chapter: CH1_V2 }}
/>
```

**Step 3: Verify**

```bash
npm test
```

Expected: PASS (eslint + tsc).

**Step 4: Smoke-test in Studio**

```bash
npm start
```

Open `Story-Ch1-V2` in the Studio sidebar. Confirm: scene renders, Joshua appears layered, camera subtly zooms. Open browser DevTools and inspect the SVG — you should see one `<g>` per body part.

**Step 5: Commit**

```bash
git add src/Video.tsx src/dalio/scenes/CH1_V2.ts
git commit -m "feat(dalio): wire Story-Ch1-V2 composition with placeholder keyframes"
```

---

## Task 9: Author Ch1 keyframes (USER CONTRIBUTION)

> **This is your authoring task.** The structure is ready — now you decide what Joshua actually does over 8 seconds.

**File to edit:** `src/dalio/scenes/CH1_V2.ts`

The 240-frame chapter (8 seconds @ 30fps) covers this narration:

> "一年下来，我有一千八百三十五笔支付宝交易。今晚，我决定第一次把它们摊开看清楚。"

**Recommended beat structure** (adjust as you see fit):

| Frame | Beat | Suggested motion |
|---|---|---|
| 0–30 | Joshua fades up into frame | (handled by camera zoom + title fade-in) |
| 30–90 | "一年下来，1835 笔" — pen writing motion | R-arm subtle wrist rotate ±3° loop |
| 90–150 | "今晚我决定" — head lifts thoughtfully | head rotate 0° → -8° (looking up), then back |
| 150–210 | "摊开看清楚" — pen pauses, head settles | R-arm scale 1.0 → 1.02 (pen tap), head returns |
| 210–240 | Camera completes push-in | (camera handles this; no part motion needed) |

**Concrete starter — replace the empty `parts: []`:**

```ts
parts: [
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
  {
    partId: 'L-arm',
    keyframes: [
      { at: 0, rotate: 0 },
      { at: 240, rotate: 0.5, easing: 'inOut' },
    ],
  },
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
```

**Iterate via Studio:**

```bash
npm start
```

Open `Story-Ch1-V2`, scrub the timeline, tweak rotate/tx/ty values, save, hot-reload. **Keep angles small** (≤10°) — `LayeredCharacter` does pure SVG transform, so big angles will distort visually because it's not skin-deformed.

**When happy, commit:**

```bash
git add src/dalio/scenes/CH1_V2.ts
git commit -m "feat(dalio): Ch1 prototype keyframes — head turn + pen writing wobble + breathing"
```

---

## Task 10: Render Ch1 prototype MP4 + visual comparison

**Step 1: Render the new chapter**

```bash
npx remotion render src/index.tsx Story-Ch1-V2 out/ch1-v2-prototype.mp4 --timeout=90000
```

Expected: ~8 seconds rendering, output at `out/ch1-v2-prototype.mp4`, ~1–3 MB.

**Step 2: Render the v1 baseline for comparison**

```bash
npx remotion render src/index.tsx Story-Ch1-ch1 out/ch1-v1-baseline.mp4 --timeout=90000
```

(Composition id is `Story-Ch{n}-{id}` per `Video.tsx` map block — confirm the exact id by listing compositions: `npx remotion compositions src/index.tsx`.)

**Step 3: Side-by-side compare**

```bash
ffmpeg -i out/ch1-v1-baseline.mp4 -i out/ch1-v2-prototype.mp4 \
  -filter_complex hstack -y out/ch1-compare.mp4
open out/ch1-compare.mp4
```

**Step 4: Decision gate**

Watch the comparison and decide:
- v2 noticeably more alive than v1 → proceed to Phase 2 (regenerate ch2–ch8 SVGs and layer them)
- v2 worse or no different → iterate Task 9 with bigger angles, or split arm into upper+lower for finer control, or pivot to Lottie path

Append a 2–3 sentence "Phase 1 outcome" note to the design doc with the decision.

**Step 5: Commit results**

```bash
git add docs/plans/2026-05-05-c-recraft-layered-animation-design.md
git commit -m "docs(dalio): Phase 1 outcome — Ch1 prototype decision recorded"
```

(If `out/` is gitignored, leave the MP4s out of git; the decision note in the design doc is the artifact that matters.)

---

## Done Criteria

Phase 1 is complete when:

- [x] `public/keypose-v2/joshua-desk-lean.svg` exists with 8 named groups
- [x] All vitest tests pass (`npx vitest run src/dalio/animation src/dalio/components/LayeredCharacter.test.tsx src/dalio/components/CameraStage.test.tsx`)
- [x] `npm test` (eslint + tsc) passes
- [x] `Story-Ch1-V2` renders without errors in Studio
- [x] `out/ch1-v2-prototype.mp4` exists and shows visible per-part motion when scrubbed
- [x] Decision recorded: proceed to Phase 2 or iterate

---

## Out-of-scope (NOT in this plan)

- Regenerating ch2–ch8 SVGs (Phase 2)
- Migrating ch2–ch8 to ChapterV2 (Phase 3)
- Audio/narration changes
- Cross-chapter transitions
- Text animation upgrades (CountUp, typewriter) — possible follow-up
