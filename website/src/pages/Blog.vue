<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TimelineItem from '../components/TimelineItem.vue'

const items = [
  {
    date: 'Oct 29',
    title: 'First update',
    desc: 'Saw React Grab on Twitter; created the repo and initialized the project that night.'
  },
  {
    date: 'Nov 4',
    title: 'First website and npm release',
    desc: 'Published the website and the first npm version v1.0.0.'
  },
  {
    date: 'Nov 23',
    title: 'Polished and promoted',
    desc: 'Polished features; promoted on Twitter; reshared by Evan You (creator of Vue and Vite).'
  },
  {
    date: 'Nov 26',
    title: 'Demo reset and enhancements',
    desc: 'Reset the demo site, added crosshair locator and hover component path preview.'
  }
]

const visible = ref<boolean[]>(Array(items.length).fill(false))
let observer: IntersectionObserver

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement
      const idx = Number(el.dataset.i ?? -1)
      if (idx >= 0 && entry.isIntersecting) visible.value[idx] = true
    }
  }, { threshold: 0.2 })
  document.querySelectorAll('.timeline-item').forEach(el => observer.observe(el))
})
</script>

<template>
  <div class="relative">
    <div class="absolute left-1/2 top-0 -translate-x-1/2 w-[2px] bg-vueNavy h-full"></div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div
        v-for="(it,i) in items"
        :key="i"
        class="timeline-item"
        :data-i="i"
        :class="i % 2 === 0 ? 'md:col-start-1 flex justify-end pr-6' : 'md:col-start-2 flex justify-start pl-6'"
      >
        <TimelineItem
          :date="it.date"
          :title="it.title"
          :desc="it.desc"
          :visible="!!visible[i]"
        />
      </div>
    </div>
  </div>
</template>
