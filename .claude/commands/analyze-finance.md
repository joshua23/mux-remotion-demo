---
description: 对支付宝聚合 JSON 进行 12 维财务分析，输出 analysis.json + analysis.md
argument-hint: <aggregated.json>
---

读取 $ARGUMENTS（支付宝聚合 JSON 文件路径）和 `src/dalio/prompts/financial-analysis.md` 中的分析框架提示。

步骤：

1. 读取并解析 `$ARGUMENTS` 文件（AggregatedFinance JSON）
2. 读取 `src/dalio/prompts/financial-analysis.md` 作为分析框架
3. 在 context 中按 12 个维度完整分析数据，推理过程要详细
4. 推导输出文件路径：
   - 将 `$ARGUMENTS` 路径去掉 `.json` 后缀，加 `-analysis.json` → 结构化输出
   - 加 `-analysis.md` → 叙事报告输出
5. 将结构化分析写入 `-analysis.json`（符合 analysis.json 结构规范）
6. 将约 800 字中文叙事报告写入 `-analysis.md`（含 3-5 条 Dalio 反转钩子）
7. 打印摘要：健康度评分 + 资金循环闭合度 + narrativeHooks 数量

输出文件命名示例：
- 输入: `out/alipay-2024.json`
- 输出: `out/alipay-2024-analysis.json` + `out/alipay-2024-analysis.md`
