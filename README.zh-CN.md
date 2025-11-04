# Vue Grab

> 语言：中文 | [English](README.md)
>
> 中文：此文件。English：请查看 `README.md`。

## 这个项目是怎么来的？

我在刷推特的时候发现了 React Grab 这个项目，这很有趣，我认为 Vue 也需要这个，所以我创建了这个仓库。

[React Grab 项目地址](https://github.com/aidenybai/react-grab)

## 目前能做什么

- 按住 `Ctrl+c`（或 `⌘c`）移动鼠标，高亮目标元素；点击即可抓取。
- 将目标元素的 HTML 片段和（尽力解析的） Vue 组件栈复制到剪贴板。
- 剪贴板里会包含一个 `<referenced_element>` 包裹，方便在工具里定位引用。
- 覆盖层（Overlay）挂在 Shadow DOM，尽量不影响业务页面样式。

## 快速试用

[在线体验](https://vue-grab.vercel.app/)

> 你可以在 “/dist” 目录下找到index.golobal.js

本地使用:

```html
<script src="./dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

在线使用:

```html
<script src="//unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"></script>
```

## Demo 与本地预览

- Demo 页面：`src/website`
- 操作方法：
  - 方式 A：按住 `Ctrl`+`c`（或 `⌘`+`c`），移动到元素上出现高亮，点击抓取。
  - 方式 B：按住 `Ctrl`（或 `⌘`），快速点按 `c`，在 800ms 内移动并点击。

## 构建

```bash
pnpm install
pnpm -C vue-grab build
```

## 重要说明

- 组件栈解析依赖运行时的内部属性，不同环境可能表现不同。
