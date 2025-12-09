<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { init, type Options } from "@ender_romantice/vue-grab";
import Home from "./pages/Home.vue";
import About from "./pages/About.vue";
import Blog from "./pages/Blog.vue";

const currentTab = ref<"HOME" | "ABOUT" | "BLOG" | "CONFIG">("HOME");

const envApiKey = import.meta.env.VITE_DS_API_KEY || "";

const config = ref<Options>({
    enabled: true,
    hotkey: ["c", "v"],
    keyHoldDuration: 500,
    showTagHint: true,
    includeLocatorTag: true,
    agent: {
        type: "opencode",
        provider: "deepseek",
        model: "deepseek/deepseek-reasoner",
        apiKey: envApiKey,
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
});

// String bindings for UI
const hotkeyString = computed({
    get: () =>
        Array.isArray(config.value.hotkey)
            ? config.value.hotkey.join(",")
            : config.value.hotkey || "",
    set: (value: string) => {
        const keys = value
            .split(/[,;\s]+/)
            .map((k) => k.trim())
            .filter(Boolean);
        config.value.hotkey = keys.length === 1 ? keys[0] : keys;
    },
});

const ignoreSelectorsString = computed({
    get: () => config.value.filter?.ignoreSelectors?.join("\n") || "",
    set: (value: string) => {
        if (!config.value.filter) config.value.filter = {};
        config.value.filter.ignoreSelectors = value
            .split(/[\n,;]+/)
            .map((s) => s.trim())
            .filter(Boolean);
    },
});

// @ts-ignore
const ignoreTagsString = computed({
    get: () => config.value.filter?.ignoreTags?.join("\n") || "",
    set: (value: string) => {
        if (!config.value.filter) config.value.filter = {};
        config.value.filter.ignoreTags = value
            .split(/[\n,;]+/)
            .map((s) => s.trim())
            .filter(Boolean);
    },
});

const applyConfig = () => {
    init(config.value);
};



watch(() => config.value, applyConfig, { deep: true, immediate: false });

onMounted(() => {
    applyConfig();
});
</script>

<template>
    <main
        class="retro-bg min-h-screen text-white flex flex-col overflow-x-hidden overflow-y-auto"
    >
        <header
            class="w-full flex items-center px-4 py-3 sticky top-0 z-50 bg-vueBlack"
        >
            <div
                class="flex items-center gap-3 flex-shrink-0"
                @click="currentTab = 'HOME'"
            >
                <img
                    src="./assets/vue-grab.svg"
                    alt="Vue Grab"
                    class="w-10 h-10"
                />
                <span class="pixel-font text-2xl tracking-widest"
                    >vue-test</span
                >
            </div>
            <nav
                class="ml-auto flex-1 flex flex-wrap justify-end items-center gap-2 md:gap-4 max-w-full pr-6"
            >
                <button
                    class="pixel-tab text-xs md:text-sm min-w-[72px]"
                    :class="currentTab === 'HOME' ? 'bg-[#3aa876]' : ''"
                    @click="currentTab = 'HOME'"
                >
                    HOME
                </button>
                <button
                    class="pixel-tab text-xs md:text-sm min-w-[72px]"
                    :class="currentTab === 'ABOUT' ? 'bg-[#3aa876]' : ''"
                    @click="currentTab = 'ABOUT'"
                >
                    ABOUT
                </button>
                <button
                    class="pixel-tab text-xs md:text-sm min-w-[72px]"
                    :class="currentTab === 'BLOG' ? 'bg-[#3aa876]' : ''"
                    @click="currentTab = 'BLOG'"
                >
                    BLOG
                </button>
                <button
                    class="pixel-tab text-xs md:text-sm min-w-[72px]"
                    :class="currentTab === 'CONFIG' ? 'bg-[#3aa876]' : ''"
                    @click="currentTab = 'CONFIG'"
                >
                    CONFIG
                </button>
            </nav>
        </header>

        <section class="flex-1 px-4 py-6 flex justify-center">
            <div class="w-full max-w-3xl">
                <Home v-if="currentTab === 'HOME'" />
                <About v-else-if="currentTab === 'ABOUT'" />
                <Blog v-else-if="currentTab === 'BLOG'" />
                <div v-else class="pixel-card text-vueNavy p-6 space-y-6">
                    <h2 class="pixel-font text-2xl text-vueNavy">
                        Configuration
                    </h2>
                    <p class="opacity-80">
                        Adjust vue-grab settings and see the effect immediately.
                    </p>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Basic Settings -->
                        <div class="space-y-4">
                            <h3 class="pixel-font text-lg">Basic Settings</h3>

                            <div class="space-y-2">
                                <label class="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        v-model="config.enabled"
                                        class="w-4 h-4"
                                    />
                                    <span>Enabled</span>
                                </label>

                                <div class="space-y-1">
                                    <label class="block text-sm"
                                        >Hotkeys (comma separated)</label
                                    >
                                    <input
                                        type="text"
                                        v-model="hotkeyString"
                                        class="w-full p-2 border border-vueNavy rounded bg-white text-vueNavy"
                                        placeholder="c,v"
                                    />
                                    <p class="text-xs opacity-70">
                                        Single letters: OR semantics. Use
                                        Control+c for combo.
                                    </p>
                                </div>

                                <div class="space-y-1">
                                    <label class="block text-sm"
                                        >Key Hold Duration (ms)</label
                                    >
                                    <input
                                        type="number"
                                        v-model="config.keyHoldDuration"
                                        class="w-full p-2 border border-vueNavy rounded bg-white text-vueNavy"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- UI Settings -->
                        <div class="space-y-4">
                            <h3 class="pixel-font text-lg">UI Settings</h3>

                            <div class="space-y-2">
                                <div class="space-y-1">
                                    <label class="block text-sm"
                                        >Highlight Color</label
                                    >
                                    <div class="flex gap-2">
                                        <input
                                            type="color"
                                            v-model="config.highlightColor"
                                            class="w-10 h-10 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            v-model="config.highlightColor"
                                            class="flex-1 p-2 border border-vueNavy rounded bg-white text-vueNavy"
                                        />
                                    </div>
                                </div>

                                <div class="space-y-1">
                                    <label class="block text-sm"
                                        >Label Text Color</label
                                    >
                                    <div class="flex gap-2">
                                        <input
                                            type="color"
                                            v-model="config.labelTextColor"
                                            class="w-10 h-10 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            v-model="config.labelTextColor"
                                            class="flex-1 p-2 border border-vueNavy rounded bg-white text-vueNavy"
                                        />
                                    </div>
                                </div>

                                <label class="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        v-model="config.showTagHint"
                                        class="w-4 h-4"
                                    />
                                    <span>Show Tag Hint</span>
                                </label>

                                <label class="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        v-model="config.includeLocatorTag"
                                        class="w-4 h-4"
                                    />
                                    <span
                                        >Include Locator Tag in copied
                                        content</span
                                    >
                                </label>
                            </div>
                        </div>

                        <!-- Filter Settings -->
                        <div class="space-y-4 md:col-span-2">
                            <h3 class="pixel-font text-lg">Filter Settings</h3>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="space-y-2">
                                    <label class="block text-sm"
                                        >Ignore Selectors</label
                                    >
                                    <textarea
                                        v-model="ignoreSelectorsString"
                                        class="w-full p-2 border border-vueNavy rounded bg-white text-vueNavy h-24"
                                        placeholder=".nav, header"
                                    ></textarea>
                                    <p class="text-xs opacity-70">
                                        CSS selectors to ignore, one per line or
                                        comma separated
                                    </p>
                                </div>

                                <div class="space-y-2">
                                    <label class="block text-sm"
                                        >Ignore Tags</label
                                    >
                                    <textarea
                                        v-model="ignoreTagsString"
                                        class="w-full p-2 border border-vueNavy rounded bg-white text-vueNavy h-24"
                                        placeholder="svg, canvas"
                                    ></textarea>
                                    <p class="text-xs opacity-70">
                                        Tag names to ignore, one per line or
                                        comma separated
                                    </p>
                                </div>

                                <div class="space-y-2">
                                    <label class="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            v-model="
                                                config.filter!
                                                    .skipCommonComponents
                                            "
                                            class="w-4 h-4"
                                        />
                                        <span
                                            >Skip Common Layout Components</span
                                        >
                                    </label>
                                    <p class="text-xs opacity-70">
                                        Skip header, nav, footer, aside elements
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Agent Settings -->
                    <div class="space-y-4 md:col-span-2">
                        <h3 class="pixel-font text-lg">AI Agent Settings</h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="block text-sm">Agent Type</label>
                                <select
                                    v-model="config.agent!.type"
                                    class="w-full p-2 border border-vueNavy rounded bg-white text-vueNavy"
                                >
                                    <option value="claude">Claude</option>
                                    <option value="opencode">OpenCode</option>
                                </select>
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm">Provider</label>
                                <input
                                    type="text"
                                    v-model="config.agent!.provider"
                                    class="w-full p-2 border border-vueNavy rounded bg-white text-vueNavy"
                                    placeholder="deepseek"
                                />
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm">Model</label>
                                <input
                                    type="text"
                                    v-model="config.agent!.model"
                                    class="w-full p-2 border border-vueNavy rounded bg-white text-vueNavy"
                                    placeholder="deepseek/deepseek-v3.2"
                                />
                            </div>

                            <div class="space-y-2">
                                <label class="block text-sm">API Key</label>
                                <input
                                    type="password"
                                    v-model="config.agent!.apiKey"
                                    class="w-full p-2 border border-vueNavy rounded bg-white text-vueNavy"
                                    placeholder="From VITE_DS_API_KEY env var"
                                />
                                <p class="text-xs opacity-70">
                                    Current:
                                    {{
                                        config.agent!.apiKey
                                            ? config.agent!.apiKey.slice(0, 4) +
                                              "..." +
                                              config.agent!.apiKey.slice(-4)
                                            : "Not set"
                                    }}
                                </p>
                            </div>
                        </div>

                        <div class="space-y-2 pt-2">
                            <label class="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    :checked="!!config.agent"
                                     @change="config.agent = $event.target && ($event.target as HTMLInputElement).checked ? { type: 'opencode', provider: 'deepseek', model: 'deepseek/deepseek-reasoner', apiKey: envApiKey } : undefined"
                                    class="w-4 h-4"
                                />
                                <span>Enable AI Agent (Ctrl+X to edit)</span>
                            </label>
                            <p class="text-xs opacity-70">
                                Enable AI agent for code editing. Press Ctrl+X
                                while hovering an element to edit.
                            </p>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-vueNavy/20">
                        <button
                            @click="applyConfig"
                            class="pixel-button bg-vueGreen text-white px-4 py-2"
                        >
                            Apply Configuration
                        </button>
                        <p class="mt-2 text-sm opacity-70">
                            Configuration is applied automatically on change.
                            Use this button to force reapply.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </main>
</template>
