export const STICK_FIGURE_PATHS = {
  standing: `
    M 25 5 A 5 5 0 1 1 25 5.01
    M 25 10 L 25 28
    M 25 28 L 15 42
    M 25 28 L 35 42
    M 25 18 L 15 26
    M 25 18 L 35 26
  `,
  walking: `
    M 25 5 A 5 5 0 1 1 25 5.01
    M 25 10 L 25 28
    M 25 28 L 18 42
    M 25 28 L 32 42
    M 25 18 L 13 22
    M 25 18 L 37 24
  `,
  waving: `
    M 25 5 A 5 5 0 1 1 25 5.01
    M 25 10 L 25 28
    M 25 28 L 15 42
    M 25 28 L 35 42
    M 25 18 L 15 14
    M 25 18 L 35 26
  `,
  pointing: `
    M 25 5 A 5 5 0 1 1 25 5.01
    M 25 10 L 25 28
    M 25 28 L 15 42
    M 25 28 L 35 42
    M 25 18 L 13 12
    M 25 18 L 35 26
  `,
} as const;

export type StickFigurePose = keyof typeof STICK_FIGURE_PATHS;
