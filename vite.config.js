import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    proxy: {
      '/.netlify': {
        target: 'http://localhost:9999',
        rewrite: (path) => path.replace(/^\/\.netlify\/functions/, '')
      }
    }
  }
})