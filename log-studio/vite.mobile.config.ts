import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";

function capacitorIndex() {
  return {
    name: "capacitor-index",
    closeBundle() {
      copyFileSync("mobile-dist/mobile.html", "mobile-dist/index.html");
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), capacitorIndex()],
    publicDir: "public",
    build: {
      outDir: "mobile-dist",
      emptyOutDir: true,
      rollupOptions: { input: { index: "mobile.html" } },
    },
    define: {
      "import.meta.env.PUBLIC_MOBILE_MODE": JSON.stringify("true"),
      "import.meta.env.PUBLIC_SUPABASE_URL": JSON.stringify(env.PUBLIC_SUPABASE_URL || ""),
      "import.meta.env.PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(env.PUBLIC_SUPABASE_ANON_KEY || ""),
      "import.meta.env.PUBLIC_SUPABASE_BUCKET": JSON.stringify(env.PUBLIC_SUPABASE_BUCKET || "log-assets"),
      "import.meta.env.PUBLIC_DEV_BYPASS_AUTH": JSON.stringify("false"),
      "import.meta.env.PUBLIC_DESKTOP_MODE": JSON.stringify("false"),
    },
  };
});
