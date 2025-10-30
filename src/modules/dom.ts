import type { SelectionBox } from "./overlay";

type VueComponentInfo = { name?: string; file?: string };

const getVueComponentChain = (el: Element): VueComponentInfo[] => {
  const chain: VueComponentInfo[] = [];
  let comp: any = (el as any).__vueParentComponent;
  // 如果当前元素没有绑定组件，尝试向上寻找最近的父元素
  let cursor: Element | null = el;
  while (!comp && cursor?.parentElement) {
    cursor = cursor.parentElement;
    comp = (cursor as any).__vueParentComponent;
  }
  while (comp) {
    const info: VueComponentInfo = {
      name: comp?.type?.name ?? comp?.type?.__name ?? undefined,
      file: comp?.type?.__file ?? undefined,
    };
    chain.unshift(info);
    comp = comp.parent;
  }
  return chain;
};

const formatVueChain = (chain: VueComponentInfo[]) => {
  if (!chain.length) return "(no vue component)";
  const names = chain.map((c) => c.name || "Anonymous");
  const files = chain.map((c) => c.file).filter(Boolean);
  const head = names.join(" > ");
  const tail = files.length ? `\nFiles: ${files.join(" > ")}` : "";
  return `Vue: ${head}${tail}`;
};

export const getLocatorData = (el: Element) => {
  const vue = getVueComponentChain(el);
  const tag = el.tagName.toLowerCase();
  const id = (el as HTMLElement).id || undefined;
  const clsList = ((el as HTMLElement).className || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const cssPath = getCSSPath(el);
  const text = (el.textContent || "").trim().replace(/\s+/g, " ");
  const textSnippet = text.length > 160 ? text.slice(0, 160) + "..." : text;
  return {
    tag,
    id,
    classList: clsList,
    cssPath,
    textSnippet,
    vue,
  } as const;
};

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
  const vueChain = getVueComponentChain(el);
  lines.push(formatVueChain(vueChain));
  lines.push(`\nPath: ${getCSSPath(el)}`);
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