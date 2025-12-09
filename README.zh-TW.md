# Vue Grab

> 語言：[English](README.md) | [简体中文](README.zh-CN.md) | 繁体中文

<img src="./public/vue-grab.svg" width="400" height="400" alt="Vue Grab Logo">

一個 Vue 3 工具庫，讓你可以輕鬆擷取頁面上的任何元素，並將其 HTML 片段和 Vue 組件堆疊資訊複製到剪貼簿，方便在 AI 工具中使用。



## 🚀 快速開始

### 安裝（推薦 NPM）

使用 NPM 安裝以獲得完整的 AI 整合功能：

```bash
pnpm add @ender_romantice/vue-grab
# 或
npm install @ender_romantice/vue-grab
# 或
yarn add @ender_romantice/vue-grab
```

> **注意**：如果您需要使用 AI 整合功能（Opencode），必須使用 NPM 安裝。CDN 方式無法使用 AI 整合功能。

### 基本使用

```javascript
import { init } from '@ender_romantice/vue-grab'

// 使用預設設定初始化
init()
```

### 快速配置（含 AI 整合）

```javascript
import { init } from '@ender_romantice/vue-grab'

init({
  // UI 配置
  highlightColor: '#2563EB',
  labelTextColor: '#ffffff',
  showTagHint: true,
  
  // 元素過濾
  filter: {
    ignoreSelectors: ['.nav', 'header'],
    ignoreTags: ['svg'],
    skipCommonComponents: true,
  },
  
  // AI 整合（可選，但推薦使用）
  agent: {
    type: "opencode",
    provider: "deepseek",
    model: "deepseek/deepseek-reasoner",
    apiKey: "your-api-key" // 替換為您的 API 金鑰
  }
})
```

### CDN 方式（無 AI 整合）

如果您不需要 AI 整合功能，也可以使用 CDN：

```html
<script src="https://unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

> **限制**：CDN 方式無法使用 AI 整合功能，僅提供基礎的擷取和複製功能。

### 使用方法
- **複製到剪貼簿**：按住 `Ctrl+C`（macOS: `⌘+C`），移動滑鼠到目標元素上（會出現高亮框），點擊複製 HTML 和組件資訊
- **快速複製**：按住 `Ctrl`（macOS: `⌘`），快速點按 `C`，然後在 800ms 內移動滑鼠並點擊目標元素
- **AI 互動**：按住 `Ctrl+X`（macOS: `⌘+X`），移動滑鼠到目標元素上，點擊開啟提示詞輸入框進行 AI 編輯（需要配置 AI 整合）

## 📚 詳細文件

### 功能特性

- **簡單易用**：按住 `Ctrl+C`（macOS: `⌘+C`）移動滑鼠，高亮目標元素，點擊即可擷取
- **智慧複製**：自動複製元素的 HTML 片段與 Vue 組件堆疊資訊
- **樣式隔離**：覆蓋層使用 Shadow DOM，不影響頁面原有樣式
- **組件追蹤**：自動解析並顯示 Vue 組件層級關係
- **可配置**：可自訂高亮顏色、標籤文字、元素過濾等設定
- **AI 整合**：支援 Opencode 進行 AI 驅動的程式碼編輯

### 完整配置

```javascript
import { init } from '@ender_romantice/vue-grab'

init({
  enabled: true,
  hotkey: 'c', // 或 ['c', 'v'] 支援多個快速鍵
  keyHoldDuration: 500, // 按鍵持續時間（毫秒）
  
  // UI 配置
  highlightColor: '#2563EB', // 邊框 + 標籤背景色
  labelTextColor: '#ffffff', // 標籤文字顏色
  showTagHint: true,         // 是否顯示懸浮標籤
  includeLocatorTag: true,   // 是否包含 <vue_grab_locator> 段
  
  // 元素過濾
  filter: {
    ignoreSelectors: ['.nav', 'header'], // 需要忽略的選擇器
    ignoreTags: ['svg'],                  // 需要忽略的標籤名稱
    skipCommonComponents: true,           // 跳過 header/nav/footer/aside
  },
  
  // AI 整合（可選）
  agent: {
    type: "opencode",
    provider: "deepseek",     // 服務提供商 ID
    model: "deepseek/deepseek-reasoner", // 模型名稱
    apiKey: "your-api-key"    // 您的 API 金鑰
  },
  
  // 自訂處理器（可選）
  adapter: {
    open: (text) => {
      console.log('擷取的內容:', text)
    }
  }
})
```

#### 配置項說明

- `highlightColor`: string - 高亮主色（用於選擇框邊框與標籤背景）
- `labelTextColor`: string - 標籤文字顏色
- `showTagHint`: boolean - 是否顯示懸浮的標籤提示
- `includeLocatorTag`: boolean - 是否包含 `<vue_grab_locator>` 段（設為 false 時僅保留 `<referenced_element>`）
- `filter.ignoreSelectors`: string[] - 需要忽略的 CSS 選擇器
- `filter.ignoreTags`: string[] - 需要忽略的標籤名稱（如 `['svg', 'canvas']`）
- `filter.skipCommonComponents`: boolean - 是否跳過常見版面元素：`header`、`nav`、`footer`、`aside`
- `agent.type`: string - AI 代理類型（目前僅支援 "opencode"）
- `agent.provider`: string - 服務提供商 ID（例如 "deepseek"、"anthropic"）
- `agent.model`: string - 模型名稱
- `agent.apiKey`: string - 您的 AI 服務 API 金鑰

### AI 整合設定

要啟用 Opencode AI 程式碼編輯功能：

1. **安裝後端服務**：
```bash
npm install @ender_romantice/vue-grab-opencode --save-dev
```

2. **配置 package.json**，在執行開發伺服器時同時執行 AI 後端服務：
```json
{
  "scripts": {
    "dev": "vite",
    "dev:ai": "concurrently \"npm run dev\" \"npx @ender_romantice/vue-grab-opencode\""
  }
}
```

3. **在 `init()` 中配置代理**（參見上方的配置部分）。

### 複製內容格式

擷取的元素資訊會以以下格式複製到剪貼簿：

```
<vue_grab_locator>
{
  "tag": "div",
  "id": "example",
  "classList": ["card", "highlight"],
  "cssPath": "html > body > div#example.card",
  "textSnippet": "示例文本內容...",
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
        示例文本內容...
</referenced_element>
```

當 `includeLocatorTag` 設為 `false` 時，僅複製 `<referenced_element>` 區塊。

### 重要說明

- **組件堆疊解析**：組件堆疊解析依賴 Vue 執行階段的內部屬性（`__vueParentComponent`），在不同環境或 Vue 版本可能表現不同
- **瀏覽器相容性**：需要支援現代瀏覽器 API（如 Shadow DOM、Clipboard API）
- **快速鍵衝突**：`Ctrl+C` 是系統複製快速鍵，本工具會攔截該組合鍵，請根據實際情況調整

## 授權條款

MIT

## 致謝

靈感來源於 [React Grab](https://github.com/aidenybai/react-grab) 專案。