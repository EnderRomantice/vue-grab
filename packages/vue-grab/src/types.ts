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

export type SelectionBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface AgentContext<T = unknown> {
  content: string;
  prompt: string;
  options?: T;
}

export interface AgentSessionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AgentSession {
  id: string;
  context: AgentContext;
  lastStatus: string;
  isStreaming: boolean;
  createdAt: number;
  position: { x: number; y: number };
  selectionBounds?: SelectionBox;
  tagName?: string;
  componentName?: string;
  error?: string;
  element?: Element;
  errorRendered?: boolean;
  completedRendered?: boolean;
}

export interface AgentProvider<T = unknown> {
  send: (
    context: AgentContext<T>,
    signal: AbortSignal,
  ) => AsyncIterable<string>;
  resume?: (
    sessionId: string,
    signal: AbortSignal,
    storage: AgentSessionStorage,
  ) => AsyncIterable<string>;
  supportsResume?: boolean;
  checkConnection?: () => Promise<boolean>;
  getCompletionMessage?: () => string | undefined;
  undo?: () => Promise<void>;
}

export interface AgentOptions {
  provider?: AgentProvider;
  storage?: AgentSessionStorage;
  onStart?: (session: AgentSession, element: Element) => void;
  onStatus?: (status: string, session: AgentSession) => void;
  onComplete?: (session: AgentSession, element?: Element) => void | { error?: string };
  onError?: (error: Error, session: AgentSession) => void;
  onAbort?: (session: AgentSession, element?: Element) => void;
  onUndo?: (session: AgentSession, element?: Element) => void;
  onResume?: (session: AgentSession) => void;
  getOptions?: () => unknown;
}