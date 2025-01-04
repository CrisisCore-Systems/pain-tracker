/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const viteConfig = defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "crisiscore-systems",
      project: "pain-tracker",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  base: process.env.NODE_ENV === 'production' ? '/pain-tracker/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
          'pdf-vendor': ['@react-pdf/renderer', 'html2canvas', 'jspdf'],
          'ui-vendor': ['@heroicons/react', '@radix-ui/react-alert-dialog', 'lucide-react'],
          'utils-vendor': ['date-fns', 'classnames']
        }
      }
    },
    chunkSizeWarningLimit: 500
  }
});

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    watch: false
  },
});

export default mergeConfig(viteConfig, vitestConfig);
