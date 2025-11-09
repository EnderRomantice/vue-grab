# Vue Grab

> Language: English | [中文](README.zh-CN.md)

## How did this project start?

I came across the React Grab project on Twitter. It was fun and useful, and I felt Vue needed the same thing — so I created this repo.

[React Grab](https://github.com/aidenybai/react-grab)

## What it does now

- Hold `Ctrl+c` (or `⌘c`) to highlight elements; click to grab.
- Copies the element’s HTML snippet and a best-effort Vue component stack to the clipboard.
- Clipboard content is wrapped in `<referenced_element>` for easier reference in tools.
- Overlay runs in a Shadow DOM to avoid interfering with app styles.
- **Smart Vue component parsing**: Automatically extracts Vue component names and corresponding source file paths.
- **Element text extraction**: Automatically extracts target element's text content (intelligently truncates long text).
- **CSS selector path**: Automatically generates complete CSS selector paths for elements.

## Quick start

> you can find index.global.js in the "/dist" directory.

[Try of Online](https://vue-grab.vercel.app/)

local use

```html
<script src="./dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

online use:

```html
<script src="//unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

## Demo & Local Preview

- Demo page: `src/website`
- Interactions:
  - Method A: hold `Ctrl`+`c` (or `⌘`+`c`), move to highlight, click to grab.
  - Method B: hold `Ctrl` (or `⌘`), quick tap `c`, then move and click within 800ms.

## Build

```bash
pnpm install
pnpm -C vue-grab build
```

## Important

- Stack extraction relies on runtime internals and may vary by environment.
