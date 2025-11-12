import { createApp } from 'vue'
import App from './App.vue'
import 'uno.css'
import { init } from '@ender_romantice/vue-grab'

init({
  enabled: true,

  hotkey: ['c', 'v'],

  keyHoldDuration: 500,
  

  // highlightColor: '#D946EF', // 统一设置高亮主色（亮粉）
  // labelTextColor: '#ffffff', // 统一设置标签文本颜色
  // showTagHint: true,
  // filter: {
  //   ignoreSelectors: ['.nav', 'header'], // 需要忽略的选择器数组
  //   ignoreTags: ['svg'], // 需要忽略的标签名数组
  //   skipCommonComponents: true, // 跳过常见布局组件
  // },

  adapter: {
    open: (text: string) => {
     
      console.log('[demo] JSON:', text)
    },
  },
})

createApp(App).mount('#app')
