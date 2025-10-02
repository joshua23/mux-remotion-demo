# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

这是一个 Mux + Remotion 演示项目，用于从 Mux 分析数据生成视频。该项目从 Mux Data API 获取视频观看指标，并使用 Remotion 将其渲染为动画视频序列。

## 前置要求

- **ffmpeg**：本地视频渲染所需。macOS 安装命令：`brew install ffmpeg`
- **Mux API 凭证**：复制 `.env.example` 为 `.env` 并添加你的 `MUX_TOKEN_ID` 和 `MUX_TOKEN_SECRET`

## 常用命令

```bash
# 在 Remotion Studio 中预览视频（交互式预览）
npm start

# 从 Mux API 获取数据并填充 src/data/ 目录
npm run hydrate

# 渲染视频到 out/video.mp4
npm run build

# 运行代码检查和类型检查
npm test

# 启动服务端渲染演示（在 localhost:8000 按需渲染）
npm run server

# 升级 Remotion 到最新版本
npm run upgrade
```

## 架构

### 视频合成结构

主视频合成在 `src/Video.tsx` 中定义，合成 ID 为 "Timeline"，共 1180 帧，30fps（1920x1080）。

时间轴在 `src/Timeline.tsx` 中以序列形式组织：
- 使用 Remotion 的 `<Series>` 组件按顺序链接片段
- 每个片段都有特定的 `durationInFrames` 控制其显示时长
- 视频结尾应用全局淡出效果
- 背景音频从 `src/static/audio.mp3` 导入

### 片段组织

各个视频片段位于 `src/clips/`：
1. `1-Intro.tsx` - 开场序列
2. `2-Overall.tsx` - 总体观看统计
3. `3-Devices.tsx` - 设备分类（手机/桌面/平板/电视）
4. `4-VideoTitles.tsx` - 按观看量排名的前 10 个视频标题
5. `5-States.tsx` - 美国各州地理分布
6. `6-Browsers.tsx` - 浏览器分类（Chrome/Safari/Firefox/Edge）
7. `7-Outro.tsx` - 结束序列

每个片段从 `src/data/*.json` 文件导入数据，并使用弹簧动画来动画化数值。

### 数据流

1. **数据获取**：`src/scripts/hydrate.ts` 从 Mux Data API 获取分析数据
   - 获取当月和上月数据用于趋势对比
   - 将 JSON 响应存储在 `src/data/` 目录
   - 使用 `date-fns` 进行时间范围计算
   - 渲染前必须先获取数据（先运行 `npm run hydrate`）

2. **数据文件**：在 `src/data/` 中生成（已添加到 gitignore）：
   - `overall.json` - 总观看量和观看时长
   - `views_by_title.json` - 按观看量排名的前 10 个视频
   - `views_by_device.json` - 按设备类型分类
   - `unique_viewers_by_us_state.json` - 美国各州地理数据
   - `unique_viewers_by_browser.json` - 浏览器统计
   - `playing_time_by_title.json` - 按视频标题的参与度

3. **渲染**：片段导入 JSON 数据并使用 Remotion 的弹簧物理动画

### 组件系统

- `src/components/Layout.tsx` - 共享布局，包含标题、时间范围显示和主体
- `src/components/Trend.tsx` - 显示趋势指示器，对比当前与之前周期
- `src/components/Measure.tsx` - 带数值的动画测量条
- `src/components/MapChart.tsx` - 使用 `react-simple-maps` 的美国州地图可视化
- `src/components/icons/` - 设备和趋势的图标组件

### 样式

- 使用 Tailwind CSS 配合 PostCSS 处理
- `tailwind.config.js` 中的自定义 Tailwind 配置定义了 Mux 品牌颜色和自定义字体大小
- 自定义字体：Akkurat（无衬线）、Akkurat Mono（等宽）
- `remotion.config.ts` 中的 Webpack 配置覆盖启用了 PostCSS/Tailwind 处理

### 服务端渲染

`server.tsx` 提供一个 Express 服务器：
- 按需打包 Remotion 项目
- 将帧渲染到临时目录
- 将帧拼接为 MP4
- 根据查询参数缓存已渲染的视频
- 在 `http://localhost:8000` 提供视频服务

## 开发工作流

1. 在 `.env` 中设置环境变量
2. 运行 `npm run hydrate` 获取最新的 Mux 数据
3. 运行 `npm start` 在 Remotion Studio 中预览
4. 如需要可在 `src/Timeline.tsx` 中调整片段时长
5. 运行 `npm run build` 渲染最终视频

## 关键配置

- 视频输出格式：JPEG 帧（在 `remotion.config.ts` 中设置）
- 默认启用覆盖输出
- 帧率：30fps
- 分辨率：1920x1080
- 总时长：约 39 秒（1180 帧 / 30fps）
