import { createApp } from 'vue'
import App from './App.vue'
import 'uno.css'
import { init } from '../../dist/index.js'

init({
  enabled: true,

  hotkey: ['c', 'v'],

  keyHoldDuration: 500,
  adapter: {
    open: (text: string) => {
     
      console.log('[demo] JSON:', text)
    },
  },
})

createApp(App).mount('#app')
