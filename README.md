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

## Quick start

> you can find index.global.js in the "/dist" directory.

```html
<script src="./dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

CDN (after publish):

```html
<script src="//unpkg.com/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

## Demo & Local Preview

- Demo page: `vue-grab/demo/index.html`
- Local preview: `http://127.0.0.1:5174/vue-grab/demo/index.html`
- Interactions:
  - Method A: hold `Ctrl`+`c` (or `⌘`+`c`), move to highlight, click to grab.
  - Method B: hold `Ctrl` (or `⌘`), quick tap `c`, then move and click within 800ms.

## Build

```bash
pnpm install
pnpm -C vue-grab build
pnpm dlx http-server . -p 5174
```

## Important

- Learning project / MVP — please don’t use in production.
- Stack extraction relies on runtime internals and may vary by environment.
- Error handling, cross-browser checks, and adapters are still in progress.

