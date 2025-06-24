import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 100
    },
    host: true, // important if accessing from host machine
    port: 5173
  }, 
  resolve: {
    alias: {
      "@letsplaychess/types": path.resolve(__dirname, "../../packages/types/src"),
      "@letsplaychess/models": path.resolve(__dirname, "../../packages/models/src"),
      "@letsplaychess/referee": path.resolve(__dirname, "../../packages/referee/src")
    }
  }
})
