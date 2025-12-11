<script setup lang="ts">
import { onMounted } from "vue";
import { init } from "@ender_romantice/vue-grab";
import Home from "./pages/Home.vue";

const config = {
    enabled: true,
    hotkey: ["c", "v"],
    keyHoldDuration: 500,
    showTagHint: true,
    includeLocatorTag: true,
    labelTextColor: "#ffffff",
    agent: {
        type: "opencode" as const,
        endpoint: "http://127.0.0.1:6569/api/code-edit",
        provider: "deepseek",
        model: "deepseek/deepseek-chat",
    },
    filter: {
        ignoreSelectors: [".nav", "header"],
        ignoreTags: ["svg"],
        skipCommonComponents: true,
    },
    adapter: {
        open: (text: string) => {
            console.log("[demo] JSON:", text);
        },
    },
};

onMounted(() => {
    init(config);
});
</script>

<template>
    <main
        class="retro-bg min-h-screen text-white flex flex-col overflow-x-hidden overflow-y-auto"
    >
        <header
            class="w-full flex items-center justify-start px-6 py-6 sticky top-0 z-50 bg-black/50 backdrop-blur-sm border-b-4 border-vueNavy/50 pixel-crack"
        >
            <div class="flex items-center gap-4">
                <img
                    src="./assets/vue-grab.svg"
                    alt="Vue Grab"
                    class="w-16 h-16 pixel-icon"
                />
                <span class="pixel-font text-4xl tracking-widest text-vueGreen glitch-text"
                    >VUE-GRAB</span
                >
            </div>
            <a
                href="https://github.com/EnderRomantice/vue-grab"
                target="_blank"
                rel="noopener noreferrer"
                class="pixel-btn flex items-center gap-2 text-white hover:text-vueGreen transition-colors ml-8"
                title="View on GitHub"
            >
                <div class="i-mdi:github text-2xl"></div>
                <span class="hidden md:inline pixel-font">GitHub</span>
            </a>
        </header>

         <section class="flex-1 px-4 py-12 flex justify-center pixel-crack-bg">
            <div class="w-full max-w-4xl px-6">
                <Home />
            </div>
        </section>
    </main>
</template>
