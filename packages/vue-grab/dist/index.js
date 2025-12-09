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
  const style = document.createElement("style");
  style.textContent = `
    .vg-element {
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      opacity: 0;
    }
    .vg-visible {
      opacity: 1;
    }
    .vg-box {
      border: 2px dashed;
      border-radius: 6px;
      position: fixed;
      pointer-events: none;
      z-index: 2147483647;
    }
    .vg-label, .vg-label-2 {
      position: fixed;
      padding: 2px 6px;
      font-family: system-ui, sans-serif;
      font-size: 11px;
      border-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.12);
      z-index: 2147483647;
    }
    .vg-label-2 {
      max-width: 40vw;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #f8fafc;
      background: #35495e;
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
var ensureOverlay = () => {
  const root = mountRoot();
  let box = root.querySelector(".vg-box");
  if (!box) {
    const { highlight } = getConfig();
    const borderColor = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    const boxShadow = highlight.boxShadow ?? DEFAULTS.DEFAULT_BOX_SHADOW;
    box = document.createElement("div");
    box.className = "vg-box vg-element";
    box.setAttribute(ATTRIBUTE_NAME, "true");
    box.style.borderColor = borderColor;
    box.style.boxShadow = boxShadow;
    box.style.background = hexToRGBA(borderColor, 0.12);
    root.appendChild(box);
  }
  let label = root.querySelector(".vg-label");
  if (!label) {
    const { highlight } = getConfig();
    const bg = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    const textColor = highlight.labelTextColor ?? DEFAULTS.DEFAULT_LABEL_TEXT;
    label = document.createElement("div");
    label.className = "vg-label vg-element";
    label.setAttribute(ATTRIBUTE_NAME, "true");
    label.style.color = textColor;
    label.style.background = bg;
    root.appendChild(label);
  }
  let label2 = root.querySelector(".vg-label-2");
  if (!label2) {
    label2 = document.createElement("div");
    label2.className = "vg-label-2 vg-element";
    label2.setAttribute(ATTRIBUTE_NAME, "true");
    root.appendChild(label2);
  }
  let crossX = root.querySelector(".vg-crosshair-x");
  if (!crossX) {
    const { highlight } = getConfig();
    const borderColor = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    crossX = document.createElement("div");
    crossX.className = "vg-crosshair-x vg-element";
    crossX.setAttribute(ATTRIBUTE_NAME, "true");
    crossX.style.position = "fixed";
    crossX.style.pointerEvents = "none";
    crossX.style.left = "0";
    crossX.style.width = "100vw";
    crossX.style.borderTop = `1px dashed ${borderColor}`;
    crossX.style.zIndex = "2147483647";
    root.appendChild(crossX);
  }
  let crossY = root.querySelector(".vg-crosshair-y");
  if (!crossY) {
    const { highlight } = getConfig();
    const borderColor = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    crossY = document.createElement("div");
    crossY.className = "vg-crosshair-y vg-element";
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
var hideOverlay = () => {
  const root = mountRoot();
  const elements = root.querySelectorAll(".vg-element");
  elements.forEach((el) => {
    el.classList.remove("vg-visible");
  });
};
var renderOverlay = (rect, text, cursor, secondaryText) => {
  const { showTagHint } = getConfig();
  const { box, label, label2, crossX, crossY } = ensureOverlay();
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
var renderInput = (rect, initialText, onSubmit) => {
  const { box, label, label2 } = ensureOverlay();
  if (!label || !label2) return;
  if (box) box.classList.add("vg-visible");
  label.textContent = "Wait..";
  label.classList.add("vg-visible");
  label2.innerHTML = "";
  label2.classList.add("vg-visible");
  label2.style.pointerEvents = "auto";
  const gap = 8;
  const labelX = parseFloat(label.style.left || "0");
  const labelY = parseFloat(label.style.top || "0");
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
      onSubmit(input.value);
    }
    e.stopPropagation();
  });
  input.addEventListener("click", (e) => e.stopPropagation());
  label2.appendChild(input);
  input.focus();
  return input;
};
var renderLoading = (elapsedTime) => {
  const { box, label, label2 } = ensureOverlay();
  if (!label || !label2) return;
  if (box) box.classList.add("vg-visible");
  label.textContent = "Loading..";
  label.classList.add("vg-visible");
  const gap = 8;
  const labelX = parseFloat(label.style.left || "0");
  const labelY = parseFloat(label.style.top || "0");
  const labelWidth = label.getBoundingClientRect().width || label.offsetWidth || 50;
  const x2 = labelX + labelWidth + gap;
  label2.style.left = `${x2}px`;
  label2.style.top = `${labelY}px`;
  label2.innerHTML = `<span class="vg-spinner"></span><span>${elapsedTime}</span>`;
  label2.classList.add("vg-visible");
};
var renderResult = (status, message) => {
  const { box, label, label2 } = ensureOverlay();
  if (!label || !label2) return;
  if (box) box.classList.add("vg-visible");
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
var AGENT_ENDPOINTS = {
  claude: "http://127.0.0.1:3000/api/code-edit",
  opencode: "http://127.0.0.1:6567/api/code-edit"
};
var activeCleanup = null;
var init = (options = {}) => {
  if (options.enabled === false) return () => {
  };
  const resolved = {
    hotkey: options.hotkey ?? getDefaultHotkey(),
    adapter: options.adapter,
    enabled: options.enabled ?? true,
    keyHoldDuration: options.keyHoldDuration ?? 500,
    agent: options.agent ? {
      type: options.agent.type,
      endpoint: options.agent.endpoint || AGENT_ENDPOINTS[options.agent.type],
      provider: options.agent.provider,
      model: options.agent.model,
      apiKey: options.agent.apiKey
    } : void 0
  };
  if (resolved.agent?.type === "opencode" && (!resolved.agent.apiKey || !resolved.agent.provider)) {
    console.error("[VueGrab] Opencode agent requires 'apiKey' and 'provider' to be configured.");
    resolved.agent = void 0;
  }
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
  let mouseX = -1e3;
  let mouseY = -1e3;
  let hovered = null;
  let rafPending = false;
  let rafId = 0;
  let lastRenderKey = "";
  let isInteracting = false;
  let isWaiting = false;
  let interactionTimerId = 0;
  const cancelInteraction = () => {
    if (isInteracting) {
      isInteracting = false;
      isWaiting = false;
      if (interactionTimerId) cancelAnimationFrame(interactionTimerId);
      hideOverlay();
      lastRenderKey = "";
    }
  };
  const isCtrlXPressed = () => {
    return pressedKeys.has("Control") && pressedKeys.has("x");
  };
  const onMouseMove = (e) => {
    if (isInteracting) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafPending) {
      rafPending = true;
      rafId = requestAnimationFrame(() => {
        rafPending = false;
        const el = getElementAtMouse(mouseX, mouseY);
        hovered = el;
        const isActive = isComboPressed(resolved.hotkey, resolved.keyHoldDuration) || isCtrlXPressed();
        if (el && isActive) {
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
              chain
            );
          }
        } else {
          lastRenderKey = "";
          hideOverlay();
        }
      });
    }
  };
  const onClick = async (e) => {
    if (isInteracting) {
      if (isWaiting) return;
      cancelInteraction();
      return;
    }
    if (!hovered) return;
    if (e.ctrlKey && pressedKeys.has("x")) {
      e.stopPropagation();
      e.preventDefault();
      isInteracting = true;
      const rect = getRect(hovered);
      renderInput(rect, "", async (value) => {
        isWaiting = true;
        const startTime = performance.now();
        let done = false;
        const updateTimer = () => {
          if (!isInteracting || done) return;
          const elapsedMs = performance.now() - startTime;
          if (elapsedMs > 3e4) {
            done = true;
            isWaiting = false;
            renderResult("timeout");
            setTimeout(() => {
              if (isInteracting) {
                cancelInteraction();
              }
            }, 2e3);
            return;
          }
          const elapsedSec = (elapsedMs / 1e3).toFixed(6);
          renderLoading(`${elapsedSec} s`);
          interactionTimerId = requestAnimationFrame(updateTimer);
        };
        updateTimer();
        if (resolved.agent?.endpoint) {
          try {
            const locator = getLocatorData(hovered);
            const htmlSnippet = getHTMLSnippet(hovered);
            const response = await fetch(resolved.agent.endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: value,
                locator,
                htmlSnippet,
                agentConfig: {
                  provider: resolved.agent.provider,
                  model: resolved.agent.model,
                  apiKey: resolved.agent.apiKey
                }
              })
            });
            if (done) return;
            if (!response.body) throw new Error("No response body");
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let currentEvent = "message";
            while (true) {
              const { done: streamDone, value: chunk } = await reader.read();
              if (streamDone) break;
              buffer += decoder.decode(chunk, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) {
                  continue;
                }
                if (trimmed.startsWith("event: ")) {
                  currentEvent = trimmed.slice(7).trim();
                } else if (trimmed.startsWith("data: ")) {
                  const data = trimmed.slice(6);
                  if (currentEvent === "error") {
                    let msg = data;
                    try {
                      msg = JSON.parse(data).message;
                    } catch {
                    }
                    throw new Error(msg);
                  } else if (currentEvent === "done") {
                    done = true;
                    isWaiting = false;
                    renderResult("done");
                    if (interactionTimerId) cancelAnimationFrame(interactionTimerId);
                  } else {
                    let preview = data;
                    try {
                      const json = JSON.parse(data);
                      if (json.type === "fragment") preview = "Generating...";
                      else if (json.message) preview = json.message;
                    } catch {
                    }
                    if (preview.length > 30) preview = preview.slice(0, 30) + "...";
                    renderLoading(preview);
                  }
                }
              }
            }
            if (!done && !response.ok) {
              throw new Error(`Server Error: ${response.statusText}`);
            }
            setTimeout(() => {
              if (isInteracting) {
                cancelInteraction();
              }
            }, 2e3);
          } catch (err) {
            if (!done) {
              done = true;
              isWaiting = false;
              if (interactionTimerId) cancelAnimationFrame(interactionTimerId);
              renderResult("error", err.message || "Network Error");
              setTimeout(() => {
                if (isInteracting) {
                  cancelInteraction();
                }
              }, 2e3);
            }
          }
        } else {
          console.warn("No agent endpoint configured.");
          done = true;
          isWaiting = false;
          if (interactionTimerId) cancelAnimationFrame(interactionTimerId);
          renderResult("done");
          setTimeout(() => {
            if (isInteracting) cancelInteraction();
          }, 1e3);
        }
      });
      return;
    }
    if (!isComboPressed(resolved.hotkey, resolved.keyHoldDuration)) return;
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
    if (isInteracting) return;
    const isActive = isComboPressed(resolved.hotkey, resolved.keyHoldDuration) || isCtrlXPressed();
    if (hovered && isActive) {
      const locator = getLocatorData(hovered);
      const names = (locator.vue ?? []).map((c) => c?.name || "Anonymous");
      const chain = names.length ? names.join(" > ") : "";
      renderOverlay(
        getRect(hovered),
        hovered.tagName.toLowerCase(),
        { x: mouseX, y: mouseY },
        chain
      );
    }
  };
  const onKeyUp = (e) => {
    pressedKeys.delete(normalizeKey(e.key));
    const isActive = isComboPressed(resolved.hotkey, resolved.keyHoldDuration) || isCtrlXPressed();
    if (!isInteracting && !isActive) hideOverlay();
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
    if (rafId) cancelAnimationFrame(rafId);
    if (interactionTimerId) cancelAnimationFrame(interactionTimerId);
    hideOverlay();
  };
  activeCleanup = cleanup;
  return cleanup;
};
if (typeof window !== "undefined" && typeof document !== "undefined") {
  init({});
}

export { init };
