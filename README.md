# Vue Grab

> Language: English | [中文](README.zh-CN.md)

<img src="./public/vue-grab.svg" alt="Vue Grab Logo">

A Vue 3 utility library that lets you easily grab any element on the page and copy its HTML snippet and Vue component stack information to the clipboard, making it convenient to use in AI tools.

## How did this project start?

I came across the React Grab project on Twitter. It was fun and useful, and I felt Vue needed the same thing — so I created this repo.

[React Grab](https://github.com/aidenybai/react-grab)

## Introduction

**Vue Grab** is the Vue version of [React Grab](https://github.com/aidenybai/react-grab). It allows developers to quickly grab element information through simple keyboard shortcuts, including:

- Element HTML structure
- Vue component stack information (component names and file paths)
- CSS selector path
- Element text content

This information is formatted and copied to the clipboard, ready to paste into AI tools (like ChatGPT, Cursor, etc.) for discussion and analysis.

## Features

- **Easy to use**: Hold `Ctrl+C` (macOS: `⌘+C`), move the mouse to highlight target elements, then click to grab
- **Smart copying**: Automatically copies element HTML snippets and Vue component stack information
- **Style isolation**: Overlay uses Shadow DOM to avoid interfering with page styles
- **Component tracking**: Automatically parses and displays Vue component hierarchy
- **Lightweight**: Small bundle size with no extra dependencies
- **Configurable highlight**: Customize highlight color and label text color
- **Element filtering**: Ignore specific selectors/tags or skip common layout components
- **Tag hint toggle**: Enable/disable the floating tag hint over the target

## Quick Start

### Online Demo

[Try it online](https://vue-grab.vercel.app/)

### Local Development

1. **Install dependencies**
   ```bash
   # Install main library dependencies
   pnpm install

   # Install demo website dependencies
   cd website
   pnpm install
   ```

2. **Build the library**
   ```bash
   # In project root
   pnpm build
   ```

3. **Start the demo website**
   ```bash
   # In website directory
   cd website
   pnpm dev
   ```

   Then open your browser to the displayed local address (usually `http://localhost:5173`)

4. **How to use**
   - **Method A**: Hold `Ctrl+C` (macOS: `⌘+C`), move the mouse over the target element (a highlight box will appear), then click to grab
   - **Method B**: Hold `Ctrl` (macOS: `⌘`), quickly tap `C`, then move and click the target element within 800ms

### Use in Your Project

#### Method 1: CDN

```html
<!-- Online CDN -->
<script src="https://unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>

<!-- Or local file -->
<script src="./dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

#### Method 2: NPM Install

```bash
npm install @ender_romantice/vue-grab
# or
pnpm add @ender_romantice/vue-grab
# or
yarn add @ender_romantice/vue-grab
```

```javascript
import { init } from '@ender_romantice/vue-grab'

// Initialize (enabled by default)
init()

// Or with custom options
init({
  enabled: true,
  hotkey: 'c', // or ['c', 'v'] for multiple hotkeys (see notes)
  keyHoldDuration: 500, // key hold window in milliseconds
  // New UI/behavior configs
  highlightColor: '#2563EB', // border + label background color
  labelTextColor: '#ffffff', // label text color
  showTagHint: true,         // toggle tag hint display
  filter: {
    ignoreSelectors: ['.nav', 'header'], // selectors to ignore
    ignoreTags: ['svg'],                  // tag names to ignore
    skipCommonComponents: true,           // skip header/nav/footer/aside
  },
  adapter: {
    open: (text) => {
      // Custom handler, e.g., open external tool
      console.log('Grabbed content:', text)
    }
  }
})
// Notes:
// - When hotkey is an array of single-letter keys (e.g. ['c','v']), it uses OR semantics: pressing any one letter triggers.
// - When hotkey includes modifiers (e.g. ['Control','c'] or ['Meta','c']), it uses combo (AND) semantics: keys must be pressed together.
// - keyHoldDuration controls the "recent press" window for 'c' (in ms), making combos more natural to trigger.
// - init is idempotent: calling it multiple times won’t duplicate listeners; later calls override earlier config.
// - The selection box is filled with a semi-transparent version of highlightColor for better contrast.
```

### Configuration Reference

- highlightColor: string
  - Main accent color for the selection border and label background
- labelTextColor: string
  - Text color used in the label
- showTagHint: boolean
  - Show/hide the floating tag label while hovering
- filter.ignoreSelectors: string[]
  - CSS selectors to ignore (elements matching these will be skipped; the search continues up the DOM)
- filter.ignoreTags: string[]
  - Tag names to ignore (e.g. `['svg', 'canvas']`)
- filter.skipCommonComponents: boolean
  - If true, skip common layout elements: `header`, `nav`, `footer`, `aside`

## Project Structure

```
vue-grab/
├── src/                    # Main library source code
│   ├── index.ts           # Entry file
│   └── modules/           # Feature modules
│       ├── clipboard.ts   # Clipboard operations
│       ├── dom.ts         # DOM operations and component stack parsing
│       ├── hotkeys.ts     # Hotkey handling
│       └── overlay.ts     # Highlight overlay
├── website/               # Demo website
│   ├── src/
│   │   ├── App.vue        # Demo page
│   │   └── main.ts        # Entry file
│   └── package.json
├── dist/                  # Build output
└── package.json
```

## Development

### Build the library

```bash
pnpm build
```

### Development mode (watch for changes)

```bash
pnpm dev
```

### Run the demo website

```bash
cd website
pnpm dev
```

## 📝 Copied Content Format

Grabbed element information is copied to the clipboard in the following format:

```
<vue_grab_locator>
{
  "tag": "div",
  "id": "example",
  "classList": ["card", "highlight"],
  "cssPath": "html > body > div#example.card",
  "textSnippet": "Example text content...",
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
        Example text content...
</referenced_element>



```

## Important Notes

- **Component stack parsing**: Component stack parsing relies on Vue runtime internals (`__vueParentComponent`), which may behave differently across environments or Vue versions
- **Browser compatibility**: Requires modern browser APIs (e.g., Shadow DOM, Clipboard API)
- **Hotkey conflicts**: `Ctrl+C` is the system copy shortcut. This tool intercepts this key combination, so adjust accordingly based on your needs

## License

MIT

## Acknowledgments

Inspired by the [React Grab](https://github.com/aidenybai/react-grab) project.
