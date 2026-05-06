# C-Recraft 分层纸偶动画 · 设计文档

**日期**：2026-05-05
**作者**：Joshua + Claude
**状态**：已批准，进入实施计划阶段
**前置文档**：[2026-05-02-gamma-dalio-pipeline-design.md](./2026-05-02-gamma-dalio-pipeline-design.md)

---

## 1. 背景与问题

当前 `out/dalio-story.mp4` (54 MB, 33s) 视觉上呈"PPT 感"。诊断（详见会话记录）：

- 现有 15 张人物 SVG 来自 AI 生图 → VTracer 矢量化，平均 4500 条无语义 path
- `KeyPoseImage` 组件只对整张图施加极轻微 idle 动效（呼吸 ±0.5%、摇摆 ±0.5°）
- 角色无入场/出场动画、无身体部位独立运动、无道具运动、无镜头语言

预期视觉参考：Bridgewater《How the Economic Machine Works》风格的分层纸偶动画。

## 2. 关键发现（Spike 验证）

通过 Gamma MCP + `recraft-v4-svg` 模型生成 Joshua 测试图：

- 路径数从 4554 → **258**（17× 减少）
- 文件体积从 7.1 MB → **103 KB**（70× 减少）
- 几何质量：每条 path 是真正的 bezier 轮廓（一只胳膊就是一个 path），不是 VTracer 的微小描边碎块
- 视觉风格：干净 flat-vector 简笔画，更贴近 Principles 美学
- 无 `<g>` 分组：仍需手工切层
- 19 个 fill color 提供天然颜色簇起点，但同色身体部位（白衬衫=躯干+双臂）需要在颜色簇内按 bbox 二次切

**结论**：Recraft V4 SVG 把"切层"成本从 30–60 min/张（VTracer 的 lasso 重画）降到 **20–30 min/张**（在干净几何形上做 6–8 部位精细分组）。

## 3. 设计目标

1. **真分层**：每个角色拆成 head / face / torso / L-arm / R-arm / L-leg / R-leg（+ 道具）独立 SVG group
2. **真运动**：每部位有独立 transform timeline，能做转头/挥手/跷腿等真动作
3. **真节奏**：章节级镜头语言（push-in / pan / parallax）+ 入场出场过渡
4. **可迭代**：先打通 Ch1 端到端 prototype，验证后扩到全片
5. **可复用**：动画 DSL 让后续新章/新动作只改数据不改代码

## 4. 架构总览

```
[Gamma MCP] → recraft-v4-svg → 原始 SVG (flat, 258 paths)
     │
     ▼
[手工分层] → Inkscape lasso → 标注 <g id="head"> / <g id="torso"> / ... → 分层 SVG
     │
     ▼
[LayeredCharacter 组件]
     │  ├─ 解析 SVG，按 group id 抽出每个部位
     │  ├─ 每部位接受 PartTimeline（rotate/translate/scale + easing 关键帧）
     │  └─ 渲染时合成回完整人物，每部位独立 transform
     │
     ▼
[ChapterSceneV2 组件]
     │  ├─ 接收 cast: LayeredCharacterDef[]（替代当前 KeyPoseCast）
     │  ├─ 章节级镜头：camera push-in / pan / parallax 背景
     │  ├─ 章节级文字动画：CountUp / 逐字浮现 / 关键词高亮
     │  └─ 入场/出场过渡：滑入、缩放、淡入
     │
     ▼
[Remotion 渲染] → MP4
```

## 5. 数据结构

### 5.1 分层 SVG 约定

每个分层后的 SVG 必须包含以下 group id（缺失部位允许，但 group id 必须从这个白名单选）：

```
head        — 头部（含头发、面部）
face        — 五官细节（眼/鼻/口/眼镜），可选独立于 head 以便单独做眨眼/转向
torso       — 躯干（衣服主体，不含胳膊）
L-arm       — 左上臂 + 左前臂 + 左手（角色视角的左）
R-arm       — 右上臂 + 右前臂 + 右手
L-leg       — 左大腿 + 左小腿 + 左脚
R-leg       — 右大腿 + 右小腿 + 右脚
prop-1      — 主道具（笔/手机/红包/账本）
prop-2      — 次道具（如桌子、椅子等场景物）
bg          — 背景纯色块（可丢弃）
```

每个 `<g>` 还需添加 `data-pivot-x` / `data-pivot-y` 属性记录该部位的旋转锚点（在 SVG 局部坐标）：
- head: 颈根
- arms: 肩关节
- legs: 髋关节
- props: 与持有手的接触点

### 5.2 动画 DSL（PartTimeline）

```ts
type Easing = 'linear' | 'in' | 'out' | 'inOut' | 'bezier(...)';

interface Keyframe {
  at: number;          // 帧（chapter local frame）
  rotate?: number;     // 度
  tx?: number;         // x 平移（SVG 像素）
  ty?: number;         // y 平移
  scale?: number;
  opacity?: number;
  easing?: Easing;     // 到下一关键帧的缓动
}

interface PartTimeline {
  partId: 'head' | 'face' | 'torso' | 'L-arm' | 'R-arm' | 'L-leg' | 'R-leg' | 'prop-1' | 'prop-2';
  pivotMode?: 'group-attr' | 'center' | { x: number; y: number };
  keyframes: Keyframe[];
}

interface LayeredCharacterDef {
  src: string;                  // 分层 SVG 路径
  imgWidth: number;
  imgHeight: number;
  xPercent: number;             // 与现有 cast 系统兼容
  yPercent: number;
  heightFraction: number;
  label?: string;
  accentColor?: string;
  parts: PartTimeline[];        // 每部位的独立动画
  enter?: 'slideLeft' | 'slideRight' | 'fadeUp' | 'scaleIn' | 'none';
  exit?: 'slideLeft' | 'slideRight' | 'fadeOut' | 'scaleOut' | 'none';
}
```

### 5.3 章节镜头 DSL

```ts
interface CameraMove {
  at: number;
  zoom?: number;            // 1.0 = 默认
  panX?: number;            // 像素，相对画面中心
  panY?: number;
  easing?: Easing;
}

interface ChapterV2 extends Chapter {
  // 沿用现有 Chapter 的 id/title/insight/narration/durationFrames
  cast: LayeredCharacterDef[];   // 替换当前 ReadonlyArray<CastMember>
  camera?: CameraMove[];          // 镜头关键帧
  textAnimation?: 'fadeIn' | 'typewriter' | 'wordByWord';
}
```

## 6. 组件设计

### 6.1 `LayeredCharacter`（新）

替代 `KeyPoseImage`。职责：
- 加载分层 SVG 一次（用 `delayRender` + fetch parse）
- 把每个 `<g id="...">` 渲染为独立 `<g>` + `transform`
- 每帧根据 `parts` 中的 timeline 计算每部位的 transform
- 处理 enter/exit 过渡

不使用 paper.js／LBS — 仅 SVG transform，零运行时蒙皮成本。

### 6.2 `ChapterSceneV2`（迭代）

在现 `ChapterScene` 基础上：
- 用 `LayeredCharacter` 替代 `KeyPoseImage`/`PosePerson`
- 增加 `<CameraStage>` 包裹层，施加 zoom/pan transform
- 文字层支持新动画类型

### 6.3 `<CameraStage>`（新组件）

```tsx
<CameraStage moves={chapter.camera}>
  {children}  // 全部演员 + 道具 + 背景
</CameraStage>
```

实现：根据 `useCurrentFrame()` 在 `moves` 之间插值 zoom/panX/panY，输出 `transform: scale() translate()`。

## 7. 数据流

```
chapters.ts (新增 ch1-v2 export)
   │
   │  CH1_V2: ChapterV2 = {
   │    ...CH1,
   │    cast: [{
   │      src: 'keypose-v2/joshua-desk-lean.svg',
   │      parts: [
   │        { partId: 'head', keyframes: [...] },
   │        { partId: 'R-arm', keyframes: [...] },
   │        ...
   │      ],
   │      enter: 'fadeUp',
   │    }],
   │    camera: [{at: 0, zoom: 1.0}, {at: 60, zoom: 1.05}],
   │  }
   │
   ▼
DalioStoryTimeline.tsx → ChapterSceneV2(chapter=CH1_V2)
   │
   ▼
ChapterSceneV2 → CameraStage → LayeredCharacter[]
   │
   ▼
LayeredCharacter → SVG <g> per part with transform
```

## 8. 错误处理

| 失败模式 | 检测 | 处理 |
|---|---|---|
| SVG 缺少声明的 group id | 加载时检查 | warn 到 console，跳过该部位（其他部位仍动） |
| pivot 属性缺失 | 解析时检查 | fallback 到该 group 的 bbox 中心 |
| Recraft 生成失败 / Gamma quota 用完 | Gamma MCP error | 留空素材，prompt 用户重生成 |
| 关键帧时间超出 chapter durationFrames | 构建时验证 | 测试用例覆盖（见 §10） |

不做的事（YAGNI）：
- 不做 LBS 骨骼蒙皮（pose-animator 路径明确放弃）
- 不做物理引擎（无碰撞、无重力）
- 不做 Lottie 兼容层
- 不自动从 raster 切层（专注 Recraft V4 SVG 路径）

## 9. 增量路径

**Phase 0 — Spike 完成（已完成 ✅）**
- 已验证 Recraft V4 SVG 通过 Gamma MCP 可访问
- 已生成 1 张 Joshua 测试图：`tmp/spike/joshua-recraft-v4.svg` (103 KB, 258 paths)
- 已确认视觉风格、路径质量、文件体积优于 VTracer

**Phase 1 — 分层工具与 Ch1 prototype（核心目标）**
1. 把 spike SVG 在 Inkscape 中手工分层到 7–8 个语义 group（head/face/torso/L-arm/R-arm/L-leg/R-leg/prop-1）
2. 写 `LayeredCharacter` + `CameraStage` 组件
3. 在 `chapters.ts` 中新建 `CH1_V2`，定义 Joshua 7 部位的关键帧动画
4. 渲染 Ch1 的 240 帧 prototype MP4，与现 Ch1 对比

**Phase 2 — 全片素材生成 + 标注**
- 用 Gamma 重新生成 ch2–ch8 所需 14 张人物姿态 SVG
- 每张手工分层（~20 min × 14 = ~5 hr）

**Phase 3 — 全章节迁移**
- 把 ch2–ch8 的 cast 数据迁移到 `LayeredCharacterDef`
- 给每章设计 PartTimeline + CameraMove 关键帧
- 全片渲染

**Phase 4 — 打磨**
- 章节切换交叉淡化
- 文字动画（CountUp / typewriter）
- 旁白同步微调

## 10. 测试策略

| 类型 | 范围 |
|---|---|
| 单元（vitest） | `LayeredCharacter` 关键帧插值正确性、pivot 计算、enter/exit 过渡边界帧 |
| 单元 | `CameraStage` zoom/pan 插值 |
| Schema 验证 | 加载 SVG 时检查必需 group id 在白名单内 |
| 视觉回归 | Ch1 v1 vs v2 渲染前几帧对比（人工） |
| 完整渲染 | `npm run build` 跑通 Ch1-only 合成，无 NaN/警告 |

## 11. 风险与对冲

| 风险 | 缓解 |
|---|---|
| Recraft 生成的姿势不一致（每张图比例/风格漂移） | 用 `styleReferenceImages` 把第一张作为参考；prompt 模板化 |
| 分层标注耗时超预期（>30 min/张） | Phase 1 实测 1 张，超时立即调整粒度（降到 4 组语义） |
| 关键帧 DSL 表达力不足 | Phase 1 prototype 时按需扩展，不预先设计 |
| 旁白 mp3 时长锁死，新动画节奏对不上 | 章节时长不变，动画在现有 durationFrames 内适配 |
| 视觉效果未达预期 | Ch1 prototype 即决策点，未达预期回退 C2/C3 路线 |

## 12. 不在本次范围内

- 旁白重生成（旁白 mp3 保持现状）
- 字体替换、品牌色调整
- 服务端实时渲染（仍走 `npm run build` 离线渲染）
- 多语种支持
- ch2–ch8 的具体动画设计（Phase 3 时分别设计）

---

## 附：术语表

- **分层 SVG**：包含 `<g id="...">` 语义分组的 SVG，每组对应一个身体部位或道具
- **PartTimeline**：单个身体部位的关键帧动画时间轴
- **pivot**：旋转锚点，决定该部位绕哪个点旋转
- **CameraStage**：模拟摄像机推拉摇移的容器组件
- **enter/exit**：角色进入/离开画面的过渡动画类型
