# Vue Grab Opencode Server

[English](./README.md) | [中文](./README.zh-CN.md)

CLI and Server bridge for `vue-grab` to communicate with Opencode AI tools.

## Introduction

This package provides a local server that `vue-grab` connects to when using the Opencode agent integration. It acts as a bridge, spawning and managing the Opencode process.

## Usage

You generally don't need to install this as a dependency in your project. You can run it directly using `npx`:

```bash
npx @ender_romantice/vue-grab-opencode
```

This will start a local server (default port 6567) that listens for requests from your browser-based `vue-grab` instance.

## Features

- **Local Bridge**: Proxies requests from the browser to the local Opencode CLI.
- **SSE Streaming**: Streams AI responses back to the browser in real-time.
- **Cross-Platform**: Supports Windows, macOS, and Linux.

## Integration

See [`@ender_romantice/vue-grab`](https://www.npmjs.com/package/@ender_romantice/vue-grab) for client-side setup.

## License

MIT
