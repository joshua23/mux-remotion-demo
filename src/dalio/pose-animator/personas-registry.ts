/**
 * personas-registry — maps narrative personas to their rigged SVG assets.
 *
 * MOCK PHASE: all 5 family members reuse Joshua's clean SVG. Real per-character
 * Flux 2 Max generation comes later — when those land, swap each persona's
 * `svgPath` and the rest of the pipeline keeps working unchanged.
 *
 * `displayHeightFactor` differentiates body sizes (child shorter, etc.) until
 * we have real per-character art. `accentColor` is for nametag plates / labels
 * in scenes — does NOT tint the figure itself (figures share the same SVG).
 */
import { staticFile } from 'remotion';

import { COLORS } from '../theme';

export type PersonaKey = 'joshua' | 'nana' | 'yanyan' | 'long' | 'guofa' | 'child';

export interface PersonaAsset {
  /** Display name used in nametags / narration */
  readonly displayName: string;
  /** Relationship to Joshua (for scene prose) */
  readonly relation: string;
  /** Public-folder SVG asset (rigged, cleaned) */
  readonly svgPath: string;
  /** SVG canvas dimensions (must match what's in the file) */
  readonly svgWidth: number;
  readonly svgHeight: number;
  /**
   * Multiplier applied to a scene's base displayHeight.
   * 1.0 = adult, 0.65 = child, 0.95 = slightly shorter female.
   */
  readonly displayHeightFactor: number;
  /** Accent color for nametag, only — figure ink stays sepia */
  readonly accentColor: string;
}

const JOSHUA_SVG = staticFile('joshua-tpose-clean.svg');
const JOSHUA_W = 1248;
const JOSHUA_H = 1664;

export const PERSONAS: Record<PersonaKey, PersonaAsset> = {
  joshua: {
    displayName: '张啸 / Joshua',
    relation: '主角（自己）',
    svgPath: JOSHUA_SVG,
    svgWidth: JOSHUA_W,
    svgHeight: JOSHUA_H,
    displayHeightFactor: 1.0,
    accentColor: COLORS.accent.red,
  },
  nana: {
    displayName: 'NaNa',
    relation: '妻子',
    svgPath: staticFile('keypose/nana-stand.svg'),
    svgWidth: 1248,
    svgHeight: 1664,
    displayHeightFactor: 0.95,
    accentColor: COLORS.accent.yellow,
  },
  yanyan: {
    displayName: '燕燕',
    relation: '妹妹',
    svgPath: staticFile('keypose/yanyan-stand.svg'),
    svgWidth: 1248,
    svgHeight: 1664,
    displayHeightFactor: 0.92,
    accentColor: COLORS.accent.teal,
  },
  long: {
    displayName: '龙',
    relation: '妻舅',
    svgPath: staticFile('keypose/long-stand.svg'),
    svgWidth: 1248,
    svgHeight: 1664,
    displayHeightFactor: 1.0,
    accentColor: COLORS.accent.blue,
  },
  guofa: {
    displayName: '国法',
    relation: '亲属（长辈）',
    svgPath: staticFile('keypose/guofa-stand.svg'),
    svgWidth: 1248,
    svgHeight: 1664,
    displayHeightFactor: 1.05,
    accentColor: COLORS.ink,
  },
  child: {
    displayName: '小孩',
    relation: '子女',
    svgPath: staticFile('keypose/child-stand.svg'),
    svgWidth: 1248,
    svgHeight: 1664,
    displayHeightFactor: 0.65,
    accentColor: COLORS.accent.red,
  },
};
