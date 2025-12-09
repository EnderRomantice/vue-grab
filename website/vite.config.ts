import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      '@ender_romantice/vue-grab': path.resolve(__dirname, '../packages/vue-grab/dist/index.js'),
    },
  },
  server: {
    proxy: {
      '/api/code-edit': {
        target: 'http://localhost:6567',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
