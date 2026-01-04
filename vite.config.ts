import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy to local backend
      "/api": {
        target: "https://api.khwaaish.com",
        changeOrigin: true,
        secure: true,
      },
      // Remove or update other proxies if not needed
      "/amazon": {
        target: "http://localhost:8001", // Update if needed
        changeOrigin: true,
        secure: false,
      },
      "/amazon_aitomation": {
        target: "http://localhost:8001", // Update if needed
        changeOrigin: true,
        secure: false,
      },
    },
  },
});