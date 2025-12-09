<script setup lang="ts">
import { ref, onMounted } from "vue";
import { init } from "@ender_romantice/vue-grab";
import Home from "./pages/Home.vue";
import About from "./pages/About.vue";
import Blog from "./pages/Blog.vue";

const currentTab = ref<"HOME" | "ABOUT" | "BLOG">("HOME");

const applyConfig = () => {
  init({
    enabled: true,
    hotkey: ["c", "v"],
    keyHoldDuration: 500,
    includeLocatorTag: true,
    agent: {
      type: "opencode", 
      provider: "alibaba-cn", // Service provider ID
      model: "alibaba-cn/qwen3-coder-plus", // Model name
      apiKey: "sk-98abbd47482846ad885b27668b19dfa3" 
    },
    adapter: {
      open: (text: string) => {
        console.log("[demo] JSON:", text);
      },
    },
  });
};

onMounted(() => {
  applyConfig();
});
</script>

<template>
  <main class="retro-bg min-h-screen text-white flex flex-col overflow-x-hidden overflow-y-auto">
    <header class="w-full flex items-center px-4 py-3 sticky top-0 z-50 bg-vueBlack">
      <div class="flex items-center gap-3 flex-shrink-0" @click="currentTab = 'HOME'">
        <img src="./assets/vue-grab.svg" alt="Vue Grab" class="w-10 h-10" />
        <span class="pixel-font text-2xl tracking-widest">vue-grab</span>
      </div>
      <nav class="ml-auto flex-1 flex flex-wrap justify-end items-center gap-2 md:gap-4 max-w-full pr-6">
        <button class="pixel-tab text-xs md:text-sm min-w-[72px]" :class="currentTab==='HOME' ? 'bg-[#3aa876]' : ''" @click="currentTab='HOME'">HOME</button>
        <button class="pixel-tab text-xs md:text-sm min-w-[72px]" :class="currentTab==='ABOUT' ? 'bg-[#3aa876]' : ''" @click="currentTab='ABOUT'">ABOUT</button>
        <button class="pixel-tab text-xs md:text-sm min-w-[72px]" :class="currentTab==='BLOG' ? 'bg-[#3aa876]' : ''" @click="currentTab='BLOG'">BLOG</button>
      </nav>
    </header>

    <section class="flex-1 px-4 py-6 flex justify-center">
      <div class="w-full max-w-3xl">
        <Home v-if="currentTab==='HOME'" />
        <About v-else-if="currentTab==='ABOUT'" />
        <Blog v-else />
      </div>
    </section>
  </main>
</template>