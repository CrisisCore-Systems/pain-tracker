export type UsageMetrics = {
  id: 'local';
  schemaVersion: 1;
  firstSeenDate: string; // YYYY-MM-DD (local time)
  lastActiveDate: string; // YYYY-MM-DD (local time)
  sessionCount: number;
  activeDayCount: number;
};

export type LocalUsageSnapshot = {
  sessionCount: number;
  activeDayCount: number;
  firstSeenDate: string | null; // YYYY-MM-DD
  lastActiveDate: string | null; // YYYY-MM-DD
};

export type LocalUsageReportV1 = {
  schema: 'paintracker.local-usage.v1';
  generatedDate: string; // YYYY-MM-DD
  sessionCount: number;
  activeDayCount: number;
  firstSeenDate: string | null; // YYYY-MM-DD
  lastActiveDate: string | null; // YYYY-MM-DD
  notes: string;
};

const DB_NAME = 'pain-tracker-usage';
const DB_VERSION = 1;
const STORE_NAME = 'usage_metrics';
const METRICS_KEY: UsageMetrics['id'] = 'local';

function toError(reason: unknown, fallbackMessage: string): Error {
  if (reason instanceof Error) return reason;

  if (reason && typeof reason === 'object') {
    const maybeMessage = (reason as { message?: unknown }).message;
    const maybeName = (reason as { name?: unknown }).name;

    if (typeof maybeMessage === 'string') {
      const err = new Error(maybeMessage);
      if (typeof maybeName === 'string' && maybeName.length > 0) {
        err.name = maybeName;
      }
      return err;
    }
  }

  if (typeof reason === 'string' && reason.length > 0) {
    return new Error(reason);
  }

  return new Error(fallbackMessage);
}

function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function getLocalUsageSnapshot(): Promise<LocalUsageSnapshot> {
  const metrics = await getUsageMetrics();
  return {
    sessionCount: Number.isFinite(metrics.sessionCount) ? metrics.sessionCount : 0,
    activeDayCount: Number.isFinite(metrics.activeDayCount) ? metrics.activeDayCount : 0,
    firstSeenDate: metrics.firstSeenDate || null,
    lastActiveDate: metrics.lastActiveDate || null,
  };
}

export async function buildAnonymousLocalUsageReport(opts?: {
  countersEnabledAtExportTime?: boolean;
}): Promise<LocalUsageReportV1> {
  const snap = await getLocalUsageSnapshot();
  const generatedDate = toLocalISODate(new Date());

  const baseNotes =
    'Generated locally on this device. This report contains only aggregate usage counts and day-level dates. It contains no identifiers, no content, and is not transmitted over the network.';
  const disabledNote =
    opts?.countersEnabledAtExportTime === false
      ? ' At export time, usage counters were disabled; no new sessions are being recorded.'
      : '';

  return {
    schema: 'paintracker.local-usage.v1',
    generatedDate,
    sessionCount: snap.sessionCount,
    activeDayCount: snap.activeDayCount,
    firstSeenDate: snap.firstSeenDate,
    lastActiveDate: snap.lastActiveDate,
    notes: baseNotes + disabledNote,
  };
}

export function downloadJsonReport(filename: string, data: unknown): void {
  const doc = (globalThis as typeof globalThis & { document?: Document }).document;
  const urlApi = (globalThis as typeof globalThis & { URL?: typeof URL }).URL;
  const BlobCtor = (globalThis as typeof globalThis & { Blob?: typeof Blob }).Blob;
  if (doc === undefined || urlApi === undefined || BlobCtor === undefined) return;

  const json = JSON.stringify(data, null, 2);
  const blob = new BlobCtor([json], { type: 'application/json;charset=utf-8' });
  const url = urlApi.createObjectURL(blob);

  const a = doc.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  doc.body.appendChild(a);
  a.click();
  a.remove();

  urlApi.revokeObjectURL(url);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const indexedDb = (globalThis as typeof globalThis & { indexedDB?: IDBFactory }).indexedDB;
    if (!indexedDb) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDb.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(toError(request.error, 'Failed to open IndexedDB'));

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
}

function idbGet<T>(db: IDBDatabase, storeName: string, key: IDBValidKey): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(toError(request.error, 'IndexedDB get failed'));
  });
}

function idbPut(db: IDBDatabase, storeName: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(toError(request.error, 'IndexedDB put failed'));
  });
}

function idbDelete(db: IDBDatabase, storeName: string, key: IDBValidKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(toError(request.error, 'IndexedDB delete failed'));
  });
}

export async function getUsageMetrics(): Promise<UsageMetrics> {
  const today = toLocalISODate(new Date());
  try {
    const db = await openDb();
    const existing = await idbGet<UsageMetrics>(db, STORE_NAME, METRICS_KEY);
    if (existing) return existing;
    const initial: UsageMetrics = {
      id: METRICS_KEY,
      schemaVersion: 1,
      firstSeenDate: today,
      lastActiveDate: today,
      sessionCount: 0,
      activeDayCount: 0,
    };
    await idbPut(db, STORE_NAME, initial);
    return initial;
  } catch {
    // If IDB fails (private mode, permissions, etc.), return an in-memory baseline.
    return {
      id: METRICS_KEY,
      schemaVersion: 1,
      firstSeenDate: today,
      lastActiveDate: today,
      sessionCount: 0,
      activeDayCount: 0,
    };
  }
}

export async function recordUsageSession(options?: { now?: Date }): Promise<UsageMetrics> {
  const now = options?.now ?? new Date();
  const today = toLocalISODate(now);

  try {
    const db = await openDb();
    const current = (await idbGet<UsageMetrics>(db, STORE_NAME, METRICS_KEY)) ?? {
      id: METRICS_KEY,
      schemaVersion: 1,
      firstSeenDate: today,
      lastActiveDate: today,
      sessionCount: 0,
      activeDayCount: 0,
    };

    const hasDayChanged = Boolean(current.lastActiveDate && current.lastActiveDate !== today);
    const previousActiveDayCount = Number.isFinite(current.activeDayCount) ? current.activeDayCount : 0;
    const activeDayCount = hasDayChanged ? previousActiveDayCount + 1 : current.activeDayCount || 1;

    const next: UsageMetrics = {
      ...current,
      schemaVersion: 1,
      firstSeenDate: current.firstSeenDate || today,
      lastActiveDate: today,
      sessionCount: (Number.isFinite(current.sessionCount) ? current.sessionCount : 0) + 1,
      activeDayCount,
    };

    await idbPut(db, STORE_NAME, next);
    return next;
  } catch {
    // IDB unavailable; still return a derived value for UI (non-persistent).
    const fallback: UsageMetrics = {
      id: METRICS_KEY,
      schemaVersion: 1,
      firstSeenDate: today,
      lastActiveDate: today,
      sessionCount: 1,
      activeDayCount: 1,
    };
    return fallback;
  }
}

export async function resetUsageMetrics(): Promise<void> {
  try {
    const db = await openDb();
    await idbDelete(db, STORE_NAME, METRICS_KEY);
  } catch {
    // ignore
  }
}
