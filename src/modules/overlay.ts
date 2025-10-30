const ATTRIBUTE_NAME = "data-vue-grab";

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

export const hideOverlay = () => {
  const root = mountRoot();
  root.querySelector(".vg-box")?.remove();
  root.querySelector(".vg-label")?.remove();
};

export const renderOverlay = (rect: SelectionBox, text?: string) => {
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