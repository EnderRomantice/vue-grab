# Vue Grab

> 語言：中文 | [English](README.md)

<img src="./public/vue-grab.svg" width="400" height="400" alt="Vue Grab Logo">

一個 Vue 3 工具庫，讓你可以輕鬆擷取頁面上的任何元素，並將其 HTML 片段和 Vue 組件堆疊資訊複製到剪貼簿，方便在 AI 工具中使用。

## 這個專案是怎麼來的？

我在刷推特的時候發現了 React Grab 這個專案，覺得很有趣，我認為 Vue 也需要這個，所以我建立了這個倉庫。

[React Grab 專案地址](https://github.com/aidenybai/react-grab)

## 專案簡介

**Vue Grab** 是 [React Grab](https://github.com/aidenybai/react-grab) 的 Vue 版本。它允許開發者透過簡單的快捷鍵操作，快速擷取頁面元素的資訊，包括：

- 元素的 HTML 結構
- Vue 組件堆疊資訊（組件名稱與檔案路徑）
- CSS 選擇器路徑
- 元素文字內容

這些資訊會被格式化後複製到剪貼簿，方便貼到 AI 工具（如 ChatGPT、Cursor 等）中進行討論與分析。

## 功能特性

- **簡單易用**：按住 `Ctrl+C`（macOS: `⌘+C`）移動滑鼠，高亮目標元素，點擊即可擷取
- **智慧複製**：自動複製元素的 HTML 片段與 Vue 組件堆疊資訊
- **樣式隔離**：覆蓋層使用 Shadow DOM，不影響頁面原有樣式
- **組件追蹤**：自動解析並顯示 Vue 組件層級關係
- **輕量級**：體積小，無額外依賴
- **高亮可配置**：可自訂高亮顏色與標籤文字顏色
- **元素過濾**：可忽略指定選擇器/標籤，或跳過常見版面元件
- **標籤提示開關**：可開關懸浮標籤提示

## 快速開始

### 線上體驗

[線上示範](https://vue-grab.vercel.app/)

### 在本機運行示範

1. **安裝相依套件**
   ```bash
   # 安裝主庫相依套件
   pnpm install

   # 安裝示範網站相依套件
   cd website
   pnpm install
   ```

2. **建置主庫**
   ```bash
   # 在專案根目錄
   pnpm build
   ```

3. **啟動示範網站**
   ```bash
   # 在 website 目錄
   cd website
   pnpm dev
   ```

   然後打開瀏覽器訪問顯示的本機地址（通常是 `http://localhost:5173`）

4. **使用方法**
   - **方式 A**：按住 `Ctrl+C`（macOS: `⌘+C`），移動滑鼠到目標元素上（會出現高亮框），點擊即可擷取
   - **方式 B**：按住 `Ctrl`（macOS: `⌘`），快速點按 `C`，然後在 800ms 內移動滑鼠並點擊目標元素

### 在專案中使用

#### 方式一：CDN 引入

```html
<!-- 線上 CDN -->
<script src="https://unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>

<!-- 或本地檔案 -->
<script src="./dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

#### 方式二：NPM 安裝

```bash
npm install @ender_romantice/vue-grab
# 或
pnpm add @ender_romantice/vue-grab
# 或
yarn add @ender_romantice/vue-grab
```

```javascript
import { init } from '@ender_romantice/vue-grab'

// 初始化（預設啟用）
init()

// 或使用自訂設定
init({
  enabled: true,
  hotkey: 'c', // 或 ['c', 'v'] 支援多個快速鍵
  keyHoldDuration: 500, // 按鍵持續時間（毫秒）
  // 新增的 UI/行為設定
  highlightColor: '#2563EB', // 邊框 + 標籤背景色
  labelTextColor: '#ffffff', // 標籤文字顏色
  showTagHint: true,         // 是否顯示懸浮標籤
  filter: {
    ignoreSelectors: ['.nav', 'header'], // 需要忽略的選擇器
    ignoreTags: ['svg'],                  // 需要忽略的標籤名稱
    skipCommonComponents: true,           // 跳過 header/nav/footer/aside
  },
  adapter: {
    open: (text) => {
      // 自訂處理函式，例如開啟外部工具
      console.log('擷取的內容:', text)
    }
  }
})
// 說明：
// - 當 hotkey 是僅由單個字元鍵組成的陣列（如 ['c','v']），表示 OR 語意：按任一個鍵觸發。
// - 當 hotkey 陣列包含修飾鍵（如 ['Control','c'] 或 ['Meta','c']），表示組合（AND）語意：需同時按下。
// - keyHoldDuration 控制對 'c' 鍵的「最近按下」判定時間視窗（毫秒），用於配合組合鍵更自然地觸發。
// - init 是冪等的：多次呼叫不會重複註冊監聽器，後一次會覆蓋前一次設定。
// - 選擇框會使用 highlightColor 的半透明填充，以提升在不同背景下的可讀性。
```

### 設定項說明

- highlightColor: string
  - 高亮主色（用於選擇框邊框與標籤背景）
- labelTextColor: string
  - 標籤文字顏色
- showTagHint: boolean
  - 是否顯示懸浮的標籤提示
- filter.ignoreSelectors: string[]
  - 需要忽略的 CSS 選擇器（命中元素會被跳過，並繼續向上尋找父元素）
- filter.ignoreTags: string[]
  - 需要忽略的標籤名稱（如 `['svg', 'canvas']`）
- filter.skipCommonComponents: boolean
  - 是否跳過常見版面元素：`header`、`nav`、`footer`、`aside`

## 專案結構

```
vue-grab/
├── src/                    # 主庫原始程式碼
│   ├── index.ts           # 入口檔案
│   └── modules/           # 功能模組
│       ├── clipboard.ts   # 剪貼簿操作
│       ├── dom.ts         # DOM 操作與組件堆疊解析
│       ├── hotkeys.ts     # 快捷鍵處理
│       └── overlay.ts     # 高亮覆蓋層
├── website/               # 示範網站
│   ├── src/
│   │   ├── App.vue        # 示範頁面
│   │   └── main.ts        # 入口檔案
│   └── package.json
├── dist/                  # 建置輸出
└── package.json
```

## 開發

### 建置主庫

```bash
pnpm build
```

### 開發模式（監聽檔案變化）

```bash
pnpm dev
```

### 執行示範網站

```bash
cd website
pnpm dev
```

## 📝 複製內容格式

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

## 重要說明

- **組件堆疊解析**：組件堆疊解析依賴 Vue 執行階段的內部屬性（`__vueParentComponent`），在不同環境或 Vue 版本可能表現不同
- **瀏覽器相容性**：需要支援現代瀏覽器 API（如 Shadow DOM、Clipboard API）
- **快速鍵衝突**：`Ctrl+C` 是系統複製快速鍵，本工具會攔截該組合鍵，請根據實際情況調整

## 授權條款

MIT

## 致謝

靈感來源於 [React Grab](https://github.com/aidenybai/react-grab) 專案。
