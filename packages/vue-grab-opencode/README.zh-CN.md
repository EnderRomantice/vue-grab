# Vue Grab Opencode 服务器

[English](./README.md) | [中文](./README.zh-CN.md)

本地服务器桥接器，连接 `vue-grab` 与 Opencode AI，实现直接从浏览器进行 AI 驱动的代码编辑。

## 🚀 快速开始

### 先决条件

**重要**：在使用此包之前，您必须使用 **Bun** 在系统上安装 [Opencode](https://opencode.ai)：

```bash
# 如果尚未安装 Bun，请先安装
curl -fsSL https://bun.sh/install | bash

# 使用 Bun 安装 Opencode
bun install @opencode-ai/sdk
```

> **注意**：Opencode **必须** 使用 Bun 安装。其他包管理器可能导致兼容性问题。

### 安装

您可以直接使用 `npx` 运行服务器，无需将其安装为依赖项：

```bash
npx @ender_romantice/vue-grab-opencode
```

或者将其安装为依赖项以便于集成：

```bash
npm install @ender_romantice/vue-grab-opencode
# 或
pnpm add @ender_romantice/vue-grab-opencode
# 或
yarn add @ender_romantice/vue-grab-opencode
```

### 基本使用

在终端中启动服务器：

```bash
# 使用 npx（推荐）
npx @ender_romantice/vue-grab-opencode

# 或如果已安装为依赖项
npx vue-grab-opencode
```

服务器默认在端口 **6569** 上启动。您可以使用 `PORT` 环境变量更改端口：

```bash
PORT=3000 npx @ender_romantice/vue-grab-opencode
```

预期输出：
```
Vue Grab 0.1.0 (Opencode)
- Local:    http://localhost:6569
```

### 与 vue-grab 集成

配置 `vue-grab` 使用 Opencode 代理：

```javascript
import { init } from '@ender_romantice/vue-grab'

init({
  agent: {
    type: "opencode",
    // 可选：指定模型（默认：Opencode 的默认模型）
    model: "provider/model-name",
    // 可选：自定义端点（默认：http://localhost:6569/api/code-edit）
    endpoint: "http://localhost:6569/api/code-edit"
  }
})
```

## 📖 API 文档

### 端点

#### `POST /api/code-edit`

从 `vue-grab` 接收 AI 代码编辑请求的主要端点。

**请求体：**
```json
{
  "prompt": "将按钮改为蓝色",
  "locator": {
    "tag": "button",
    "id": "submit-btn",
    "classList": ["btn", "primary"],
    "cssPath": "html > body > form > button#submit-btn.btn",
    "textSnippet": "提交",
    "vue": [
      { "name": "App", "file": "src/App.vue" },
      { "name": "Form", "file": "src/components/Form.vue" }
    ]
  },
  "htmlSnippet": "<button id=\"submit-btn\" class=\"btn primary\">提交</button>",
  "agentConfig": {
    "model": "provider/model-name"
  }
}
```

**响应：** 服务器发送事件（SSE）流，实时更新。

#### `POST /agent`

通用代理端点，用于自定义 AI 请求。

**请求体：**
```json
{
  "content": "您的上下文内容",
  "prompt": "您的提示",
  "options": {
    "model": "provider/model-name",
    "agent": "edit"
  }
}
```

**响应：** 服务器发送事件（SSE）流，实时更新。

#### `GET /health`

健康检查端点。

**响应：**
```json
{
  "status": "ok",
  "provider": "opencode"
}
```

## 🔧 高级使用

### 编程式使用

您可以以编程方式导入并启动服务器：

```javascript
import { startServer } from '@ender_romantice/vue-grab-opencode/server'

// 在默认端口（6569）上启动
await startServer()

// 或指定自定义端口
await startServer(3000)
```

### 与开发服务器同时运行

在您的 `package.json` 中添加脚本以同时运行开发服务器和 Opencode 服务器：

```json
{
  "scripts": {
    "dev": "vite",
    "dev:ai": "concurrently \"npm run dev\" \"npx @ender_romantice/vue-grab-opencode\""
  }
}
```

然后运行：
```bash
npm run dev:ai
```

## 🚨 故障排除

### "Failed to create session" 或 Opencode 连接错误

1. **确保使用 Bun 安装了 Opencode**：
   ```bash
   bun install @opencode-ai/sdk
   ```

2. **检查 Opencode 是否正在运行**：
   服务器会自动在端口 4096 上启动 Opencode。确保此端口可用。

3. **验证安装**：
   ```bash
   bunx @opencode-ai/cli --version
   ```

### 端口已被占用

如果端口 6569 已被占用，服务器会自动跳过启动。使用不同的端口：

```bash
PORT=3000 npx @ender_romantice/vue-grab-opencode
```

### AI 无响应

1. 检查服务器日志中的 Opencode 错误
2. 确保您有正确的 Opencode 配置和 API 访问权限
3. 验证模型名称是否正确（如果指定了）

## 📄 许可证

MIT