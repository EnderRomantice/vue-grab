<script setup lang="ts">
defineProps<{ name: string; role: string; link?: string }>()
</script>

<template>
  <div class="pixel-card text-vueNavy">
    <h3 class="pixel-font text-base mb-2 text-vueNavy">{{ name }}</h3>
    <p class="mb-3">{{ role }}</p>
    <a v-if="link" :href="link" target="_blank" rel="noopener noreferrer" class="pixel-btn inline-block">主页</a>
  </div>
</template>
