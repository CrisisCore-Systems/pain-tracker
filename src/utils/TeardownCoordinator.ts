import { offlineStorage } from '../lib/offline-storage';

export type TeardownSector =
  | 'service-workers'
  | 'caches'
  | 'offline-storage'
  | 'indexeddb'
  | 'secure-storage'
  | 'web-storage';

export type TeardownSectorResult = {
  sector: TeardownSector;
  ok: boolean;
  details?: Record<string, unknown>;
  error?: string;
};

export type TeardownVerification = {
  cachesRemaining: number;
  unresolvedDatabases: string[];
  localStorageRemnants: number;
  sessionStorageRemnants: number;
  canaryKeyPresent: boolean;
};

export type TeardownReport = {
  ok: boolean;
  sectors: TeardownSectorResult[];
  verification: TeardownVerification;
};

type TeardownOptions = {
  canaryKey: string;
  knownDatabases?: string[];
  clearSecureStorage?: () => void;
  beforeIndexedDbTeardown?: () => Promise<void> | void;
};

const DEFAULT_DATABASES = ['pain-tracker-tone', 'pain-tracker-audit', 'pain-tracker-usage'];

function safeStorageLength(storage: Storage): number {
  try {
    return storage.length;
  } catch {
    return -1;
  }
}

function safeHasStorageKey(storage: Storage, key: string): boolean {
  try {
    return storage.getItem(key) !== null;
  } catch {
    return false;
  }
}

async function deleteDatabase(name: string): Promise<{ name: string; deleted: boolean }> {
  return new Promise(resolve => {
    try {
      const req = indexedDB.deleteDatabase(name);
      req.onsuccess = () => resolve({ name, deleted: true });
      req.onerror = () => resolve({ name, deleted: false });
      req.onblocked = () => resolve({ name, deleted: false });
    } catch {
      resolve({ name, deleted: false });
    }
  });
}

async function collectDatabaseNames(knownDatabases: string[]): Promise<string[]> {
  const names = new Set<string>(knownDatabases);

  const maybeDatabases = indexedDB as IDBFactory & {
    databases?: () => Promise<Array<{ name?: string }>>;
  };

  if (typeof maybeDatabases.databases === 'function') {
    try {
      const listed = await maybeDatabases.databases();
      for (const db of listed) {
        if (typeof db.name === 'string' && db.name.length > 0) names.add(db.name);
      }
    } catch {
      // best effort only
    }
  }

  return Array.from(names);
}

export class TeardownCoordinator {
  async run(options: TeardownOptions): Promise<TeardownReport> {
    const dbCandidates = await collectDatabaseNames(options.knownDatabases || DEFAULT_DATABASES);

    const sectors = await Promise.allSettled([
      this.teardownServiceWorkers(),
      this.teardownCaches(),
      this.teardownOfflineStorage(),
      this.teardownIndexedDb(dbCandidates, options.beforeIndexedDbTeardown),
      this.teardownSecureStorage(options.clearSecureStorage),
      this.teardownWebStorage(),
    ]);

    const sectorResults: TeardownSectorResult[] = sectors.map((result, index) => {
      const fallbackSector: TeardownSector[] = [
        'service-workers',
        'caches',
        'offline-storage',
        'indexeddb',
        'secure-storage',
        'web-storage',
      ];

      if (result.status === 'fulfilled') return result.value;

      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
      return {
        sector: fallbackSector[index] || 'web-storage',
        ok: false,
        error: reason,
      };
    });

    const cacheNames = 'caches' in globalThis ? await caches.keys() : [];
    const unresolvedDatabases = await this.findUnresolvedDatabases(dbCandidates);
    const verification: TeardownVerification = {
      cachesRemaining: cacheNames.length,
      unresolvedDatabases,
      localStorageRemnants: safeStorageLength(localStorage),
      sessionStorageRemnants: safeStorageLength(sessionStorage),
      canaryKeyPresent:
        safeHasStorageKey(localStorage, options.canaryKey) ||
        safeHasStorageKey(sessionStorage, options.canaryKey),
    };

    const sectorsOk = sectorResults.every(s => s.ok);
    const verificationOk =
      verification.cachesRemaining === 0 &&
      verification.unresolvedDatabases.length === 0 &&
      verification.localStorageRemnants === 0 &&
      verification.sessionStorageRemnants === 0 &&
      !verification.canaryKeyPresent;

    return {
      ok: sectorsOk && verificationOk,
      sectors: sectorResults,
      verification,
    };
  }

  private async teardownServiceWorkers(): Promise<TeardownSectorResult> {
    if (!('serviceWorker' in navigator)) {
      return { sector: 'service-workers', ok: true, details: { skipped: true } };
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const unregisterResults = await Promise.allSettled(registrations.map(reg => reg.unregister()));
      const failed = unregisterResults.filter(r => r.status === 'rejected').length;
      return {
        sector: 'service-workers',
        ok: failed === 0,
        details: { registrations: registrations.length, failed },
      };
    } catch (error) {
      return {
        sector: 'service-workers',
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async teardownCaches(): Promise<TeardownSectorResult> {
    if (!('caches' in globalThis)) {
      return { sector: 'caches', ok: true, details: { skipped: true } };
    }

    try {
      const names = await caches.keys();
      const results = await Promise.allSettled(names.map(name => caches.delete(name)));
      const failed = results.filter(
        r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value !== true)
      ).length;
      return { sector: 'caches', ok: failed === 0, details: { names, failed } };
    } catch (error) {
      return {
        sector: 'caches',
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async teardownOfflineStorage(): Promise<TeardownSectorResult> {
    try {
      await offlineStorage.clearAllData();
      return { sector: 'offline-storage', ok: true };
    } catch (error) {
      return {
        sector: 'offline-storage',
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async teardownIndexedDb(
    databaseNames: string[],
    beforeIndexedDbTeardown?: () => Promise<void> | void
  ): Promise<TeardownSectorResult> {
    try {
      if (beforeIndexedDbTeardown) {
        await beforeIndexedDbTeardown();
      }

      const results = await Promise.allSettled(databaseNames.map(name => deleteDatabase(name)));
      const unresolved = results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<{ name: string; deleted: boolean }>).value)
        .filter(r => !r.deleted)
        .map(r => r.name);
      const rejected = results.filter(r => r.status === 'rejected').length;
      return {
        sector: 'indexeddb',
        ok: unresolved.length === 0 && rejected === 0,
        details: { attempted: databaseNames, unresolved, rejected },
      };
    } catch (error) {
      return {
        sector: 'indexeddb',
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async teardownSecureStorage(
    clearSecureStorage: (() => void) | undefined
  ): Promise<TeardownSectorResult> {
    if (!clearSecureStorage) {
      return { sector: 'secure-storage', ok: true, details: { skipped: true } };
    }

    try {
      clearSecureStorage();
      return { sector: 'secure-storage', ok: true };
    } catch (error) {
      return {
        sector: 'secure-storage',
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async teardownWebStorage(): Promise<TeardownSectorResult> {
    let localOk = true;
    let sessionOk = true;

    try {
      localStorage.clear();
    } catch {
      localOk = false;
    }

    try {
      sessionStorage.clear();
    } catch {
      sessionOk = false;
    }

    return {
      sector: 'web-storage',
      ok: localOk && sessionOk,
      details: { localOk, sessionOk },
    };
  }

  private async findUnresolvedDatabases(databaseNames: string[]): Promise<string[]> {
    const unresolved: string[] = [];
    for (const name of databaseNames) {
      const result = await deleteDatabase(name);
      if (!result.deleted) unresolved.push(name);
    }
    return unresolved;
  }
}
