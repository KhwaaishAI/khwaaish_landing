import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      // Proxy REST API calls to backend to avoid CORS during development
      "/api": {
        target: "https://api.khwaaish.com",
        changeOrigin: true,
        secure: true,
      },
      "/amazon_aitomation": {
        target: "https://api.khwaaish.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
