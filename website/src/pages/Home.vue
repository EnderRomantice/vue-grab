<script setup lang="ts">
import { onMounted, ref } from 'vue'

const visible = ref<boolean[]>([false, false, false, false])
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
  <div class="space-y-12">
    <!-- Hero Section -->
    <div class="fade-item-home" :data-i="0" :class="['text-center space-y-6 transition-all duration-700', visible[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4']">
      <div class="relative inline-block">
        <img src="../assets/vue-grab.svg" alt="Vue Grab" class="w-48 h-48 mx-auto pixel-icon" />
        <div class="absolute inset-0 pixel-crack-bg opacity-30"></div>
      </div>
      <h1 class="pixel-font text-5xl md:text-6xl tracking-widest glitch-text" data-text="VUE-GRAB">VUE-GRAB</h1>
      <p class="text-xl md:text-2xl text-vueGreen pixel-font">
        Vue component inspector with <span class="text-vueRed">AI-powered</span> editing
      </p>
      <p class="text-lg text-white/80 max-w-2xl mx-auto">
        Inspect, copy, and edit Vue components directly in the browser with keyboard shortcuts and AI assistance.
      </p>
      <div class="flex justify-center gap-6 pt-4">
        <div class="pixel-crack px-6 py-3 flex items-center gap-3">
          <span class="text-2xl">⭐</span>
          <img alt="GitHub Stars" src="https://img.shields.io/github/stars/EnderRomantice/vue-grab.svg?style=social" class="h-8" />
        </div>
        <div class="pixel-crack px-6 py-3 flex items-center gap-3">
          <span class="text-2xl">📦</span>
          <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@ender_romantice/vue-grab.svg" class="h-8" />
        </div>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="fade-item-home" :data-i="1" :class="['grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-700', visible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4']">
      <!-- Copy Feature -->
      <div class="pixel-card pixel-crack p-8 space-y-6">
        <div class="flex items-center gap-4">
          <div class="pixel-key bg-vueGreen text-white text-2xl px-6 py-3">Ctrl + C</div>
          <h3 class="pixel-font text-3xl text-vueNavy">Copy Component Info</h3>
        </div>
        <p class="text-white text-lg">
          Hover over any Vue component and press <span class="font-mono bg-vueNavy/50 px-3 py-1 rounded">Ctrl + C</span> to copy detailed component information.
        </p>
        <ul class="space-y-3">
          <li class="flex items-center gap-3">
            <div class="w-3 h-3 bg-vueGreen"></div>
            <span class="text-white">Component name and file path</span>
          </li>
          <li class="flex items-center gap-3">
            <div class="w-3 h-3 bg-vueGreen"></div>
            <span class="text-white">HTML structure with CSS selectors</span>
          </li>
          <li class="flex items-center gap-3">
            <div class="w-3 h-3 bg-vueGreen"></div>
            <span class="text-white">Class list and text content</span>
          </li>
          <li class="flex items-center gap-3">
            <div class="w-3 h-3 bg-vueGreen"></div>
            <span class="text-white">Complete component locator data</span>
          </li>
        </ul>
      </div>

      <!-- AI Feature -->
      <div class="pixel-card pixel-crack p-8 space-y-6">
        <div class="flex items-center gap-4">
          <div class="pixel-key bg-[#FFD700] text-black text-2xl px-6 py-3">Ctrl + X</div>
          <h3 class="pixel-font text-3xl text-vueNavy">AI Agent Edit</h3>
        </div>
        <p class="text-white text-lg">
          Select any Vue component, press <span class="font-mono bg-[#FFD700]/50 px-3 py-1 rounded">Ctrl&nbsp;+&nbsp;X</span>, enter your prompt, and let AI agents modify the code directly.
        </p>
        <ul class="space-y-3">
          <li class="flex items-center gap-3">
            <div class="w-3 h-3 bg-[#FFD700]"></div>
            <span class="text-white">Input prompt to describe your desired changes</span>
          </li>
          <li class="flex items-center gap-3">
            <div class="w-3 h-3 bg-[#FFD700]"></div>
            <span class="text-white">AI agents (opencode, claude, cursor) execute modifications</span>
          </li>
          <li class="flex items-center gap-3">
            <div class="w-3 h-3 bg-[#FFD700]"></div>
            <span class="text-white">Modified code is returned and displayed in the browser</span>
          </li>
          <li class="flex items-center gap-3">
            <div class="w-3 h-3 bg-[#FFD700]"></div>
            <span class="text-white">Real-time code editing with AI assistance</span>
          </li>
        </ul>
        <p class="text-sm text-white/70 pt-4 border-t border-vueNavy/30">
          Supports multiple AI agents: OpenCode, Claude, and Cursor. Seamless browser-to-agent workflow.
        </p>
      </div>
    </div>

    <!-- How It Works -->
    <div class="fade-item-home" :data-i="2" :class="['pixel-crack p-8 space-y-6 transition-all duration-700', visible[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4']">
      <h2 class="pixel-font text-4xl text-vueGreen text-center">How It Works</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
        <div class="text-center space-y-4">
          <div class="text-5xl">🎯</div>
          <h3 class="pixel-font text-xl text-white">1. Select</h3>
          <p class="text-white/80">Click to select any Vue component on the page.</p>
        </div>
        <div class="text-center space-y-4">
          <div class="text-5xl">⌨️</div>
          <h3 class="pixel-font text-xl text-white">2. Shortcut</h3>
          <p class="text-white/80">Press Ctrl+C to copy info or Ctrl+X for AI edit.</p>
        </div>
        <div class="text-center space-y-4">
          <div class="text-5xl">💬</div>
          <h3 class="pixel-font text-xl text-white">3. Prompt (AI)</h3>
          <p class="text-white/80">Enter your prompt describing the desired code changes.</p>
        </div>
        <div class="text-center space-y-4">
          <div class="text-5xl">🤖</div>
          <h3 class="pixel-font text-xl text-white">4. Execute</h3>
          <p class="text-white/80">AI agents modify code and return results to browser.</p>
        </div>
      </div>
       <p class="text-center text-white/60 pt-8 text-lg">
        For AI editing: select → Ctrl+X → enter prompt → agent executes → results displayed.
      </p>
    </div>

    <!-- Quick Start -->
    <div class="fade-item-home" :data-i="3" :class="['pixel-crack p-8 space-y-8 transition-all duration-700', visible[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4']">
      <h2 class="pixel-font text-4xl text-vueGreen text-center">Quick Start</h2>
      <p class="text-center text-white/80 text-lg max-w-3xl mx-auto">
        Get started with vue-grab in minutes. Choose your preferred installation method:
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <!-- CDN Installation -->
        <div class="pixel-card space-y-6">
          <div class="flex items-center gap-3">
            <div class="text-3xl">🌐</div>
            <h3 class="pixel-font text-2xl text-vueNavy">CDN Installation</h3>
          </div>
          <p class="text-white">
            Quickest way to try vue-grab in any HTML page.
          </p>
          <div class="code-block">
            <code class="text-vueGreen">&lt;script src="https://unpkg.com/@ender_romantice/vue-grab"&gt;&lt;/script&gt;</code><br/>
            <code class="text-white">// Then initialize in your Vue app:</code><br/>
            <code class="text-vueGreen">vueGrab.init({ enabled: true })</code>
          </div>
          <div class="pt-4 border-t border-vueNavy/30">
            <p class="text-sm text-white/70">
              <span class="text-vueRed font-bold">Note:</span> For AI features, you'll need to separately install and run the OpenCode server.
            </p>
          </div>
        </div>

        <!-- npm Installation -->
        <div class="pixel-card space-y-6">
          <div class="flex items-center gap-3">
            <div class="text-3xl">📦</div>
            <h3 class="pixel-font text-2xl text-vueNavy">npm Installation</h3>
          </div>
          <p class="text-white">
            Recommended for production Vue applications.
          </p>
          <div class="code-block">
            <code class="text-white"># Install vue-grab</code><br/>
            <code class="text-vueGreen">npm install @ender_romantice/vue-grab</code><br/><br/>
            <code class="text-white"># Install OpenCode server for AI features</code><br/>
            <code class="text-vueRed">bun install opencode</code><br/>
            <code class="text-vueGreen">bun run opencode --help</code>
          </div>
          <div class="pt-4 border-t border-vueNavy/30">
            <div class="flex items-start gap-2">
              <div class="text-xl text-vueRed mt-1">⚠️</div>
              <div>
                <p class="text-sm text-white/70">
                  <span class="text-vueRed font-bold">Important:</span> OpenCode <span class="font-bold text-vueRed">must</span> be installed with bun, not npm or yarn. AI features will not work with npm/yarn installations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Example -->
      <div class="pixel-card space-y-6 mt-8">
        <h3 class="pixel-font text-2xl text-vueNavy">Basic Usage</h3>
        <div class="code-block">
          <code class="text-white">// Import and initialize in your Vue app</code><br/>
          <code class="text-vueGreen">import { init } from '@ender_romantice/vue-grab'</code><br/><br/>
          <code class="text-white">// Initialize with default settings</code><br/>
          <code class="text-vueGreen">init({</code><br/>
          <code class="text-vueGreen ml-4">enabled: true,</code><br/>
          <code class="text-vueGreen ml-4">hotkey: ['c', 'v'], // Ctrl+C or Ctrl+V</code><br/>
          <code class="text-vueGreen ml-4">agent: { type: 'opencode' } // For AI features</code><br/>
          <code class="text-vueGreen">})</code>
        </div>
        <p class="text-sm text-white/70 pt-4 border-t border-vueNavy/30">
          Once installed, hover over any Vue component and try Ctrl+C to copy component info or Ctrl+X for AI editing.
        </p>
      </div>
    </div>
  </div>
</template>
