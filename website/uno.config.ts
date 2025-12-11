import { defineConfig, presetUno, presetIcons } from 'unocss'
import presetWebFonts from 'unocss/preset-web-fonts'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        // Use as `font-display`
        display: 'Press Start 2P',
        // Use as `font-mono`
        mono: 'VT323',
      },
    }),
  ],
  theme: {
    colors: {
      vueGreen: '#00ff00',
      vueNavy: '#35495e',
      vueBlack: '#0f1217',
      vueWhite: '#f8fafc',
      vueBlue: '#3b82f6',
      vueRed: '#ff4444',
    },
    animation: {
      'glitch': 'glitch 1s infinite',
      'glitch-top': 'glitch-top 1s infinite',
      'glitch-bottom': 'glitch-bottom 1s infinite',
    },
  },
  shortcuts: {
    'pixel-font': 'font-display',
    'retro-bg': 'bg-[#0a0f17] bg-[linear-gradient(90deg,#1a2433_1px,transparent_1px),linear-gradient(#1a2433_1px,transparent_1px)] bg-[length:20px_20px]',
    'pixel-card': 'border-4 border-vueNavy bg-vueGreen p-4 shadow-[6px_6px_0_#35495e] rounded-none text-vueNavy',
    'pixel-btn': 'border-4 border-vueNavy bg-vueGreen px-3 py-2 shadow-[4px_4px_0_#35495e] hover:bg-[#3aa876] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_#35495e] transition-all duration-150 cursor-pointer text-vueNavy',
    'pixel-tab': 'border-4 border-vueNavy bg-vueGreen px-3 py-2 shadow-[4px_4px_0_#35495e] hover:bg-[#3aa876] transition-colors duration-150 cursor-pointer text-vueNavy',
    'pixel-key': 'border-2 border-vueNavy px-4 py-1 shadow-[2px_2px_0_#35495e] rounded-none font-bold whitespace-nowrap',
    'accent-text': 'text-vueWhite',
    'pixel-crack': 'border-4 border-vueNavy border-dashed shadow-[0_0_0_4px_#0a0f17,0_0_20px_#42b883]',
    'pixel-crack-bg': 'bg-[#0a0f17] bg-[url("data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h100v100H0z%22%20fill%3D%22%230a0f17%22%2F%3E%3Cpath%20d%3D%22M0%200l100%20100M100%200L0%20100%22%20stroke%3D%22%2342b883%22%20stroke-width%3D%221%22%20opacity%3D%220.2%22%2F%3E%3C%2Fsvg%3E")] bg-[length:20px_20px]',
    'glitch-text': 'animate-pulse text-vueGreen drop-shadow-[0_0_8px_#42b883]',
    'pixel-icon': 'filter drop-shadow(0 0 4px #42b883)',
    'code-block': 'bg-vueBlack border-2 border-vueNavy p-4 font-mono text-sm overflow-x-auto shadow-[2px_2px_0_#35495e]',
  },
})
