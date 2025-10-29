import { defineConfig, type Options } from "tsup";

const DEFAULT_OPTIONS: Options = {
  clean: true,
  dts: false,
  entry: [],
  env: {
    NODE_ENV: process.env.NODE_ENV ?? "development",
  },
  format: [],
  minify: false,
  outDir: "./dist",
  platform: "browser",
  sourcemap: false,
  splitting: false,
  target: "esnext",
  treeshake: true,
};

export default defineConfig([
  {
    ...DEFAULT_OPTIONS,
    entry: ["./src/index.ts"],
    format: ["iife"],
    globalName: "VueGrab",
    minify: process.env.NODE_ENV === "production",
    outDir: "./dist",
  },
  {
    ...DEFAULT_OPTIONS,
    entry: ["./src/index.ts"],
    format: ["cjs", "esm"],
    outDir: "./dist",
  },
]);