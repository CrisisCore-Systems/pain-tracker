#!/usr/bin/env node
import fs from 'fs/promises';

const [,, resultsPath = 'vitest-results.json'] = process.argv;
try {
  const raw = await fs.readFile(resultsPath, 'utf8');
  const parsed = JSON.parse(raw);

  // Heuristics to find total test count across different Vitest reporter formats
  let total = null;
  if (typeof parsed.tests === 'number') total = parsed.tests;
  else if (parsed.stats && typeof parsed.stats.tests === 'number') total = parsed.stats.tests;
  else if (parsed.summary && typeof parsed.summary.total === 'number') total = parsed.summary.total;
  else if (typeof parsed.numTotalTests === 'number') total = parsed.numTotalTests;
  else if (Array.isArray(parsed.files)) total = parsed.files.reduce((s, f) => s + (f.tests || 0), 0);
  else if (Array.isArray(parsed.results)) total = parsed.results.reduce((s, r) => s + (r.tests || 0), 0);

  if (total === null) {
    console.warn('update-test-count: could not determine total tests from JSON; aborting.');
    process.exitCode = 2;
    process.exit();
  }

  const readmePath = 'README.md';
  const readme = await fs.readFile(readmePath, 'utf8');
  const date = new Date().toISOString().slice(0,10);
  const newLine = `Currently declared tests: ${total} tests (captured from a vitest run on ${date})`;

  let updated;
  if (/^Currently declared tests:/m.test(readme)) {
    updated = readme.replace(/^Currently declared tests:.*$/m, newLine);
  } else if (/## Project Test Count/m.test(readme)) {
    updated = readme.replace(/(## Project Test Count\s*\n\s*\n)/, `$1${newLine}\n\n`);
  } else {
    // Append at end if section not found
    updated = readme + `\n\n## Project Test Count\n\n${newLine}\n`;
  }

  await fs.writeFile(readmePath, updated, 'utf8');
  console.log(`update-test-count: Updated README with ${total} tests.`);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('update-test-count: failed', err);
  process.exitCode = 1;
}
