/**
 * 主角与家庭角色配置（Dalio 视频管线）
 *
 * 由 src/scripts/build-timeline.ts 在生成时间线时引用。
 * 当前为「支付宝财务摘要 原始数据.csv」的初始映射，需 Joshua 确认/修正。
 */

export interface Persona {
  /** 火柴人 character key（对应 src/dalio/utils/stickFigures.ts 的 CHARACTER_DECORATIONS）*/
  readonly character: 'joshua' | 'wife' | 'family-female' | 'family-male' | 'business' | 'generic';
  /** 屏幕上方/脚下显示的标签 */
  readonly label: string;
  /** 角色与主角关系 */
  readonly relation: string;
  /** 该角色在 narration 里的代称 */
  readonly narrativeAlias: string;
}

/**
 * 主角设定 — 全片以 Joshua 第一人称讲述
 */
export const PROTAGONIST: Persona = {
  character: 'joshua',
  label: 'Joshua',
  relation: 'self',
  narrativeAlias: '我',
};

/**
 * 家庭/业务网络
 *
 * Key = CSV 里 `交易对方` 字段的值，必须与原始数据精确匹配。
 *
 * ✅ Joshua 确认（2026-05-02）的家庭关系：
 * - NaNa(张娜)   → 妻子
 * - 燕燕(张春彦) → 妹妹（Joshua 的妹妹）
 * - 龙(张龙)     → 小舅子（妻子 NaNa 的弟弟）
 * - 皆柏贸易...  → 业务对手方
 */
export const NETWORK: Record<string, Persona> = {
  'NaNa(张娜)': {
    character: 'wife',
    label: 'NaNa',
    relation: '妻子',
    narrativeAlias: 'NaNa',
  },
  '燕燕（9万)(张春彦)': {
    character: 'family-female',
    label: '燕燕',
    relation: '妹妹',
    narrativeAlias: '燕燕',
  },
  '龙(张龙)': {
    character: 'family-male',
    label: '龙',
    relation: '小舅子',
    narrativeAlias: '龙',
  },
  '皆柏贸易（杭州）有限公司上海第七分公司': {
    character: 'business',
    label: '皆柏贸易',
    relation: '业务伙伴',
    narrativeAlias: '皆柏贸易',
  },
} as const;

/** 用 CSV `交易对方` 字符串查找该角色，找不到返回 undefined */
export function lookupPersona(counterparty: string): Persona | undefined {
  return NETWORK[counterparty];
}
