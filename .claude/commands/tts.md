---
description: 用 MiniMax T2A v2 为 outline.json 生成旁白音频
argument-hint: <outline.json>
---

读取 `$ARGUMENTS`（outline.json 文件路径），自动推导输出目录，调用 TTS 脚本生成音频。

步骤：

1. 解析 `$ARGUMENTS` 路径，推导输出目录：
   - 例：`out/alipay-2024-outline.json` → 输出目录 `out/alipay-2024-audio`
2. 检查环境变量 `MINIMAX_API_KEY` 和 `MINIMAX_GROUP_ID` 是否已设置
   - 若未设置，提示用户：`security add-generic-password -U -a $USER -s MINIMAX_API_KEY -w <key>`
3. 运行：`npx tsx src/scripts/tts.ts $ARGUMENTS <outDir>`
4. 验证生成结果：
   - `<outDir>/manifest.json` 存在
   - manifest 中每个 card 都有 mp3 文件
   - 打印每张卡的时长估算
5. 打印总时长估算（所有 card durationMs 之和）

环境变量加载提示：
```bash
export MINIMAX_API_KEY=$(security find-generic-password -a $USER -s MINIMAX_API_KEY -w)
export MINIMAX_GROUP_ID=$(security find-generic-password -a $USER -s MINIMAX_GROUP_ID -w)
```
