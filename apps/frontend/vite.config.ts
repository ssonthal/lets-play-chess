import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    watch: {
      usePolling: true,
      interval: 100
    },
    host: true, // important if accessing from host machine
    port: 5173
  }
})
