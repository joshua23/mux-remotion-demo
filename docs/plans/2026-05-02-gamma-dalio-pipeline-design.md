# Gamma → Dalio 风格视频管线 · 设计文档

**日期**: 2026-05-02
**状态**: 已批准（设计阶段完成，待 writing-plans 出实现计划）
**作者**: Claude Code 协作 with @joshuaspc
**brainstorm 周期**: 1 次会话，3 个并行调研 agent

## 1. 目标

把任意结构化数据（首发：支付宝账单 CSV）转换为 Ray Dalio《How the Economic Machine Works》风格的中文动画解说短片，全程由 Claude Code 编排，本地小团队使用，无需自建 UI/队列/计费。

**首支视频验证素材**: `/Users/joshuaspc/Documents/10-19 公司行政/15 财务/银行流水/支付宝财务摘要 原始数据.csv`（1,835 笔交易，2023-09 至 2024-08）。

## 2. 范围决策

| 项 | 决策 |
|---|---|
| 用户对象 | 个人/内部小团队（**非** B2B/B2C SaaS）|
| 编排前端 | Claude Code 对话框，无自建 UI |
| 部署模型 | 本地 Mac，命令行 + Remotion Studio |
| 多租户/计费/队列 | 不做 |
| 视频规格 | 1920×1080 / 30fps / MP4（沿用 mux-remotion-demo 配置）|
| 数据隐私 | 用户接受财务数据走 Gamma 云，但管线本身预留聚合/匿名化能力 |

## 3. 架构（5 步管线 + 1 个分析子层）

```
CSV/JSON  ─┐
           ▼
[1] 本地预处理 (Python + iconv 兜底)
           ▼
[1.5] Claude 财务分析层 (12 维框架，借鉴 googlarz/finance-assistant)
           │
           ├─ analysis_report.json  ← Gamma 输入
           └─ analysis_report.md    ← 人审用
           ▼
[2] Gamma MCP generate (creme/wireframe 主题, 16x9, zh-cn,
                        textMode=preserve, noImages 或 lineArt)
       ↓
    read_gamma → outline.json (per-card title/body/visual_concept/narration)
           ▼
[3] MiniMax T2A v2 旁白合成 (复用 sister 项目 generate-audio.js)
       ↓
    audio/scene_NN.mp3 + manifest.json (含字级时间戳)
           ▼
[4] Remotion 装配
    ├─ 13 个 Dalio 组件原语 (自建)
    ├─ 7 种场景 archetype (组件组合)
    ├─ 1 个移植组件 (TitleSpotlight, 改自 vibe-motion-skills)
    └─ Timeline 生成器 (outline.json + manifest.json → JSX)
           ▼
[5] npm run build → out/<topic>.mp4
```

## 4. Gamma 角色（已重新定位）

**Gamma 在管线里只做**：
- 中文叙事大纲生成（Ray Dalio 弧：抛问题 → 拆机制 → 数据揭示 → 综合洞见）
- 旁白文案润色
- 视觉概念建议（仅作为我们 Remotion 组件设计参考，**Gamma PNG 不进入最终视频**）

**Gamma 不做**：
- 视觉渲染（导出格式不保留动画，PNG 静帧不符合 Dalio 矢量审美）
- SVG 提供（Recraft-SVG 内部生成但不暴露文件）
- 视频/Lottie 输出（不存在）

**已实测**：92 credits 生成 8 卡 deck，质量评估 9/10（详见 `docs/plans/spike-results/`，留待 writing-plans 阶段记录）。Gamma Pro 池剩 7,908 credits，可支持 ~80 支带图视频。

## 5. Ray Dalio 视觉规格（锁定）

| 项 | 值 | 来源 |
|---|---|---|
| 背景色 | `#F2EBD8`（米黄纸） | Agent C 反查 Visual Capitalist 截图 |
| 墨色 | `#2A2520`（暖黑棕） | 同上 |
| 强调色 | 红 `#D9533A` · 黄 `#D6A93B` · 青 `#5A8C7B` · 蓝 `#3E5C7A` | 同上 |
| 标题字体 | Hoefler Text/Titling（无版权时用 Source Serif Pro 或 Gelasio 替代） | Motionographer 工作室 credits |
| 正文字体 | Humanist sans（如 Inter） | 同上 |
| 线宽 | 2-3px @1080p（**无抖动**，平滑 Bézier） | 关键反直觉：Dalio 不是白板手绘风 |
| 留白比例 | 70% | Agent C |
| 旁白节奏 | 150-160 WPM | Agent C |
| 元素留屏 | 平均 2.5-4 秒 | Agent C |
| 场景换镜 | 平均 10-18 秒 | Agent C |
| 动画落点 | 对齐旁白重音节（pre-roll 3-5 帧） | Agent C |

## 6. Dalio 组件原语（13 个，自建）

| 组件 | 作用 | LOC 估 |
|---|---|---|
| `<PaperBackground />` | 米色 + 纸纹噪点 | 30 |
| `<SceneCard title timeRange>` | 标准化 70% 留白 + Hoefler 标题 | 60 |
| `<DrawPath d strokeColor>` | SVG 路径 stroke-dasharray 揭示 | 80 |
| `<DrawArrow path>` | DrawPath + 终点箭头旋转 | 100 |
| `<SnapIcon delay>` | 弹簧 0.85→1 缩放 + 淡入 | 40 |
| `<CountUp from to format>` | 数字插值 + tabular-nums | 50 |
| `<GrowBar valueFrom valueTo>` | 柱图弹簧高度 | 60 |
| `<StackBuilder items stagger>` | 物品逐个叠入 | 70 |
| `<StickFigure pose>` | 火柴人（站/走/挥手） | 120 |
| `<CameraPan from to>` | 相机平移/缩放包裹 | 50 |
| `<ConceptHighlight target>` | 圆环画出包围 | 60 |
| `<TitleSpotlight />` | **移植自 vibe-motion-skills** 聚光灯反射 | 40 |
| `<NarrationCue srt>` | 读 SRT，emit `<Sequence>` 节拍 | 80 |
| **合计** | — | **~840 LOC** |

## 7. 场景 archetype（7 种，组件组合）

1. **ConceptReveal** — 中央 SnapIcon + Hoefler 标题
2. **CauseEffect** — 节点 → DrawArrow → 节点链
3. **Comparison** — 双 GrowBar + DrawPath 等号
4. **Cycle** — 中央节点 + 4 个 DrawArrow 环绕
5. **TimeSeries** — 轴 DrawPath + GrowBar × N + ConceptHighlight 标记异常点
6. **Hierarchy** — 顶节点 + 扇形展开 + DrawPath 连线
7. **MacroMicroZoom** — 全景 → CameraPan 推进 → 切换图层

## 8. 财务分析层（12 维框架，Claude 直做）

输入：CSV 聚合 JSON
输出：`analysis_report.json` + `analysis_report.md`

12 个维度：
1. 收支结构（总额、净额、储蓄率）
2. 类目细分（**含中国本土增强**：识别同姓家庭节点、亲情转账、余额宝、12306 等）
3. 月度变异 + 异常事件检测
4. 储蓄率（个人/业务可分离）
5. 投资表现（**强化**：被动收益年化推算）
6. 现金流预测（按当前模式推 12 个月）
7. 集中度风险（前 N 商户/对手方占比）
8. 周期性识别（节假日/工资日 spike）
9. 被动 vs 主动收入比例
10. 资金循环闭合度（被动收益 ÷ 总支出）
11. 异常交易标记
12. 财务健康度评分（0-100，7 维加权）

借鉴自：[googlarz/finance-assistant](https://github.com/googlarz/finance-assistant) 的 12 模式框架，但用 Claude 在 context 里直接做，不安装外部 skill（避免 EU locale 改造成本）。

## 9. TTS（MiniMax T2A v2）

- 直接复用 sister 项目 `~/Documents/工作台/Remotion-Learning/播客故事/generate-audio.js`（233 行 ESM JS）
- API: `POST https://api.minimax.chat/v1/t2a_v2`
- 凭据: `MINIMAX_API_KEY` + `MINIMAX_GROUP_ID`（已存在于 sister 项目 .env，待迁移到 keychain）
- 输出: `out/audio/scene_NN.mp3` + `manifest.json`（含每段时长，供 Timeline 生成器对齐）

## 10. 项目放置

**决策**：在 `mux-remotion-demo` 内新增子模块，**不开新仓**。

理由：
- mux-remotion-demo 已有 Remotion 4.0.355 + TS + Tailwind 配置
- "MG动画" 项目根目录的语义就是动画工坊，新管线属于扩展
- 后续可考虑抽出，先验证再说

新增目录结构（writing-plans 阶段细化）：
```
src/
├── clips/                  ← 现有（Mux 视频）
├── dalio/                  ← 🆕 新管线
│   ├── components/         ← 13 个 Dalio 原语
│   ├── archetypes/         ← 7 种场景模板
│   ├── Timeline.tsx        ← 由 outline.json 自动生成
│   └── compositions/       ← 各支视频的 Composition
└── scripts/
    ├── analyze.py          ← 🆕 Step 1.5 财务分析（用 Claude 也行，看实现）
    ├── gamma-generate.ts   ← 🆕 Step 2 调 MCP 或 REST
    ├── tts.ts              ← 🆕 Step 3 (复用 generate-audio.js)
    └── build-timeline.ts   ← 🆕 outline+manifest → Timeline.tsx
docs/plans/                 ← 🆕（本文件）
out/<topic>/                ← 🆕 中间产物 + 最终 mp4
```

## 11. 错误处理 & 测试策略

错误处理（出现即记录，不静默失败）：
- CSV 解码：先尝试 UTF-8，失败再尝试 GB18030（已写好兜底）
- Gamma 生成失败：记录 generationId、credits 余额、错误码；不重试
- MiniMax TTS 失败：单段失败重试 1 次（速率限制可能），仍失败则中止整个流程
- Remotion 渲染失败：透传 ffmpeg 错误，不吞

测试策略：
- 每个 Dalio 组件原语：1 个 Storybook-style 单帧 + 1 个动画段测试（手眼验证）
- 集成测试：跑一遍完整流水，比对 `out/audio/manifest.json` 时长与 outline.json 卡数
- 不做单元测试覆盖率指标——这是创意管线，回归测试用"渲染产物 diff" 比代码测试更有意义

## 12. 已知风险 & 开放问题

| 风险/问题 | 影响 | 缓解 |
|---|---|---|
| Hoefler 字体收费 | 视觉不能 100% 复刻 | 备选 Source Serif Pro / Gelasio（Gamma 已用 Gelasio，效果佳） |
| MiniMax 中文 TTS 调性是否够 Dalio 风 | 旁白质感 | 实现时跑 voice 试听，必要时调 emotion/speed 参数 |
| Gamma 偶尔煽情（非 Dalio 极简） | 旁白调性偏离 | 在 prompt 里加更严格的"禁止口语词"白名单 |
| 异常数据（如 0 笔交易/全月零支出） | Pipeline 崩 | Step 1.5 加 sanity check，必要时 fail fast 而非生成废视频 |
| Custom Dalio PPTX 主题未上传 | 视觉风险（备选用 creme） | 长远做：设计师输出一份 dalio-template.pptx 上传 Gamma |

## 13. 不做的（YAGNI）

- ❌ 自建 Web UI（Claude Code 就是 UI）
- ❌ 多租户/计费追踪（Pro 池足够）
- ❌ 队列/Worker（单进程，本地）
- ❌ Gamma PNG 嵌入（不符合 Dalio 矢量审美）
- ❌ 全部 8 个 vibe-motion-skills（仅移植 1 个 TitleSpotlight）
- ❌ 单元测试覆盖率（创意工程不需要）
- ❌ 数据库（中间产物落 JSON 文件即可）
- ❌ 实时预览/直播渲染（Remotion Studio 已够）

## 14. 下一步

1. 调用 `superpowers:writing-plans` skill，把本设计转成可执行的 implementation plan
2. plan 中按依赖顺序排出：Step 1 → 1.5 → 2 → 3 → 4a (组件原语) → 4b (archetypes) → 4c (Timeline 生成器) → 5
3. 每步出 verification 准则
4. 然后才进入 implementation（用 `superpowers:executing-plans` 或 `subagent-driven-development`）

## 附录：调研来源

- Agent A: Gamma 2026 能力详尽挖掘（导出/动画/主题/图像/价格）
- Agent B: vibe-motion-skills 仓库帧级技术分析（8 skills 个个拆解）
- Agent C: Ray Dalio 视觉技术拆解（Jonathan Jarvis 起源、Hoefler 字体、16 种动画原语）
- Spike: Gamma 实测生成 8 卡中文 deck（generationId `ba9pUK0XBPfATBSMoBFxw`，creme 主题，92 credits）
