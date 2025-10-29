export const ATTRIBUTE_NAME = "data-vue-grab";

export const mountRoot = () => {
  const mountedHost = document.querySelector(`[${ATTRIBUTE_NAME}]`);
  if (mountedHost) {
    const mountedRoot = (mountedHost as HTMLElement).shadowRoot?.querySelector(
      `[${ATTRIBUTE_NAME}]`
    );
    if (mountedRoot instanceof HTMLDivElement && (mountedHost as any).shadowRoot) {
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