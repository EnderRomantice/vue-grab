<script setup lang="ts">
</script>

<template>
  <div class="space-y-5">
    <div class="pixel-card text-vueNavy">
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
    <div class="pixel-card text-vueNavy">
      <h2 class="pixel-font text-lg mb-3 text-vueNavy">CDN</h2>
      <div class="relative">
        <pre class="bg-vueWhite text-vueNavy p-3 overflow-auto"><code>&lt;script src="https://unpkg.com/@ender_romantice/vue-grab/dist/index.global.js" crossorigin="anonymous" data-enabled="true"&gt;&lt;/script&gt;</code></pre>
      </div>
    </div>
  </div>
</template>
