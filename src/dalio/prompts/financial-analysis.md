# 财务分析提示模板（12 维框架）

## 输入

你将收到一份 `AggregatedFinance` JSON 对象（由 `src/scripts/preprocess.ts` 生成），包含支付宝账单聚合数据。

## 分析任务

请对输入数据进行 12 个维度的深度分析，生成两份输出：

1. **`analysis.json`** — 结构化分析结果
2. **`analysis.md`** — 约 800 字中文叙事报告

---

## 12 维分析框架

### 维度 1：收支结构
- 总收入、总支出、净流出额
- 储蓄率 = (总收入 - 总支出) / 总收入，保留 2 位小数

### 维度 2：类目细分（含中国本土增强）
- 按类目列出支出占比
- 特别识别：余额宝/理财收益、12306/出行、亲情转账、同姓家庭节点
- 标注主力消费类目（占比 > 20%）

### 维度 3：月度变异 + 异常事件检测
- 月度支出均值、标准差
- z-score > 2 的月份标记为异常
- 为每个异常月份推测可能原因（大额单笔、节假日消费等）

### 维度 4：储蓄率（个人/业务可分离）
- 如能识别业务收支，分别计算个人储蓄率与业务储蓄率
- 对标：中国城镇居民平均储蓄率约 35%

### 维度 5：投资表现（被动收益年化推算）
- 被动收益（余额宝/理财）总额及日均
- 推算年化被动收益率（被动收益 / 估算本金）
- 估算本金 = 总收入 × 平均持仓比例（若无法确定则注明估算方法）

### 维度 6：现金流预测（12 个月）
- 基于当前月均支出/收入，预测未来 12 个月净流出
- 乐观/中性/悲观三种情景（±15%波动）

### 维度 7：集中度风险
- 前 5 大商户/对手方占总支出比例
- 前 3 大收入来源占总收入比例
- 是否存在单一来源 > 50% 的风险

### 维度 8：周期性识别
- 工资日（月初/月末 spike）
- 节假日消费（春节/十一/双十一）
- 定期扣款（月/季度）

### 维度 9：被动 vs 主动收入比例
- 被动收入 = 理财/余额宝收益
- 主动收入 = 工资/劳务
- 被动比例 = 被动 / (被动 + 主动)

### 维度 10：资金循环闭合度
- 闭合度 = 被动收益年化 / 总年化支出
- 1.0 = 完全闭合（被动收益可覆盖所有支出）
- 目标：闭合度趋势是否在改善

### 维度 11：异常交易标记
- 金额异常大的单笔交易（> 3σ）
- 时间异常的交易（深夜大额、非工作日批量）
- 可疑重复交易

### 维度 12：财务健康度评分（0-100）
7 维加权评分：
- 储蓄率（权重 25%）：>30% 满分，<10% 零分
- 收入稳定性（权重 20%）：CV < 0.2 满分
- 支出集中度（权重 15%）：无单类 > 40% 满分
- 被动收益率（权重 15%）：年化 > 5% 满分
- 资金闭合度（权重 10%）：> 0.5 满分
- 异常事件频率（权重 10%）：0 次异常满分
- 现金流预测（权重 5%）：正净流量满分

---

## 输出格式

### analysis.json 结构
```json
{
  "period": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD", "months": N },
  "incomeExpense": { "totalIncome": 0.00, "totalExpense": 0.00, "netOutflow": 0.00, "savingsRate": 0.00 },
  "categoryBreakdown": [{ "category": "...", "amount": 0.00, "pct": 0.00 }],
  "monthlyVariance": { "mean": 0.00, "stdDev": 0.00, "anomalousMonths": [] },
  "savingsRateDetail": { "personal": 0.00, "business": null },
  "investmentPerformance": { "passiveTotal": 0.00, "estimatedAnnualRate": 0.00 },
  "cashFlowForecast": { "monthly": [{ "month": "YYYY-MM", "optimistic": 0.00, "neutral": 0.00, "pessimistic": 0.00 }] },
  "concentrationRisk": { "topMerchants": [], "topIncomeSources": [] },
  "periodicity": { "salaryDay": null, "holidaySpikes": [], "recurringDebits": [] },
  "passiveActiveRatio": { "passive": 0.00, "active": 0.00, "passiveRatio": 0.00 },
  "fundLoopClosure": 0.00,
  "anomalousTransactions": [],
  "healthScore": { "total": 0, "breakdown": {} },
  "narrativeHooks": []
}
```

### narrativeHooks 要求
3-5 条 Dalio 风格"反转洞见"，格式：
```
"看似 [表象]，实则 [深层真相]"
```

示例：
- "看似花了十六万，实则被动收益悄悄还回来了九成"
- "看似支出稳定，实则三个月的异常消费掩盖了真实储蓄能力"

---

## 输出约束

- 所有金额保留人民币元 2 位小数
- 不编造数据——如某维度数据不足，注明"数据不足，无法计算"
- 全部中文输出
- 禁止口语词（不用"其实"、"感觉"、"好像"、"真的"等）
- narrativeHooks 必须是 Dalio "反转风"：先描述表象，再揭示机制或真相
- healthScore.total 范围 0-100，每维度说明扣分原因
