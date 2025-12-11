const ATTRIBUTE_NAME = "data-vue-grab";
const SESSION_ATTRIBUTE = "data-vue-grab-session";
import { getConfig, DEFAULTS } from "./config";

const hexToRGBA = (hex: string, alpha: number): string => {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
};

const mountRoot = () => {
  const mountedHost = document.querySelector(`[${ATTRIBUTE_NAME}]`);
  if (mountedHost) {
    const mountedRoot = (mountedHost as HTMLElement).shadowRoot?.querySelector(
      `[${ATTRIBUTE_NAME}]`,
    );
    if (
      mountedRoot instanceof HTMLDivElement &&
      (mountedHost as any).shadowRoot
    )
      return mountedRoot as HTMLDivElement;
  }
  const host = document.createElement("div");
  host.setAttribute(ATTRIBUTE_NAME, "true");
  host.style.zIndex = "2147483646";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "0";
  const shadowRoot = host.attachShadow({ mode: "open" });

  // Add Styles
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
  return root as HTMLDivElement;
};

export type SelectionBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const ensureOverlay = (sessionId?: string) => {
  const root = mountRoot();
  const suffix = sessionId ? `-${sessionId}` : "";
  
  let box = root.querySelector(`.vg-box.vg-element${suffix}`) as HTMLDivElement | null;
  if (!box) {
    const { highlight } = getConfig();
    const borderColor = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    const boxShadow = highlight.boxShadow ?? DEFAULTS.DEFAULT_BOX_SHADOW;
    box = document.createElement("div");
    box.className = `vg-box vg-element${suffix}`;
    box.setAttribute(ATTRIBUTE_NAME, "true");
    box.style.borderColor = borderColor;
    box.style.boxShadow = boxShadow;
    // semi-transparent fill derived from highlight color
    box.style.background = hexToRGBA(borderColor, 0.12);
    root.appendChild(box);
  }
  let label = root.querySelector(`.vg-label.vg-element${suffix}`) as HTMLDivElement | null;
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
  let label2 = root.querySelector(`.vg-label-2.vg-element${suffix}`) as HTMLDivElement | null;
  if (!label2) {
    label2 = document.createElement("div");
    label2.className = `vg-label-2 vg-element${suffix}`;
    label2.setAttribute(ATTRIBUTE_NAME, "true");
    root.appendChild(label2);
  }
  let crossX = root.querySelector(`.vg-crosshair-x.vg-element${suffix}`) as HTMLDivElement | null;
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
  let crossY = root.querySelector(`.vg-crosshair-y.vg-element${suffix}`) as HTMLDivElement | null;
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

export const hideOverlay = (sessionId?: string) => {
  const root = mountRoot();
  const suffix = sessionId ? `-${sessionId}` : "";
  const elements = root.querySelectorAll(`.vg-element${suffix}`);
  elements.forEach((el) => {
    el.classList.remove("vg-visible");
  });
};

export const renderOverlay = (
  rect: SelectionBox,
  text?: string,
  cursor?: { x: number; y: number },
  secondaryText?: string,
  sessionId?: string,
) => {
  const { showTagHint } = getConfig();
  const { box, label, label2, crossX, crossY } = ensureOverlay(sessionId);
  if (!box || !label || !label2) return;

  // Make visible
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

    // Reset styles to default
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
    // Calculate the position of label2 based on label's width
    const labelWidth =
      label.getBoundingClientRect().width || label.offsetWidth || 0;
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

export const renderInput = (
  rect: SelectionBox,
  initialText: string,
  onSubmit: (value: string) => void,
  sessionId?: string,
  onCancel?: () => void,
) => {
  const { box, label, label2, crossX, crossY } = ensureOverlay(sessionId);
  if (!label || !label2) return;

  // Position box if not already positioned (e.g., if renderOverlay wasn't called due to no hover)
  const currentBoxLeft = parseFloat(box.style.left || "0");
  const currentBoxTop = parseFloat(box.style.top || "0");
  const currentBoxWidth = parseFloat(box.style.width || "0");
  const currentBoxHeight = parseFloat(box.style.height || "0");
  
  if (currentBoxLeft === 0 && currentBoxTop === 0 && currentBoxWidth === 0 && currentBoxHeight === 0) {
    // Box not positioned yet, position it
    box.style.left = `${rect.x}px`;
    box.style.top = `${rect.y}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
  }
  
  box.classList.add("vg-visible");

  // Hide crosshairs
  if (crossX) crossX.classList.remove("vg-visible");
  if (crossY) crossY.classList.remove("vg-visible");

  // Position label above the element (using the provided rect)
  const labelX = rect.x;
  const labelY = Math.max(8, rect.y - 24);
  label.style.left = `${labelX}px`;
  label.style.top = `${labelY}px`;
  
  // Change label to "Wait.."
  label.textContent = "Wait..";
  label.classList.add("vg-visible");

  label2.innerHTML = "";
  label2.classList.add("vg-visible");
  label2.style.pointerEvents = "auto";
  label2.addEventListener("click", (e) => e.stopPropagation());

  // Recalculate label2 position immediately because content changed
  const gap = 8;
  // Force a reflow or use getBoundingClientRect to ensure we get the new width of "Wait.."
  const labelWidth =
    label.getBoundingClientRect().width || label.offsetWidth || 40;
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
      // Clear input and show loading state immediately
      label2.innerHTML = '';
      const spinner = document.createElement('span');
      spinner.className = 'vg-spinner';
      const loadingText = document.createElement('span');
      loadingText.textContent = ' Loading...';
      label2.appendChild(spinner);
      label2.appendChild(loadingText);
      
      onSubmit(value);
    }
    e.stopPropagation();
  });
  // Stop click propagation to prevent closing
  input.addEventListener("click", (e) => e.stopPropagation());

  // Handle clicks outside the input to cancel
  const handleOutsideClick = (e: MouseEvent) => {
    // Check if click is outside the input and label2 area
    const clickedElement = e.target as Node;
    if (!input.contains(clickedElement) && !label2.contains(clickedElement)) {
      // Clean up
       document.removeEventListener('click', handleOutsideClick);
       if (onCancel) {
         onCancel();
       }
      // Clean up overlay for this session
      if (sessionId) {
        cleanupSessionOverlay(sessionId);
      } else {
        hideOverlay();
      }
    }
  };

  document.addEventListener('click', handleOutsideClick);

  // Also handle Escape key to cancel
  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
       document.removeEventListener('click', handleOutsideClick);
       document.removeEventListener('keydown', handleEscapeKey);
      if (onCancel) {
        onCancel();
      }
      // Clean up overlay for this session
      if (sessionId) {
        cleanupSessionOverlay(sessionId);
      } else {
        hideOverlay();
      }
    }
  };
  document.addEventListener('keydown', handleEscapeKey);

  // Clean up event listeners when input is submitted
  const originalOnSubmit = onSubmit;
  const wrappedOnSubmit = (value: string) => {
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleEscapeKey);
    originalOnSubmit(value);
  };

  // Update the event listener to use wrapped onSubmit
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const value = input.value;
      // Clear input and show loading state immediately
      label2.innerHTML = '';
      const spinner = document.createElement('span');
      spinner.className = 'vg-spinner';
      const loadingText = document.createElement('span');
      loadingText.textContent = ' Loading...';
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

export const renderLoading = (
  elapsedTime: string,
  sessionId?: string,
  rect?: SelectionBox,
) => {
  const { box, label, label2, crossX, crossY } = ensureOverlay(sessionId);
  if (!label || !label2) return;

  if (box) box.classList.add("vg-visible");
  // Hide crosshairs
  if (crossX) crossX.classList.remove("vg-visible");
  if (crossY) crossY.classList.remove("vg-visible");

  // Change label to "Loading" 
  label.textContent = "Loading..";
  label.classList.add("vg-visible");

  // Calculate position based on rect if provided, otherwise use box position
  let labelX, labelY;
  if (rect) {
    labelX = rect.x;
    labelY = Math.max(8, rect.y - 24);
  } else {
    // Fallback to box position
    labelX = parseFloat(box.style.left || "0");
    const boxY = parseFloat(box.style.top || "0");
    labelY = Math.max(8, boxY - 24);
  }
  
  // Ensure position is set
  label.style.left = `${labelX}px`;
  label.style.top = `${labelY}px`;

  // Force a reflow to ensure text measurement is accurate
  void label.offsetHeight;
  
  // Recalculate label2 position
  const gap = 8;
  const labelWidth = label.offsetWidth || label.getBoundingClientRect().width || 50;
  const x2 = labelX + labelWidth + gap;
  label2.style.left = `${x2}px`;
  label2.style.top = `${labelY}px`;

  // Clear existing content and add spinner with timer
  label2.innerHTML = '';
  const spinner = document.createElement('span');
  spinner.className = 'vg-spinner';
  label2.appendChild(spinner);
  
  const timer = document.createElement('span');
  timer.textContent = elapsedTime;
  label2.appendChild(timer);
  
  label2.classList.add("vg-visible");
};

export const renderResult = (
  status: "done" | "error" | "timeout",
  message?: string,
  sessionId?: string,
  rect?: SelectionBox,
) => {
  const { box, label, label2, crossX, crossY } = ensureOverlay(sessionId);
  if (!label || !label2) return;

  if (box) box.classList.add("vg-visible");
  // Hide crosshairs
  if (crossX) crossX.classList.remove("vg-visible");
  if (crossY) crossY.classList.remove("vg-visible");

  // Calculate position based on rect if provided, otherwise use existing position
  let labelX, labelY;
  if (rect) {
    labelX = rect.x;
    labelY = Math.max(8, rect.y - 24);
  } else {
    // Fallback to existing position
    labelX = parseFloat(label.style.left || "0");
    labelY = parseFloat(label.style.top || "0");
    
    // If position is invalid, use box position
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
  
  // Change label based on status
  if (status === "done") {
    label.textContent = "√ Done";
    label.style.background = "#42b883"; // Vue Green
    label.style.color = "#35495e";
  } else if (status === "timeout") {
    label.textContent = "× Timeout";
    label.style.background = "#e6a23c"; // Warning/Orange
    label.style.color = "white";
  } else {
    label.textContent = message ? `× ${message}` : "× Error";
    label.style.background = "#e74c3c"; // Red
    label.style.color = "white";
  }
  label.classList.add("vg-visible");

  // Hide the spinner/timer (label2)
  label2.classList.remove("vg-visible");
  label2.innerHTML = "";
};

export const showToast = (messageHTML: string, duration = 1600) => {
  const root = mountRoot();
  const prev = root.querySelector(".vg-toast") as HTMLDivElement | null;
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

export const cleanupSessionOverlay = (sessionId: string) => {
  const root = mountRoot();
  const suffix = `-${sessionId}`;
  
  // First hide elements with fade out animation
  const selectors = [
    `.vg-element${suffix}`,
    `[class*="vg-element${suffix}"]`,
    `[class$="vg-element${suffix}"]`,
  ];
  
  // Hide all matching elements (remove vg-visible class for fade out)
  selectors.forEach(selector => {
    const elements = root.querySelectorAll(selector);
    elements.forEach((el) => {
      el.classList.remove("vg-visible");
    });
  });
  
  // Also hide any elements that might have the sessionId in their class but not the exact pattern
  const allElements = root.querySelectorAll('[class*="vg-"]');
  allElements.forEach(el => {
    const className = el.className;
    if (typeof className === 'string' && className.includes(sessionId)) {
      el.classList.remove("vg-visible");
    }
  });
  
  // Wait for fade out animation (400ms) then remove elements
  setTimeout(() => {
    selectors.forEach(selector => {
      const elements = root.querySelectorAll(selector);
      elements.forEach((el) => {
        el.remove();
      });
    });
    
    allElements.forEach(el => {
      const className = el.className;
      if (typeof className === 'string' && className.includes(sessionId)) {
        el.remove();
      }
    });
  }, 400);
};
