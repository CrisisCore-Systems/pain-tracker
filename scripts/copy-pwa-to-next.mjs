#!/usr/bin/env node
/**
 * copy-pwa-to-next.mjs
 *
 * Copies the Vite PWA build output (dist/) into packages/blog/public/app/
 * so that Next.js can serve the PWA at the /app route.
 *
 * Usage:
 *   node scripts/copy-pwa-to-next.mjs
 *
 * Prerequisites:
 *   - Run `npm run pwa:build:app` first (builds Vite with VITE_BASE=/app/)
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const SRC = resolve(ROOT, 'dist');
const DEST = resolve(ROOT, 'packages', 'blog', 'public', 'app');

// ── Preflight checks ──────────────────────────────────────────────────
if (!existsSync(SRC)) {
  console.error(
    '❌  dist/ not found. Run "npm run pwa:build:app" first.',
  );
  process.exit(1);
}

// ── Clean destination ──────────────────────────────────────────────────
if (existsSync(DEST)) {
  rmSync(DEST, { recursive: true, force: true });
  console.log('🧹  Cleaned previous packages/blog/public/app/');
}

mkdirSync(DEST, { recursive: true });

// ── Copy dist → public/app ────────────────────────────────────────────
cpSync(SRC, DEST, { recursive: true });

console.log(`✅  Copied dist/ → packages/blog/public/app/`);
console.log(`    PWA will be served at /app when Next.js runs.`);
