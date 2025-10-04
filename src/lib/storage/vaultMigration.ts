import { secureStorage } from './secureStorage';

const LOCAL_PREFIX = 'pt:';
const VAULT_PREFIX = 'vault:';

type MigrationItem = { key: string; value: unknown };

type MigrationResult = {
  reencrypted: number;
  skipped: number;
};

export function collectLegacySecureStorageItems(): MigrationItem[] {
  const pending: MigrationItem[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const fullKey = localStorage.key(i);
    if (!fullKey || !fullKey.startsWith(LOCAL_PREFIX)) continue;
    const key = fullKey.slice(LOCAL_PREFIX.length);
    if (key.startsWith(VAULT_PREFIX)) continue;
    const raw = localStorage.getItem(fullKey);
    if (raw == null) continue;
    if (looksEncrypted(raw)) continue;

    const value = secureStorage.get<unknown>(key);
    if (value !== null && value !== undefined) {
      pending.push({ key, value });
    }
  }

  return pending;
}

export function runVaultMigration(items: MigrationItem[]): MigrationResult {
  let reencrypted = 0;
  let skipped = 0;

  for (const item of items) {
    const result = secureStorage.set(item.key, item.value, { encrypt: true });
    if (result.success) {
      reencrypted += 1;
    } else {
      skipped += 1;
    }
  }

  return { reencrypted, skipped };
}

function looksEncrypted(raw: string): boolean {
  if (!raw) return false;
  if (!raw.startsWith('{')) return false;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed?.v === 'xchacha20-poly1305' && typeof parsed.c === 'string';
  } catch {
    return false;
  }
}
