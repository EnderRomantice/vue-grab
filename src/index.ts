import { copyTextToClipboard } from "./modules/clipboard";
import { hideOverlay, renderOverlay, showToast } from "./modules/overlay";
import { getElementAtMouse, getRect, getHTMLSnippet, getLocatorData } from "./modules/dom";
import { updateConfig } from "./modules/config";
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
  // New configurations
  highlightColor?: string;
  labelTextColor?: string;
  showTagHint?: boolean;
  filter?: {
    ignoreSelectors?: string[];
    ignoreTags?: string[];
    skipCommonComponents?: boolean;
  };
}

// Ensure single active instance: re-init will clean up previous listeners
let activeCleanup: (() => void) | null = null;

export const init = (options: Options = {}) => {
  if (options.enabled === false) return () => {};
  const resolved = {
    hotkey: options.hotkey ?? getDefaultHotkey(),
    adapter: options.adapter,
    enabled: options.enabled ?? true,
    keyHoldDuration: options.keyHoldDuration ?? 500,
  } satisfies Options;

  // Apply runtime UI/behavior configuration
  updateConfig({
    highlight: {
      color: options.highlightColor,
      labelTextColor: options.labelTextColor,
    },
    filter: {
      ignoreSelectors: options.filter?.ignoreSelectors,
      ignoreTags: options.filter?.ignoreTags,
      skipCommonComponents: options.filter?.skipCommonComponents,
    },
    showTagHint: options.showTagHint ?? true,
  });

  // If already initialized, clean up previous listeners to avoid duplicates
  try {
    activeCleanup?.();
  } catch {}

  let mouseX = -1000;
  let mouseY = -1000;
  let hovered: Element | null = null;

  const onMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    const el = getElementAtMouse(mouseX, mouseY);
    hovered = el;
    if (el && isComboPressed(resolved.hotkey!, resolved.keyHoldDuration)) {
      renderOverlay(getRect(el), el.tagName.toLowerCase());
    } else {
      hideOverlay();
    }
  };

  const onClick = async (e: MouseEvent) => {
    if (!hovered) return;
    if (!isComboPressed(resolved.hotkey!, resolved.keyHoldDuration)) return;
    e.stopPropagation();
    e.preventDefault();
    try {
      const htmlSnippet = getHTMLSnippet(hovered);
      const locator = getLocatorData(hovered);
      const locatorJSON = JSON.stringify(locator, null, 2);
      const combined = `\n\n<vue_grab_locator>\n${locatorJSON}\n</vue_grab_locator>\n\n<referenced_element>\n${htmlSnippet}\n</referenced_element>`;
      await copyTextToClipboard(combined);
      hideOverlay();
      const tag = hovered.tagName.toLowerCase();
      showToast(`<strong>copy</strong> &lt;${tag}&gt;`);
      resolved.adapter?.open?.(locatorJSON);
    } catch {}
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const k = normalizeKey(e.key);
    pressedKeys.add(k as Hotkey);
    lastKeyDownTimestamps.set(k, Date.now());
    if (hovered && isComboPressed(resolved.hotkey!, resolved.keyHoldDuration)) {
      renderOverlay(getRect(hovered), hovered.tagName.toLowerCase());
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    pressedKeys.delete(normalizeKey(e.key) as Hotkey);
    if (!isComboPressed(resolved.hotkey!, resolved.keyHoldDuration)) hideOverlay();
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  const cleanup = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    hideOverlay();
  };
  activeCleanup = cleanup;
  return cleanup;
};

if (typeof window !== "undefined" && typeof document !== "undefined") {
  init({});
}