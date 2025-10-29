import { ATTRIBUTE_NAME, mountRoot } from "./utils/mount-root";

export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

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
  const box = root.querySelector(".vg-box");
  const label = root.querySelector(".vg-label");
  if (box) box.remove();
  if (label) label.remove();
};

export const renderOverlay = (rect: SelectionBox, text?: string) => {
  const { box, label } = ensureOverlay();
  box!.style.left = `${rect.x}px`;
  box!.style.top = `${rect.y}px`;
  box!.style.width = `${rect.width}px`;
  box!.style.height = `${rect.height}px`;

  const labelX = rect.x;
  const labelY = Math.max(8, rect.y - 24);
  label!.style.left = `${labelX}px`;
  label!.style.top = `${labelY}px`;
  label!.textContent = text ?? "VueGrab";
};