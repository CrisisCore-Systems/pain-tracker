#!/usr/bin/env node
/**
 * Documentation Validation Script
 * Checks:
 * 1. Local file links in README exist.
 * 2. Source test-file count drift (README claimed vs actual src test files).
 * 3. Feature Matrix status values are constrained.
 *
 * Exit codes:
 * 0 = success
 * 1 = failures detected
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED_STATUSES = new Set(['Implemented', 'Partial', 'Planned']);
const ROOT = process.cwd();
let failures = 0;

function log(msg) {
  console.log(msg);
}

function fail(msg) {
  failures++;
  console.error(`ERROR: ${msg}`);
}

function readFile(path) {
  return readFileSync(join(ROOT, path), 'utf8');
}

function validateLocalLinks() {
  log('Validating local file links in README...');
  const readme = readFile('README.md');

  const linkRegex = /\[[^\]]+\]\((?!https?:\/\/)([^)]+)\)/g;
  const seen = new Set();
  let match;
  while ((match = linkRegex.exec(readme)) !== null) {
    const target = match[1].split('#')[0].trim();
    if (!target || target.startsWith('mailto:')) continue;
    if (target.startsWith('data:')) continue;
    if (seen.has(target)) continue;
    seen.add(target);

    const resolved = join(ROOT, target);
    if (!existsSync(resolved)) {
      fail(`Missing linked file: ${target}`);
    } else {
      log(`  OK ${target}`);
    }
  }
  if (seen.size === 0) {
    fail('No local links found to validate (unexpected).');
  }
}

function validateTestCount() {
  log('Validating source test-file count drift...');
  const readme = readFile('README.md');
  const countMatch = readme.match(/(\d+)\s+source test files/i);
  if (!countMatch) {
    fail('Could not find declared source test-file count in README (e.g., "128 source test files").');
    return;
  }
  const declared = parseInt(countMatch[1], 10);

  const testFiles = [];
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(test|spec)\.(c|m)?(t|j)sx?$/.test(entry.name)) {
        testFiles.push(full);
      }
    }
  }
  walk(join(ROOT, 'src'));

  const actual = testFiles.length;
  const threshold = parseInt(process.env.ALLOWED_TEST_DELTA || '5', 10);

  log(`  Declared: ${declared}, Actual: ${actual}, Threshold: +/-${threshold}`);

  if (Math.abs(declared - actual) > threshold) {
    fail(`Source test-file count drift exceeds threshold: declared=${declared} actual=${actual}`);
  } else {
    log('  OK source test-file count within acceptable drift.');
  }
}

function validateFeatureMatrix() {
  log('Validating Feature Matrix status values...');
  const matrixPath = 'docs/FEATURE_MATRIX.md';
  if (!existsSync(join(ROOT, matrixPath))) {
    fail('Feature matrix file missing (docs/FEATURE_MATRIX.md).');
    return;
  }
  const content = readFile(matrixPath);
  const lines = content.split(/\r?\n/);

  const headerIdx = lines.findIndex((line) => line.trim().startsWith('|') && /\bStatus\b/i.test(line));
  if (headerIdx === -1) {
    fail('No feature matrix table header found (missing a "Status" column).');
    return;
  }

  const headerCells = lines[headerIdx]
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean);
  const statusCol = headerCells.findIndex((cell) => cell.toLowerCase() === 'status');
  if (statusCol === -1) {
    fail('Feature matrix header does not include a Status column.');
    return;
  }

  let checked = 0;
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) {
      if (checked > 0) break;
      continue;
    }

    if (/^\|\s*-{2,}\s*\|/.test(line)) continue;

    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean);

    const status = cells[statusCol];
    if (!status) continue;

    if (!ALLOWED_STATUSES.has(status)) {
      fail(`Invalid status value in feature matrix: "${status}"`);
    } else {
      checked++;
    }
  }

  if (checked === 0) {
    fail('No feature matrix rows validated (pattern mismatch).');
  } else {
    log(`  OK validated ${checked} status entries.`);
  }
}

try {
  validateLocalLinks();
  validateTestCount();
  validateFeatureMatrix();
} catch (err) {
  fail(`Unhandled exception: ${err.message}`);
}

if (failures > 0) {
  console.error(`Documentation validation failed with ${failures} issue(s).`);
  process.exit(1);
} else {
  console.log('Documentation validation passed.');
}
