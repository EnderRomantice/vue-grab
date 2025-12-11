# Vue Grab

> 語言：[English](README.md) | [简体中文](README.zh-CN.md) | 繁体中文

<img src="./public/vue-grab.svg" width="400" height="400" alt="Vue Grab Logo">

一個 Vue 3 工具庫，讓你可以輕鬆擷取頁面上的任何元素，並將其 HTML 片段和 Vue 組件堆疊資訊複製到剪貼簿，方便在 AI 工具中使用。

<video src="./public/vue-grab-ai.mp4" controls autoplay muted loop></video>

## 🚀 快速開始

### 步驟 1：安裝依賴
安裝 `vue-grab` 和 Opencode 橋接伺服器：
```bash
pnpm add @ender_romantice/vue-grab @ender_romantice/vue-grab-opencode concurrently
# 或
npm install @ender_romantice/vue-grab @ender_romantice/vue-grab-opencode concurrently
# 或
yarn add @ender_romantice/vue-grab @ender_romantice/vue-grab-opencode concurrently
```

### 步驟 2：使用 Bun 安裝 Opencode
**重要**：Opencode 必須使用 Bun 安裝以確保相容性：
```bash
# 如果尚未安裝 Bun，請先安裝
curl -fsSL https://bun.sh/install | bash

# 安裝 Opencode SDK
bun install opencode-ai -g
```

### 步驟 3：配置您的應用
在您的主 Vue 檔案中（例如 `main.js` 或 `main.ts`）：
```javascript
import { init } from '@ender_romantice/vue-grab'

init({
  agent: {
    type: "opencode"
    // 無需 API 金鑰 - 使用本地安裝的 Opencode
  }
})
```

### 步驟 4：啟動開發環境
加入到您的 `package.json` 腳本中：
```json
{
  "scripts": {
    "dev": "vite",
    "dev:ai": "concurrently \"npm run dev\" \"npx @ender_romantice/vue-grab-opencode\""
  }
}
```
然後執行：
```bash
npm run dev:ai
```

### 步驟 5：在瀏覽器中使用 AI 編輯
1. 按住 `Ctrl+X`（macOS: `⌘+X`）
2. 懸停在 Vue 應用中的任何元素上
3. 點擊打開 AI 提示輸入框
4. 輸入您的編輯請求（例如："將這個按鈕改為藍色"）
5. 觀看 Opencode 產生程式碼更改

### 替代方案：CDN 安裝（無 AI）
如果您不需要 AI 功能，可以使用 CDN 版本：
```html
<script src="https://unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```
> **注意**：CDN 安裝僅提供基本的複製功能，不支援 AI 整合。

> **注意**：如果您需要使用 AI 整合功能（Opencode），必須使用 NPM 安裝。CDN 方式無法使用 AI 整合功能。

### 基本使用

```javascript
import { init } from '@ender_romantice/vue-grab'

// 使用預設設定初始化
init()
```

### 使用方法
- **複製到剪貼簿**：按住 `Ctrl+C`（macOS: `⌘+C`），移動滑鼠到目標元素上（會出現高亮框），點擊複製 HTML 和組件資訊
- **快速複製**：按住 `Ctrl`（macOS: `⌘`），快速點按 `C`，然後在 800ms 內移動滑鼠並點擊目標元素
- **AI 互動**：按住 `Ctrl+X`（macOS: `⌘+X`），移動滑鼠到目標元素上，點擊開啟提示詞輸入框進行 AI 編輯（需要配置 AI 整合）

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
  
  // AI 整合（可選）
  agent: {
    type: "opencode"
    // 可選：model: "provider/model-name",
    // 可選：endpoint: "http://localhost:3000/api/code-edit"
  }
})
```

讓opencode連接器同步啟動

```json
{
    "scripts":{
        "dev": "concurrently \"vite\" \"npx @ender_romantice/vue-grab-opencode\""
    }
}
```

### CDN 方式（無 AI 整合）

如果您不需要 AI 整合功能，也可以使用 CDN：

```html
<script src="https://unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

> **限制**：CDN 方式無法使用 AI 整合功能，僅提供基礎的擷取和複製功能。

## 📚 詳細文件

### 功能特性

- **簡單易用**：按住 `Ctrl+C`（macOS: `⌘+C`），移動滑鼠到目標元素上（會出現高亮框），點擊即可擷取
- **智慧複製**：自動複製元素的 HTML 片段和 Vue 組件堆疊資訊
- **樣式隔離**：覆蓋層使用 Shadow DOM，不影響頁面原有樣式
- **組件追蹤**：自動解析並顯示 Vue 組件層級關係
- **可配置**：可自訂高亮顏色、標籤文字、元素過濾等設定
- **AI 整合**：支援 Opencode 進行 AI 驅動的程式碼編輯，採用模組化提供者系統
- **狀態管理**：內建狀態管理器，支援多個並行 AI 會話
- **會話處理**：支援 AI 互動的超時、中止和撤銷操作
- **模組化架構**：職責分離清晰，包含 DOM、覆蓋層、快捷鍵、代理和渲染等專用模組

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
    type: "opencode"
    // 可選：model: "provider/model-name",
    // 可選：endpoint: "http://localhost:3000/api/code-edit"
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
- `agent.type`: string - AI 代理類型（支援 "opencode"）
- `agent.model`: string - 可選模型標識符（例如 "provider/model-name"）
- `agent.endpoint`: string - 可選自訂端點 URL

### AI 整合設定

完整的逐步指南，請參見上方的[完整 AI 整合工作流程](#-完整-ai-整合工作流程)部分。

關鍵點：
- Opencode 必須使用 Bun 安裝：`bun install @opencode-ai/sdk`
- 橋接伺服器預設在連接埠 6569 上執行
- 無需 API 金鑰 - 使用本地安裝的 Opencode
- 使用 `agent: { type: "opencode" }` 配置 `vue-grab`

### AI 會話管理

AI 整合包含高階會話管理功能：

- **多會話並行**：可同時執行多個 AI 編輯會話
- **超時處理**：會話在 30 秒後自動超時
- **中止支援**：使用 `Escape` 鍵可取消任何進行中的會話
- **撤銷能力**：支援撤銷 AI 變更（需要提供者實作）
- **視埠感知**：會話覆蓋層在捲動/調整大小時自動調整
- **狀態持久化**：會話狀態由內部狀態管理器管理，可透過狀態管理器存取

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
