import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";

export default defineConfig({
  integrations: [react()],
  output: "server",
  adapter: vercel(),
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/@lezer")) return "editor-syntax";
            if (id.includes("node_modules/@codemirror/lang-") || id.includes("node_modules/@codemirror/language-data")) return "editor-languages";
            if (id.includes("node_modules/@codemirror")) return "editor-core";
            if (id.includes("node_modules/@uiw")) return "editor-react";
            if (id.includes("node_modules/@supabase")) return "supabase";
            if (/node_modules\/(react-markdown|remark-|rehype-|unified|micromark|mdast-|hast-|property-information)/.test(id)) return "markdown-preview";
          },
        },
      },
    },
  },
});
