/**
 * 火柴人 / 简笔画角色
 *
 * 设计：基础身体（pose）+ 角色装饰（character decorations）叠加。
 * 每个 character 在头部/身上加 1-2 个区分性元素，让观众能跨场景识别。
 *
 * Ray Dalio《Economic Machine》风格：人物极简但有辨识度（如 Bob 戴帽、Sue 长发）。
 */

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

/**
 * 角色装饰：叠加到基础身体之上的 SVG 路径，给火柴人加辨识度。
 * 坐标系与 STICK_FIGURE_PATHS 一致（viewBox 0 0 50 50）。
 */
export const CHARACTER_DECORATIONS = {
  /** 主角 Joshua — 圆框眼镜 + 短发 */
  joshua: `
    M 21 4 A 1.5 1.5 0 1 1 21 4.01
    M 28.5 4 A 1.5 1.5 0 1 1 28.5 4.01
    M 22.5 4 L 27 4
    M 19 1 L 31 1
  `,
  /** 妻子（默认 NaNa）— 长发披肩到肩部 */
  wife: `
    M 19 4 Q 18 14 22 18
    M 31 4 Q 32 14 28 18
  `,
  /** 女性亲属 — 中长发 */
  'family-female': `
    M 19 5 Q 19 11 23 14
    M 31 5 Q 31 11 27 14
  `,
  /** 男性亲属 — 平头 */
  'family-male': `
    M 19 1 L 31 1
    M 19 1 L 19 4
    M 31 1 L 31 4
  `,
  /** 业务伙伴 — 公文包/西装领（在身体两侧加 V 形领） */
  business: `
    M 22 11 L 25 14 L 28 11
  `,
  /** 通用（无装饰） */
  generic: '',
} as const;

export type CharacterKey = keyof typeof CHARACTER_DECORATIONS;
