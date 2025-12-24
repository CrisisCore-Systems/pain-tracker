import { webcrypto } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Ensure tests (jsdom + forks) use Node's WebCrypto implementation.
// This prevents subtlecrypto BufferSource/realm mismatches under Node 20.
//
// IMPORTANT: test-only. This file is loaded via Vitest `setupFiles`.
const g = globalThis as unknown as {
  crypto?: Crypto;
  window?: { crypto?: Crypto };
  btoa?: (s: string) => string;
  atob?: (s: string) => string;
};

type PatchableCrypto = {
  subtle?: SubtleCrypto;
  getRandomValues?: Crypto['getRandomValues'];
  randomUUID?: Crypto['randomUUID'];
};

function tryInstallCrypto(target: unknown) {
  if (!target || (typeof target !== 'object' && typeof target !== 'function')) return;

  // Best effort: define/replace the crypto property (may be readonly in jsdom)
  try {
    Object.defineProperty(target, 'crypto', {
      value: webcrypto as unknown as Crypto,
      configurable: true,
      writable: true,
      enumerable: true,
    });
    return;
  } catch {
    // Fall back to patching methods on the existing crypto object.
  }

  try {
    const existing = (target as { crypto?: Crypto }).crypto;
    if (!existing) return;
    // Patch the pieces we rely on in tests.
    const wc = webcrypto as unknown as Crypto;
    const patchable = existing as unknown as PatchableCrypto;
    patchable.subtle = wc.subtle;
    patchable.getRandomValues = wc.getRandomValues.bind(wc);
    if (typeof wc.randomUUID === 'function') patchable.randomUUID = wc.randomUUID.bind(wc);
  } catch {
    // ignore
  }
}

// Prefer Node's WebCrypto everywhere.
// Vitest/jsdom may provide a different crypto implementation that is not compatible
// with BufferSource checks across forked contexts.
tryInstallCrypto(globalThis);
tryInstallCrypto(g.window);

// Provide base64 helpers if missing (Node contexts without jsdom).
if (typeof g.btoa !== 'function') {
  g.btoa = (s: string) => Buffer.from(s, 'binary').toString('base64');
}
if (typeof g.atob !== 'function') {
  g.atob = (s: string) => Buffer.from(s, 'base64').toString('binary');
}

// Ensure Vitest coverage temp directory exists when coverage is enabled.
// (Prevents occasional ENOENT when merging V8 coverage in forked mode.)
try {
  const envCoverage = process.env.VITEST_COVERAGE;
  const coverageEnabled =
    process.argv.includes('--coverage') || envCoverage === 'true' || envCoverage === '1';
  if (coverageEnabled) {
    fs.mkdirSync(path.resolve(process.cwd(), 'coverage', '.tmp'), { recursive: true });
  }
} catch {
  // ignore
}
