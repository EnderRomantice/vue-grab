# Vue Grab Demo

- Hotkey: hold `Ctrl + C` (macOS: `⌘ + c`) and click an element.
- Toggle whether copied content includes the `<vue_grab_locator>` block.

## Run

```bash
pnpm install
pnpm -C website install
pnpm -C website dev
```

This command will simultaneously start:
- Vite dev server at `http://localhost:5173`
- Opencode bridge server at `http://localhost:6567`

> **Note**: For AI editing functionality, you need to:
> 1. Set up your API key in the configuration panel
> 2. Enable AI agent in the configuration panel
> 3. Use `Ctrl+X` while hovering over an element to invoke AI editing

## Configure

The demo uses:

```ts
import { init } from '@ender_romantice/vue-grab'

init({
  enabled: true,
  hotkey: ['c','v'],
  keyHoldDuration: 500,
  includeLocatorTag: true
})
```

Use the toggle on the page to switch `includeLocatorTag` ON/OFF.
