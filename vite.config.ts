/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "crisiscore-systems",
      project: "pain-tracker",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    })
  ],
  base: process.env.NODE_ENV === 'production' ? '/pain-tracker/' : '/',
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
          'date-vendor': ['date-fns']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
});
