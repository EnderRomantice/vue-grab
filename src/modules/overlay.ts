const ATTRIBUTE_NAME = "data-vue-grab";
import { getConfig, DEFAULTS } from "./config";

const hexToRGBA = (hex: string, alpha: number): string => {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
};

const mountRoot = () => {
  const mountedHost = document.querySelector(`[${ATTRIBUTE_NAME}]`);
  if (mountedHost) {
    const mountedRoot = (mountedHost as HTMLElement).shadowRoot?.querySelector(`[${ATTRIBUTE_NAME}]`);
    if (mountedRoot instanceof HTMLDivElement && (mountedHost as any).shadowRoot) return mountedRoot as HTMLDivElement;
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
  return root as HTMLDivElement;
};

export type SelectionBox = { x: number; y: number; width: number; height: number };

export const ensureOverlay = () => {
  const root = mountRoot();
  let box = root.querySelector(".vg-box") as HTMLDivElement | null;
  if (!box) {
    const { highlight } = getConfig();
    const borderColor = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    const boxShadow = highlight.boxShadow ?? DEFAULTS.DEFAULT_BOX_SHADOW;
    box = document.createElement("div");
    box.className = "vg-box";
    box.setAttribute(ATTRIBUTE_NAME, "true");
    box.style.position = "fixed";
    box.style.pointerEvents = "none";
    box.style.border = `2px dashed ${borderColor}`;
    box.style.borderRadius = "6px";
    box.style.boxShadow = boxShadow;
    // semi-transparent fill derived from highlight color
    box.style.background = hexToRGBA(borderColor, 0.12);
    box.style.zIndex = "2147483647";
    root.appendChild(box);
  }
  let label = root.querySelector(".vg-label") as HTMLDivElement | null;
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
  let label2 = root.querySelector(".vg-label-2") as HTMLDivElement | null;
  if (!label2) {
    label2 = document.createElement("div");
    label2.className = "vg-label-2";
    label2.setAttribute(ATTRIBUTE_NAME, "true");
    label2.style.position = "fixed";
    label2.style.padding = "2px 6px";
    label2.style.fontFamily = "system-ui, sans-serif";
    label2.style.fontSize = "11px";
    label2.style.color = "#f8fafc";
    label2.style.background = "#35495e";
    label2.style.borderRadius = "4px";
    label2.style.boxShadow = "0 1px 4px rgba(0,0,0,0.12)";
    label2.style.zIndex = "2147483647";
    label2.style.maxWidth = "40vw";
    label2.style.overflow = "hidden";
    label2.style.textOverflow = "ellipsis";
    label2.style.whiteSpace = "nowrap";
    root.appendChild(label2);
  }
  let crossX = root.querySelector(".vg-crosshair-x") as HTMLDivElement | null;
  if (!crossX) {
    const { highlight } = getConfig();
    const borderColor = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    crossX = document.createElement("div");
    crossX.className = "vg-crosshair-x";
    crossX.setAttribute(ATTRIBUTE_NAME, "true");
    crossX.style.position = "fixed";
    crossX.style.pointerEvents = "none";
    crossX.style.left = "0";
    crossX.style.width = "100vw";
    crossX.style.borderTop = `1px dashed ${borderColor}`;
    crossX.style.zIndex = "2147483647";
    root.appendChild(crossX);
  }
  let crossY = root.querySelector(".vg-crosshair-y") as HTMLDivElement | null;
  if (!crossY) {
    const { highlight } = getConfig();
    const borderColor = highlight.color ?? DEFAULTS.DEFAULT_COLOR;
    crossY = document.createElement("div");
    crossY.className = "vg-crosshair-y";
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

export const hideOverlay = () => {
  const root = mountRoot();
  root.querySelector(".vg-box")?.remove();
  root.querySelector(".vg-label")?.remove();
  root.querySelector(".vg-label-2")?.remove();
  root.querySelector(".vg-crosshair-x")?.remove();
  root.querySelector(".vg-crosshair-y")?.remove();
};

export const renderOverlay = (
  rect: SelectionBox,
  text?: string,
  cursor?: { x: number; y: number },
  secondaryText?: string,
) => {
  const { showTagHint } = getConfig();
  const { box, label, label2, crossX, crossY } = ensureOverlay();
  if (!box || !label || !label2) return;
  box.style.left = `${rect.x}px`;
  box.style.top = `${rect.y}px`;
  box.style.width = `${rect.width}px`;
  box.style.height = `${rect.height}px`;
  const cx = cursor?.x ?? Math.round(rect.x + rect.width / 2);
  const cy = cursor?.y ?? Math.round(rect.y + rect.height / 2);
  if (crossX) crossX.style.top = `${cy}px`;
  if (crossY) crossY.style.left = `${cx}px`;
  if (showTagHint) {
    const labelX = rect.x;
    const labelY = Math.max(8, rect.y - 24);
    label.style.left = `${labelX}px`;
    label.style.top = `${labelY}px`;
    label.textContent = text ?? "VueGrab";
    label.style.display = "block";
    label2.textContent = secondaryText ?? "";
    label2.style.display = secondaryText ? "block" : "none";
    const gap = 8;
    const x2 = labelX + (label.offsetWidth || 0) + gap;
    label2.style.left = `${x2}px`;
    label2.style.top = `${labelY}px`;
  } else {
    label.style.display = "none";
    label2.style.display = "none";
  }
};

// 独立弹窗：复制后提示“copy <tag>”，配色与网站风格一致（Vue 绿与深色）
export const showToast = (messageHTML: string, duration = 1600) => {
  const root = mountRoot();
  const prev = root.querySelector(".vg-toast") as HTMLDivElement | null;
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
