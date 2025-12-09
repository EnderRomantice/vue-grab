import { copyTextToClipboard } from "./modules/clipboard";
import { hideOverlay, renderOverlay, showToast, renderInput, renderLoading, renderResult } from "./modules/overlay";
import { getElementAtMouse, getRect, getHTMLSnippet, getLocatorData } from "./modules/dom";
import { updateConfig, getConfig } from "./modules/config";
import {
  normalizeKey,
  getDefaultHotkey,
  isComboPressed,
  pressedKeys,
  lastKeyDownTimestamps,
} from "./modules/hotkeys";

export type Hotkey = KeyboardEvent["key"];

export interface Options {
  adapter?: { open: (text: string) => void };
  enabled?: boolean;
  hotkey?: Hotkey | Hotkey[];
  keyHoldDuration?: number;
  agent?: {
    type: "claude" | "opencode";
    endpoint?: string;
    provider?: string;
    model?: string;
    apiKey?: string;
  };
  highlightColor?: string;
  labelTextColor?: string;
  showTagHint?: boolean;
  includeLocatorTag?: boolean;
  filter?: {
    ignoreSelectors?: string[];
    ignoreTags?: string[];
    skipCommonComponents?: boolean;
  };
}

const AGENT_ENDPOINTS = {
    claude: "http://127.0.0.1:3000/api/code-edit",
    opencode: "http://127.0.0.1:6567/api/code-edit"
};

let activeCleanup: (() => void) | null = null;

export const init = (options: Options = {}) => {
  if (options.enabled === false) return () => {};
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
    } : undefined,
  } satisfies Options;

  if (resolved.agent?.type === 'opencode' && (!resolved.agent.apiKey || !resolved.agent.provider)) {
      console.error("[VueGrab] Opencode agent requires 'apiKey' and 'provider' to be configured.");
      // Disable agent if configuration is missing
      resolved.agent = undefined;
  }

  // Apply runtime UI/behavior configuration
  updateConfig({
    highlight: {
      color: options.highlightColor,
      labelTextColor: options.labelTextColor,
    },
    filter: {
      ignoreSelectors: options.filter?.ignoreSelectors,
      ignoreTags: options.filter?.ignoreTags,
      skipCommonComponents: options.filter?.skipCommonComponents,
    },
    showTagHint: options.showTagHint ?? true,
    includeLocatorTag: options.includeLocatorTag ?? true,
  });

  // If already initialized, clean up previous listeners to avoid duplicates
  try {
    activeCleanup?.();
  } catch {}

  let mouseX = -1000;
  let mouseY = -1000;
  let hovered: Element | null = null;
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
        lastRenderKey = ""; // Reset so hover can resume
     }
  };

  const isCtrlXPressed = () => {
    return pressedKeys.has("Control") && pressedKeys.has("x");
  };

  const onMouseMove = (e: MouseEvent) => {
    if (isInteracting) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!rafPending) {
      rafPending = true;
      rafId = requestAnimationFrame(() => {
        rafPending = false;
        const el = getElementAtMouse(mouseX, mouseY);
        hovered = el;
        const isActive = isComboPressed(resolved.hotkey!, resolved.keyHoldDuration) || isCtrlXPressed();
        if (el && isActive) {
          const rect = getRect(el);
          const key = `${rect.x}|${rect.y}|${rect.width}|${rect.height}|${el.tagName}`;
          if (key !== lastRenderKey) {
            lastRenderKey = key;
            const locator = getLocatorData(el);
            const names = (locator.vue ?? []).map((c: any) => c?.name || "Anonymous");
            const chain = names.length ? names.join(" > ") : "";
            renderOverlay(
              rect,
              el.tagName.toLowerCase(),
              { x: mouseX, y: mouseY },
              chain,
            );
          }
        } else {
          lastRenderKey = "";
          hideOverlay();
        }
      });
    }
  };

  const onClick = async (e: MouseEvent) => {
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
                 if (elapsedMs > 30000) {
                      done = true;
                      isWaiting = false;
                      renderResult("timeout");
                      
                      setTimeout(() => {
                          if (isInteracting) {
                              cancelInteraction();
                          }
                      }, 2000);
                      return;
                 }
                 const elapsedSec = (elapsedMs / 1000).toFixed(6);
                 renderLoading(`${elapsedSec} s`);
                 interactionTimerId = requestAnimationFrame(updateTimer);
             };
             updateTimer();

             if (resolved.agent?.endpoint) {
                 try {
                    const locator = getLocatorData(hovered!);
                    const htmlSnippet = getHTMLSnippet(hovered!);
                    
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
                                    try { msg = JSON.parse(data).message; } catch {}
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
                                    } catch {}
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
                    }, 2000);

                 } catch (err: any) {
                     if (!done) {
                        done = true;
                        isWaiting = false;
                        if (interactionTimerId) cancelAnimationFrame(interactionTimerId);
                        renderResult("error", err.message || "Network Error");
                        
                        setTimeout(() => {
                            if (isInteracting) {
                                cancelInteraction();
                            }
                        }, 2000);
                     }
                 }
             } else {
                 console.warn("No agent endpoint configured.");
                 done = true;
                 isWaiting = false;
                 if (interactionTimerId) cancelAnimationFrame(interactionTimerId);
                 renderResult("done");
                 setTimeout(() => { if(isInteracting) cancelInteraction(); }, 1000);
             }
         });
         return;
    }

    if (!isComboPressed(resolved.hotkey!, resolved.keyHoldDuration)) return;
    e.stopPropagation();
    e.preventDefault();
    try {
      const htmlSnippet = getHTMLSnippet(hovered);
      const locator = getLocatorData(hovered);
      const locatorJSON = JSON.stringify(locator, null, 2);
      const cfg = getConfig();
      const locatorBlock = `\n\n<vue_grab_locator>\n${locatorJSON}\n</vue_grab_locator>`;
      const refBlock = `\n\n<referenced_element>\n${htmlSnippet}\n</referenced_element>`;
      const combined = `${cfg.includeLocatorTag ? locatorBlock : ""}${refBlock}`;
      await copyTextToClipboard(combined);
      hideOverlay();
      const tag = hovered.tagName.toLowerCase();
      showToast(`<strong>copy</strong> &lt;${tag}&gt;`);
      resolved.adapter?.open?.(locatorJSON);
    } catch {}
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const k = normalizeKey(e.key);
    pressedKeys.add(k as Hotkey);
    lastKeyDownTimestamps.set(k, Date.now());
    
    if (isInteracting) return;
    
    const isActive = isComboPressed(resolved.hotkey!, resolved.keyHoldDuration) || isCtrlXPressed();

    if (hovered && isActive) {
      const locator = getLocatorData(hovered);
      const names = (locator.vue ?? []).map((c: any) => c?.name || "Anonymous");
      const chain = names.length ? names.join(" > ") : "";
      renderOverlay(
        getRect(hovered),
        hovered.tagName.toLowerCase(),
        { x: mouseX, y: mouseY },
        chain,
      );
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    pressedKeys.delete(normalizeKey(e.key) as Hotkey);
    const isActive = isComboPressed(resolved.hotkey!, resolved.keyHoldDuration) || isCtrlXPressed();
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
