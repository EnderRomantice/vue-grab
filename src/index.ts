import type { SelectionBox } from "./modules/overlay";
import { copyTextToClipboard } from "./modules/clipboard";
import { hideOverlay, renderOverlay, showToast } from "./modules/overlay";
import { getElementAtMouse, getRect, getHTMLSnippet } from "./modules/dom";
import {
  normalizeKey,
  getDefaultHotkey,
  isComboPressed,
  pressedKeys,
  lastKeyDownTimestamps,
} from "./modules/hotkeys";

export type Hotkey = KeyboardEvent["key"];

export interface Options {
  adapter?: { open: (text: string) => void };
  enabled?: boolean;
  hotkey?: Hotkey | Hotkey[];
  keyHoldDuration?: number;
}

export const init = (options: Options = {}) => {
  if (options.enabled === false) return () => {};
  const resolved = {
    hotkey: options.hotkey ?? getDefaultHotkey(),
    adapter: options.adapter,
    enabled: options.enabled ?? true,
    keyHoldDuration: options.keyHoldDuration ?? 500,
  } satisfies Options;

  let mouseX = -1000;
  let mouseY = -1000;
  let hovered: Element | null = null;

  const onMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    const el = getElementAtMouse(mouseX, mouseY);
    hovered = el;
    if (el && isComboPressed(resolved.hotkey!)) {
      renderOverlay(getRect(el), el.tagName.toLowerCase());
    } else {
      hideOverlay();
    }
  };

  const onClick = async (e: MouseEvent) => {
    if (!hovered) return;
    if (!isComboPressed(resolved.hotkey!)) return;
    e.stopPropagation();
    e.preventDefault();
    try {
      const htmlSnippet = getHTMLSnippet(hovered);
      const payload = htmlSnippet;
      await copyTextToClipboard(`\n\n<referenced_element>\n${payload}\n</referenced_element>`);
      // 复制完成后：取消选框并弹出提示
      hideOverlay();
      const tag = hovered.tagName.toLowerCase();
      showToast(`<strong>copy</strong> &lt;${tag}&gt;`);
      resolved.adapter?.open?.(payload);
    } catch {}
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const k = normalizeKey(e.key);
    pressedKeys.add(k as Hotkey);
    lastKeyDownTimestamps.set(k, Date.now());
    if (hovered && isComboPressed(resolved.hotkey!)) {
      renderOverlay(getRect(hovered), hovered.tagName.toLowerCase());
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    pressedKeys.delete(normalizeKey(e.key) as Hotkey);
    if (!isComboPressed(resolved.hotkey!)) hideOverlay();
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  return () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    hideOverlay();
  };
};

if (typeof window !== "undefined" && typeof document !== "undefined") {
  init({});
}