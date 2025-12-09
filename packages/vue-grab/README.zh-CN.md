# Vue Grab

> 语言：[English](README.md) | 简体中文 | [繁体中文](README.zh-TW.md)

<img src="./public/vue-grab.svg" width="400" height="400" alt="Vue Grab Logo">

一个 Vue 3 工具库，让你可以轻松抓取页面上的任何元素，并将其 HTML 片段和 Vue 组件栈信息复制到剪贴板，方便在 AI 工具中使用。

## 功能特性

- **简单易用**：按住 `Ctrl+C`（macOS: `⌘+C`），移动鼠标到目标元素上（会出现高亮框），点击即可抓取
- **智能复制**：自动复制元素的 HTML 片段和 Vue 组件栈信息
- **样式隔离**：覆盖层使用 Shadow DOM，不影响页面原有样式
- **组件追踪**：自动解析并显示 Vue 组件层级关系
- **可配置**：可自定义高亮颜色、标签文字、元素过滤等设置
- **AI 集成**：支持 Opencode 进行 AI 驱动的代码编辑

## 快速开始

### 安装

#### 方式一：CDN
```html
<script src="https://unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

#### 方式二：NPM
```bash
npm install @ender_romantice/vue-grab
# 或
pnpm add @ender_romantice/vue-grab
# 或
yarn add @ender_romantice/vue-grab
```

### 基本使用

```javascript
import { init } from '@ender_romantice/vue-grab'

// 使用默认设置初始化
init()
```

### 使用方法
- **方式 A**：按住 `Ctrl+C`（macOS: `⌘+C`），移动鼠标到目标元素上（会出现高亮框），点击即可抓取
- **方式 B**：按住 `Ctrl`（macOS: `⌘`），快速点按 `C`，然后在 800ms 内移动鼠标并点击目标元素

## 配置

```javascript
import { init } from '@ender_romantice/vue-grab'

init({
  enabled: true,
  hotkey: 'c', // 或 ['c', 'v'] 支持多个快捷键
  keyHoldDuration: 500, // 按键持续时间（毫秒）
  
  // UI 配置
  highlightColor: '#2563EB', // 边框 + 标签背景色
  labelTextColor: '#ffffff', // 标签文字颜色
  showTagHint: true,         // 是否显示悬浮标签
  includeLocatorTag: true,   // 是否包含 <vue_grab_locator> 段
  
  // 元素过滤
  filter: {
    ignoreSelectors: ['.nav', 'header'], // 需要忽略的选择器
    ignoreTags: ['svg'],                  // 需要忽略的标签名
    skipCommonComponents: true,           // 跳过 header/nav/footer/aside
  },
  
  // AI 集成（可选）
  agent: {
    type: "opencode",
    provider: "deepseek",     // 服务提供商 ID
    model: "deepseek/deepseek-reasoner", // 模型名称
    apiKey: "your-api-key"    // 您的 API 密钥
  },
  
  // 自定义处理器（可选）
  adapter: {
    open: (text) => {
      console.log('抓取的内容:', text)
    }
  }
})
```

### 配置项说明

- `highlightColor`: string - 高亮主色（用于选择框边框与标签背景）
- `labelTextColor`: string - 标签文字颜色
- `showTagHint`: boolean - 是否显示悬浮的标签提示
- `includeLocatorTag`: boolean - 是否包含 `<vue_grab_locator>` 段（设为 false 时仅保留 `<referenced_element>`）
- `filter.ignoreSelectors`: string[] - 需要忽略的 CSS 选择器
- `filter.ignoreTags`: string[] - 需要忽略的标签名（如 `['svg', 'canvas']`）
- `filter.skipCommonComponents`: boolean - 是否跳过常见布局元素：`header`、`nav`、`footer`、`aside`
- `agent.type`: string - AI 代理类型（目前仅支持 "opencode"）
- `agent.provider`: string - 服务提供商 ID（例如 "deepseek"、"anthropic"）
- `agent.model`: string - 模型名称
- `agent.apiKey`: string - 您的 AI 服务 API 密钥

## AI 集成设置

要启用 Opencode AI 代码编辑功能：

1. **安装后端服务**：
```bash
npm install @ender_romantice/vue-grab-opencode --save-dev
```

2. **配置 package.json**，在启动开发服务器时同时运行 AI 后端服务：
```json
{
  "scripts": {
    "dev": "vite",
    "dev:ai": "concurrently \"npm run dev\" \"npx @ender_romantice/vue-grab-opencode\""
  }
}
```

3. **在 `init()` 中配置代理**（参见上方的配置部分）。

## 复制内容格式

抓取的元素信息会以以下格式复制到剪贴板：

```
<vue_grab_locator>
{
  "tag": "div",
  "id": "example",
  "classList": ["card", "highlight"],
  "cssPath": "html > body > div#example.card",
  "textSnippet": "示例文本内容...",
  "vue": [
    { "name": "App", "file": "src/App.vue" },
    { "name": "Card", "file": "src/components/Card.vue" }
  ]
}
</vue_grab_locator>

<referenced_element>
Vue: App > Card
Path: html > body > div#example.card

  <html>
    <body>
      <div#example class="card highlight">
        示例文本内容...
</referenced_element>
```

当 `includeLocatorTag` 设为 `false` 时，仅复制 `<referenced_element>` 区块。

## 重要说明

- **组件栈解析**：组件栈解析依赖 Vue 运行时的内部属性（`__vueParentComponent`），不同环境或 Vue 版本可能表现不同
- **浏览器兼容性**：需要支持现代浏览器 API（如 Shadow DOM、Clipboard API）
- **快捷键冲突**：`Ctrl+C` 是系统复制快捷键，本工具会拦截该组合键，请根据实际情况调整

## 许可证

MIT

## 致谢

灵感来源于 [React Grab](https://github.com/aidenybai/react-grab) 项目。