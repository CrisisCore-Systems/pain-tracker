import { secureStorage } from './secureStorage';

export type MigrationFn = () => Promise<void> | void;

const appliedKey = 'pt:migrations:applied';

export async function runMigrations(migrations: Array<{ id: string; fn: MigrationFn }>) {
  const appliedRaw = secureStorage.get<string>(appliedKey) || '[]';
  let applied: string[] = [];
  try {
    applied = JSON.parse(appliedRaw);
  } catch {
    applied = [];
  }

  for (const m of migrations) {
    if (applied.includes(m.id)) continue;
    try {
      await m.fn();
      applied.push(m.id);
      secureStorage.set(appliedKey, applied);
    } catch (e) {
      // swallow migration errors but log
      console.warn('Migration failed', m.id, e);
    }
  }
}

export default { runMigrations };

/**
 * migrateLegacyKey - one-time migration helper
 * Attempts to read a legacy localStorage key and, if present and no secure value exists,
 * writes it into secureStorage (optionally encrypted) then optionally removes the legacy key.
 */
export interface MigrateOptions {
  encrypt?: boolean;
  namespace?: string;
  removeLegacy?: boolean;
  transform?: (raw: string) => unknown; // optional parsing/transform
}

export function migrateLegacyKey(legacyKey: string, options: MigrateOptions = {}): boolean {
  const { encrypt = false, namespace, removeLegacy = false, transform } = options;
  try {
    // Skip if secure already present
    const existing = secureStorage.get(legacyKey, { encrypt, namespace });
    if (existing != null) return false;

    const raw = localStorage.getItem(legacyKey);
    if (raw == null) return false;

    let value: unknown = raw;
    if (transform) {
      try {
        value = transform(raw);
      } catch {
        /* keep raw */
      }
    } else {
      try {
        value = JSON.parse(raw);
      } catch {
        /* leave as string */
      }
    }

    secureStorage.set(legacyKey, value, { encrypt, namespace });
    if (removeLegacy) {
      try {
        localStorage.removeItem(legacyKey);
      } catch {
        /* ignore */
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Bulk migration convenience: supply array of keys with per-key options.
 */
export function migrateLegacyKeys(
  defs: Array<{ key: string; options?: MigrateOptions }>
): Record<string, boolean> {
  const results: Record<string, boolean> = {};
  for (const def of defs) {
    results[def.key] = migrateLegacyKey(def.key, def.options);
  }
  return results;
}
