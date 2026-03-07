import { describe, expect, it } from 'vitest';

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';

import { ALLOWED_SYNC_ROUTES } from '../lib/background-sync-allowlist';
import { VAULT_EXPORT_CONSTANTS } from '../lib/vault-export/vaultExportPolicy';

function* walkDir(dirPath: string): Generator<string> {
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const full = resolve(dirPath, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(full);
      continue;
    }
    if (entry.isFile()) yield full;
  }
}

const SRC_SCAN_ALLOWED_EXT = new Set(['.ts', '.tsx', '.js', '.jsx']);
const SRC_SCAN_MAX_BYTES = 2 * 1024 * 1024;

function isScanCandidateSourceFile(filePath: string): boolean {
  return SRC_SCAN_ALLOWED_EXT.has(extname(filePath));
}

function readUtf8IfSmall(filePath: string): string | null {
  try {
    const st = statSync(filePath);
    if (st.size > SRC_SCAN_MAX_BYTES) return null;
    return readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function findForbiddenSymbolsInSrc(tokens: string[]): Array<{ file: string; token: string }> {
  const srcRoot = resolve(process.cwd(), 'src');
  const hits: Array<{ file: string; token: string }> = [];

  for (const file of walkDir(srcRoot)) {
    if (!isScanCandidateSourceFile(file)) continue;
    const text = readUtf8IfSmall(file);
    if (!text) continue;

    for (const token of tokens) {
      if (text.includes(token)) {
        hits.push({ file, token });
        // Keep output small + deterministic.
        if (hits.length >= 3) return hits;
      }
    }
  }

  return hits;
}

function parseCsp(value: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const directives = value
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);

  for (const d of directives) {
    const parts = d.split(/\s+/).filter(Boolean);
    const name = parts[0]?.toLowerCase();
    if (!name) continue;
    map.set(name, parts.slice(1));
  }
  return map;
}

describe('security chokepoint CI guards', () => {
  it('CSP in vercel.json stays narrow (default-src self, connect-src self)', () => {
    const vercelPath = resolve(process.cwd(), 'vercel.json');
    const vercel = JSON.parse(readFileSync(vercelPath, 'utf8')) as unknown;

    const v = vercel as { headers?: Array<{ source?: string; headers?: Array<{ key: string; value: string }> }> };
    const headers: Array<{ source?: string; headers?: Array<{ key: string; value: string }> }> =
      Array.isArray(v.headers) ? v.headers : [];

    const allHeaderPairs = headers.flatMap(h => (Array.isArray(h.headers) ? h.headers : []));
    const csp = allHeaderPairs.find(h => h.key?.toLowerCase() === 'content-security-policy')?.value;

    if (typeof csp !== 'string') {
      throw new TypeError('Missing Content-Security-Policy header in vercel.json');
    }
    const directives = parseCsp(csp);

    expect(directives.get('default-src')).toEqual(["'self'"]);
    expect(directives.get('connect-src')).toEqual(["'self'"]);

    const scriptSrc = directives.get('script-src') ?? [];
    expect(scriptSrc).toContain("'self'");
    // We currently rely on WASM; keep this explicit so changes are reviewed.
    expect(scriptSrc).toContain("'wasm-unsafe-eval'");

    const forbiddenAnywhere = [
      "connect-src *",
      "script-src *",
      "'unsafe-eval'",
      'data:',
    ];

    for (const token of forbiddenAnywhere) {
      // Note: 'data:' is allowed for fonts/img in this app; we only forbid
      // it in contexts that widen script/connect. The connect-src exact match
      // already blocks it there.
      if (token === 'data:') continue;
      expect(csp).not.toContain(token);
    }

    // Catch sneaky broadening in the two most sensitive directives.
    expect((directives.get('connect-src') ?? []).some(t => t !== "'self'")).toBe(false);
    expect(scriptSrc).not.toContain('*');
    expect(scriptSrc).not.toContain('data:');
    expect(scriptSrc).not.toContain('https:');
  });

  it('background sync allowlist is pinned (intentional changes only)', () => {
    expect(ALLOWED_SYNC_ROUTES).toEqual([
      {
        method: 'POST',
        path: '/api/pain-entries',
        reason: 'Offline-first pain entry create replay',
      },
      {
        method: 'PUT',
        path: '/api/pain-entries/:id',
        reason: 'Offline-first pain entry update replay (numeric id only)',
      },
      {
        method: 'POST',
        path: '/api/emergency',
        reason: 'Emergency info submission when connectivity returns',
      },
      {
        method: 'POST',
        path: '/api/activity-logs',
        reason: 'Activity log submission when connectivity returns',
      },
      {
        method: 'PUT',
        path: '/api/settings',
        reason: 'Settings sync when connectivity returns (explicitly bounded)',
      },
    ]);
  });

  it('background sync does not regress to /api/* wildcard checks', () => {
    const p = resolve(process.cwd(), 'src/lib/background-sync.ts');
    const src = readFileSync(p, 'utf8');

    // Exact allowlist is the doctrine; reject common "easy" broad checks.
    // Note: allowlist sanity checks like `route.path.startsWith('/api/')` are OK.
    // What we forbid is using startsWith against *request* URLs/paths.
    expect(src).not.toMatch(/\.pathname\.startsWith\(['"`]\/?api/);
    expect(src).not.toMatch(/(?:^|[^.\w])url\.startsWith\(['"`]\/?api/);
    expect(src).not.toMatch(/(?:^|[^.\w])path\.startsWith\(['"`]\/?api/);
    expect(src).not.toContain('/api/*');
    expect(src).not.toContain('/api/.*');

    // Ensure allowlist matcher machinery still exists.
    expect(src).toMatch(/allowedSyncMatchers/);
    expect(src).toMatch(/buildAllowedSyncMatchers/);
  });

  it('settings backup policy keeps envelope + limits + confirm token gate', async () => {
    const mod = await import('../lib/backup/settingsBackupPolicy');

    expect(mod.SETTINGS_BACKUP_SCHEMA).toBe('paintracker.settings-backup');
    expect(mod.SETTINGS_BACKUP_VERSION).toBe(1);

    expect(mod.SETTINGS_BACKUP_LIMITS.maxFileBytes).toBe(2 * 1024 * 1024);
    expect(mod.SETTINGS_BACKUP_LIMITS.maxKeys).toBe(200);
    expect(mod.SETTINGS_BACKUP_LIMITS.maxValueBytes).toBe(100 * 1024);

    // Confirm token must remain explicit.
    const written = mod.applySettingsBackupImport({
      safeData: { 'pain-tracker:x': 1 },
      confirmToken: 'NOPE',
      writeValue: () => undefined,
    }).written;

    expect(written).toEqual([]);
  });

  it('BackupSettings uses the shared backup policy module (no policy drift)', () => {
    const p = resolve(process.cwd(), 'src/components/settings/BackupSettings.tsx');
    const src = readFileSync(p, 'utf8');

    expect(src).toContain("from '../../lib/backup/settingsBackupPolicy'");
  });

  it('vault export doctrine is pinned (schema/version/crypto suite/confirm tokens/caps)', () => {
    expect(VAULT_EXPORT_CONSTANTS.SCHEMA).toBe('paintracker.vault-export');
    expect(VAULT_EXPORT_CONSTANTS.VERSION).toBe(1);

    // Crypto suite doctrine (intentional changes only).
    expect(VAULT_EXPORT_CONSTANTS.KDF).toBe('PBKDF2-HMAC-SHA256');
    expect(VAULT_EXPORT_CONSTANTS.CIPHER).toBe('AES-256-GCM');

    // Typed confirms are an explicit containment UX requirement.
    expect(VAULT_EXPORT_CONSTANTS.CONFIRM_EXPORT).toBe('EXPORT');
    expect(VAULT_EXPORT_CONSTANTS.CONFIRM_IMPORT).toBe('IMPORT');

    // Iteration floor doctrine: production must not accept tiny PBKDF2 iteration counts.
    expect(VAULT_EXPORT_CONSTANTS.PROD_MIN_ITERATIONS).toBeGreaterThanOrEqual(150_000);

    // Caps exist + stay sane.
    expect(VAULT_EXPORT_CONSTANTS.LIMITS.maxEntries).toBeGreaterThan(0);
    expect(VAULT_EXPORT_CONSTANTS.LIMITS.maxApproxPlainBytes).toBeGreaterThan(0);
    expect(VAULT_EXPORT_CONSTANTS.LIMITS.maxCiphertextBytes).toBeGreaterThan(0);
    expect(VAULT_EXPORT_CONSTANTS.LIMITS.maxFileBytes).toBeGreaterThan(0);

    // Prevent absurdly-large imports/exports from silently creeping in.
    expect(VAULT_EXPORT_CONSTANTS.LIMITS.maxFileBytes).toBeLessThanOrEqual(20 * 1024 * 1024);
  });

  it('no plaintext offline export/import channel exists (tripwire)', () => {
    // Build tokens dynamically so this file doesn't contain the literal substrings.
    const forbidden = ['export' + 'OfflineData', 'import' + 'OfflineData'];
    const hits = findForbiddenSymbolsInSrc(forbidden);
    expect(hits).toEqual([]);
  });
});
