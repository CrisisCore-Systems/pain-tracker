/// <reference types="vitest" />
import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
const devCsp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self' ws://localhost:* wss://localhost:* https://api.wcb.gov; media-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; upgrade-insecure-requests";
// Production CSP removes unsafe-inline/unsafe-eval and restricts connect-src
const prodCsp = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self' https://api.wcb.gov; media-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; upgrade-insecure-requests";

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [
    react(),
    // Write a simple meta.json with output sizes for bundle badge generation
    {
      name: 'write-bundle-meta',
      apply: 'build',
      configResolved(cfg) {
        // @ts-expect-error Vite types
        this.__outDir = cfg.build?.outDir || 'dist';
      },
      closeBundle() {
        // @ts-expect-error passthrough
        const outDir: string = this.__outDir || 'dist';
        const abs = path.isAbsolute(outDir) ? outDir : path.join(process.cwd(), outDir);
        const outputs: Record<string, { bytes: number }> = {};

        function walk(dir: string) {
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (/\.(js|css|map)$/.test(entry.name)) {
              const stat = fs.statSync(full);
              const rel = path.relative(abs, full).replace(/\\/g, '/');
              outputs[rel] = { bytes: stat.size };
            }
          }
        }

        if (fs.existsSync(abs)) walk(abs);
        const metaPath = path.join(abs, 'meta.json');
        fs.writeFileSync(metaPath, JSON.stringify({ outputs }, null, 2), 'utf8');
      }
    },
    {
      name: 'security-headers',
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          // Content Security Policy
          res.setHeader('Content-Security-Policy', devCsp);
          
          // Security headers
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('X-XSS-Protection', '1; mode=block');
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
          res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()');
          
          next();
        });
      }
    }
  ],
  base: isProd ? '/pain-tracker/' : '/',
  resolve: {
    alias: {
      '@pain-tracker/services': path.resolve(__dirname, 'packages/services/src'),
      '@pain-tracker/design-system': path.resolve(__dirname, 'packages/design-system/src'),
      '@pain-tracker/utils': path.resolve(__dirname, 'packages/utils/src'),
    },
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunking strategy for better code splitting
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-is')) {
              return 'react-vendor';
            }
            
            // Charting libraries (large)
            if (id.includes('recharts') || id.includes('chart.js') || id.includes('react-chartjs')) {
              return 'chart-vendor';
            }
            
            // Date utilities
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
            
            // Form handling
            if (id.includes('react-hook-form') || id.includes('hookform') || id.includes('zod')) {
              return 'form-vendor';
            }
            
            // State management
            if (id.includes('zustand') || id.includes('immer')) {
              return 'state-vendor';
            }
            
            // PDF and export (large)
            if (id.includes('jspdf') || id.includes('react-pdf') || id.includes('html2canvas')) {
              return 'pdf-vendor';
            }
            
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
            
            // Icons and UI components
            if (id.includes('lucide-react') || id.includes('heroicons') || id.includes('radix-ui') || id.includes('focus-trap')) {
              return 'ui-vendor';
            }
            
            // Crypto
            if (id.includes('crypto-js')) {
              return 'crypto-vendor';
            }
            
            // Utility libraries
            if (id.includes('clsx') || id.includes('classnames') || id.includes('tailwind-merge') || id.includes('class-variance-authority') || id.includes('sonner')) {
              return 'utils-vendor';
            }
            
            // Everything else from node_modules
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    headers: {
      'Content-Security-Policy': devCsp,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()'
    }
  },
  define: {
    __BUILD_CSP__: JSON.stringify(isProd ? 'prod' : 'dev')
  },
  // Inject stricter CSP for production preview server (static hosting can add headers separately)
  preview: {
    headers: {
      'Content-Security-Policy': isProd ? prodCsp : devCsp
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  }
});
