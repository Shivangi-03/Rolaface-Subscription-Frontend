import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
 
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://erp.local:8000", // same Frappe backend your ERP uses
        changeOrigin: true,
      },
    },
  },
});