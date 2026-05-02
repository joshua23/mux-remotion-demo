# Gamma 叙事大纲生成提示

## 任务

根据提供的财务分析报告（`analysis.md`），生成一份 Ray Dalio《How the Economic Machine Works》风格的中文叙事大纲，用于后续 Remotion 动画视频制作。

## 输出规格

**必须恰好 8 张卡片（scenes）**，每张卡片包含以下 4 个字段：

```json
{
  "title": "简洁标题（≤10 字）",
  "key_points": ["核心观点 1", "核心观点 2", "核心观点 3"],
  "visual_concept": "视觉概念描述（用于 Remotion 组件选型）",
  "narration": "旁白文案（100-150 字，标准普通话，沉稳纪录片调性）"
}
```

## 叙事弧线（必须遵守）

Ray Dalio 叙事弧：**抛问题 → 拆机制 → 数据揭示 → 综合洞见**

| 卡片 | 叙事角色 | 建议类型 |
|---|---|---|
| 卡 1 | 震撼开场（反直觉问题） | TitleSpotlight |
| 卡 2 | 揭示整体收支格局 | ConceptReveal / Comparison |
| 卡 3 | 月度趋势与异常事件 | TimeSeries |
| 卡 4 | 资金流向机制（因果链） | CauseEffect |
| 卡 5 | 主动 vs 被动收入对比 | Comparison |
| 卡 6 | 资金循环引擎 | Cycle |
| 卡 7 | 财务健康度与风险 | Hierarchy / ConceptReveal |
| 卡 8 | 综合洞见与行动建议 | ConceptReveal |

## 调性约束

- **禁止口语词**：不用"其实"、"感觉"、"好像"、"真的"、"非常"、"很"、"太"
- **Dalio 风格**：客观、机制性、数据驱动，像经济学家解说机器运转
- **反直觉钩子**：至少 3 张卡的 narration 包含"看似 X，实则 Y"结构
- **旁白节奏**：150-160 WPM，每张卡旁白朗读时长约 45-60 秒
- **中文输出**：全部使用规范书面中文

## visual_concept 参考词汇

请从以下 Remotion 组件原语中选择适合的视觉概念描述：
- `PaperBackground` — 米色纸质背景
- `DrawPath` — SVG 路径描绘动画
- `DrawArrow` — 带箭头的因果连线
- `GrowBar` — 柱状图生长动画
- `CountUp` — 数字计数动画
- `SnapIcon` — 图标弹入
- `StackBuilder` — 分层堆叠展示
- `CameraPan` — 镜头推拉
- `ConceptHighlight` — 圆环高亮
- `StickFigure` — 火柴人角色

## 输入数据

以下是本次分析的核心洞见（来自 analysis.md 的 narrativeHooks）：

{{NARRATIVE_HOOKS}}

以及财务摘要数据：

{{FINANCIAL_SUMMARY}}

## 输出要求

严格输出 JSON 数组，不含 markdown 代码块包裹，8 个元素，每元素 4 个字段。
