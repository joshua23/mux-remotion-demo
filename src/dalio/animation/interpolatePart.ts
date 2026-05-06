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
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function pick<K extends keyof ResolvedTransform>(
  k: K,
  a: Partial<ResolvedTransform>,
  b: Partial<ResolvedTransform>,
  t: number,
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
