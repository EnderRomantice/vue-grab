# Vue Grab Opencode Server

[English](./README.md) | [中文](./README.zh-CN.md)

用于 `vue-grab` 与 Opencode AI 工具通信的 CLI 和服务器桥接器。

## 简介

此包提供了一个本地服务器，当使用 Opencode 代理集成时，`vue-grab` 会连接到该服务器。它充当桥梁，负责启动和管理 Opencode 进程。

## 使用

通常不需要将其作为项目依赖项安装。你可以直接使用 `npx` 运行它：

```bash
npx @ender_romantice/vue-grab-opencode
```

这将启动一个本地服务器（默认端口 6567），监听来自基于浏览器的 `vue-grab` 实例的请求。

## 特性

- **本地桥接**：代理从浏览器到本地 Opencode CLI 的请求。
- **SSE 流**：将 AI 响应实时流式传输回浏览器。
- **跨平台**：支持 Windows、macOS 和 Linux。

## 集成

有关客户端设置，请参阅 [`@ender_romantice/vue-grab`](https://www.npmjs.com/package/@ender_romantice/vue-grab)。

## 许可证

MIT
