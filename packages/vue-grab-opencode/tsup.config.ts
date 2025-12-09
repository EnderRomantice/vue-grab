import fs from "node:fs";
import { defineConfig } from "tsup";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8")) as { version: string };

export default defineConfig([
  {
    entry: {
      server: "./src/server.ts",
      cli: "./src/cli.ts",
    },
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: false,
    target: "node18",
    platform: "node",
    treeshake: true,
    noExternal: [/.*/],
    env: {
      VERSION: process.env.VERSION ?? packageJson.version,
    },
  },
]);
