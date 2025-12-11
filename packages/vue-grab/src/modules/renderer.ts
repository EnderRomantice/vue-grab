import { stateManager } from '../state'
import { renderOverlay, hideOverlay, renderInput, renderLoading, renderResult, cleanupSessionOverlay } from './overlay'

let animationFrameId: number | null = null
let lastUpdateTime = 0
const lastDisplayedSeconds = new Map<string, number>() // sessionId -> last displayed whole seconds

function renderSessions() {
  const state = stateManager.getState()
  
  // Clean up tracking for sessions that no longer exist
  for (const sessionId of lastDisplayedSeconds.keys()) {
    if (!state.sessions.has(sessionId)) {
      lastDisplayedSeconds.delete(sessionId)
    }
  }

  // Only render streaming sessions (for timer updates)
  // Completed/error sessions only need to be rendered once, not every frame
  let hasActiveStreamingSessions = false

  for (const [sessionId, session] of state.sessions) {
    const rect = session.selectionBounds

    if (session.isStreaming) {
      hasActiveStreamingSessions = true
      
      // Calculate elapsed time and update every frame for smooth timer
      const elapsedMs = Date.now() - session.createdAt
      const elapsedSec = (elapsedMs / 1000).toFixed(3) // Show milliseconds for better responsiveness
      renderLoading(`${elapsedSec} s`, sessionId, rect)
    } else if (session.error && !session.errorRendered) {
      // Mark error as rendered and show result
      stateManager.updateSession(sessionId, { errorRendered: true })
      lastDisplayedSeconds.delete(sessionId) // Clean up timer tracking
      if (session.error === 'timeout') {
        renderResult('timeout', undefined, sessionId, rect)
      } else {
        renderResult('error', session.error, sessionId, rect)
      }
    } else if (!session.isStreaming && !session.completedRendered && !session.error) {
      // Mark completed as rendered and show result
      stateManager.updateSession(sessionId, { completedRendered: true })
      lastDisplayedSeconds.delete(sessionId) // Clean up timer tracking
      renderResult('done', undefined, sessionId, rect)
    }
    // Skip sessions that have already been rendered in their final state
  }

  // If no active streaming sessions but we still have sessions in final states,
  // we don't need to continue the animation loop
  if (!hasActiveStreamingSessions) {
    stopRenderLoop()
  }
}

function renderLoop() {
  renderSessions()
  
  const state = stateManager.getState()
  if (state.sessions.size > 0) {
    // Continue animation loop if there are active sessions
    animationFrameId = requestAnimationFrame(renderLoop)
  } else {
    animationFrameId = null
  }
}

export function startRenderLoop() {
  if (animationFrameId === null) {
    animationFrameId = requestAnimationFrame(renderLoop)
  }
}

export function stopRenderLoop() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

export function updateHover(element: Element | null, rect: any, mousePos: { x: number, y: number }, tagName?: string, componentChain?: string) {
  if (element && rect) {
    renderOverlay(rect, tagName, mousePos, componentChain)
  } else {
    hideOverlay()
  }
}