---
description: 用 Gamma 生成叙事大纲，解析为 outline.json
argument-hint: <analysis.md>
---

读取 `$ARGUMENTS`（财务分析 .md 文件）和 `src/dalio/prompts/gamma-narrative.md` 生成叙事大纲。

步骤：

1. 读取 `$ARGUMENTS`（analysis.md），提取 narrativeHooks 和财务摘要
2. 读取 `src/dalio/prompts/gamma-narrative.md`，将 `{{NARRATIVE_HOOKS}}` 和 `{{FINANCIAL_SUMMARY}}` 替换为实际内容
3. 调用 `mcp__claude_ai_Gamma__generate`，参数：
   - `numCards`: 8
   - `themeId`: "creme"
   - `dimensions`: "16x9"
   - `language`: "zh-cn"
   - `tone`: "calm instructional documentary Ray Dalio style"
   - `noImages`: true
   - `textMode`: "preserve"
   - prompt: 拼好的完整提示
4. 获取 `generationId`，每 30 秒轮询状态，直到完成
5. 调用 `mcp__claude_ai_Gamma__read_gamma` 获取生成的 HTML 内容
6. 将 HTML 存储到临时文件 `/tmp/gamma-output.html`
7. 运行 `npx tsx src/scripts/parse-gamma.ts /tmp/gamma-output.html <outline.json>`
   - outline.json 路径：将 $ARGUMENTS 中的 `-analysis.md` 替换为 `-outline.json`
   - 例：`out/alipay-2024-analysis.md` → `out/alipay-2024-outline.json`
8. 打印摘要：卡片数量、每张卡标题

注意：
- 如果 Gamma 生成失败，记录 generationId 和错误码，不重试，打印错误后退出
- 解析后验证每张卡都有 title（非空）且 narration > 20 字
