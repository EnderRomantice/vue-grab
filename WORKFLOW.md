# vue-grab 工作流程与改造说明

## 目标
- 减少冗余代码，但保留核心功能（高亮、复制）。
- 逻辑解耦与模块化，代码更容易维护与替换。
- 实现尽量简单，避免过度语法细节与工程复杂度。

## 改造思路
1. 在 `src/modules/` 下拆分为 4 个简单模块：
   - `clipboard.ts`：复制文本到剪贴板（优先使用 Clipboard API，回退到 textarea）。
   - `overlay.ts`：负责 Shadow DOM 宿主挂载、选择框与标签渲染/隐藏。
   - `dom.ts`：DOM 辅助（鼠标元素、矩形、CSS Path、HTML 片段生成）。
   - `hotkeys.ts`：热键归一化、默认热键、按键状态、组合判断。
2. `src/index.ts` 仅保留对外类型与 `init(options)`，将事件监听与最小核心逻辑组装起来，调用上述模块。
3. 删除旧的冗余实现（此前内联的所有 helper），避免重复与耦合。

## 使用说明（开发者）
- 入口：`src/index.ts` 导出 `init(options)`，在浏览器环境会自动调用一次（保持行为一致）。
- 最小功能：按住 `Ctrl+c`（或 `⌘c`）并移动鼠标时显示高亮框，点击复制该元素的 HTML 片段到剪贴板，内容包裹在 `<referenced_element>` 中。
- 模块职责：
  - 修改复制逻辑：改 `src/modules/clipboard.ts`。
  - 修改覆盖层样式与渲染：改 `src/modules/overlay.ts`。
  - 修改 DOM 片段生成：改 `src/modules/dom.ts`。
  - 修改热键策略：改 `src/modules/hotkeys.ts`。

## 构建与分发
- 构建：`pnpm -C vue-grab build`（基于 `tsup`，输出到 `dist/`）。
- 分发：在 HTML 中使用 `dist/index.global.js`，或以 ESM/CJS 方式引入 `dist/index.js`。

## 约定式提交
- 示例：`fix: reduce redundant code while retaining core functionality`
- 建议：根据实际改动使用 `feat:`、`fix:`、`refactor:` 等前缀。

## 注意事项
- 为了简单，模块实现尽量“直给”，不做过度封装，不使用复杂类型或类结构。
- 需要更进一步瘦身时，可调整 `overlay.ts` 样式或 `dom.ts` 的 HTML 片段生成策略。
- 若希望保留此前功能产物，请谨慎重构建（重构建会覆盖 `dist/`）。

## 后续可选项
- 将自动初始化的 Dataset 解析逻辑外置或移除，进一步减少体积与复杂度。
- 提供 `adapter` 示例（如打开新窗口）作为扩展点，但不在默认实现里引入额外复杂度。