#!/usr/bin/env node
/**
 * generate-test-badge.mjs
 * Parses Vitest JSON summary (coverage/coverage-summary.json OR custom) or falls back to running vitest summary.
 * Produces a shields.io endpoint JSON badge at badges/test-badge.json
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { glob } from 'glob';

const ROOT = process.cwd();
const BADGE_PATH = path.join(ROOT, 'badges', 'test-badge.json');

function trySpawn(cmd, args) {
  try {
    return spawn(cmd, args, { stdio: ['ignore', 'pipe', 'inherit'] });
  } catch {
    return null; // ignore
  }
}

function platformVitestCommands() {
  const isWin = process.platform === 'win32';
  return isWin ? ['vitest.cmd', 'vitest', 'npx.cmd', 'npx'] : ['vitest', 'npx'];
}

async function runVitestList() {
  return new Promise((resolve, reject) => {
    const cmds = platformVitestCommands();
    let proc = null;
    for (const c of cmds) {
      proc = trySpawn(c, c.startsWith('npx') ? ['vitest', 'list', '--run', '--reporter', 'json'] : ['list', '--run', '--reporter', 'json']);
      if (proc) break;
    }
    if (!proc) return reject(new Error('Unable to spawn vitest'));
    let buf = '';
    proc.stdout.on('data', d => (buf += d.toString()));
    proc.on('error', reject);
    proc.on('close', code => {
      if (code !== 0) return reject(new Error('vitest list failed'));
      resolve(buf);
    });
  });
}

async function fallbackStaticScan() {
  const pattern = 'src/test/**/*.test.{ts,tsx}';
  const files = await glob(pattern, { nodir: true });
  let total = 0;
  const testRegex = /\b(?:it|test)(?:\.(?:only|skip|todo))?\s*\(/g;
  for (const file of files) {
    try {
      const content = await readFile(file, 'utf8');
      const matches = content.match(testRegex);
      if (matches) total += matches.length;
    } catch { /* ignore */ }
  }
  return total;
}

async function getTestCount() {
  // Prefer running vitest list to get current count rather than coverage summary (may not include skipped) .
  try {
    const raw = await runVitestList();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Vitest list reporter returns array of files; each has tests length
      const total = parsed.reduce((acc, f) => acc + (Array.isArray(f.tests) ? f.tests.length : 0), 0);
      return total;
    }
  } catch (e) {
    // Fallback: if a prior json run reporter output exists at VITEST_JSON path, parse it
    const runJsonPath = process.env.VITEST_JSON || path.join(ROOT, 'vitest-run.json');
    if (existsSync(runJsonPath)) {
      try {
        const runData = JSON.parse(await readFile(runJsonPath, 'utf8'));
        if (runData?.testResults && Array.isArray(runData.testResults)) {
          const total = runData.testResults.reduce((acc, f) => acc + (Array.isArray(f.assertionResults) ? f.assertionResults.length : 0), 0);
          if (total > 0) return total;
        }
      } catch { /* ignore */ }
    }
  // fallback: static scan of test sources
  const staticCount = await fallbackStaticScan();
  if (staticCount > 0) return staticCount;
  // fallback: scan coverage summary if exists (not ideal)
    const coverPath = path.join(ROOT, 'coverage', 'coverage-summary.json');
    if (existsSync(coverPath)) {
      try {
        const data = JSON.parse(await readFile(coverPath, 'utf8'));
        if (data && data.total) {
          return data.total.lines?.covered ?? 0; // crude fallback
        }
  } catch { /* ignore malformed coverage summary */ }
    }
    throw e;
  }
}

function badgeColor(count) {
  if (count >= 250) return 'brightgreen';
  if (count >= 180) return 'green';
  if (count >= 120) return 'yellowgreen';
  if (count >= 60) return 'yellow';
  return 'lightgrey';
}

async function main() {
  const count = await getTestCount();
  const badge = {
    schemaVersion: 1,
    label: 'tests',
    message: String(count),
    color: badgeColor(count)
  };
  await writeFile(BADGE_PATH, JSON.stringify(badge, null, 2));
  console.log(`Generated test badge with count=${count}`);
}

main().catch(err => {
  console.error('Failed to generate test badge:', err);
  process.exit(1);
});
