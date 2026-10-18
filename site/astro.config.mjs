import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://zicons.zerro.dev",
  trailingSlash: "never",
  build: { format: "file" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  integrations: [react(), sitemap()],
  vite: {
    cacheDir: process.argv.includes("build") ? "node_modules/.vite-build" : "node_modules/.vite",
    plugins: [tailwindcss()],
  },
});
