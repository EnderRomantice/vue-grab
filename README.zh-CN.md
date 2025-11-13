# Vue Grab

> 语言：中文 | [English](README.md)

<img src="./public/vue-grab.svg" width="400" height="400" alt="Vue Grab Logo">

一个 Vue 3 工具库，让你可以轻松抓取页面上的任何元素，并将其 HTML 片段和 Vue 组件栈信息复制到剪贴板，方便在 AI 工具中使用。

## 这个项目是怎么来的？

我在刷推特的时候发现了 React Grab 这个项目，这很有趣，我认为 Vue 也需要这个，所以我创建了这个仓库。

[React Grab 项目地址](https://github.com/aidenybai/react-grab)

## 项目简介

**Vue Grab** 是 [React Grab](https://github.com/aidenybai/react-grab) 的 Vue 版本。它允许开发者通过简单的快捷键操作，快速抓取页面元素的信息，包括：

- 元素的 HTML 结构
- Vue 组件栈信息（组件名称和文件路径）
- CSS 选择器路径
- 元素文本内容

这些信息会被格式化后复制到剪贴板，方便粘贴到 AI 工具（如 ChatGPT、Cursor 等）中进行讨论和分析。

## 功能特性

- **简单易用**：按住 `Ctrl+C`（macOS: `⌘+C`）移动鼠标，高亮目标元素，点击即可抓取
- **智能复制**：自动复制元素的 HTML 片段和 Vue 组件栈信息
- **样式隔离**：覆盖层使用 Shadow DOM，不影响页面原有样式
- **组件追踪**：自动解析并显示 Vue 组件层级关系
- **轻量级**：体积小，无额外依赖
- **高亮可配置**：可自定义高亮颜色和标签文字颜色
- **元素过滤**：可忽略指定选择器/标签，或跳过常见布局组件
- **标签提示开关**：可开关悬浮标签提示

## 快速开始

### 在线体验

[在线演示](https://vue-grab.vercel.app/)

### 本地运行演示

1. **安装依赖**
   ```bash
   # 安装主库依赖
   pnpm install

   # 安装演示网站依赖
   cd website
   pnpm install
   ```

2. **构建主库**
   ```bash
   # 在项目根目录
   pnpm build
   ```

3. **启动演示网站**
   ```bash
   # 在 website 目录
   cd website
   pnpm dev
   ```

   然后打开浏览器访问显示的本地地址（通常是 `http://localhost:5173`）

4. **使用方法**
   - **方式 A**：按住 `Ctrl+C`（macOS: `⌘+C`），移动鼠标到目标元素上（会出现高亮框），点击即可抓取
   - **方式 B**：按住 `Ctrl`（macOS: `⌘`），快速点按 `C`，然后在 800ms 内移动鼠标并点击目标元素

### 在项目中使用

#### 方式一：CDN 引入

```html
<!-- 在线 CDN -->
<script src="https://unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>

<!-- 或本地文件 -->
<script src="./dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

#### 方式二：NPM 安装

```bash
npm install @ender_romantice/vue-grab
# 或
pnpm add @ender_romantice/vue-grab
# 或
yarn add @ender_romantice/vue-grab
```

```javascript
import { init } from '@ender_romantice/vue-grab'

// 初始化（默认启用）
init()

// 或使用自定义配置
init({
  enabled: true,
  hotkey: 'c', // 或 ['c', 'v'] 支持多个快捷键
  keyHoldDuration: 500, // 按键持续时间（毫秒）
  // 新增的 UI/行为配置
  highlightColor: '#2563EB', // 边框 + 标签背景色
  labelTextColor: '#ffffff', // 标签文字颜色
  showTagHint: true,         // 是否显示悬浮标签
  filter: {
    ignoreSelectors: ['.nav', 'header'], // 需要忽略的选择器
    ignoreTags: ['svg'],                  // 需要忽略的标签名
    skipCommonComponents: true,           // 跳过 header/nav/footer/aside
  },
  adapter: {
    open: (text) => {
      // 自定义处理函数，例如打开外部工具
      console.log('抓取的内容:', text)
    }
  }
})
// 说明：
// - 当 hotkey 是仅由单字符键组成的数组（如 ['c','v']），表示 OR 语义：按任意一个键触发。
// - 当 hotkey 数组包含修饰键（如 ['Control','c'] 或 ['Meta','c']），表示组合（AND）语义：需同时按下。
// - keyHoldDuration 控制对 'c' 键的“最近按下”判定时间窗口（毫秒），用于配合组合键更自然地触发。
// - init 是幂等的：多次调用不会重复注册监听器，后一次会覆盖前一次配置。
// - 选择框会使用 highlightColor 的半透明填充，以提升在不同背景下的可读性。
```

### 配置项说明

- highlightColor: string
  - 高亮主色（用于选择框边框与标签背景）
- labelTextColor: string
  - 标签文字颜色
- showTagHint: boolean
  - 是否显示悬浮的标签提示
- filter.ignoreSelectors: string[]
  - 需要忽略的 CSS 选择器（命中元素会被跳过，并继续向上寻找父元素）
- filter.ignoreTags: string[]
  - 需要忽略的标签名（如 `['svg', 'canvas']`）
- filter.skipCommonComponents: boolean
  - 是否跳过常见布局元素：`header`、`nav`、`footer`、`aside`

## 项目结构

```
vue-grab/
├── src/                    # 主库源代码
│   ├── index.ts           # 入口文件
│   └── modules/           # 功能模块
│       ├── clipboard.ts   # 剪贴板操作
│       ├── dom.ts         # DOM 操作和组件栈解析
│       ├── hotkeys.ts     # 快捷键处理
│       └── overlay.ts     # 高亮覆盖层
├── website/               # 演示网站
│   ├── src/
│   │   ├── App.vue        # 演示页面
│   │   └── main.ts        # 入口文件
│   └── package.json
├── dist/                  # 构建输出
└── package.json
```

## 开发

### 构建主库

```bash
pnpm build
```

### 开发模式（监听文件变化）

```bash
pnpm dev
```

### 运行演示网站

```bash
cd website
pnpm dev
```

## 📝 复制内容格式

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

## 重要说明

- **组件栈解析**：组件栈解析依赖 Vue 运行时的内部属性（`__vueParentComponent`），不同环境或 Vue 版本可能表现不同
- **浏览器兼容性**：需要支持现代浏览器 API（如 Shadow DOM、Clipboard API）
- **快捷键冲突**：`Ctrl+C` 是系统复制快捷键，本工具会拦截该组合键，请根据实际情况调整

## 许可证

MIT

## 致谢

灵感来源于 [React Grab](https://github.com/aidenybai/react-grab) 项目。
感谢 Vue 生态社区提供的技术支持与组件设计思路。
