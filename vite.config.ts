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
  base: '/pain-tracker/',
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
