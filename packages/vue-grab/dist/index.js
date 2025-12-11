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
  textarea.style.outline = "none";
  textarea.style.border = "none";
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
  showTagHint: true,
  includeLocatorTag: true
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
    const mountedRoot = mountedHost.shadowRoot?.querySelector(
      `[${ATTRIBUTE_NAME}]`
    );
    if (mountedRoot instanceof HTMLDivElement && mountedHost.shadowRoot)
      return mountedRoot;
  }
  const host = document.createElement("div");
  host.setAttribute(ATTRIBUTE_NAME, "true");
  host.style.zIndex = "2147483646";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "0";
  const shadowRoot = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = `
    .vg-element, [class*="vg-element-"], .vg-box, .vg-label, .vg-label-2, .vg-crosshair-x, .vg-crosshair-y {
       transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      opacity: 0;
    }
    .vg-visible, [class^="vg-element-"].vg-visible, [class*=" vg-visible"] {
      opacity: 1;
    }
    .vg-box, [class^="vg-box-"] {
      border: 2px dashed;
      border-radius: 6px;
      position: fixed;
      pointer-events: none;
      z-index: 2147483647;
    }
    .vg-label, .vg-label-2, [class^="vg-label-"] {
      position: fixed;
      padding: 2px 6px;
      font-family: system-ui, sans-serif;
      font-size: 11px;
      border-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
      z-index: 2147483647;
    }
    .vg-label-2, [class^="vg-label-2-"] {
      max-width: 40vw;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #f8fafc;
      background: #35495e;
    }
    .vg-crosshair-x, [class^="vg-crosshair-x-"] {
      position: fixed;
      pointer-events: none;
      left: 0;
      width: 100vw;
      border-top: 1px dashed;
      z-index: 2147483647;
    }
    .vg-crosshair-y, [class^="vg-crosshair-y-"] {
      position: fixed;
      pointer-events: none;
      top: 0;
      height: 100vh;
      border-left: 1px dashed;
      z-index: 2147483647;
    }
    .vg-input {
      background: transparent;
      border: none;
      color: white;
      font-size: 11px;
      font-family: inherit;
      outline: none;
      width: 150px;
    }
    .vg-spinner {
      width: 10px;
      height: 10px;
      border: 2px solid #f8fafc;
      border-top-color: transparent;
      border-radius: 50%;
      display: inline-block;
      animation: vg-spin 1s linear infinite;
      margin-right: 6px;
      vertical-align: middle;
      box-sizing: border-box;
    }
    @keyframes vg-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .vg-toast {
      position: fixed;
      left: 50%;
      bottom: 24px;
      transform: translateX(-50%);
      z-index: 2147483647;
      pointer-events: none;
      padding: 6px 10px;
      border-radius: 6px;
      border: 2px solid #35495e;
      background: #42b883;
      color: #35495e;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: opacity 120ms ease;
    }
  `;
  shadowRoot.appendChild(style);
  const root = document.createElement("div");
  root.setAttribute(ATTRIBUTE_NAME, "true");
  shadowRoot.appendChild(root);
  (document.body ?? document.documentElement).appendChild(host);
  return root;
};
var ensureOverlay = (sessionId) => {
  const root = mountRoot();
  const suffix = sessionId ? `-${sessionId}` : "";
  let box = root.querySelector(`.vg-box.vg-element${suffix}`);
  if (!box) {
    const { highlight } = getConfig();
    const borderColor = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    const boxShadow = highlight.boxShadow ?? DEFAULTS.DEFAULT_BOX_SHADOW;
    box = document.createElement("div");
    box.className = `vg-box vg-element${suffix}`;
    box.setAttribute(ATTRIBUTE_NAME, "true");
    box.style.borderColor = borderColor;
    box.style.boxShadow = boxShadow;
    box.style.background = hexToRGBA(borderColor, 0.12);
    root.appendChild(box);
  }
  let label = root.querySelector(`.vg-label.vg-element${suffix}`);
  if (!label) {
    const { highlight } = getConfig();
    const bg = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    const textColor = highlight.labelTextColor ?? DEFAULTS.DEFAULT_LABEL_TEXT;
    label = document.createElement("div");
    label.className = `vg-label vg-element${suffix}`;
    label.setAttribute(ATTRIBUTE_NAME, "true");
    label.style.color = textColor;
    label.style.background = bg;
    root.appendChild(label);
  }
  let label2 = root.querySelector(`.vg-label-2.vg-element${suffix}`);
  if (!label2) {
    label2 = document.createElement("div");
    label2.className = `vg-label-2 vg-element${suffix}`;
    label2.setAttribute(ATTRIBUTE_NAME, "true");
    root.appendChild(label2);
  }
  let crossX = root.querySelector(`.vg-crosshair-x.vg-element${suffix}`);
  if (!crossX) {
    const { highlight } = getConfig();
    const borderColor = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    crossX = document.createElement("div");
    crossX.className = `vg-crosshair-x vg-element${suffix}`;
    crossX.setAttribute(ATTRIBUTE_NAME, "true");
    crossX.style.position = "fixed";
    crossX.style.pointerEvents = "none";
    crossX.style.left = "0";
    crossX.style.width = "100vw";
    crossX.style.borderTop = `1px dashed ${borderColor}`;
    crossX.style.zIndex = "2147483647";
    root.appendChild(crossX);
  }
  let crossY = root.querySelector(`.vg-crosshair-y.vg-element${suffix}`);
  if (!crossY) {
    const { highlight } = getConfig();
    const borderColor = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    crossY = document.createElement("div");
    crossY.className = `vg-crosshair-y vg-element${suffix}`;
    crossY.setAttribute(ATTRIBUTE_NAME, "true");
    crossY.style.position = "fixed";
    crossY.style.pointerEvents = "none";
    crossY.style.top = "0";
    crossY.style.height = "100vh";
    crossY.style.borderLeft = `1px dashed ${borderColor}`;
    crossY.style.zIndex = "2147483647";
    root.appendChild(crossY);
  }
  return { root, box, label, label2, crossX, crossY };
};
var hideOverlay = (sessionId) => {
  const root = mountRoot();
  const suffix = "";
  const elements = root.querySelectorAll(`.vg-element${suffix}`);
  elements.forEach((el) => {
    el.classList.remove("vg-visible");
  });
};
var renderOverlay = (rect, text, cursor, secondaryText, sessionId) => {
  const { showTagHint } = getConfig();
  const { box, label, label2, crossX, crossY } = ensureOverlay(sessionId);
  if (!box || !label || !label2) return;
  box.classList.add("vg-visible");
  if (crossX) crossX.classList.add("vg-visible");
  if (crossY) crossY.classList.add("vg-visible");
  box.style.left = `${rect.x}px`;
  box.style.top = `${rect.y}px`;
  box.style.width = `${rect.width}px`;
  box.style.height = `${rect.height}px`;
  const cx = cursor?.x ?? Math.round(rect.x + rect.width / 2);
  const cy = cursor?.y ?? Math.round(rect.y + rect.height / 2);
  if (crossX) crossX.style.top = `${cy}px`;
  if (crossY) crossY.style.left = `${cx}px`;
  if (showTagHint) {
    const { highlight } = getConfig();
    const bg = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    const textColor = highlight.labelTextColor ?? DEFAULTS.DEFAULT_LABEL_TEXT;
    label.style.background = bg;
    label.style.color = textColor;
    const labelX = rect.x;
    const labelY = Math.max(8, rect.y - 24);
    label.style.left = `${labelX}px`;
    label.style.top = `${labelY}px`;
    label.textContent = text ?? "VueGrab";
    label.classList.add("vg-visible");
    label2.textContent = secondaryText ?? "";
    const gap = 8;
    const labelWidth = label.getBoundingClientRect().width || label.offsetWidth || 0;
    const x2 = labelX + labelWidth + gap;
    label2.style.left = `${x2}px`;
    label2.style.top = `${labelY}px`;
    if (secondaryText) {
      label2.classList.add("vg-visible");
    } else {
      label2.classList.remove("vg-visible");
    }
  } else {
    label.classList.remove("vg-visible");
    label2.classList.remove("vg-visible");
  }
};
var renderInput = (rect, initialText, onSubmit, sessionId, onCancel) => {
  const { box, label, label2, crossX, crossY } = ensureOverlay(sessionId);
  if (!label || !label2) return;
  const currentBoxLeft = parseFloat(box.style.left || "0");
  const currentBoxTop = parseFloat(box.style.top || "0");
  const currentBoxWidth = parseFloat(box.style.width || "0");
  const currentBoxHeight = parseFloat(box.style.height || "0");
  if (currentBoxLeft === 0 && currentBoxTop === 0 && currentBoxWidth === 0 && currentBoxHeight === 0) {
    box.style.left = `${rect.x}px`;
    box.style.top = `${rect.y}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
  }
  box.classList.add("vg-visible");
  if (crossX) crossX.classList.remove("vg-visible");
  if (crossY) crossY.classList.remove("vg-visible");
  const labelX = rect.x;
  const labelY = Math.max(8, rect.y - 24);
  label.style.left = `${labelX}px`;
  label.style.top = `${labelY}px`;
  label.textContent = "Wait..";
  label.classList.add("vg-visible");
  label2.innerHTML = "";
  label2.classList.add("vg-visible");
  label2.style.pointerEvents = "auto";
  label2.addEventListener("click", (e) => e.stopPropagation());
  const gap = 8;
  const labelWidth = label.getBoundingClientRect().width || label.offsetWidth || 40;
  const x2 = labelX + labelWidth + gap;
  label2.style.left = `${x2}px`;
  label2.style.top = `${labelY}px`;
  const input = document.createElement("input");
  input.className = "vg-input";
  input.value = "";
  input.placeholder = "Input prompt...";
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const value = input.value;
      label2.innerHTML = "";
      const spinner = document.createElement("span");
      spinner.className = "vg-spinner";
      const loadingText = document.createElement("span");
      loadingText.textContent = " Loading...";
      label2.appendChild(spinner);
      label2.appendChild(loadingText);
      onSubmit(value);
    }
    e.stopPropagation();
  });
  input.addEventListener("click", (e) => e.stopPropagation());
  const handleOutsideClick = (e) => {
    const clickedElement = e.target;
    if (!input.contains(clickedElement) && !label2.contains(clickedElement)) {
      document.removeEventListener("click", handleOutsideClick);
      if (onCancel) {
        onCancel();
      }
      if (sessionId) {
        cleanupSessionOverlay(sessionId);
      } else {
        hideOverlay();
      }
    }
  };
  document.addEventListener("click", handleOutsideClick);
  const handleEscapeKey = (e) => {
    if (e.key === "Escape") {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
      if (onCancel) {
        onCancel();
      }
      if (sessionId) {
        cleanupSessionOverlay(sessionId);
      } else {
        hideOverlay();
      }
    }
  };
  document.addEventListener("keydown", handleEscapeKey);
  const originalOnSubmit = onSubmit;
  const wrappedOnSubmit = (value) => {
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener("keydown", handleEscapeKey);
    originalOnSubmit(value);
  };
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const value = input.value;
      label2.innerHTML = "";
      const spinner = document.createElement("span");
      spinner.className = "vg-spinner";
      const loadingText = document.createElement("span");
      loadingText.textContent = " Loading...";
      label2.appendChild(spinner);
      label2.appendChild(loadingText);
      wrappedOnSubmit(value);
    }
    e.stopPropagation();
  });
  label2.appendChild(input);
  input.focus();
  return input;
};
var renderLoading = (elapsedTime, sessionId, rect) => {
  const { box, label, label2, crossX, crossY } = ensureOverlay(sessionId);
  if (!label || !label2) return;
  if (box) box.classList.add("vg-visible");
  if (crossX) crossX.classList.remove("vg-visible");
  if (crossY) crossY.classList.remove("vg-visible");
  label.textContent = "Loading..";
  label.classList.add("vg-visible");
  let labelX, labelY;
  if (rect) {
    labelX = rect.x;
    labelY = Math.max(8, rect.y - 24);
  } else {
    labelX = parseFloat(box.style.left || "0");
    const boxY = parseFloat(box.style.top || "0");
    labelY = Math.max(8, boxY - 24);
  }
  label.style.left = `${labelX}px`;
  label.style.top = `${labelY}px`;
  void label.offsetHeight;
  const gap = 8;
  const labelWidth = label.offsetWidth || label.getBoundingClientRect().width || 50;
  const x2 = labelX + labelWidth + gap;
  label2.style.left = `${x2}px`;
  label2.style.top = `${labelY}px`;
  label2.innerHTML = "";
  const spinner = document.createElement("span");
  spinner.className = "vg-spinner";
  label2.appendChild(spinner);
  const timer = document.createElement("span");
  timer.textContent = elapsedTime;
  label2.appendChild(timer);
  label2.classList.add("vg-visible");
};
var renderResult = (status, message, sessionId, rect) => {
  const { box, label, label2, crossX, crossY } = ensureOverlay(sessionId);
  if (!label || !label2) return;
  if (box) box.classList.add("vg-visible");
  if (crossX) crossX.classList.remove("vg-visible");
  if (crossY) crossY.classList.remove("vg-visible");
  let labelX, labelY;
  if (rect) {
    labelX = rect.x;
    labelY = Math.max(8, rect.y - 24);
  } else {
    labelX = parseFloat(label.style.left || "0");
    labelY = parseFloat(label.style.top || "0");
    if (isNaN(labelX) || labelX === 0) {
      labelX = parseFloat(box.style.left || "0");
    }
    if (isNaN(labelY) || labelY === 0) {
      const boxY = parseFloat(box.style.top || "0");
      labelY = Math.max(8, boxY - 24);
    }
  }
  label.style.left = `${labelX}px`;
  label.style.top = `${labelY}px`;
  if (status === "done") {
    label.textContent = "\u221A Done";
    label.style.background = "#42b883";
    label.style.color = "#35495e";
  } else if (status === "timeout") {
    label.textContent = "\xD7 Timeout";
    label.style.background = "#e6a23c";
    label.style.color = "white";
  } else {
    label.textContent = message ? `\xD7 ${message}` : "\xD7 Error";
    label.style.background = "#e74c3c";
    label.style.color = "white";
  }
  label.classList.add("vg-visible");
  label2.classList.remove("vg-visible");
  label2.innerHTML = "";
};
var showToast = (messageHTML, duration = 1600) => {
  const root = mountRoot();
  const prev = root.querySelector(".vg-toast");
  if (prev) prev.remove();
  const toast = document.createElement("div");
  toast.className = "vg-toast";
  toast.setAttribute(ATTRIBUTE_NAME, "true");
  toast.style.opacity = "0";
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
var cleanupSessionOverlay = (sessionId) => {
  const root = mountRoot();
  const suffix = `-${sessionId}`;
  const selectors = [
    `.vg-element${suffix}`,
    `[class*="vg-element${suffix}"]`,
    `[class$="vg-element${suffix}"]`
  ];
  selectors.forEach((selector) => {
    const elements = root.querySelectorAll(selector);
    elements.forEach((el) => {
      el.classList.remove("vg-visible");
    });
  });
  const allElements = root.querySelectorAll('[class*="vg-"]');
  allElements.forEach((el) => {
    const className = el.className;
    if (typeof className === "string" && className.includes(sessionId)) {
      el.classList.remove("vg-visible");
    }
  });
  setTimeout(() => {
    selectors.forEach((selector) => {
      const elements = root.querySelectorAll(selector);
      elements.forEach((el) => {
        el.remove();
      });
    });
    allElements.forEach((el) => {
      const className = el.className;
      if (typeof className === "string" && className.includes(sessionId)) {
        el.remove();
      }
    });
  }, 400);
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
  while (el) {
    const root = el.getRootNode();
    if (root instanceof ShadowRoot) {
      const host = root.host;
      if (host && host.hasAttribute && host.hasAttribute("data-vue-grab")) {
        const originalDisplay = host.style.display;
        host.style.display = "none";
        try {
          const underlyingEl = document.elementFromPoint(x, y);
          host.style.display = originalDisplay;
          if (underlyingEl && underlyingEl !== host) {
            el = underlyingEl;
            continue;
          }
        } catch (e) {
          host.style.display = originalDisplay;
        }
      }
    }
    if (!(el instanceof Element)) return null;
    const cfg = getConfig();
    const ignoreTags = (cfg.filter.ignoreTags ?? []).map((t) => t.toLowerCase());
    const commonTags = ["header", "nav", "footer", "aside"];
    const shouldIgnore = (node) => {
      const tag = node.tagName.toLowerCase();
      if (ignoreTags.includes(tag)) return true;
      if (cfg.filter.skipCommonComponents && commonTags.includes(tag))
        return true;
      const selectors = cfg.filter.ignoreSelectors ?? [];
      if (selectors.length) {
        try {
          for (const sel of selectors) {
            if (sel && node.matches && node.matches(sel))
              return true;
          }
        } catch {
        }
      }
      return false;
    };
    if (shouldIgnore(el)) {
      el = el.parentElement;
      continue;
    }
    break;
  }
  return el;
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
    lines.push(
      indent2 + `<${tag}${id ? `#${id}` : ""}${cls ? ` class="${cls}"` : ""}>`
    );
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
var isComboPressed = (hotkey, holdMs) => {
  const toKeys = (hk) => (Array.isArray(hk) ? hk : [hk]).map(normalizeKey);
  const keys = toKeys(hotkey);
  const isKeyActive = (k) => {
    return pressedKeys.has(k);
  };
  if (Array.isArray(hotkey) && keys.every((k) => k.length === 1)) {
    return keys.some((k) => isKeyActive(k));
  }
  return keys.every((k) => isKeyActive(k));
};

// src/state.ts
var StateManager = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set();
    this.state = {
      mouseX: -1e3,
      mouseY: -1e3,
      hoveredElement: null,
      hoveredRect: null,
      isActive: false,
      isInputMode: false,
      inputText: "",
      sessions: /* @__PURE__ */ new Map(),
      lastRenderKey: "",
      rafPending: false,
      rafId: null
    };
  }
  getState() {
    return this.state;
  }
  setState(updater) {
    this.state = updater(this.state);
    this.notifyListeners();
  }
  updateState(partial) {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }
  // 会话管理辅助方法
  addSession(session) {
    this.setState((prev) => ({
      ...prev,
      sessions: new Map(prev.sessions).set(session.id, session)
    }));
  }
  updateSession(sessionId, updates) {
    this.setState((prev) => {
      const session = prev.sessions.get(sessionId);
      if (!session) return prev;
      const updatedSession = { ...session, ...updates };
      const newSessions = new Map(prev.sessions);
      newSessions.set(sessionId, updatedSession);
      return { ...prev, sessions: newSessions };
    });
  }
  removeSession(sessionId) {
    this.setState((prev) => {
      const newSessions = new Map(prev.sessions);
      newSessions.delete(sessionId);
      return { ...prev, sessions: newSessions };
    });
  }
  getSession(sessionId) {
    return this.state.sessions.get(sessionId);
  }
  hasActiveSessions() {
    return this.state.sessions.size > 0;
  }
  clearSessions() {
    this.setState((prev) => ({
      ...prev,
      sessions: /* @__PURE__ */ new Map()
    }));
  }
};
var stateManager = new StateManager();

// src/modules/agent-manager.ts
var AgentManager = class {
  constructor() {
    this.abortControllers = /* @__PURE__ */ new Map();
    this.sessionElements = /* @__PURE__ */ new Map();
  }
  setProvider(provider) {
    this.provider = provider;
  }
  getProvider() {
    return this.provider;
  }
  isProcessing() {
    return stateManager.getState().sessions.size > 0;
  }
  async startSession(params) {
    const { element, prompt, position, selectionBounds, sessionId } = params;
    const provider = this.provider;
    if (!provider) {
      console.warn("No agent provider configured");
      return;
    }
    const locator = getLocatorData(element);
    const htmlSnippet = getHTMLSnippet(element);
    const context = {
      content: htmlSnippet,
      prompt,
      options: { locator, htmlSnippet }
    };
    const tagName = element.tagName.toLowerCase();
    const componentName = void 0;
    const session = {
      id: sessionId || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      context,
      lastStatus: "Thinking\u2026",
      isStreaming: true,
      createdAt: Date.now(),
      position,
      selectionBounds,
      tagName,
      componentName,
      element,
      errorRendered: false,
      completedRendered: false
    };
    stateManager.addSession(session);
    this.sessionElements.set(session.id, element);
    const abortController = new AbortController();
    this.abortControllers.set(session.id, abortController);
    try {
      const streamIterator = provider.send(context, abortController.signal);
      this.executeSessionStream(session, streamIterator);
    } catch (error) {
      console.error("Failed to start session:", error);
      stateManager.updateSession(session.id, { isStreaming: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
  }
  async executeSessionStream(session, streamIterator) {
    const timeoutMs = 3e4;
    let wasAborted = false;
    const timeoutId = setTimeout(() => {
      if (stateManager.getSession(session.id)) {
        stateManager.updateSession(session.id, { isStreaming: false, error: "timeout" });
        this.abortControllers.get(session.id)?.abort();
      }
    }, timeoutMs);
    try {
      for await (const status of streamIterator) {
        const currentSession = stateManager.getSession(session.id);
        if (!currentSession) break;
        stateManager.updateSession(session.id, { lastStatus: status });
      }
      const finalSession = stateManager.getSession(session.id);
      if (finalSession) {
        stateManager.updateSession(session.id, { isStreaming: false });
        setTimeout(() => {
          this.dismissSession(session.id);
        }, 2e3);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        wasAborted = true;
      } else {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        stateManager.updateSession(session.id, { isStreaming: false, error: errorMessage });
        setTimeout(() => {
          this.dismissSession(session.id);
        }, 2e3);
      }
    } finally {
      clearTimeout(timeoutId);
      this.abortControllers.delete(session.id);
      if (wasAborted) {
        this.sessionElements.delete(session.id);
        stateManager.removeSession(session.id);
        cleanupSessionOverlay(session.id);
      }
    }
  }
  abortSession(sessionId) {
    const controller = this.abortControllers.get(sessionId);
    if (controller) {
      controller.abort();
    }
  }
  abortAllSessions() {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
    stateManager.clearSessions();
  }
  dismissSession(sessionId) {
    cleanupSessionOverlay(sessionId);
    this.sessionElements.delete(sessionId);
    stateManager.removeSession(sessionId);
  }
  undoSession(sessionId) {
    const session = stateManager.getSession(sessionId);
    if (session) {
      this.sessionElements.get(sessionId);
    }
    this.dismissSession(sessionId);
  }
  updateSessionBoundsOnViewportChange() {
    const state = stateManager.getState();
    if (state.sessions.size === 0) return;
    let updated = false;
    const newSessions = new Map(state.sessions);
    const sessionsToDismiss = [];
    for (const [sessionId, session] of state.sessions) {
      const element = this.sessionElements.get(sessionId);
      if (element && document.contains(element)) {
        const rect = element.getBoundingClientRect();
        const newBounds = {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        };
        let updatedPosition = session.position;
        const oldBounds = session.selectionBounds;
        if (oldBounds) {
          const oldCenterX = oldBounds.x + oldBounds.width / 2;
          const offsetX = session.position.x - oldCenterX;
          const newCenterX = newBounds.x + newBounds.width / 2;
          updatedPosition = { ...session.position, x: newCenterX + offsetX };
        }
        newSessions.set(sessionId, {
          ...session,
          selectionBounds: newBounds,
          position: updatedPosition
        });
        updated = true;
      } else {
        sessionsToDismiss.push(sessionId);
      }
    }
    for (const sessionId of sessionsToDismiss) {
      this.dismissSession(sessionId);
    }
    if (updated) {
      stateManager.updateState({ sessions: newSessions });
    }
  }
  getSessionElement(sessionId) {
    return this.sessionElements.get(sessionId);
  }
};
var agentManager = new AgentManager();

// src/modules/provider.ts
var AGENT_ENDPOINTS = {
  claude: "http://127.0.0.1:3000/api/code-edit",
  opencode: "http://127.0.0.1:6569/api/code-edit"
};
function createProvider(options) {
  const endpoint = options.endpoint || AGENT_ENDPOINTS[options.type];
  return {
    async *send(context, signal) {
      const { prompt, options: ctxOptions } = context;
      if (!ctxOptions) throw new Error("Missing locator and htmlSnippet");
      const { locator, htmlSnippet } = ctxOptions;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          locator,
          htmlSnippet,
          agentConfig: {
            ...options.provider && { provider: options.provider },
            ...options.model && { model: options.model },
            ...options.apiKey && { apiKey: options.apiKey }
          }
        }),
        signal
      });
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "message";
      try {
        while (true) {
          const { done: streamDone, value: chunk } = await reader.read();
          if (streamDone) break;
          buffer += decoder.decode(chunk, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            if (trimmed.startsWith("event: ")) {
              currentEvent = trimmed.slice(7).trim();
            } else if (trimmed.startsWith("data: ")) {
              const data = trimmed.slice(6);
              if (currentEvent === "error") {
                throw new Error(data);
              } else if (currentEvent === "done") {
                return;
              } else {
                let preview = data;
                try {
                  const json = JSON.parse(data);
                  if (json.type === "fragment") preview = "Generating...";
                  else if (json.message) preview = json.message;
                } catch {
                }
                yield preview;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
    supportsResume: false,
    getCompletionMessage: () => "Done"
  };
}

// src/modules/renderer.ts
var animationFrameId = null;
var lastDisplayedSeconds = /* @__PURE__ */ new Map();
function renderSessions() {
  const state = stateManager.getState();
  for (const sessionId of lastDisplayedSeconds.keys()) {
    if (!state.sessions.has(sessionId)) {
      lastDisplayedSeconds.delete(sessionId);
    }
  }
  let hasActiveStreamingSessions = false;
  for (const [sessionId, session] of state.sessions) {
    const rect = session.selectionBounds;
    if (session.isStreaming) {
      hasActiveStreamingSessions = true;
      const elapsedMs = Date.now() - session.createdAt;
      const elapsedSec = (elapsedMs / 1e3).toFixed(3);
      renderLoading(`${elapsedSec} s`, sessionId, rect);
    } else if (session.error && !session.errorRendered) {
      stateManager.updateSession(sessionId, { errorRendered: true });
      lastDisplayedSeconds.delete(sessionId);
      if (session.error === "timeout") {
        renderResult("timeout", void 0, sessionId, rect);
      } else {
        renderResult("error", session.error, sessionId, rect);
      }
    } else if (!session.isStreaming && !session.completedRendered && !session.error) {
      stateManager.updateSession(sessionId, { completedRendered: true });
      lastDisplayedSeconds.delete(sessionId);
      renderResult("done", void 0, sessionId, rect);
    }
  }
  if (!hasActiveStreamingSessions) {
    stopRenderLoop();
  }
}
function renderLoop() {
  renderSessions();
  const state = stateManager.getState();
  if (state.sessions.size > 0) {
    animationFrameId = requestAnimationFrame(renderLoop);
  } else {
    animationFrameId = null;
  }
}
function startRenderLoop() {
  if (animationFrameId === null) {
    animationFrameId = requestAnimationFrame(renderLoop);
  }
}
function stopRenderLoop() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// src/index.ts
var activeCleanup = null;
var init = (options = {}) => {
  if (options.enabled === false) return () => {
  };
  if (!document.head.querySelector("style[data-vue-grab-global]")) {
    const style = document.createElement("style");
    style.setAttribute("data-vue-grab-global", "true");
    style.textContent = `
      body:focus, body:focus-visible, html:focus, html:focus-visible {
        outline: none !important;
      }
      :focus-visible {
        outline: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  const resolved = {
    hotkey: options.hotkey ?? getDefaultHotkey(),
    adapter: options.adapter,
    enabled: options.enabled ?? true,
    keyHoldDuration: options.keyHoldDuration ?? 500,
    agent: options.agent ? {
      type: options.agent.type,
      endpoint: options.agent.endpoint,
      provider: options.agent.provider,
      model: options.agent.model,
      apiKey: options.agent.apiKey
    } : void 0
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
    showTagHint: options.showTagHint ?? true,
    includeLocatorTag: options.includeLocatorTag ?? true
  });
  try {
    activeCleanup?.();
  } catch {
  }
  if (resolved.agent) {
    const provider = createProvider(resolved.agent);
    agentManager.setProvider(provider);
  }
  let mouseX = -1e3;
  let mouseY = -1e3;
  let hovered = null;
  let rafPending = false;
  let rafId = 0;
  let lastRenderKey = "";
  let lastMouseMoveTime = 0;
  const MOUSE_MOVE_THROTTLE_MS = 50;
  let isCurrentlyActive = false;
  const isCtrlXPressed = () => {
    return pressedKeys.has("Control") && pressedKeys.has("x");
  };
  const updateActiveState = () => {
    const wasActive = isCurrentlyActive;
    isCurrentlyActive = isComboPressed(resolved.hotkey) || isCtrlXPressed();
    if (wasActive && !isCurrentlyActive) {
      const state = stateManager.getState();
      if (state.sessions.size === 0) {
        hideOverlay();
      }
    }
  };
  const onMouseMove = (e) => {
    const now = performance.now();
    if (now - lastMouseMoveTime < MOUSE_MOVE_THROTTLE_MS) {
      return;
    }
    lastMouseMoveTime = now;
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateActiveState();
    if (!isCurrentlyActive) {
      return;
    }
    if (!rafPending) {
      rafPending = true;
      rafId = requestAnimationFrame(() => {
        rafPending = false;
        stateManager.getState();
        const el = getElementAtMouse(mouseX, mouseY);
        hovered = el;
        if (el && isCurrentlyActive) {
          const rect = getRect(el);
          const key = `${rect.x}|${rect.y}|${rect.width}|${rect.height}|${el.tagName}`;
          if (key !== lastRenderKey) {
            lastRenderKey = key;
            const locator = getLocatorData(el);
            const names = (locator.vue ?? []).map((c) => c?.name || "Anonymous");
            const chain = names.length ? names.join(" > ") : "";
            renderOverlay(
              rect,
              el.tagName.toLowerCase(),
              { x: mouseX, y: mouseY },
              chain,
              void 0
              // No session ID for hover highlighting
            );
          }
        } else if (!isCurrentlyActive) {
          lastRenderKey = "";
          hideOverlay();
        }
      });
    }
  };
  const onClick = async (e) => {
    const isCtrlXClick = e.ctrlKey && pressedKeys.has("x");
    if (!hovered) return;
    if (isCtrlXClick) {
      e.stopPropagation();
      e.preventDefault();
      const rect = getRect(hovered);
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      renderInput(rect, "", async (value) => {
        await agentManager.startSession({
          element: hovered,
          prompt: value,
          position: { x: mouseX, y: mouseY },
          selectionBounds: rect,
          sessionId
        });
        startRenderLoop();
      }, sessionId, () => {
        cleanupSessionOverlay(sessionId);
      });
      return;
    }
    if (!isComboPressed(resolved.hotkey)) return;
    e.stopPropagation();
    e.preventDefault();
    try {
      const htmlSnippet = getHTMLSnippet(hovered);
      const locator = getLocatorData(hovered);
      const locatorJSON = JSON.stringify(locator, null, 2);
      const cfg = getConfig();
      const locatorBlock = `

<vue_grab_locator>
${locatorJSON}
</vue_grab_locator>`;
      const refBlock = `

<referenced_element>
${htmlSnippet}
</referenced_element>`;
      const combined = `${cfg.includeLocatorTag ? locatorBlock : ""}${refBlock}`;
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
    updateActiveState();
    stateManager.getState();
    if (hovered && isCurrentlyActive) {
      const locator = getLocatorData(hovered);
      const names = (locator.vue ?? []).map((c) => c?.name || "Anonymous");
      const chain = names.length ? names.join(" > ") : "";
      renderOverlay(
        getRect(hovered),
        hovered.tagName.toLowerCase(),
        { x: mouseX, y: mouseY },
        chain,
        void 0
        // No session ID for hover highlighting
      );
    }
  };
  const onKeyUp = (e) => {
    pressedKeys.delete(normalizeKey(e.key));
    updateActiveState();
    if (!isCurrentlyActive) hideOverlay();
  };
  window.addEventListener("mousemove", onMouseMove);
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  const onViewportChange = () => {
    agentManager.updateSessionBoundsOnViewportChange();
  };
  window.addEventListener("scroll", onViewportChange, { capture: true });
  window.addEventListener("resize", onViewportChange);
  const onBlur = () => {
    pressedKeys.clear();
    updateActiveState();
    const state = stateManager.getState();
    if (state.sessions.size === 0) {
      hideOverlay();
    }
  };
  window.addEventListener("blur", onBlur);
  const cleanup = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("scroll", onViewportChange, { capture: true });
    window.removeEventListener("resize", onViewportChange);
    window.removeEventListener("blur", onBlur);
    if (rafId) cancelAnimationFrame(rafId);
    agentManager.abortAllSessions();
    stopRenderLoop();
    hideOverlay();
  };
  activeCleanup = cleanup;
  return cleanup;
};
if (typeof window !== "undefined" && typeof document !== "undefined") {
  init({});
}

export { init };
