#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const SCAN_ROOTS = [
  'src',
  'docs',
  'packages/blog/src',
  'public/screenshots',
  'scripts/screenshot-config.js',
];

const EXTENSIONS = new Set(['.md', '.ts', '.tsx', '.js', '.jsx', '.html']);

const DISALLOWED = [
  { label: 'HIPAA compliant', regex: /\bhipaa\s+compliant\b/i },
  { label: 'secure portal', regex: /\bsecure\s+portal\b/i },
  { label: 'military-grade', regex: /\bmilitary-grade\b/i },
  { label: 'never leaves your device', regex: /\bnever\s+leaves\s+your\s+device\b/i },
  { label: 'fully encrypted', regex: /\bfully\s+encrypted\b/i },
  { label: 'protected by default', regex: /\bprotected\s+by\s+default\b/i },
];

const ALLOWLIST_PATHS = new Set([
  normalize('docs/CLAIMS_BASELINE.md'),
  normalize('docs/marketing/devto-series/SERIES_PLAN.md'),
]);

function normalize(p) {
  return p.replaceAll('\\', '/');
}

function shouldScanFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return EXTENSIONS.has(ext);
}

function walk(currentPath, files) {
  const stat = fs.statSync(currentPath);
  if (stat.isFile()) {
    if (shouldScanFile(currentPath)) files.push(currentPath);
    return;
  }

  for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
    const entryPath = path.join(currentPath, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'coverage', '.git', '.next'].includes(entry.name)) continue;
      if (toRelative(entryPath).startsWith('public/screenshots/runs/')) continue;
      walk(entryPath, files);
    } else if (entry.isFile() && shouldScanFile(entryPath)) {
      files.push(entryPath);
    }
  }
}

function toRelative(filePath) {
  return normalize(path.relative(ROOT, filePath));
}

const filesToScan = [];
for (const root of SCAN_ROOTS) {
  const full = path.join(ROOT, root);
  if (!fs.existsSync(full)) continue;
  walk(full, filesToScan);
}

const violations = [];

for (const filePath of filesToScan) {
  const rel = toRelative(filePath);
  if (ALLOWLIST_PATHS.has(rel)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const rule of DISALLOWED) {
      if (rule.regex.test(line)) {
        violations.push({
          file: rel,
          line: index + 1,
          phrase: rule.label,
          text: line.trim(),
        });
      }
    }
  });
}

if (violations.length > 0) {
  console.error('[claims:validate] Disallowed claims detected:');
  for (const v of violations) {
    console.error(`- ${v.file}:${v.line} [${v.phrase}] ${v.text}`);
  }
  process.exit(1);
}

console.log('[claims:validate] No disallowed claims detected.');
