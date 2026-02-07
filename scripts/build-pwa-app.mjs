#!/usr/bin/env node
/**
 * build-pwa-app.mjs
 *
 * Builds the Vite PWA with VITE_BASE=/app/ so all asset paths
 * are prefixed correctly for serving under the /app sub-path.
 *
 * This is a cross-platform wrapper that works on both Windows (PowerShell)
 * and Linux (Vercel CI).
 */

import { execSync } from 'node:child_process';

process.env.VITE_BASE = '/app/';

// Capture git hash for cache-busting (matches current Vercel buildCommand)
try {
  const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  process.env.VITE_BUILD_HASH = hash;
  console.log(`🔖  Build hash: ${hash}`);
} catch {
  console.warn('⚠️  Could not get git hash, skipping VITE_BUILD_HASH');
}

console.log('🔨  Building PWA with VITE_BASE=/app/ ...');

execSync('npm run build', {
  stdio: 'inherit',
  env: { ...process.env, VITE_BASE: '/app/' },
});

console.log('✅  PWA build complete (base path: /app/)');
