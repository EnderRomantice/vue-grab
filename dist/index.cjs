'use strict';

// src/modules/clipboard.ts
var copyTextToClipboard = async (text) => {
  const anyNav = navigator;
  if (anyNav?.clipboard?.writeText) {
    await anyNav.clipboard.writeText(text);
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

// src/modules/config.ts
var DEFAULT_COLOR = "#77E1D5";
var DEFAULT_LABEL_TEXT = "#222";
var DEFAULT_BOX_SHADOW = "0 0 0 1px rgba(143, 253, 218, 0.3), 0 0 0 6px rgba(119,225,213,0.1)";
var runtimeConfig = {
  highlight: {
    color: DEFAULT_COLOR,
    labelTextColor: DEFAULT_LABEL_TEXT,
    boxShadow: DEFAULT_BOX_SHADOW
  },
  filter: {
    ignoreSelectors: [],
    ignoreTags: [],
    skipCommonComponents: false
  },
  showTagHint: true
};
var getConfig = () => runtimeConfig;
var updateConfig = (partial) => {
  runtimeConfig = {
    ...runtimeConfig,
    ...partial,
    highlight: { ...runtimeConfig.highlight, ...partial.highlight ?? {} },
    filter: { ...runtimeConfig.filter, ...partial.filter ?? {} }
  };
};
var DEFAULTS = {
  DEFAULT_COLOR,
  DEFAULT_LABEL_TEXT,
  DEFAULT_BOX_SHADOW
};

// src/modules/overlay.ts
var ATTRIBUTE_NAME = "data-vue-grab";
var hexToRGBA = (hex, alpha) => {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
};
var mountRoot = () => {
  const mountedHost = document.querySelector(`[${ATTRIBUTE_NAME}]`);
  if (mountedHost) {
    const mountedRoot = mountedHost.shadowRoot?.querySelector(`[${ATTRIBUTE_NAME}]`);
    if (mountedRoot instanceof HTMLDivElement && mountedHost.shadowRoot) return mountedRoot;
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
var ensureOverlay = () => {
  const root = mountRoot();
  let box = root.querySelector(".vg-box");
  if (!box) {
    const { highlight } = getConfig();
    const borderColor = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    const boxShadow = highlight.boxShadow ?? DEFAULTS.DEFAULT_BOX_SHADOW;
    box = document.createElement("div");
    box.className = "vg-box";
    box.setAttribute(ATTRIBUTE_NAME, "true");
    box.style.position = "fixed";
    box.style.pointerEvents = "none";
    box.style.border = `2px solid ${borderColor}`;
    box.style.borderRadius = "6px";
    box.style.boxShadow = boxShadow;
    box.style.background = hexToRGBA(borderColor, 0.12);
    box.style.zIndex = "2147483647";
    root.appendChild(box);
  }
  let label = root.querySelector(".vg-label");
  if (!label) {
    const { highlight } = getConfig();
    const bg = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    const textColor = highlight.labelTextColor ?? DEFAULTS.DEFAULT_LABEL_TEXT;
    label = document.createElement("div");
    label.className = "vg-label";
    label.setAttribute(ATTRIBUTE_NAME, "true");
    label.style.position = "fixed";
    label.style.padding = "2px 6px";
    label.style.fontFamily = "system-ui, sans-serif";
    label.style.fontSize = "11px";
    label.style.color = textColor;
    label.style.background = bg;
    label.style.borderRadius = "4px";
    label.style.boxShadow = "0 1px 4px rgba(0,0,0,0.12)";
    label.style.zIndex = "2147483647";
    root.appendChild(label);
  }
  return { root, box, label };
};
var hideOverlay = () => {
  const root = mountRoot();
  root.querySelector(".vg-box")?.remove();
  root.querySelector(".vg-label")?.remove();
};
var renderOverlay = (rect, text) => {
  const { showTagHint } = getConfig();
  const { box, label } = ensureOverlay();
  if (!box || !label) return;
  box.style.left = `${rect.x}px`;
  box.style.top = `${rect.y}px`;
  box.style.width = `${rect.width}px`;
  box.style.height = `${rect.height}px`;
  if (showTagHint) {
    const labelX = rect.x;
    const labelY = Math.max(8, rect.y - 24);
    label.style.left = `${labelX}px`;
    label.style.top = `${labelY}px`;
    label.textContent = text ?? "VueGrab";
    label.style.display = "block";
  } else {
    label.style.display = "none";
  }
};
var showToast = (messageHTML, duration = 1600) => {
  const root = mountRoot();
  const prev = root.querySelector(".vg-toast");
  if (prev) prev.remove();
  const toast = document.createElement("div");
  toast.className = "vg-toast";
  toast.setAttribute(ATTRIBUTE_NAME, "true");
  toast.style.position = "fixed";
  toast.style.left = "50%";
  toast.style.bottom = "24px";
  toast.style.transform = "translateX(-50%)";
  toast.style.zIndex = "2147483647";
  toast.style.pointerEvents = "none";
  toast.style.padding = "6px 10px";
  toast.style.borderRadius = "6px";
  toast.style.border = "2px solid #35495e";
  toast.style.background = "#42b883";
  toast.style.color = "#35495e";
  toast.style.fontFamily = "system-ui, sans-serif";
  toast.style.fontSize = "12px";
  toast.style.fontWeight = "500";
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 120ms ease";
  toast.innerHTML = messageHTML;
  root.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });
  window.setTimeout(() => {
    toast.style.opacity = "0";
    window.setTimeout(() => toast.remove(), 180);
  }, duration);
};

// src/modules/dom.ts
var getVueComponentChain = (el) => {
  const chain = [];
  let comp = el.__vueParentComponent;
  let cursor = el;
  while (!comp && cursor?.parentElement) {
    cursor = cursor.parentElement;
    comp = cursor.__vueParentComponent;
  }
  while (comp) {
    const info = {
      name: comp?.type?.name ?? comp?.type?.__name ?? void 0,
      file: comp?.type?.__file ?? void 0
    };
    chain.unshift(info);
    comp = comp.parent;
  }
  return chain;
};
var formatVueChain = (chain) => {
  if (!chain.length) return "(no vue component)";
  const names = chain.map((c) => c.name || "Anonymous");
  const files = chain.map((c) => c.file).filter(Boolean);
  const head = names.join(" > ");
  const tail = files.length ? `
Files: ${files.join(" > ")}` : "";
  return `Vue: ${head}${tail}`;
};
var getLocatorData = (el) => {
  const vue = getVueComponentChain(el);
  const tag = el.tagName.toLowerCase();
  const id = el.id || void 0;
  const clsList = (el.className || "").trim().split(/\s+/).filter(Boolean);
  const cssPath = getCSSPath(el);
  const text = (el.textContent || "").trim().replace(/\s+/g, " ");
  const textSnippet = text.length > 160 ? text.slice(0, 160) + "..." : text;
  return {
    tag,
    id,
    classList: clsList,
    cssPath,
    textSnippet,
    vue
  };
};
var getElementAtMouse = (x, y) => {
  let el = document.elementFromPoint(x, y);
  if (!(el instanceof Element)) return null;
  const cfg = getConfig();
  const ignoreTags = (cfg.filter.ignoreTags ?? []).map((t) => t.toLowerCase());
  const commonTags = ["header", "nav", "footer", "aside"];
  const shouldIgnore = (node) => {
    const tag = node.tagName.toLowerCase();
    if (ignoreTags.includes(tag)) return true;
    if (cfg.filter.skipCommonComponents && commonTags.includes(tag)) return true;
    const selectors = cfg.filter.ignoreSelectors ?? [];
    if (selectors.length) {
      try {
        for (const sel of selectors) {
          if (sel && node.matches && node.matches(sel)) return true;
        }
      } catch {
      }
    }
    return false;
  };
  let cursor = el;
  while (cursor && shouldIgnore(cursor)) {
    cursor = cursor.parentElement;
  }
  return cursor;
};
var getRect = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
};
var getCSSPath = (el) => {
  const path = [];
  let cur = el;
  while (cur) {
    let selector = cur.tagName.toLowerCase();
    const id = cur.id;
    if (id) selector += `#${id}`;
    const classes = cur.className?.trim()?.split(/\s+/) ?? [];
    if (classes.length) selector += "." + classes.slice(0, 2).join(".");
    path.unshift(selector);
    cur = cur.parentElement;
  }
  return path.join(" > ");
};
var getHTMLSnippet = (el) => {
  const lines = [];
  const vueChain = getVueComponentChain(el);
  lines.push(formatVueChain(vueChain));
  lines.push(`
Path: ${getCSSPath(el)}`);
  lines.push("");
  const ancestors = [];
  let cur = el;
  while (cur) {
    ancestors.unshift(cur);
    cur = cur.parentElement;
  }
  for (let i = 0; i < ancestors.length; i++) {
    const indent2 = "  ".repeat(i);
    const tag = ancestors[i].tagName.toLowerCase();
    const id = ancestors[i].id;
    const cls = ancestors[i].className;
    lines.push(indent2 + `<${tag}${id ? `#${id}` : ""}${cls ? ` class="${cls}"` : ""}>`);
  }
  const text = (el.textContent || "").trim().replace(/\s+/g, " ");
  const truncated = text.length > 60 ? text.slice(0, 60) + "..." : text;
  const indent = "  ".repeat(ancestors.length);
  if (truncated) lines.push(indent + truncated);
  return lines.join("\n");
};

// src/modules/hotkeys.ts
var normalizeKey = (key) => key.length === 1 ? key.toLowerCase() : key;
var getDefaultHotkey = () => {
  if (typeof navigator === "undefined") return ["Meta", "C"];
  const isMac = navigator.platform.toLowerCase().includes("mac");
  return isMac ? ["Meta", "c"] : ["Control", "c"];
};
var pressedKeys = /* @__PURE__ */ new Set();
var lastKeyDownTimestamps = /* @__PURE__ */ new Map();
var comboWindowMs = 800;
var isComboPressed = (hotkey, holdMs) => {
  const windowMs = holdMs ?? comboWindowMs;
  const toKeys = (hk) => (Array.isArray(hk) ? hk : [hk]).map(normalizeKey);
  const keys = toKeys(hotkey);
  const isKeyActive = (k) => {
    if (k === "c") {
      const cHeld = pressedKeys.has("c");
      const cRecent = (lastKeyDownTimestamps.get("c") ?? 0) > Date.now() - windowMs;
      return cHeld || cRecent;
    }
    return pressedKeys.has(k);
  };
  if (Array.isArray(hotkey) && keys.every((k) => k.length === 1)) {
    return keys.some((k) => isKeyActive(k));
  }
  const hasC = keys.includes("c");
  const modifiers = keys.filter((k) => k !== "c");
  const modifiersHeld = modifiers.every((k) => pressedKeys.has(k));
  if (hasC) {
    return modifiersHeld && isKeyActive("c");
  }
  return keys.every((k) => pressedKeys.has(k));
};

// src/index.ts
var activeCleanup = null;
var init = (options = {}) => {
  if (options.enabled === false) return () => {
  };
  const resolved = {
    hotkey: options.hotkey ?? getDefaultHotkey(),
    adapter: options.adapter,
    enabled: options.enabled ?? true,
    keyHoldDuration: options.keyHoldDuration ?? 500
  };
  updateConfig({
    highlight: {
      color: options.highlightColor,
      labelTextColor: options.labelTextColor
    },
    filter: {
      ignoreSelectors: options.filter?.ignoreSelectors,
      ignoreTags: options.filter?.ignoreTags,
      skipCommonComponents: options.filter?.skipCommonComponents
    },
    showTagHint: options.showTagHint ?? true
  });
  try {
    activeCleanup?.();
  } catch {
  }
  let mouseX = -1e3;
  let mouseY = -1e3;
  let hovered = null;
  const onMouseMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    const el = getElementAtMouse(mouseX, mouseY);
    hovered = el;
    if (el && isComboPressed(resolved.hotkey, resolved.keyHoldDuration)) {
      renderOverlay(getRect(el), el.tagName.toLowerCase());
    } else {
      hideOverlay();
    }
  };
  const onClick = async (e) => {
    if (!hovered) return;
    if (!isComboPressed(resolved.hotkey, resolved.keyHoldDuration)) return;
    e.stopPropagation();
    e.preventDefault();
    try {
      const htmlSnippet = getHTMLSnippet(hovered);
      const locator = getLocatorData(hovered);
      const locatorJSON = JSON.stringify(locator, null, 2);
      const combined = `

<vue_grab_locator>
${locatorJSON}
</vue_grab_locator>

<referenced_element>
${htmlSnippet}
</referenced_element>`;
      await copyTextToClipboard(combined);
      hideOverlay();
      const tag = hovered.tagName.toLowerCase();
      showToast(`<strong>copy</strong> &lt;${tag}&gt;`);
      resolved.adapter?.open?.(locatorJSON);
    } catch {
    }
  };
  const onKeyDown = (e) => {
    const k = normalizeKey(e.key);
    pressedKeys.add(k);
    lastKeyDownTimestamps.set(k, Date.now());
    if (hovered && isComboPressed(resolved.hotkey, resolved.keyHoldDuration)) {
      renderOverlay(getRect(hovered), hovered.tagName.toLowerCase());
    }
  };
  const onKeyUp = (e) => {
    pressedKeys.delete(normalizeKey(e.key));
    if (!isComboPressed(resolved.hotkey, resolved.keyHoldDuration)) hideOverlay();
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

exports.init = init;
