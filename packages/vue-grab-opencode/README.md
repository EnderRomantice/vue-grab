# Vue Grab Opencode Server

[English](./README.md) | [中文](./README.zh-CN.md)

A local server bridge that connects `vue-grab` with Opencode AI for AI-powered code editing directly from your browser.

## 🚀 Quick Start

### Prerequisites

**Important**: Before using this package, you must have [Opencode](https://opencode.ai) installed on your system **using Bun**:

```bash
# Install Bun if you haven't already
curl -fsSL https://bun.sh/install | bash

# Install Opencode with Bun
bun install @opencode-ai/sdk
```

> **Note**: Opencode **must** be installed with Bun. Other package managers may cause compatibility issues.

### Installation

You can run the server directly using `npx` without installing it as a dependency:

```bash
npx @ender_romantice/vue-grab-opencode
```

Or install it as a dependency for easier integration:

```bash
npm install @ender_romantice/vue-grab-opencode
# or
pnpm add @ender_romantice/vue-grab-opencode
# or
yarn add @ender_romantice/vue-grab-opencode
```

### Basic Usage

Start the server in your terminal:

```bash
# Using npx (recommended)
npx @ender_romantice/vue-grab-opencode

# Or if installed as dependency
npx vue-grab-opencode
```

The server will start on port **6569** by default. You can change the port using the `PORT` environment variable:

```bash
PORT=3000 npx @ender_romantice/vue-grab-opencode
```

Expected output:
```
Vue Grab 0.1.0 (Opencode)
- Local:    http://localhost:6569
```

### Integration with vue-grab

Configure `vue-grab` to use the Opencode agent:

```javascript
import { init } from '@ender_romantice/vue-grab'

init({
  agent: {
    type: "opencode",
    // Optional: specify a model (default: Opencode's default model)
    model: "provider/model-name",
    // Optional: custom endpoint (default: http://localhost:6569/api/code-edit)
    endpoint: "http://localhost:6569/api/code-edit"
  }
})
```

## 📖 API Documentation

### Endpoints

#### `POST /api/code-edit`

Main endpoint for AI code editing requests from `vue-grab`.

**Request Body:**
```json
{
  "prompt": "Make the button blue",
  "locator": {
    "tag": "button",
    "id": "submit-btn",
    "classList": ["btn", "primary"],
    "cssPath": "html > body > form > button#submit-btn.btn",
    "textSnippet": "Submit",
    "vue": [
      { "name": "App", "file": "src/App.vue" },
      { "name": "Form", "file": "src/components/Form.vue" }
    ]
  },
  "htmlSnippet": "<button id=\"submit-btn\" class=\"btn primary\">Submit</button>",
  "agentConfig": {
    "model": "provider/model-name"
  }
}
```

**Response:** Server-Sent Events (SSE) stream with real-time updates.

#### `POST /agent`

General-purpose agent endpoint for custom AI requests.

**Request Body:**
```json
{
  "content": "Your context content here",
  "prompt": "Your prompt here",
  "options": {
    "model": "provider/model-name",
    "agent": "edit"
  }
}
```

**Response:** Server-Sent Events (SSE) stream with real-time updates.

#### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "provider": "opencode"
}
```

## 🔧 Advanced Usage

### Programmatic Usage

You can import and start the server programmatically:

```javascript
import { startServer } from '@ender_romantice/vue-grab-opencode/server'

// Start on default port (6569)
await startServer()

// Or specify a custom port
await startServer(3000)
```

### Running Alongside Development Server

Add a script to your `package.json` to run both your dev server and the Opencode server:

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

## 🚨 Troubleshooting

### "Failed to create session" or Opencode connection errors

1. **Ensure Opencode is installed with Bun**:
   ```bash
   bun install @opencode-ai/sdk
   ```

2. **Check Opencode is running**:
   The server automatically starts Opencode on port 4096. Ensure this port is available.

3. **Verify installation**:
   ```bash
   bunx @opencode-ai/cli --version
   ```

### Port already in use

The server automatically skips startup if port 6569 is already in use. Use a different port:

```bash
PORT=3000 npx @ender_romantice/vue-grab-opencode
```

### No response from AI

1. Check the server logs for Opencode errors
2. Ensure you have proper Opencode configuration and API access
3. Verify the model name is correct (if specified)

## 📄 License

MIT