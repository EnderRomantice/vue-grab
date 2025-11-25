<script setup lang="ts">
import { onMounted, ref } from 'vue'

const visible = ref<boolean[]>([false, false])
let observer: IntersectionObserver

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement
      const idx = Number(el.dataset.i ?? -1)
      if (idx >= 0 && entry.isIntersecting) visible.value[idx] = true
    }
  }, { threshold: 0.2 })
  document.querySelectorAll('.fade-item-about').forEach(el => observer.observe(el))
})
</script>

<template>
  <div class="space-y-5">
    <div class="fade-item-about" :data-i="0" :class="['pixel-card text-vueNavy transition-all duration-700', visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4']">
      <h2 class="pixel-font text-lg mb-3 text-vueNavy">Install</h2>
      <div class="relative">
        <pre class="bg-vueWhite text-vueNavy p-3 overflow-auto"><code>pnpm add @ender_romantice/vue-grab</code></pre>
      </div>
      <h2 class="pixel-font text-lg mb-3 text-vueNavy">Usage</h2>
      <div class="relative">
        <pre class="bg-vueWhite text-vueNavy p-3 overflow-auto"><code>import { init } from '@ender_romantice/vue-grab'

init({
  enabled: true,
  hotkey: ['c','v'],
  keyHoldDuration: 500,
  includeLocatorTag: true
})</code></pre>
      </div>
      <p class="mt-3">See README for more details.</p>
    </div>
    <div class="fade-item-about" :data-i="1" :class="['pixel-card text-vueNavy transition-all duration-700', visible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4']">
      <h2 class="pixel-font text-lg mb-3 text-vueNavy">CDN</h2>
      <div class="relative">
        <pre class="bg-vueWhite text-vueNavy p-3 overflow-auto"><code>&lt;script src="https://unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"&gt;&lt;/script&gt;</code></pre>
      </div>
    </div>
  </div>
</template>
