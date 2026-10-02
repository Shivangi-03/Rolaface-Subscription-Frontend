import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const target = env.VITE_PROXY_TARGET || "http://erp.local:8000";

  return {
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          // `secure` only matters for https targets
          secure: target.startsWith("https://"),
        },
      },
    },
  };
});