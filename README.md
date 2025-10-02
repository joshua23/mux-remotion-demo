# mux-remotion-demo

本代码仓库演示如何使用 Mux Data 和 Remotion 创建视频。

请确保设置你的 Mux 访问令牌和密钥！

复制 `.env.example` 文件为新文件 `.env` 并在其中添加你的密钥。

你还需要安装 ffmpeg 以在本地渲染视频。在 macOS 上可以通过 homebrew 运行 `brew install ffmpeg` 来安装。这将需要几分钟下载和安装，现在是查看邮件或绕街区走几圈的好时机。

本演示使用 `date-fns` 来帮助轻松计算我们想要提取统计数据的时间范围。

### 注意事项

- 在 `Timeline` 中的 `Sequence` 组件上设置 `durationInFrames` 属性可以指定每个组件应显示多长时间。

## 命令

**启动预览**

```console
npm start
```

**渲染视频**

```console
npm run build
```

**服务端渲染演示**

```console
npm run server
```

服务端渲染文档请参阅 [这里](https://www.remotion.dev/docs/ssr)。

**升级 Remotion**

```console
npm run upgrade
```

## 文档

通过阅读 [基础页面](https://www.remotion.dev/docs/the-fundamentals) 开始使用 Remotion。

## 帮助

Remotion 在 [我们的 Discord 服务器](https://discord.gg/6VzzNDwUwV) 上提供帮助。

## 问题

发现 Remotion 的问题？[在这里提交问题](https://github.com/remotion-dev/remotion/issues/new)。

## 许可证

请注意，某些实体需要公司许可证。请阅读 [此处的条款](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)。
