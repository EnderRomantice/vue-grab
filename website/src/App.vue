<script setup lang="ts"></script>

<template>
    <main
        class="retro-bg min-h-screen text-white flex flex-col items-center justify-center gap-6"
    >
        <div class="text-center space-y-3">
            <div class="flex items-center justify-center gap-3">
                <img
                    src="./assets/vue-grab.svg"
                    alt="Vue logo"
                    class="w-8 h-8"
                />
                <h1 class="pixel-font text-3xl md:text-4xl tracking-widest">
                    vue-grab
                </h1>
            </div>
            <p class="text-sm md:text-base opacity-80">
                Hover any element, hold
                <span class="pixel-card inline-block px-2 py-1">Ctrl + C</span>
                (macOS:
                <span class="pixel-card inline-block px-2 py-1">⌘ + c</span>),
                then click to copy the element info.
            </p>
        </div>

        <section
            class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 w-full max-w-5xl"
        >
            <div class="pixel-card text-vueNavy">
                <h2 class="pixel-font text-lg mb-2 text-vueNavy">
                    Sample Card
                </h2>
                <p>This is a demo card. Try hovering and using the hotkey.</p>
                <button class="pixel-btn mt-3">Click me</button>
            </div>

            <div class="pixel-card text-vueNavy">
                <h2 class="pixel-font text-lg mb-2 text-vueNavy">List</h2>
                <ul class="list-disc pl-5">
                    <li>Item One</li>
                    <li>Item Two</li>
                    <li>Item Three</li>
                </ul>
            </div>

            <div class="pixel-card text-vueNavy">
                <h2 class="pixel-font text-lg mb-2 text-vueNavy">Form</h2>
                <input
                    class="border-4 border-vueNavy bg-vueWhite text-vueNavy px-2 py-1 w-[80%] mb-2"
                    placeholder="Type something here"
                />
                <button class="pixel-btn">Submit</button>
            </div>
        </section>

        <footer class="opacity-70 text-xs md:text-sm">
            Shortcut: Windows/Linux use
            <span class="accent-text font-bold">Ctrl + C</span>, macOS use
            <span class="accent-text font-bold">⌘ + c</span>.
        </footer>
    </main>
</template>
