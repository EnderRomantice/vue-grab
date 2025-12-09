# Vue Grab

> Language: English | [简体中文](README.zh-CN.md) | [繁体中文](README.zh-TW.md)

<img src="./public/vue-grab.svg" width="400" height="400" alt="Vue Grab Logo">

A Vue 3 utility library that lets you easily grab any element on the page and copy its HTML snippet and Vue component stack information to the clipboard, making it convenient to use in AI tools.

## 🚀 Quick Start

### Installation

#### CDN
```html
<script src="https://unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

#### NPM
```bash
npm install @ender_romantice/vue-grab
# or
pnpm add @ender_romantice/vue-grab
# or
yarn add @ender_romantice/vue-grab
```

### Basic Usage
```javascript
import { init } from '@ender_romantice/vue-grab'

// Initialize with default settings
init()
```

### How to Use
- **Copy to clipboard**: Hold `Ctrl+C` (macOS: `⌘+C`), move mouse over target element (highlight box appears), click to copy HTML and component info
- **Quick copy**: Hold `Ctrl` (macOS: `⌘`), quickly tap `C`, then move and click target element within 800ms
- **AI interaction**: Hold `Ctrl+X` (macOS: `⌘+X`), move mouse over target element, click to open prompt input for AI editing (requires AI integration)

### Quick Configuration
```javascript
import { init } from '@ender_romantice/vue-grab'

init({
  // UI
  highlightColor: '#2563EB',
  labelTextColor: '#ffffff',
  showTagHint: true,
  
  // Filtering
  filter: {
    ignoreSelectors: ['.nav', 'header'],
    ignoreTags: ['svg'],
    skipCommonComponents: true,
  },
  
  // AI Integration (Optional)
  agent: {
    type: "opencode",
    provider: "deepseek",
    model: "deepseek/deepseek-reasoner",
    apiKey: "your-api-key"
  }
})
```

## 📚 Detailed Documentation

### Features

- **Easy to use**: Hold `Ctrl+C` (macOS: `⌘+C`), move the mouse to highlight target elements, then click to grab
- **Smart copying**: Automatically copies element HTML snippets and Vue component stack information
- **Style isolation**: Overlay uses Shadow DOM to avoid interfering with page styles
- **Component tracking**: Automatically parses and displays Vue component hierarchy
- **Configurable**: Customize highlight color, label text, element filtering, and more
- **AI Integration**: Supports Opencode for AI-powered code editing

### Full Configuration

```javascript
import { init } from '@ender_romantice/vue-grab'

init({
  enabled: true,
  hotkey: 'c', // or ['c', 'v'] for multiple hotkeys
  keyHoldDuration: 500, // key hold window in milliseconds
  
  // UI Configuration
  highlightColor: '#2563EB', // border + label background color
  labelTextColor: '#ffffff', // label text color
  showTagHint: true,         // toggle tag hint display
  includeLocatorTag: true,   // include the locator block in copied content
  
  // Element Filtering
  filter: {
    ignoreSelectors: ['.nav', 'header'], // selectors to ignore
    ignoreTags: ['svg'],                  // tag names to ignore
    skipCommonComponents: true,           // skip header/nav/footer/aside
  },
  
  // AI Integration (Optional)
  agent: {
    type: "opencode",
    provider: "deepseek",     // Service provider ID
    model: "deepseek/deepseek-reasoner", // Model name
    apiKey: "your-api-key"    // Your API key
  },
  
  // Custom Handler (Optional)
  adapter: {
    open: (text) => {
      console.log('Grabbed content:', text)
    }
  }
})
```

#### Configuration Reference

- `highlightColor`: string - Main accent color for the selection border and label background
- `labelTextColor`: string - Text color used in the label
- `showTagHint`: boolean - Show/hide the floating tag label while hovering
- `includeLocatorTag`: boolean - Whether to include the `<vue_grab_locator>` block in the copied content (set to false to keep only `<referenced_element>`)
- `filter.ignoreSelectors`: string[] - CSS selectors to ignore
- `filter.ignoreTags`: string[] - Tag names to ignore (e.g. `['svg', 'canvas']`)
- `filter.skipCommonComponents`: boolean - If true, skip common layout elements: `header`, `nav`, `footer`, `aside`
- `agent.type`: string - AI agent type (currently only "opencode" supported)
- `agent.provider`: string - Service provider ID (e.g., "deepseek", "anthropic")
- `agent.model`: string - Model name
- `agent.apiKey`: string - Your API key for the AI service

### AI Integration Setup

To enable AI code editing with Opencode:

1. **Install the backend service**:
```bash
npm install @ender_romantice/vue-grab-opencode --save-dev
```

2. **Configure your package.json** to run the AI backend alongside your dev server:
```json
{
  "scripts": {
    "dev": "vite",
    "dev:ai": "concurrently \"npm run dev\" \"npx @ender_romantice/vue-grab-opencode\""
  }
}
```

3. **Configure the agent** in your `init()` call (see Configuration section above).

### Copied Content Format

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

When `includeLocatorTag` is `false`, only the `<referenced_element>` block is copied.

### Notes

- **Component stack parsing**: Relies on Vue runtime internals (`__vueParentComponent`), which may behave differently across environments or Vue versions
- **Browser compatibility**: Requires modern browser APIs (e.g., Shadow DOM, Clipboard API)
- **Hotkey conflicts**: `Ctrl+C` is the system copy shortcut. This tool intercepts this key combination, please adjust accordingly based on your needs

## License

MIT

## Acknowledgments

Inspired by the [React Grab](https://github.com/aidenybai/react-grab) project.