import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    exclude: ['node_modules', 'tests/e2e/**'],
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
