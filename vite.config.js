import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5000,
    host: true,
    hmr: {
      port: 6000,
      path: '/hot/vite-hmr'
    }
  }
})
