<script setup lang="ts">
defineProps<{ date: string; title: string; desc: string; visible: boolean }>()
</script>

<template>
  <div :class="['inline-block transition-all duration-700', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4']">
    <div class="text-vueGreen pixel-font">{{ date }}</div>
    <div class="pixel-card text-vueNavy inline-block mt-2">
      <h3 class="pixel-font text-base mb-1 text-vueNavy">{{ title }}</h3>
      <p>{{ desc }}</p>
    </div>
  </div>
</template>
