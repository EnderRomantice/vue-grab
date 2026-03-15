import type { AgentProvider, AgentContext } from '../types'

export interface ProviderOptions {
  type?: string
  endpoint: string
  provider?: string
  model?: string
  apiKey?: string
  [key: string]: any
}

/**
 * Creates a generic HTTP SSE provider that can talk to any compatible agent server.
 */
export function createProvider(options: ProviderOptions): AgentProvider<{ locator: any; htmlSnippet: string }> {
  const { endpoint } = options

  return {
    async *send(context: AgentContext<{ locator: any; htmlSnippet: string }>, signal: AbortSignal) {
      const { prompt, options: ctxOptions } = context
      if (!ctxOptions) throw new Error('Missing locator and htmlSnippet')
      const { locator, htmlSnippet } = ctxOptions

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          locator,
          htmlSnippet,
          agentConfig: {
            ...options,
            // Remove endpoint from nested config to avoid recursion/clutter
            endpoint: undefined 
          }
        }),
        signal
      })

      if (!response.body) throw new Error('No response body')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let currentEvent = 'message'

      try {
        while (true) {
          const { done: streamDone, value: chunk } = await reader.read()
          if (streamDone) break
          
          buffer += decoder.decode(chunk, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue
            if (trimmed.startsWith('event: ')) {
              currentEvent = trimmed.slice(7).trim()
            } else if (trimmed.startsWith('data: ')) {
              const data = trimmed.slice(6)
              if (currentEvent === 'error') {
                throw new Error(data)
              } else if (currentEvent === 'done') {
                return // stream ends
              } else {
                let preview = data
                try {
                  const json = JSON.parse(data)
                  if (json.type === 'fragment') preview = 'Generating...'
                  else if (json.message) preview = json.message
                } catch {}
                yield preview
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    },

    supportsResume: false,
    getCompletionMessage: () => 'Done'
  }
}
