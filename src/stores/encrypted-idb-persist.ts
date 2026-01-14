import type { PersistStorage } from 'zustand/middleware';
import { offlineStorage } from '../lib/offline-storage';
import { vaultService } from '../services/VaultService';
import { secureStorage } from '../lib/storage/secureStorage';

const LEGACY_PAIN_ENTRIES_KEYS = {
  // Zustand persist (plaintext localStorage)
  zustand: 'pain-tracker-storage',
  // Legacy pain tracker utilities
  legacyEntries: 'pain_tracker_entries',
  // Older key used by some onboarding migration logic
  olderEntries: 'painEntries',
} as const;

export const ANALYTICS_CONSENT_STORAGE_KEY = 'pain-tracker:analytics-consent';

function getSafeLocalStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readLegacyPainEntries(): unknown[] | null {
  // Try legacy encrypted localStorage via secureStorage first (does not throw if hooks missing)
  try {
    const stored = secureStorage.get<unknown>(LEGACY_PAIN_ENTRIES_KEYS.legacyEntries, { encrypt: true });
    if (Array.isArray(stored)) return stored;
  } catch {
    // ignore
  }

  // Then try plain localStorage keys
  const ls = getSafeLocalStorage();
  if (!ls) return null;

  const rawLegacy = ls.getItem(LEGACY_PAIN_ENTRIES_KEYS.legacyEntries);
  if (rawLegacy) {
    const parsed = safeJsonParse<unknown>(rawLegacy);
    if (Array.isArray(parsed)) return parsed;
  }

  const rawOlder = ls.getItem(LEGACY_PAIN_ENTRIES_KEYS.olderEntries);
  if (rawOlder) {
    const parsed = safeJsonParse<unknown>(rawOlder);
    if (Array.isArray(parsed)) return parsed;
  }

  return null;
}

function clearLegacyPainEntriesKeys(): void {
  const ls = getSafeLocalStorage();
  try {
    secureStorage.remove(LEGACY_PAIN_ENTRIES_KEYS.legacyEntries, { encrypt: true });
  } catch {
    // ignore
  }
  if (!ls) return;
  try {
    ls.removeItem(LEGACY_PAIN_ENTRIES_KEYS.legacyEntries);
  } catch {
    // ignore
  }
  try {
    ls.removeItem(LEGACY_PAIN_ENTRIES_KEYS.olderEntries);
  } catch {
    // ignore
  }
}

export function createEncryptedOfflinePersistStorage<TState>(
  name: string,
  options?: {
    /** IDB settings key override. Defaults to `zustand:persist:${name}` */
    idbKey?: string;
    /** Optional migration hook called when legacy entries are detected */
    buildMigratedState?: (legacyEntries: unknown[]) => { state: TState; version?: number };
  }
): PersistStorage<TState> {
  const idbKey = options?.idbKey ?? `zustand:persist:${name}`;

  // Serialize operations per storage instance so callers can reliably await
  // completion (e.g. tests calling `persist.clearStorage()`), and to prevent
  // races where an older async write removes newly-seeded legacy localStorage.
  let opChain: Promise<unknown> = Promise.resolve();
  const runExclusive = <T>(fn: () => Promise<T>): Promise<T> => {
    const next = opChain.then(fn, fn);
    // Keep the chain alive even if this operation fails.
    opChain = next.then(
      () => undefined,
      () => undefined
    );
    return next;
  };

  async function findRowId(): Promise<number | null> {
    const rows = await offlineStorage.getData('settings');
    const match = rows.find(
      r =>
        r.data &&
        typeof r.data === 'object' &&
        'key' in r.data &&
        (r.data as Record<string, unknown>).key === idbKey
    );
    return match?.id ?? null;
  }

  async function readEncryptedValue(): Promise<unknown | null> {
    const rows = await offlineStorage.getData('settings');
    const match = rows.find(
      r =>
        r.data &&
        typeof r.data === 'object' &&
        'key' in r.data &&
        (r.data as Record<string, unknown>).key === idbKey
    );
    if (!match) return null;

    const payload = (match.data as Record<string, unknown>).value;
    if (!payload) return null;

    return payload;
  }

  async function writeEncryptedValue(value: unknown): Promise<void> {
    const rows = await offlineStorage.getData('settings');
    const match = rows.find(
      r =>
        r.data &&
        typeof r.data === 'object' &&
        'key' in r.data &&
        (r.data as Record<string, unknown>).key === idbKey
    );

    if (match?.id !== undefined) {
      try {
        await offlineStorage.updateData(match.id, { key: idbKey, value } as unknown as Record<string, unknown>);
      } catch {
        // IndexedDB can legitimately race in test environments (or if another
        // cleanup runs between read and update). Fall back to add.
        await offlineStorage.storeData('settings', { key: idbKey, value } as unknown as Record<string, unknown>);
      }
    } else {
      await offlineStorage.storeData('settings', { key: idbKey, value } as unknown as Record<string, unknown>);
    }
  }

  async function removeEncryptedValue(): Promise<void> {
    const rowId = await findRowId();
    if (rowId !== null) {
      await offlineStorage.deleteData(rowId);
    }
  }

  async function tryMigrateFromLegacyLocalStorage(): Promise<{ state: TState; version?: number } | null> {
    // 1) old zustand persist (plaintext localStorage)
    const ls = getSafeLocalStorage();
    if (ls) {
      const raw = ls.getItem(name);
      if (raw) {
        const parsed = safeJsonParse<{ state: TState; version?: number }>(raw);
        if (parsed) {
          // Best-effort: store encrypted and then remove plaintext.
          // If the vault isn't unlocked yet, do NOT delete plaintext; we'll retry after unlock.
          if (vaultService.isUnlocked()) {
            try {
              const encrypted = vaultService.encryptString(JSON.stringify(parsed));
              await writeEncryptedValue(encrypted);
              try {
                ls.removeItem(name);
              } catch {
                // ignore
              }
            } catch {
              // ignore
            }
          }
          return parsed;
        }

        // Corrupted JSON: clear and continue
        try {
          ls.removeItem(name);
        } catch {
          // ignore
        }
      }
    }

    // 2) legacy pain entries arrays
    const legacyEntries = readLegacyPainEntries();
    if (legacyEntries && options?.buildMigratedState) {
      const migrated = options.buildMigratedState(legacyEntries);
      // Only clear legacy keys after successfully writing an encrypted payload.
      if (vaultService.isUnlocked()) {
        try {
          const encrypted = vaultService.encryptString(JSON.stringify(migrated));
          await writeEncryptedValue(encrypted);
          clearLegacyPainEntriesKeys();
        } catch {
          // ignore
        }
      }
      return migrated;
    }

    // 3) nothing to migrate
    return null;
  }

  return {
    getItem: async (_storageName: string) => runExclusive(async () => {
      // First: try encrypted IDB.
      try {
        const storedEncrypted = await readEncryptedValue();
        if (typeof storedEncrypted === 'string') {
          // Vault-gated: we can only decrypt after unlock.
          if (!vaultService.isUnlocked()) {
            return null;
          }
          const decrypted = vaultService.decryptString(storedEncrypted);
          return safeJsonParse<{ state: TState; version?: number }>(decrypted);
        }
      } catch {
        // If decrypt fails, do NOT delete the encrypted payload.
        // Decrypt can fail legitimately when crypto material isn't available yet
        // (e.g. vault not unlocked / master keys not initialized). Deleting here
        // would cause irreversible data loss.
      }

      // Second: try migration from legacy sources.
      const migrated = await tryMigrateFromLegacyLocalStorage();
      return migrated;
    }),

    setItem: async (_storageName: string, value: { state: TState; version?: number }) => runExclusive(async () => {
      // Persistence is best-effort; if the vault is not unlocked yet,
      // skip writing rather than throwing (which can surface as app errors).
      if (!vaultService.isUnlocked()) {
        return;
      }
      try {
        const encrypted = vaultService.encryptString(JSON.stringify(value));
        await writeEncryptedValue(encrypted);

        // Best-effort: remove any plaintext legacy copies.
        const ls = getSafeLocalStorage();
        if (ls) {
          try {
            ls.removeItem(name);
          } catch {
            // ignore
          }
        }
        clearLegacyPainEntriesKeys();
      } catch {
        // ignore
      }
    }),

    removeItem: async (_storageName: string) => runExclusive(async () => {
      try {
        await removeEncryptedValue();
      } catch {
        // ignore
      }
      const ls = getSafeLocalStorage();
      if (!ls) return;
      try {
        ls.removeItem(name);
      } catch {
        // ignore
      }
    }),
  };
}
