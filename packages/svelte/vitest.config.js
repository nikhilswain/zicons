import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  root: fileURLToPath(new URL("./", import.meta.url)),
  plugins: [svelte()],
  test: { environment: "node", include: ["test/**/*.test.js"] },
});
