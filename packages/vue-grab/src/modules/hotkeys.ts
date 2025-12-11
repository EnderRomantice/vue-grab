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

// Return whether a hotkey (single, combo, or multi-letter OR) is considered pressed.
// holdMs: configurable window for "c" recent-press detection; defaults to comboWindowMs.
export const isComboPressed = (hotkey: Hotkey | Hotkey[], holdMs?: number) => {
  const windowMs = holdMs ?? comboWindowMs;
  const toKeys = (hk: Hotkey | Hotkey[]) => (Array.isArray(hk) ? hk : [hk]).map(normalizeKey);
  const keys = toKeys(hotkey);

  // Helper: check if a single key is held
  const isKeyActive = (k: string) => {
    return pressedKeys.has(k as Hotkey);
  };

  // If all entries are single letters and no modifiers (e.g., ['c','v']),
  // treat as OR semantics: pressing any one letter triggers.
  if (Array.isArray(hotkey) && keys.every((k) => k.length === 1)) {
    return keys.some((k) => isKeyActive(k));
  }

  // Otherwise treat as a combo (AND semantics)
  return keys.every((k) => isKeyActive(k));
};