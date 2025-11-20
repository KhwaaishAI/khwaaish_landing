import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy REST API calls to backend to avoid CORS during development
      '/api': {
        target: 'https://api.khwaaish.com',
        changeOrigin: true,
        secure: true,
      },
      '/amazon_aitomation': {
        target: 'https://api.khwaaish.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
