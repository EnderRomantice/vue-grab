export type Hotkey = KeyboardEvent["key"];

export interface Options {
  adapter?: { open: (text: string) => void };
  enabled?: boolean;
  hotkey?: Hotkey | Hotkey[];
  keyHoldDuration?: number;
}

// ---------- Minimal helpers (inlined to reduce redundancy) ----------
const ATTRIBUTE_NAME = "data-vue-grab";

const normalizeKey = (key: string): string => (key.length === 1 ? key.toLowerCase() : key);
const getDefaultHotkey = (): Hotkey[] => {
  if (typeof navigator === "undefined") return ["Meta", "C"];
  const isMac = navigator.platform.toLowerCase().includes("mac");
  return isMac ? ["Meta", "c"] : ["Control", "c"];
};

const copyTextToClipboard = async (text: string) => {
  if ((navigator as any)?.clipboard?.writeText) {
    await (navigator as any).clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
};

const mountRoot = () => {
  const mountedHost = document.querySelector(`[${ATTRIBUTE_NAME}]`);
  if (mountedHost) {
    const mountedRoot = (mountedHost as HTMLElement).shadowRoot?.querySelector(`[${ATTRIBUTE_NAME}]`);
    if (mountedRoot instanceof HTMLDivElement && (mountedHost as any).shadowRoot) return mountedRoot;
  }
  const host = document.createElement("div");
  host.setAttribute(ATTRIBUTE_NAME, "true");
  host.style.zIndex = "2147483646";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "0";
  const shadowRoot = host.attachShadow({ mode: "open" });
  const root = document.createElement("div");
  root.setAttribute(ATTRIBUTE_NAME, "true");
  shadowRoot.appendChild(root);
  (document.body ?? document.documentElement).appendChild(host);
  return root;
};

type SelectionBox = { x: number; y: number; width: number; height: number };
const ensureOverlay = () => {
  const root = mountRoot();
  let box = root.querySelector(".vg-box") as HTMLDivElement | null;
  if (!box) {
    box = document.createElement("div");
    box.className = "vg-box";
    box.setAttribute(ATTRIBUTE_NAME, "true");
    box.style.position = "fixed";
    box.style.pointerEvents = "none";
    box.style.border = "2px solid #77E1D5";
    box.style.borderRadius = "6px";
    box.style.boxShadow = "0 0 0 1px rgba(119,225,213,0.3), 0 0 0 6px rgba(119,225,213,0.1)";
    box.style.zIndex = "2147483647";
    root.appendChild(box);
  }
  let label = root.querySelector(".vg-label") as HTMLDivElement | null;
  if (!label) {
    label = document.createElement("div");
    label.className = "vg-label";
    label.setAttribute(ATTRIBUTE_NAME, "true");
    label.style.position = "fixed";
    label.style.padding = "2px 6px";
    label.style.fontFamily = "system-ui, sans-serif";
    label.style.fontSize = "11px";
    label.style.color = "#222";
    label.style.background = "#77E1D5";
    label.style.borderRadius = "4px";
    label.style.boxShadow = "0 1px 4px rgba(0,0,0,0.12)";
    label.style.zIndex = "2147483647";
    root.appendChild(label);
  }
  return { root, box, label };
};

const hideOverlay = () => {
  const root = mountRoot();
  root.querySelector(".vg-box")?.remove();
  root.querySelector(".vg-label")?.remove();
};

const renderOverlay = (rect: SelectionBox, text?: string) => {
  const { box, label } = ensureOverlay();
  if (!box || !label) return;
  box.style.left = `${rect.x}px`;
  box.style.top = `${rect.y}px`;
  box.style.width = `${rect.width}px`;
  box.style.height = `${rect.height}px`;
  const labelX = rect.x;
  const labelY = Math.max(8, rect.y - 24);
  label.style.left = `${labelX}px`;
  label.style.top = `${labelY}px`;
  label.textContent = text ?? "VueGrab";
};

const getElementAtMouse = (x: number, y: number): Element | null => {
  const el = document.elementFromPoint(x, y);
  return el instanceof Element ? el : null;
};
const getRect = (el: Element): SelectionBox => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
};

const getCSSPath = (el: Element) => {
  const path: string[] = [];
  let cur: Element | null = el;
  while (cur) {
    let selector = cur.tagName.toLowerCase();
    if ((cur as HTMLElement).id) selector += `#${(cur as HTMLElement).id}`;
    const classes = (cur as HTMLElement).className?.trim()?.split(/\s+/) ?? [];
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
    const tag = ancestors[i].tagName.toLowerCase();
    const id = (ancestors[i] as HTMLElement).id;
    const cls = (ancestors[i] as HTMLElement).className;
    lines.push(indent + `<${tag}${id ? `#${id}` : ""}${cls ? ` class=\"${cls}\"` : ""}>`);
  }
  const text = (el.textContent || "").trim().replace(/\s+/g, " ");
  const truncated = text.length > 60 ? text.slice(0, 60) + "..." : text;
  const indent = "  ".repeat(ancestors.length);
  if (truncated) lines.push(indent + truncated);
  return lines.join("\n");
};

// ---------- Core (minimal) ----------
const pressedKeys = new Set<Hotkey>();
const lastKeyDownTimestamps = new Map<string, number>();
const comboWindowMs = 800;

const isComboPressed = (hotkey: Hotkey | Hotkey[]) => {
  const keys = (Array.isArray(hotkey) ? hotkey : [hotkey]).map(normalizeKey);
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