import type { SelectionBox, AgentSession } from "./types";

export interface AppState {
  // 鼠标位置
  mouseX: number;
  mouseY: number;
  
  // 当前悬停元素
  hoveredElement: Element | null;
  hoveredRect: SelectionBox | null;
  
  // 激活状态
  isActive: boolean;
  isInputMode: boolean;
  inputText: string;
  
  // 代理会话
  sessions: Map<string, AgentSession>;
  
  // 临时状态
  lastRenderKey: string;
  rafPending: boolean;
  rafId: number | null;
}

// 简单的observable实现
type Listener = (state: AppState) => void;

class StateManager {
  private state: AppState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = {
      mouseX: -1000,
      mouseY: -1000,
      hoveredElement: null,
      hoveredRect: null,
      isActive: false,
      isInputMode: false,
      inputText: "",
      sessions: new Map(),
      lastRenderKey: "",
      rafPending: false,
      rafId: null,
    };
  }

  getState(): AppState {
    return this.state;
  }

  setState(updater: (prev: AppState) => AppState): void {
    this.state = updater(this.state);
    this.notifyListeners();
  }

  updateState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // 会话管理辅助方法
  addSession(session: AgentSession): void {
    this.setState(prev => ({
      ...prev,
      sessions: new Map(prev.sessions).set(session.id, session),
    }));
  }

  updateSession(sessionId: string, updates: Partial<AgentSession>): void {
    this.setState(prev => {
      const session = prev.sessions.get(sessionId);
      if (!session) return prev;

      const updatedSession = { ...session, ...updates };
      const newSessions = new Map(prev.sessions);
      newSessions.set(sessionId, updatedSession);

      return { ...prev, sessions: newSessions };
    });
  }

  removeSession(sessionId: string): void {
    this.setState(prev => {
      const newSessions = new Map(prev.sessions);
      newSessions.delete(sessionId);
      return { ...prev, sessions: newSessions };
    });
  }

  getSession(sessionId: string): AgentSession | undefined {
    return this.state.sessions.get(sessionId);
  }

  hasActiveSessions(): boolean {
    return this.state.sessions.size > 0;
  }

  clearSessions(): void {
    this.setState(prev => ({
      ...prev,
      sessions: new Map(),
    }));
  }
}

export const stateManager = new StateManager();