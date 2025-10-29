// src/utils/copy-text.ts
var copyTextToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
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

// src/utils/mount-root.ts
var ATTRIBUTE_NAME = "data-vue-grab";
var mountRoot = () => {
  const mountedHost = document.querySelector(`[${ATTRIBUTE_NAME}]`);
  if (mountedHost) {
    const mountedRoot = mountedHost.shadowRoot?.querySelector(
      `[${ATTRIBUTE_NAME}]`
    );
    if (mountedRoot instanceof HTMLDivElement && mountedHost.shadowRoot) {
      return mountedRoot;
    }
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
  const doc = document.body ?? document.documentElement;
  doc.appendChild(host);
  return root;
};

// src/overlay.ts
var ensureOverlay = () => {
  const root = mountRoot();
  let box = root.querySelector(".vg-box");
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
  let label = root.querySelector(".vg-label");
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
var hideOverlay = () => {
  const root = mountRoot();
  const box = root.querySelector(".vg-box");
  const label = root.querySelector(".vg-label");
  if (box) box.remove();
  if (label) label.remove();
};
var renderOverlay = (rect, text) => {
  const { box, label } = ensureOverlay();
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

// src/index.ts
var getDefaultHotkey = () => {
  if (typeof navigator === "undefined") return ["Meta", "C"];
  const isMac = navigator.platform.toLowerCase().includes("mac");
  return isMac ? ["Meta", "c"] : ["Control", "c"];
};
var normalizeKey = (key) => {
  return key.length === 1 ? key.toLowerCase() : key;
};
var pressedKeys = /* @__PURE__ */ new Set();
var lastKeyDownTimestamps = /* @__PURE__ */ new Map();
var comboWindowMs = 800;
var isComboPressed = (hotkey) => {
  const keys = (Array.isArray(hotkey) ? hotkey : [hotkey]).map(normalizeKey);
  const hasC = keys.includes("c");
  const modifiers = keys.filter((k) => k !== "c");
  const modifiersHeld = modifiers.every((k) => pressedKeys.has(k));
  if (hasC) {
    const cHeld = pressedKeys.has("c");
    const cRecent = (lastKeyDownTimestamps.get("c") ?? 0) > Date.now() - comboWindowMs;
    return modifiersHeld && (cHeld || cRecent);
  }
  return keys.every((k) => pressedKeys.has(k));
};
var getElementAtMouse = (x, y) => {
  const el = document.elementFromPoint(x, y);
  return el instanceof Element ? el : null;
};
var getRect = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
};
var getVueInstance = (el) => {
  let cur = el;
  while (cur) {
    const inst = cur.__vueParentComponent;
    if (inst) return inst;
    cur = cur.parentElement;
  }
  cur = el;
  while (cur) {
    const vm = cur.__vue__;
    if (vm) return vm;
    cur = cur.parentElement;
  }
  return null;
};
var getVueOwnerStack = (instOrVm) => {
  const stack = [];
  if (!instOrVm) return stack;
  let cur = instOrVm;
  for (let i = 0; i < 20 && cur; i++) {
    if (cur.type) {
      const name = cur.type.name || cur.type.__name || "<Anonymous>";
      const fileName = cur.type.__file;
      stack.push({ name, fileName });
      cur = cur.parent;
      continue;
    }
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
var serializeStack = (stack) => {
  return stack.map((s) => `${s.name}${s.fileName ? ` (${s.fileName})` : ""}`).join("\n");
};
var getElementTag = (el) => {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = el.className && typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
  return `<${tag}${id}${cls ? ` class="${el.className}"` : ""}>`;
};
var getCSSPath = (el) => {
  const path = [];
  let cur = el;
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
var getHTMLSnippet = (el) => {
  const lines = [];
  lines.push(`Path: ${getCSSPath(el)}`);
  lines.push("");
  const ancestors = [];
  let cur = el;
  while (cur) {
    ancestors.unshift(cur);
    cur = cur.parentElement;
  }
  for (let i = 0; i < ancestors.length; i++) {
    const indent2 = "  ".repeat(i);
    lines.push(indent2 + getElementTag(ancestors[i]));
  }
  const text = (el.textContent || "").trim().replace(/\s+/g, " ");
  const truncated = text.length > 60 ? text.slice(0, 60) + "..." : text;
  const indent = "  ".repeat(ancestors.length);
  if (truncated) lines.push(indent + truncated);
  return lines.join("\n");
};
var init = (options = {}) => {
  if (options.enabled === false) return () => {
  };
  const resolved = {
    hotkey: options.hotkey ?? getDefaultHotkey(),
    adapter: options.adapter,
    enabled: options.enabled ?? true,
    keyHoldDuration: options.keyHoldDuration ?? 500
  };
  mountRoot();
  let mouseX = -1e3;
  let mouseY = -1e3;
  let hovered = null;
  const onMouseMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    const el = getElementAtMouse(mouseX, mouseY);
    hovered = el;
    if (el && isComboPressed(resolved.hotkey)) {
      const rect = getRect(el);
      renderOverlay(rect, el.tagName.toLowerCase());
    } else {
      hideOverlay();
    }
  };
  const onMouseDown = (e) => {
    if (!hovered) return;
    if (!isComboPressed(resolved.hotkey)) return;
    e.stopPropagation();
    e.preventDefault();
  };
  const onClick = async (e) => {
    if (!hovered) return;
    if (!isComboPressed(resolved.hotkey)) return;
    e.stopPropagation();
    e.preventDefault();
    try {
      const htmlSnippet = getHTMLSnippet(hovered);
      const inst = getVueInstance(hovered);
      const stack = serializeStack(getVueOwnerStack(inst));
      const payload = stack ? `${htmlSnippet}

Component owner stack:
${stack}` : htmlSnippet;
      await copyTextToClipboard(`

<referenced_element>
${payload}
</referenced_element>`);
      if (resolved.adapter?.open) {
        resolved.adapter.open(payload);
      }
    } catch {
    }
  };
  const onKeyDown = (e) => {
    const k = normalizeKey(e.key);
    pressedKeys.add(k);
    lastKeyDownTimestamps.set(k, Date.now());
    if (hovered && isComboPressed(resolved.hotkey)) {
      renderOverlay(getRect(hovered), hovered.tagName.toLowerCase());
    }
  };
  const onKeyUp = (e) => {
    pressedKeys.delete(normalizeKey(e.key));
    if (!isComboPressed(resolved.hotkey)) hideOverlay();
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
  const currentScript = document.currentScript;
  const options = {};
  if (currentScript?.dataset) {
    const { adapter, enabled, hotkey, keyHoldDuration } = currentScript.dataset;
    if (enabled !== void 0) options.enabled = enabled === "true";
    if (hotkey !== void 0) {
      const keys = hotkey.split(",").map((k) => normalizeKey(k.trim()));
      options.hotkey = keys.length === 1 ? keys[0] : keys;
    }
    if (keyHoldDuration !== void 0) {
      const d = Number(keyHoldDuration);
      if (!Number.isNaN(d)) options.keyHoldDuration = d;
    }
  }
  init(options);
}

export { init };
