import type { AgentSession, AgentProvider, AgentContext, SelectionBox } from '../types'
import { stateManager } from '../state'
import { getLocatorData, getHTMLSnippet } from './dom'
import { cleanupSessionOverlay } from './overlay'

interface StartSessionParams {
  element: Element
  prompt: string
  position: { x: number; y: number }
  selectionBounds?: SelectionBox
  sessionId?: string
}

export class AgentManager {
  private provider?: AgentProvider<any>
  private abortControllers = new Map<string, AbortController>()
  private sessionElements = new Map<string, Element>()

  setProvider(provider: AgentProvider<any>) {
    this.provider = provider
  }

  getProvider() {
    return this.provider
  }

  isProcessing() {
    return stateManager.getState().sessions.size > 0
  }

  async startSession(params: StartSessionParams) {
    const { element, prompt, position, selectionBounds, sessionId } = params
    const provider = this.provider
    if (!provider) {
      console.warn('No agent provider configured')
      return
    }

    const locator = getLocatorData(element)
    const htmlSnippet = getHTMLSnippet(element)
    const context: AgentContext<{ locator: any; htmlSnippet: string }> = {
      content: htmlSnippet,
      prompt,
      options: { locator, htmlSnippet }
    }

    const tagName = element.tagName.toLowerCase()
    const componentName = undefined // TODO: extract Vue component name

    const session: AgentSession = {
      id: sessionId || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      context,
      lastStatus: 'Thinking…',
      isStreaming: true,
      createdAt: Date.now(),
      position,
      selectionBounds,
      tagName,
      componentName,
      element,
      errorRendered: false,
      completedRendered: false
    }

    // Add to state
    stateManager.addSession(session)
    this.sessionElements.set(session.id, element)

    const abortController = new AbortController()
    this.abortControllers.set(session.id, abortController)

    try {
      const streamIterator = provider.send(context, abortController.signal)
      this.executeSessionStream(session, streamIterator)
    } catch (error) {
      console.error('Failed to start session:', error)
      // Mark session as error
      stateManager.updateSession(session.id, { isStreaming: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  private async executeSessionStream(session: AgentSession, streamIterator: AsyncIterable<string>) {
    const timeoutMs = 30000
    const startTime = Date.now()
    let wasAborted = false

    const timeoutId = setTimeout(() => {
      if (stateManager.getSession(session.id)) {
        stateManager.updateSession(session.id, { isStreaming: false, error: 'timeout' })
        this.abortControllers.get(session.id)?.abort()
      }
    }, timeoutMs)

    try {
      for await (const status of streamIterator) {
        const currentSession = stateManager.getSession(session.id)
        if (!currentSession) break

        stateManager.updateSession(session.id, { lastStatus: status })
      }

      // Stream completed successfully
      const finalSession = stateManager.getSession(session.id)
      if (finalSession) {
        stateManager.updateSession(session.id, { isStreaming: false })
        // Schedule dismissal after 2 seconds
        setTimeout(() => {
          this.dismissSession(session.id)
        }, 2000)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        wasAborted = true
        // Session already removed by abort handler
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        stateManager.updateSession(session.id, { isStreaming: false, error: errorMessage })
        // Schedule dismissal after 2 seconds
        setTimeout(() => {
          this.dismissSession(session.id)
        }, 2000)
      }
    } finally {
      clearTimeout(timeoutId)
      this.abortControllers.delete(session.id)

      if (wasAborted) {
        this.sessionElements.delete(session.id)
        stateManager.removeSession(session.id)
        // Also cleanup overlay for aborted sessions
        cleanupSessionOverlay(session.id)
      }
    }
  }

  abortSession(sessionId: string) {
    const controller = this.abortControllers.get(sessionId)
    if (controller) {
      controller.abort()
    }
  }

  abortAllSessions() {
    this.abortControllers.forEach(controller => controller.abort())
    this.abortControllers.clear()
    stateManager.clearSessions()
  }

  dismissSession(sessionId: string) {
    cleanupSessionOverlay(sessionId)
    this.sessionElements.delete(sessionId)
    stateManager.removeSession(sessionId)
  }

  undoSession(sessionId: string) {
    const session = stateManager.getSession(sessionId)
    if (session) {
      const element = this.sessionElements.get(sessionId)
      // TODO: call onUndo callback
      // TODO: provider.undo()
    }
    this.dismissSession(sessionId)
  }

  updateSessionBoundsOnViewportChange() {
    const state = stateManager.getState()
    if (state.sessions.size === 0) return

    let updated = false
    const newSessions = new Map(state.sessions)
    const sessionsToDismiss: string[] = []

    for (const [sessionId, session] of state.sessions) {
      const element = this.sessionElements.get(sessionId)
      if (element && document.contains(element)) {
        const rect = element.getBoundingClientRect()
        const newBounds: SelectionBox = {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        }
        let updatedPosition = session.position
        const oldBounds = session.selectionBounds
        if (oldBounds) {
          const oldCenterX = oldBounds.x + oldBounds.width / 2
          const offsetX = session.position.x - oldCenterX
          const newCenterX = newBounds.x + newBounds.width / 2
          updatedPosition = { ...session.position, x: newCenterX + offsetX }
        }

        newSessions.set(sessionId, {
          ...session,
          selectionBounds: newBounds,
          position: updatedPosition
        })
        updated = true
      } else {
        // Element no longer exists in DOM, dismiss the session
        sessionsToDismiss.push(sessionId)
      }
    }

    // Dismiss sessions whose elements no longer exist
    for (const sessionId of sessionsToDismiss) {
      this.dismissSession(sessionId)
    }

    if (updated) {
      stateManager.updateState({ sessions: newSessions })
    }
  }

  getSessionElement(sessionId: string) {
    return this.sessionElements.get(sessionId)
  }
}

export const agentManager = new AgentManager()