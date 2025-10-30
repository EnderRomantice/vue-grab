import type { SelectionBox } from "./overlay";

export const getElementAtMouse = (x: number, y: number): Element | null => {
  const el = document.elementFromPoint(x, y);
  return el instanceof Element ? el : null;
};

export const getRect = (el: Element): SelectionBox => {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
};

export const getCSSPath = (el: Element) => {
  const path: string[] = [];
  let cur: Element | null = el;
  while (cur) {
    let selector = cur.tagName.toLowerCase();
    const id = (cur as HTMLElement).id;
    if (id) selector += `#${id}`;
    const classes = (cur as HTMLElement).className?.trim()?.split(/\s+/) ?? [];
    if (classes.length) selector += "." + classes.slice(0, 2).join(".");
    path.unshift(selector);
    cur = cur.parentElement;
  }
  return path.join(" > ");
};

export const getHTMLSnippet = (el: Element) => {
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