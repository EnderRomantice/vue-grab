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
  document.querySelectorAll('.fade-item-home').forEach(el => observer.observe(el))
})
</script>

<template>
  <div class="space-y-5">
    <div class="fade-item-home" :data-i="0" :class="['text-center space-y-4 transition-all duration-700', visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4']">
      <img src="../assets/vue-grab.svg" alt="Vue Grab" class="w-28 h-28 mx-auto" />
      <h1 class="pixel-font text-3xl tracking-widest text-red-500">vue-grab</h1>
      <p class="text-lg md:text-xl opacity-80">
        Hold <span class="pixel-card inline-block px-2 py-1">Ctrl + C</span> (macOS:
        <span class="pixel-card inline-block px-2 py-1">⌘ + c</span>) to hover and click to copy element info.
      </p>
    </div>
    <div class="fade-item-home" :data-i="1" :class="['flex justify-center gap-4 mt-6 transition-all duration-700', visible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4']">
      <img alt="GitHub Stars" src="https://img.shields.io/github/stars/EnderRomantice/vue-grab.svg?style=social" class="h-8" />
      <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@ender_romantice/vue-grab.svg" class="h-8" />
    </div>
  </div>
</template>
