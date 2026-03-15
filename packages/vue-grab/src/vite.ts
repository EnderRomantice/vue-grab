import { Plugin } from 'vite'
import { parse, transform } from '@vue/compiler-dom'
import MagicString from 'magic-string'
import { relative } from 'path'

export function vueGrabPlugin(): Plugin {
  return {
    name: 'vite-plugin-vue-grab',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.vue')) return

      const s = new MagicString(code)
      const relativePath = relative(process.cwd(), id).replace(/\\/g, '/')

      const result = parse(code)
      
      transform(result, {
        nodeTransforms: [
          (node) => {
            if (node.type === 1) { // Element node
              const { start } = node.loc
              const attr = ` data-v-grab="${relativePath}:${start.line}:${start.column}"`
              
              // Find the right position to insert the attribute (after tag name)
              const tagEndPos = start.offset + node.tag.length + 1
              s.appendLeft(tagEndPos, attr)
            }
          }
        ]
      })

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      }
    }
  }
}
