/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

// Base path. GitHub Pages serves the site under /CNKI2BIB_web/ unless a custom
// domain (CNAME) is configured, in which case set VITE_BASE=/ at build time.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/naive-ui/')) return 'naive-ui';
          if (id.includes('/node_modules/jieba-wasm/')) return 'jieba';
          if (id.includes('/node_modules/pinyin-pro/')) return 'pinyin';
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.ts', 'tests/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
