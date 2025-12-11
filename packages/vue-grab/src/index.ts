import { copyTextToClipboard } from './modules/clipboard'
import { hideOverlay, renderOverlay, showToast, renderInput, cleanupSessionOverlay } from './modules/overlay'
import { getElementAtMouse, getRect, getHTMLSnippet, getLocatorData } from './modules/dom'
import { updateConfig, getConfig } from './modules/config'
import {
  normalizeKey,
  getDefaultHotkey,
  isComboPressed,
  pressedKeys,
  lastKeyDownTimestamps,
} from './modules/hotkeys'
import { stateManager } from './state'
import { agentManager } from './modules/agent-manager'
import { createProvider } from './modules/provider'
import { startRenderLoop, stopRenderLoop, updateHover } from './modules/renderer'

export type Hotkey = KeyboardEvent['key']

export interface Options {
  adapter?: { open: (text: string) => void }
  enabled?: boolean
  hotkey?: Hotkey | Hotkey[]
  keyHoldDuration?: number
  agent?: {
    type: 'claude' | 'opencode'
    endpoint?: string
    provider?: string
    model?: string
    apiKey?: string
  }
  highlightColor?: string
  labelTextColor?: string
  showTagHint?: boolean
  includeLocatorTag?: boolean
  filter?: {
    ignoreSelectors?: string[]
    ignoreTags?: string[]
    skipCommonComponents?: boolean
  }
}

let activeCleanup: (() => void) | null = null

export const init = (options: Options = {}) => {
  if (options.enabled === false) return () => {}
  
  // Add global CSS to prevent focus outlines on page
  if (!document.head.querySelector('style[data-vue-grab-global]')) {
    const style = document.createElement('style')
    style.setAttribute('data-vue-grab-global', 'true')
    style.textContent = `
      body:focus, body:focus-visible, html:focus, html:focus-visible {
        outline: none !important;
      }
      :focus-visible {
        outline: none !important;
      }
    `
    document.head.appendChild(style)
  }
  
  const resolved = {
    hotkey: options.hotkey ?? getDefaultHotkey(),
    adapter: options.adapter,
    enabled: options.enabled ?? true,
    keyHoldDuration: options.keyHoldDuration ?? 500,
    agent: options.agent ? {
        type: options.agent.type,
        endpoint: options.agent.endpoint,
        provider: options.agent.provider,
        model: options.agent.model,
        apiKey: options.agent.apiKey
    } : undefined,
  } satisfies Options

  let activeInputSessionId: string | null = null

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
  })

  // If already initialized, clean up previous listeners to avoid duplicates
  try {
    activeCleanup?.()
  } catch {}

  // Setup agent provider if configured
  if (resolved.agent) {
    const provider = createProvider(resolved.agent)
    agentManager.setProvider(provider)
  }

  let mouseX = -1000
  let mouseY = -1000
  let hovered: Element | null = null
  let rafPending = false
  let rafId = 0
  let lastRenderKey = ''
  let lastMouseMoveTime = 0
  const MOUSE_MOVE_THROTTLE_MS = 50 // 50ms throttle for mouse move
  let isCurrentlyActive = false

  const isCtrlXPressed = () => {
    return pressedKeys.has('Control') && pressedKeys.has('x')
  }

  const updateActiveState = () => {
    const wasActive = isCurrentlyActive
    isCurrentlyActive = isComboPressed(resolved.hotkey!, resolved.keyHoldDuration) || isCtrlXPressed()
    
    // If becoming inactive and no sessions, hide overlay
    if (wasActive && !isCurrentlyActive) {
      const state = stateManager.getState()
      if (state.sessions.size === 0) {
        hideOverlay()
      }
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    const now = performance.now()
    if (now - lastMouseMoveTime < MOUSE_MOVE_THROTTLE_MS) {
      return // Skip if called too soon
    }
    lastMouseMoveTime = now
    
    mouseX = e.clientX
    mouseY = e.clientY
    
    // Update active state
    updateActiveState()
    
    // Only process if active (hotkey is pressed)
    if (!isCurrentlyActive) {
      return
    }
    
    if (!rafPending) {
      rafPending = true
       rafId = requestAnimationFrame(() => {
        rafPending = false
        const state = stateManager.getState()
        const el = getElementAtMouse(mouseX, mouseY)
        hovered = el
        
        if (el && isCurrentlyActive) {
          const rect = getRect(el)
          const key = `${rect.x}|${rect.y}|${rect.width}|${rect.height}|${el.tagName}`
          if (key !== lastRenderKey) {
            lastRenderKey = key
            const locator = getLocatorData(el)
            const names = (locator.vue ?? []).map((c: any) => c?.name || 'Anonymous')
            const chain = names.length ? names.join(' > ') : ''
            
            renderOverlay(
              rect,
              el.tagName.toLowerCase(),
              { x: mouseX, y: mouseY },
              chain,
              undefined // No session ID for hover highlighting
            )
          }
        } else if (!isCurrentlyActive) {
          lastRenderKey = ''
          hideOverlay() // Hide hover overlay when hotkey is released
        }
      })
    }
  }

  const onClick = async (e: MouseEvent) => {
    const isCtrlXClick = e.ctrlKey && pressedKeys.has('x')
    
    if (!hovered) return
    
    if (isCtrlXClick) {
      e.stopPropagation()
      e.preventDefault()
      
      const rect = getRect(hovered)
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
      
      // Render input for this session
      renderInput(rect, '', async (value) => {
        // Start agent session (UI already switched to loading state by renderInput)
        await agentManager.startSession({
          element: hovered!,
          prompt: value,
          position: { x: mouseX, y: mouseY },
          selectionBounds: rect,
          sessionId
        })
        // Start render loop to update timer
        startRenderLoop()
      }, sessionId, () => {
        // Cancel callback - clean up overlay when user clicks outside or presses Escape
        cleanupSessionOverlay(sessionId)
      })
      return
    }

    if (!isComboPressed(resolved.hotkey!, resolved.keyHoldDuration)) return
    e.stopPropagation()
    e.preventDefault()
    try {
      const htmlSnippet = getHTMLSnippet(hovered)
      const locator = getLocatorData(hovered)
      const locatorJSON = JSON.stringify(locator, null, 2)
      const cfg = getConfig()
      const locatorBlock = `\n\n<vue_grab_locator>\n${locatorJSON}\n</vue_grab_locator>`
      const refBlock = `\n\n<referenced_element>\n${htmlSnippet}\n</referenced_element>`
      const combined = `${cfg.includeLocatorTag ? locatorBlock : ''}${refBlock}`
      await copyTextToClipboard(combined)
      hideOverlay()
      const tag = hovered.tagName.toLowerCase()
      showToast(`<strong>copy</strong> &lt;${tag}&gt;`)
      resolved.adapter?.open?.(locatorJSON)
    } catch {}
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const k = normalizeKey(e.key)
    pressedKeys.add(k as Hotkey)
    lastKeyDownTimestamps.set(k, Date.now())
    
    updateActiveState()
    const state = stateManager.getState()

    if (hovered && isCurrentlyActive) {
      const locator = getLocatorData(hovered)
      const names = (locator.vue ?? []).map((c: any) => c?.name || 'Anonymous')
      const chain = names.length ? names.join(' > ') : ''
      
      renderOverlay(
        getRect(hovered),
        hovered.tagName.toLowerCase(),
        { x: mouseX, y: mouseY },
        chain,
        undefined // No session ID for hover highlighting
      )
    }
  }

  const onKeyUp = (e: KeyboardEvent) => {
    pressedKeys.delete(normalizeKey(e.key) as Hotkey)
    updateActiveState()
    if (!isCurrentlyActive) hideOverlay() // Hide hover overlay when no hotkey is pressed
  }

  window.addEventListener('mousemove', onMouseMove)
  document.addEventListener('click', onClick)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)

  // Viewport change handling for session bounds
  const onViewportChange = () => {
    agentManager.updateSessionBoundsOnViewportChange()
  }
  window.addEventListener('scroll', onViewportChange, { capture: true })
  window.addEventListener('resize', onViewportChange)

  // Clean up pressed keys on blur to prevent stuck keys
  const onBlur = () => {
    pressedKeys.clear()
    updateActiveState()
    const state = stateManager.getState()
    if (state.sessions.size === 0) {
      hideOverlay()
    }
  }
  window.addEventListener('blur', onBlur)

  const cleanup = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('click', onClick, true)
    document.removeEventListener('keydown', onKeyDown)
    document.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('scroll', onViewportChange, { capture: true })
    window.removeEventListener('resize', onViewportChange)
    window.removeEventListener('blur', onBlur)
    if (rafId) cancelAnimationFrame(rafId)
    // Cancel all active sessions
    agentManager.abortAllSessions()
    stopRenderLoop()
    hideOverlay()
  }
  activeCleanup = cleanup
  return cleanup
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  init({})
}