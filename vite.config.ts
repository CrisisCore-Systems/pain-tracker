/// <reference types="vitest" />
import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// Development CSP - allows hot reload and dev tools
// NOTE: Don't force 'upgrade-insecure-requests' in dev unless HTTPS is enabled
// (Playwright/E2E may run the dev server on HTTP). Only include that directive
// when VITE_DEV_HTTPS is truthy.
const baseDevCsp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com; connect-src 'self' ws://localhost:* wss://localhost:* https://api.wcb.gov https://fonts.googleapis.com https://fonts.gstatic.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://region1.analytics.google.com; media-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'";
// For dev server we avoid forcing 'upgrade-insecure-requests' because
// Playwright/E2E runs commonly use an HTTP dev server. Always use the
// base dev CSP during development; the production preview uses a stricter
// CSP including upgrade-insecure-requests.
const devCsp = baseDevCsp;

// Production CSP - strict, but allows Google Analytics, Google Fonts, and CDN
const prodCsp = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com; connect-src 'self' https://api.wcb.gov https://fonts.googleapis.com https://fonts.gstatic.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://region1.analytics.google.com; media-src 'self'; object-src 'none'; frame-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'; upgrade-insecure-requests";

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
          
          // Security headers (OWASP recommended)
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('X-XSS-Protection', '1; mode=block');
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
          res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()');
          
          // Cross-Origin headers for enhanced security
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          // Note: COEP 'require-corp' breaks Vite HMR WebSocket in dev
          // Use 'credentialless' for dev to allow HMR while maintaining some isolation
          res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
          res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
          
          // HSTS for HTTPS enforcement (dev server doesn't use HTTPS, so this is for documentation)
          // In production, web server should set: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
          
          next();
        });
      }
    }
    ,
    {
      name: 'serve-public-under-base',
      configureServer(server) {
        // If VITE_BASE is set to a non-root base, ensure public assets are also
        // served under that base in dev so service worker and manifest requests
        // using the base path succeed during E2E runs.
        const base = process.env.VITE_BASE || '/';
        if (base && base !== '/') {
          const prefix = base.endsWith('/') ? base : base + '/';
          server.middlewares.use((req, res, next) => {
            try {
              if (!req.url || !req.url.startsWith(prefix)) return next();

              const relPath = req.url.slice(prefix.length);
              // only serve top-level public files (manifest.json, sw.js, icons)
              const allowed = ['sw.js', 'manifest.json', 'favicon.ico', 'favicon.svg', 'apple-touch-icon.png'];
              if (!allowed.includes(relPath)) return next();

              const publicFile = path.join(process.cwd(), 'public', relPath);
              if (!fs.existsSync(publicFile)) return next();

              // Set a minimal content-type mapping
              const ext = path.extname(publicFile).toLowerCase();
              const ct = ext === '.json' ? 'application/json' : ext === '.js' ? 'application/javascript' : ext === '.png' ? 'image/png' : ext === '.svg' ? 'image/svg+xml' : ext === '.ico' ? 'image/x-icon' : 'application/octet-stream';
              res.setHeader('Content-Type', ct);
              res.setHeader('Cache-Control', 'no-store');
              const data = fs.readFileSync(publicFile);
              res.end(data);
              return;
            } catch (e) {
              // swallow and continue to next middleware
            }
            next();
          });
        }
      }
    }
  ],
  // Allow overriding the base path for test runs (Playwright) or CI by setting VITE_BASE.
  // This keeps production default as '/', but lets E2E run under '/pain-tracker/'.
  base: process.env.VITE_BASE || '/',
  resolve: {
    alias: {
      '@pain-tracker/services': path.resolve(__dirname, 'packages/services/src'),
      '@pain-tracker/design-system': path.resolve(__dirname, 'packages/design-system/src'),
      '@pain-tracker/utils': path.resolve(__dirname, 'packages/utils/src'),
    },
  },
  build: {
    // Never generate source maps (security best practice)
    sourcemap: false,
    outDir: 'dist',
    // Always use terser for production-grade minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log statements
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        sourcemap: false, // Explicitly disable sourcemaps in rollup output
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
    strictPort: false, // Allow fallback to next available port
    host: true,
    // Enable HTTPS in dev when running E2E (controlled by env var VITE_DEV_HTTPS)
    https: process.env.VITE_DEV_HTTPS === 'true' || false,
    // HMR configuration - use 'auto' to detect actual server port
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      // Don't specify port - let Vite auto-detect the actual server port
    },
    headers: {
      'Content-Security-Policy': devCsp,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
      'Cross-Origin-Opener-Policy': 'same-origin',
      // Note: COEP 'require-corp' breaks Vite HMR WebSocket in dev
      // Use 'credentialless' for dev to allow HMR while maintaining some isolation
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Resource-Policy': 'same-origin'
    },
    proxy: {
      // Proxy API routes to development webhook server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  define: {
    __BUILD_CSP__: JSON.stringify(isProd ? 'prod' : 'dev')
  },
  // Inject stricter CSP for production preview server (static hosting can add headers separately)
  preview: {
    port: 4173,
    headers: {
      'Content-Security-Policy': prodCsp,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  }
});
