import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://zicons.zerro.dev",
  trailingSlash: "never",
  build: { format: "file" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  integrations: [
    react(),
    sitemap({
      serialize(item) {
        const icon = /\/icons\/([a-z0-9-]+)$/.exec(item.url);
        if (icon) item.img = [{ url: `https://zicons.zerro.dev/svg/${icon[1]}.svg` }];
        return item;
      },
    }),
  ],
  vite: {
    cacheDir: process.argv.includes("build") ? "node_modules/.vite-build" : "node_modules/.vite",
    plugins: [tailwindcss()],
  },
});
