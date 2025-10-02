#!/usr/bin/env node
import { spawn } from 'child_process';
import fs from 'fs/promises';
import fsSync from 'fs';

// Attempt to run Vitest via the programmatic API and capture its stdout into a file.
// If that fails (older vitest versions or missing API), fall back to spawning the CLI
// and piping stdout into the same file.

async function runViaProgrammaticVitest() {
  const vitest = await import('vitest/node').catch(() => null);
  if (!vitest || typeof vitest.run !== 'function') {
    throw new Error('programmatic vitest API not available');
  }

  let buffer = '';
  const origWrite = process.stdout.write;
  // Capture stdout writes into buffer
  process.stdout.write = ((chunk, enc, cb) => {
    // normalize chunk into string safely
    try {
      if (typeof chunk === 'string') buffer += chunk;
      else if (chunk && typeof chunk.toString === 'function') buffer += chunk.toString();
      else buffer += String(chunk);
    } catch {
      buffer += String(chunk);
    }
    if (typeof cb === 'function') cb();
    return true;
  });

  try {
    // Use the JSON reporter so the output is machine readable
    await vitest.run({ reporters: ['json'] });
  } finally {
    // restore original stdout
    process.stdout.write = origWrite;
  }

  await fs.writeFile('./vitest-results.json', buffer, 'utf8');
}

async function runViaSpawnFallback() {
  return new Promise((resolve, reject) => {
    const out = fsSync.createWriteStream('./vitest-results.json');
    const child = spawn('npx', ['vitest', 'run', '--reporter=json', '--reporter=default'], { shell: true });
    child.stdout.pipe(out);
    child.stderr.on('data', (d) => process.stderr.write(d));
    child.on('close', (code) => {
      out.close();
      if (code === 0) resolve(0);
      else reject(new Error('vitest exited with ' + code));
    });
    child.on('error', (e) => {
      out.close();
      reject(e);
    });
  });
}

async function invokeUpdater() {
  return new Promise((resolve, reject) => {
    const updater = spawn('node', ['scripts/update-test-count.mjs', './vitest-results.json'], { stdio: 'inherit', shell: true });
    updater.on('close', (code) => {
      if (code === 0) resolve(0);
      else reject(new Error('updater exited with ' + code));
    });
    updater.on('error', (err) => reject(err));
  });
}

async function main() {
  try {
    console.log('Running vitest: try programmatic API, fallback to CLI spawn');
    try {
      await runViaProgrammaticVitest();
      console.log('Programmatic vitest run completed, results written to vitest-results.json');
    } catch (err) {
      console.warn('Programmatic run failed, falling back to CLI spawn:', err?.message ?? err);
      await runViaSpawnFallback();
      console.log('Spawned vitest run completed, results written to vitest-results.json');
    }

    await invokeUpdater();
    console.log('README update attempted.');
  } catch (err) {
    console.error('test-ci failed:', err);
    process.exit(1);
  }
}

main();
