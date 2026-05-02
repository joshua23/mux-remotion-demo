---
description: 端到端 CSV 到 Ray Dalio 视频
argument-hint: <csv-path> [<topic-slug>]
---

把 $1 (CSV) 一条龙渲染成 mp4。可选 $2 作为输出前缀（默认为 "dalio-finance"）。

步骤（每步报告进度）：

1. **预处理** — 解析 CSV，生成聚合 JSON：
   ```
   npx tsx src/scripts/preprocess.ts "$1" "out/$2.json"
   ```
   报告：交易数、总支出、被动收益总额

2. **财务分析** — 调 `/analyze-finance out/$2.json`
   - 输出：`out/$2-analysis.json` + `out/$2-analysis.md`
   - 报告：健康度评分、资金闭合度、narrativeHooks 数量

3. **叙事生成** — 调 `/narrate out/$2-analysis.md`
   - 输出：`out/$2-outline.json`
   - 报告：卡片数量、每张卡标题

4. **TTS 合成** — 生成旁白音频：
   ```
   npx tsx src/scripts/tts.ts "out/$2-outline.json" "out/$2-audio"
   ```
   - 输出：`out/$2-audio/card_NN.mp3` + `manifest.json`
   - 报告：总时长估算

5. **Timeline 生成** — 构建 Remotion 时间轴：
   ```
   npx tsx src/scripts/build-timeline.ts "out/$2-outline.json" "out/$2-audio/manifest.json" "/audio" "src/dalio/Timeline.generated.tsx"
   ```
   - 报告：总帧数

6. **渲染** — 生成最终视频：
   ```
   npx remotion render src/index.tsx DalioFinanceVideo "out/$2.mp4"
   ```
   - 报告：输出文件路径和文件大小

7. **总结** — 打印完成消息，包含：
   - 输出文件路径
   - 视频时长（帧数 / 30 fps）
   - 关键指标摘要

注意事项：
- 若 $2 未提供，使用 "dalio-finance" 作为默认前缀
- 环境变量检查：需要 MINIMAX_API_KEY + MINIMAX_GROUP_ID（步骤 4 前检查）
- 每步完成后打印 ✓ 或 ✗ 状态
- 任意步骤失败时中止并打印错误，不继续后续步骤
