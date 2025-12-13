# Vue Grab

> Language: English | [简体中文](README.zh-CN.md) | [繁体中文](README.zh-TW.md)

<img src="./public/vue-grab.svg" width="400" height="400" alt="Vue Grab Logo">

A Vue 3 utility library that lets you easily grab any element on the page and copy its HTML snippet and Vue component stack information to the clipboard, making it convenient to use in AI tools.

[<video src="./public/vue-grab-ai.mp4" controls autoplay muted loop></video>](https://github.com/user-attachments/assets/af677007-2f7e-46f4-9fb5-a9890334f82e)

## 🚀 Quick Start

### Step 1: Install Dependencies
Install both `vue-grab` and the Opencode bridge server:
```bash
pnpm add @ender_romantice/vue-grab @ender_romantice/vue-grab-opencode concurrently
# or
npm install @ender_romantice/vue-grab @ender_romantice/vue-grab-opencode concurrently
# or
yarn add @ender_romantice/vue-grab @ender_romantice/vue-grab-opencode concurrently
```

### Step 2: Install Opencode with Bun
**Important**: Opencode must be installed using Bun for compatibility:
```bash
# Install Bun if you haven't already
curl -fsSL https://bun.sh/install | bash

# Install Opencode SDK
bun install opencode-ai -g
```

### Step 3: Configure Your App
In your main Vue file (e.g., `main.js` or `main.ts`):
```javascript
import { init } from '@ender_romantice/vue-grab'

init({
  agent: {
    type: "opencode"
    // No API key needed - uses locally installed Opencode
  }
})
```

### Step 4: Start the Development Environment
Add to your `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "dev:ai": "concurrently \"npm run dev\" \"npx @ender_romantice/vue-grab-opencode\""
  }
}
```
Then run:
```bash
npm run dev:ai
```

### Step 5: Use AI Editing in Browser
1. Hold `Ctrl+X` (macOS: `⌘+X`)
2. Hover over any element in your Vue app
3. Click to open the AI prompt input
4. Enter your editing request (e.g., "Make this button blue")
5. Watch as opencode generates the code changes

### Alternative: CDN Installation (No AI)
If you don't need AI features, use the CDN version:
```html
<script src="https://unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```
> **Note**: CDN installation only provides basic copy functionality, not AI integration.

> **Note**: If you need AI integration (Opencode), you must use NPM installation. CDN installation does not support AI integration.

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
    // Optional: specify a model
    // model: "provider/model-name",
    // Optional: custom endpoint (default: http://localhost:6569/api/code-edit)
    // endpoint: "http://localhost:3000/api/code-edit"
  }
})
```

Run the opencode connector concurrently with your development server:

```json
{
    "scripts":{
        "dev": "concurrently \"vite\" \"npx @ender_romantice/vue-grab-opencode\""
    }
}
```

### CDN Installation (No AI Integration)
If you don't need AI integration, you can also use CDN:

```html
<script src="https://unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```
> **Limitation**: CDN installation does not support AI integration, only provides basic grabbing and copying functionality.

## 📚 Detailed Documentation

### Features

- **Easy to use**: Hold `Ctrl+C` (macOS: `⌘+C`), move the mouse to highlight target elements, then click to grab
- **Smart copying**: Automatically copies element HTML snippets and Vue component stack information
- **Style isolation**: Overlay uses Shadow DOM to avoid interfering with page styles
- **Component tracking**: Automatically parses and displays Vue component hierarchy
- **Configurable**: Customize highlight color, label text, element filtering, and more
- **AI Integration**: Supports Opencode for AI-powered code editing with modular provider system
- **State management**: Built-in state manager for handling multiple concurrent AI sessions
- **Session handling**: Supports timeouts, aborting, and undo operations for AI interactions
- **Modular architecture**: Clean separation of concerns with dedicated modules for DOM, overlay, hotkeys, agents, and rendering

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
    // Optional: specify a model
    // model: "provider/model-name",
    // Optional: custom endpoint (default: http://localhost:6569/api/code-edit)
    // endpoint: "http://localhost:3000/api/code-edit"
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
- `agent.type`: string - AI agent type (currently supports "opencode")
- `agent.model`: string - Optional model identifier (e.g., "provider/model-name")
- `agent.endpoint`: string - Optional custom endpoint URL (default: http://localhost:6569/api/code-edit)

### AI Integration Setup

For a complete step-by-step guide, see the [Complete AI Integration Workflow](#-complete-ai-integration-workflow) section above.

Key points:
- Opencode must be installed using Bun: `bun install @opencode-ai/sdk`
- The bridge server runs on port 6569 by default
- No API key required - uses locally installed Opencode
- Configure `vue-grab` with `agent: { type: "opencode" }`

### AI Session Management

The AI integration includes advanced session management features:

- **Multiple concurrent sessions**: Run multiple AI editing sessions simultaneously
- **Timeout handling**: Sessions automatically timeout after 30 seconds
- **Abort support**: Cancel any ongoing session with `Escape` key
- **Undo capability**: Support for undoing AI changes (requires provider implementation)
- **Viewport awareness**: Session overlays adjust automatically on scroll/resize
- **State persistence**: Session state is managed internally and can be accessed via the state manager

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
