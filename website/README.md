# Vue Grab Demo

- Hotkey: hold `Ctrl + C` (macOS: `⌘ + c`) and click an element.
- Toggle whether copied content includes the `<vue_grab_locator>` block.

## Run

```bash
pnpm install
pnpm -C website install
pnpm -C website dev
```

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
