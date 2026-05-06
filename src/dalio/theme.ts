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
