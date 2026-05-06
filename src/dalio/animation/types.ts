export const PART_IDS = ['head', 'face', 'torso', 'L-arm', 'R-arm', 'L-leg', 'R-leg', 'prop-1'] as const;
export type PartId = (typeof PART_IDS)[number];

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
