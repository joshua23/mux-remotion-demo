/**
 * 简笔线条人物（character line drawings, Ray Dalio 风格）
 *
 * 每个角色是一组完整的 SVG path，组合而成：圆头 + 头发/眼镜 + 衬衫/裙子轮廓 + 四肢。
 * 设计参考：Jonathan Jarvis / Thornberg & Forester 在《How the Economic Machine Works》
 * 中使用的人物——克制的轮廓 + 1-2 个区分性细节。
 *
 * 坐标系: viewBox 0 0 60 100，头中心约 (30, 18)，脚约 (30, 92)
 */

interface CharacterPaths {
  /** 主体（头、脖子、衬衫/裙子、四肢）- 通用线稿 */
  body: string;
  /** 区分性装饰（头发、眼镜、领带等）- 角色独有 */
  decoration: string;
}

// === 共用片段 ===

/** 圆头：以 (30, 18) 为中心，半径 10 */
const HEAD = 'M 20 18 A 10 10 0 1 1 40 18 A 10 10 0 1 1 20 18';

/** 短脖子 */
const NECK = 'M 30 28 L 30 32';

/** T 恤衬衫轮廓（无腿）*/
const TSHIRT = 'M 22 32 L 16 42 L 18 65 L 42 65 L 44 42 L 38 32';

/** A 字裙轮廓（无腿）*/
const DRESS = 'M 22 32 L 14 70 L 46 70 L 38 32';

/** 西装外套（V 领） */
const SUIT_JACKET = 'M 22 32 L 16 42 L 18 65 L 30 65 L 42 65 L 44 42 L 38 32';

/** 双臂自然下垂 */
const ARMS_DOWN = 'M 18 42 L 14 60 M 42 42 L 46 60';

/** 双腿正立 */
const LEGS_STANDING = 'M 26 65 L 24 92 M 34 65 L 36 92';

/** 双腿正立（裙装）*/
const LEGS_STANDING_DRESS = 'M 26 70 L 24 92 M 34 70 L 36 92';

// === 五个角色 ===

const JOSHUA: CharacterPaths = {
  body: `${HEAD} ${NECK} ${TSHIRT} ${ARMS_DOWN} ${LEGS_STANDING}`,
  // 短发顶 + 圆框眼镜 + 鼻梁
  decoration: `
    M 21 12 Q 30 6 39 12
    M 24 17 A 2 2 0 1 1 28 17 A 2 2 0 1 1 24 17
    M 32 17 A 2 2 0 1 1 36 17 A 2 2 0 1 1 32 17
    M 28 17 L 32 17
  `,
};

const WIFE: CharacterPaths = {
  body: `${HEAD} ${NECK} ${DRESS} ${ARMS_DOWN} ${LEGS_STANDING_DRESS}`,
  // 长发披肩到胸口
  decoration: `
    M 21 12 Q 30 6 39 12
    M 20 14 Q 17 28 20 38
    M 40 14 Q 43 28 40 38
  `,
};

const FAMILY_FEMALE: CharacterPaths = {
  body: `${HEAD} ${NECK} ${TSHIRT} ${ARMS_DOWN} ${LEGS_STANDING}`,
  // 中短发（齐下巴 bob 头）
  decoration: `
    M 21 12 Q 30 5 39 12
    M 20 14 Q 19 22 22 26
    M 40 14 Q 41 22 38 26
  `,
};

const FAMILY_MALE: CharacterPaths = {
  body: `${HEAD} ${NECK} ${TSHIRT} ${ARMS_DOWN} ${LEGS_STANDING}`,
  // 短男士发型（贴头）
  decoration: `
    M 21 12 Q 30 7 39 12
    M 22 11 L 22 15
    M 38 11 L 38 15
  `,
};

const BUSINESS: CharacterPaths = {
  body: `${HEAD} ${NECK} ${SUIT_JACKET} ${ARMS_DOWN} ${LEGS_STANDING}`,
  // 短发 + 西装领 V + 领带
  decoration: `
    M 21 12 Q 30 6 39 12
    M 26 32 L 30 42 L 34 32
    M 30 42 L 28 56 L 30 60 L 32 56 Z
  `,
};

export const CHARACTERS = {
  joshua: JOSHUA,
  wife: WIFE,
  'family-female': FAMILY_FEMALE,
  'family-male': FAMILY_MALE,
  business: BUSINESS,
  generic: { body: `${HEAD} ${NECK} ${TSHIRT} ${ARMS_DOWN} ${LEGS_STANDING}`, decoration: '' },
} as const;

export type CharacterKey = keyof typeof CHARACTERS;

// === 兼容旧 API（StickFigure 旧 pose 接口仍引用 STICK_FIGURE_PATHS）===

export const STICK_FIGURE_PATHS = {
  standing: '',
  walking: '',
  waving: '',
  pointing: '',
} as const;

export type StickFigurePose = keyof typeof STICK_FIGURE_PATHS;
