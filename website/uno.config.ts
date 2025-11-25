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
      vueGreen: '#42b883',
      vueNavy: '#35495e',
      vueBlack: '#0f1217',
      vueWhite: '#f8fafc',
    },
  },
  shortcuts: {
    'pixel-font': 'font-display',
    'retro-bg': 'bg-vueBlack bg-[linear-gradient(90deg,#35495e_1px,transparent_1px),linear-gradient(#35495e_1px,transparent_1px)] bg-[length:20px_20px]',
    'pixel-card': 'border-4 border-vueNavy bg-vueGreen p-4 shadow-[6px_6px_0_#35495e] rounded-none text-vueNavy',
    'pixel-btn': 'border-4 border-vueNavy bg-vueGreen px-3 py-2 shadow-[4px_4px_0_#35495e] hover:bg-[#3aa876] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0_#35495e] transition-all duration-150 cursor-pointer text-vueNavy',
    'pixel-tab': 'border-4 border-vueNavy bg-vueGreen px-3 py-2 shadow-[4px_4px_0_#35495e] hover:bg-[#3aa876] transition-colors duration-150 cursor-pointer text-vueNavy',
    'accent-text': 'text-vueGreen',
  },
})
