#!/usr/bin/env node
/**
 * Privacy Gates (Static)
 *
 * Goal: fail loudly when new code introduces unexpected network/telemetry surfaces.
 *
 * This is intentionally conservative: it flags hard-coded remote origins and
 * analytics identifiers outside known, reviewed locations.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, extname, relative, sep } from 'node:path';

const ROOT = process.cwd();
const SRC_ROOT = join(ROOT, 'src');

const FILE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

/**
 * Remote origins that may appear in source (typically in a single reviewed module).
 * Keep this list short.
 */
const ALLOWED_REMOTE_SCRIPT_ORIGINS = [
  'https://www.googletagmanager.com/',
  'https://js.stripe.com/',
  'https://www.google.com/recaptcha/',
];

/**
 * Files that are allowed to reference remote origins directly.
 * Prefer allowing a specific file over allowing a whole origin everywhere.
 */
const ALLOWED_REMOTE_SCRIPT_FILES = new Set([
  normalizeRel('src/analytics/analytics-loader.ts'),
  normalizeRel('src/services/StripeService.ts'),
  normalizeRel('src/pages/SubmitStoryPage.tsx'),
]);

/**
 * Known GA measurement IDs are allowed only in the loader.
 */
const ALLOWED_GA_MEASUREMENT_ID_FILES = new Set([
  normalizeRel('src/analytics/analytics-loader.ts'),
]);

const GA_MEASUREMENT_ID_RE = /\bG-[A-Z0-9]{6,}\b/g;
// Network-surface heuristics (string literals only).
const FETCH_LITERAL_RE = /\bfetch\s*\(\s*(["'`])([^"'`]+)\1/g;
const SCRIPT_SRC_LITERAL_RE = /\b(?:src\s*=\s*|\.src\s*=\s*)(["'`])([^"'`]+)\1/g;
const BEACON_LITERAL_RE = /\bnavigator\.sendBeacon\s*\(\s*(["'`])([^"'`]+)\1/g;
const WEBSOCKET_LITERAL_RE = /\bnew\s+WebSocket\s*\(\s*(["'`])([^"'`]+)\1/g;
const IMPORTSCRIPTS_LITERAL_RE = /\bimportScripts\s*\(\s*(["'`])([^"'`]+)\1/g;

let failures = 0;

function normalizeRel(p) {
  return p.split(/[\\/]+/).join('/');
}

function log(msg) {
  console.log(msg);
}

function fail(msg) {
  failures++;
  console.error(`ERROR: ${msg}`);
}

function walkFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full));
    } else {
      const ext = extname(entry.name);
      if (FILE_EXTS.has(ext)) out.push(full);
    }
  }
  return out;
}

function readText(file) {
  return readFileSync(file, 'utf8');
}

function fileRel(file) {
  return normalizeRel(relative(ROOT, file));
}

function shouldSkipFile(rel) {
  // Avoid failing on adversarial fixtures and examples in tests.
  if (rel.includes('/src/test/')) return true;
  if (rel.endsWith('.test.ts') || rel.endsWith('.test.tsx')) return true;
  if (rel.endsWith('.spec.ts') || rel.endsWith('.spec.tsx')) return true;
  return false;
}

function isLocalhostUrl(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/i.test(url);
}

function checkScriptSrcRemote(files) {
  log('🧯 Privacy gate: remote script sources must be allowlisted...');

  for (const file of files) {
    const rel = fileRel(file);
    if (shouldSkipFile(rel)) continue;
    const text = readText(file);

    let m;
    while ((m = SCRIPT_SRC_LITERAL_RE.exec(text)) !== null) {
      const url = m[2];

      if (!/^https?:\/\//i.test(url)) continue;
      if (isLocalhostUrl(url)) continue;

      const allowedByFile = ALLOWED_REMOTE_SCRIPT_FILES.has(rel);
      const allowedByOrigin = ALLOWED_REMOTE_SCRIPT_ORIGINS.some((origin) => url.startsWith(origin));

      if (!allowedByFile || !allowedByOrigin) {
        fail(`Remote script src not allowlisted in ${rel}: ${url}`);
      }
    }
  }
}

function checkGaMeasurementIdPlacement(files) {
  log('📏 Privacy gate: GA measurement IDs placement...');

  for (const file of files) {
    const rel = fileRel(file);
    const text = readText(file);

    const matches = text.match(GA_MEASUREMENT_ID_RE) || [];
    if (matches.length === 0) continue;

    if (!ALLOWED_GA_MEASUREMENT_ID_FILES.has(rel)) {
      const unique = Array.from(new Set(matches)).slice(0, 5).join(', ');
      fail(`GA measurement ID(s) found outside allowlist in ${rel}: ${unique}`);
    }
  }
}

function checkFetchHardcodedRemote(files) {
  log('🌐 Privacy gate: fetch() must not hardcode remote origins...');

  for (const file of files) {
    const rel = fileRel(file);
    if (shouldSkipFile(rel)) continue;
    const text = readText(file);

    let m;
    while ((m = FETCH_LITERAL_RE.exec(text)) !== null) {
      const url = m[2];

      // Allow relative URLs (same-origin).
      if (url.startsWith('/')) continue;
      if (url.startsWith('./') || url.startsWith('../')) continue;

      // Allow localhost in dev tooling.
      if (isLocalhostUrl(url)) continue;

      // Flag any other protocol usage.
      if (/^https?:\/\//i.test(url)) {
        fail(`fetch() uses hard-coded remote URL in ${rel}: ${url}`);
      }
    }
  }
}

function checkNoBeaconOrWebsocketOrImportScripts(files) {
  log('🚫 Privacy gate: disallow sendBeacon/WebSocket/importScripts remote use...');

  for (const file of files) {
    const rel = fileRel(file);
    if (shouldSkipFile(rel)) continue;
    const text = readText(file);

    const patterns = [
      { re: BEACON_LITERAL_RE, name: 'navigator.sendBeacon' },
      { re: WEBSOCKET_LITERAL_RE, name: 'WebSocket' },
      { re: IMPORTSCRIPTS_LITERAL_RE, name: 'importScripts' },
    ];

    for (const p of patterns) {
      let m;
      while ((m = p.re.exec(text)) !== null) {
        const url = m[2];

        // Allow relative URLs; flag remote.
        if (url.startsWith('/')) continue;
        if (url.startsWith('./') || url.startsWith('../')) continue;
        if (isLocalhostUrl(url)) continue;

        if (/^https?:\/\//i.test(url) || /^wss?:\/\//i.test(url)) {
          fail(`${p.name} uses hard-coded remote URL in ${rel}: ${url}`);
        }
      }
    }
  }
}

function main() {
  const srcFiles = walkFiles(SRC_ROOT);

  checkScriptSrcRemote(srcFiles);
  checkGaMeasurementIdPlacement(srcFiles);
  checkFetchHardcodedRemote(srcFiles);
  checkNoBeaconOrWebsocketOrImportScripts(srcFiles);

  if (failures > 0) {
    console.error(`❌ Privacy gates failed with ${failures} issue(s).`);
    process.exit(1);
  }

  console.log('✅ Privacy gates passed.');
}

try {
  main();
} catch (err) {
  fail(`Unhandled exception: ${err?.message || String(err)}`);
  console.error(`❌ Privacy gates failed with ${failures} issue(s).`);
  process.exit(1);
}
