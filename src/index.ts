import { copyTextToClipboard } from "./utils/copy-text";
import { mountRoot } from "./utils/mount-root";
import { hideOverlay, renderOverlay } from "./overlay";

export type Hotkey = KeyboardEvent["key"];

export interface Options {
  adapter?: { open: (text: string) => void };
  enabled?: boolean;
  hotkey?: Hotkey | Hotkey[];
  keyHoldDuration?: number; // reserved for future
}

const getDefaultHotkey = (): Hotkey[] => {
  if (typeof navigator === "undefined") return ["Meta", "C"];
  const isMac = navigator.platform.toLowerCase().includes("mac");
  // Normalize letter 'c' to lowercase to match KeyboardEvent.key
  return isMac ? ["Meta", "c"] : ["Control", "c"];
};

const normalizeKey = (key: string): string => {
  // For single-character keys, use lowercase; keep named keys as-is
  return key.length === 1 ? key.toLowerCase() : key;
};

const pressedKeys = new Set<Hotkey>();
const lastKeyDownTimestamps = new Map<string, number>();
const comboWindowMs = 800; // allow brief 'c' tap while holding modifier

const isComboPressed = (hotkey: Hotkey | Hotkey[]) => {
  const keys = (Array.isArray(hotkey) ? hotkey : [hotkey]).map(normalizeKey);

  // If combo includes 'c', permit recent keydown of 'c' within window while modifier is held
  const hasC = keys.includes("c");
  const modifiers = keys.filter((k) => k !== "c");
  const modifiersHeld = modifiers.every((k) => pressedKeys.has(k as Hotkey));

  if (hasC) {
    const cHeld = pressedKeys.has("c" as Hotkey);
    const cRecent = (lastKeyDownTimestamps.get("c") ?? 0) > Date.now() - comboWindowMs;
    return modifiersHeld && (cHeld || cRecent);
  }

  return keys.every((k) => pressedKeys.has(k as Hotkey));
};

const getElementAtMouse = (x: number, y: number): Element | null => {
  const el = document.elementFromPoint(x, y);
  return el instanceof Element ? el : null;
};

const getRect = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
};

// --- Vue instrumentation (MVP) ---
interface StackItem { name: string; fileName?: string }

const getVueInstance = (el: Element): any | null => {
  // Vue 3
  let cur: Element | null = el as Element | null;
  while (cur) {
    const inst = (cur as any).__vueParentComponent;
    if (inst) return inst;
    cur = cur.parentElement;
  }
  // Vue 2
  cur = el as Element | null;
  while (cur) {
    const vm = (cur as any).__vue__;
    if (vm) return vm;
    cur = cur.parentElement;
  }
  return null;
};

const getVueOwnerStack = (instOrVm: any): StackItem[] => {
  const stack: StackItem[] = [];
  if (!instOrVm) return stack;
  let cur = instOrVm;
  for (let i = 0; i < 20 && cur; i++) {
    // Vue 3
    if (cur.type) {
      const name = cur.type.name || cur.type.__name || "<Anonymous>";
      const fileName = cur.type.__file;
      stack.push({ name, fileName });
      cur = cur.parent;
      continue;
    }
    // Vue 2
    if (cur.$options) {
      const name = cur.$options.name || "<Anonymous>";
      const fileName = cur.$options.__file;
      stack.push({ name, fileName });
      cur = cur.$parent;
      continue;
    }
    break;
  }
  return stack.filter((s) => s.name && s.name.length > 1);
};

const serializeStack = (stack: StackItem[]): string => {
  return stack
    .map((s) => `${s.name}${s.fileName ? ` (${s.fileName})` : ""}`)
    .join("\n");
};

// --- HTML snippet (minimal) ---
const getElementTag = (el: Element) => {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = el.className && typeof el.className === "string" && el.className.trim()
    ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".")
    : "";
  return `<${tag}${id}${cls ? ` class=\"${el.className}\"` : ""}>`;
};

const getCSSPath = (el: Element) => {
  const path: string[] = [];
  let cur: Element | null = el;
  while (cur) {
    let selector = cur.tagName.toLowerCase();
    if (cur.id) selector += `#${cur.id}`;
    const classes = cur.className && typeof cur.className === "string" ? cur.className.trim().split(/\s+/) : [];
    if (classes.length) selector += "." + classes.slice(0, 2).join(".");
    path.unshift(selector);
    cur = cur.parentElement;
  }
  return path.join(" > ");
};

const getHTMLSnippet = (el: Element) => {
  const lines: string[] = [];
  lines.push(`Path: ${getCSSPath(el)}`);
  lines.push("");
  const ancestors: Element[] = [];
  let cur: Element | null = el;
  while (cur) {
    ancestors.unshift(cur);
    cur = cur.parentElement;
  }
  for (let i = 0; i < ancestors.length; i++) {
    const indent = "  ".repeat(i);
    lines.push(indent + getElementTag(ancestors[i]));
  }
  const text = (el.textContent || "").trim().replace(/\s+/g, " ");
  const truncated = text.length > 60 ? text.slice(0, 60) + "..." : text;
  const indent = "  ".repeat(ancestors.length);
  if (truncated) lines.push(indent + truncated);
  return lines.join("\n");
};

export const init = (options: Options = {}) => {
  if (options.enabled === false) return () => {};
  const resolved = {
    hotkey: options.hotkey ?? getDefaultHotkey(),
    adapter: options.adapter,
    enabled: options.enabled ?? true,
    keyHoldDuration: options.keyHoldDuration ?? 500,
  } satisfies Options;

  const root = mountRoot();
  let mouseX = -1000;
  let mouseY = -1000;
  let hovered: Element | null = null;

  const onMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    const el = getElementAtMouse(mouseX, mouseY);
    hovered = el;
    if (el && isComboPressed(resolved.hotkey!)) {
      const rect = getRect(el);
      renderOverlay(rect, el.tagName.toLowerCase());
    } else {
      hideOverlay();
    }
  };

  const onMouseDown = (e: MouseEvent) => {
    if (!hovered) return;
    if (!isComboPressed(resolved.hotkey!)) return;
    e.stopPropagation();
    e.preventDefault();
  };

  const onClick = async (e: MouseEvent) => {
    if (!hovered) return;
    if (!isComboPressed(resolved.hotkey!)) return;
    e.stopPropagation();
    e.preventDefault();
    try {
      const htmlSnippet = getHTMLSnippet(hovered);
      const inst = getVueInstance(hovered);
      const stack = serializeStack(getVueOwnerStack(inst));
      const payload = stack
        ? `${htmlSnippet}\n\nComponent owner stack:\n${stack}`
        : htmlSnippet;
      await copyTextToClipboard(`\n\n<referenced_element>\n${payload}\n</referenced_element>`);
      if (resolved.adapter?.open) {
        resolved.adapter.open(payload);
      }
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
  window.addEventListener("mousedown", onMouseDown, true);
  window.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  return () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mousedown", onMouseDown, true);
    window.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    hideOverlay();
  };
};

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const currentScript = document.currentScript as HTMLScriptElement | null;
  const options: Options = {};
  if (currentScript?.dataset) {
    const { adapter, enabled, hotkey, keyHoldDuration } = currentScript.dataset as any;
    if (enabled !== undefined) options.enabled = enabled === "true";
    if (hotkey !== undefined) {
      const keys = hotkey
        .split(",")
        .map((k: string) => normalizeKey(k.trim()));
      options.hotkey = keys.length === 1 ? keys[0] : keys;
    }
    if (keyHoldDuration !== undefined) {
      const d = Number(keyHoldDuration);
      if (!Number.isNaN(d)) options.keyHoldDuration = d;
    }
    if (adapter !== undefined) {
      // reserved for future: adapter="cursor"
    }
  }
  init(options);
}