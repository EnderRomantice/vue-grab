export type Hotkey = KeyboardEvent["key"];

export const normalizeKey = (key: string): string => (key.length === 1 ? key.toLowerCase() : key);

export const getDefaultHotkey = (): Hotkey[] => {
  if (typeof navigator === "undefined") return ["Meta", "C"];
  const isMac = navigator.platform.toLowerCase().includes("mac");
  return isMac ? ["Meta", "c"] : ["Control", "c"];
};

export const pressedKeys = new Set<Hotkey>();
export const lastKeyDownTimestamps = new Map<string, number>();
const comboWindowMs = 800;

export const isComboPressed = (hotkey: Hotkey | Hotkey[]) => {
  const keys = (Array.isArray(hotkey) ? hotkey : [hotkey]).map(normalizeKey);
  const hasC = keys.includes("c");
  const modifiers = keys.filter((k) => k !== "c");
  const modifiersHeld = modifiers.every((k) => pressedKeys.has(k as Hotkey));
  if (hasC) {
    const cHeld = pressedKeys.has("c" as Hotkey);
    const cRecent = (lastKeyDownTimestamps.get("c") ?? 0) > Date.now() - comboWindowMs;
    return modifiersHeld && (cHeld || cRecent);
  }
  return keys.every((k) => pressedKeys.has(k as Hotkey));
};