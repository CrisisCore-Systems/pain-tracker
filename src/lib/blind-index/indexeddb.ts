import type { BlindIndexBackend, BlindIndexEntry } from './types';
import { BLIND_INDEX_DB_NAME, BLIND_INDEX_STORE_NAME } from './types';

export interface IndexedDBBlindIndexOptions {
  dbName?: string;
  storeName?: string;
}

export function createIndexedDBBlindIndexBackend(options: IndexedDBBlindIndexOptions = {}): BlindIndexBackend {
  const dbName = options.dbName ?? BLIND_INDEX_DB_NAME;
  const storeName = options.storeName ?? BLIND_INDEX_STORE_NAME;
  let dbPromise: Promise<IDBDatabase> | null = null;

  async function openDb(): Promise<IDBDatabase> {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            const objectStore = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('field', 'field', { unique: false });
            objectStore.createIndex('token', 'token', { unique: false });
            objectStore.createIndex('rowKey', 'rowKey', { unique: false });
            objectStore.createIndex('compound', ['field', 'token'], { unique: false });
          }
        };
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    }
    return dbPromise;
  }

  async function withTransaction(
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => void | IDBRequest
  ): Promise<void> {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
      fn(store);
    });
  }

  return {
    async init(): Promise<void> {
      await openDb();
    },
    async upsertToken(entry: BlindIndexEntry): Promise<void> {
      await withTransaction('readwrite', (store) => store.put({ ...entry, id: undefined }));
    },
    async batchUpsert(entries: BlindIndexEntry[]): Promise<void> {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        let pending = entries.length;
        for (const entry of entries) {
          const request = store.put({ ...entry, id: undefined });
          request.onsuccess = () => {
            pending--;
            if (pending === 0) resolve();
          };
          request.onerror = () => reject(request.error);
        }
        if (entries.length === 0) resolve();
      });
    },
    async searchTokens(field: string, token: string): Promise<{ rowKey: string; token: string }[]> {
      const db = await openDb();
      const results: { rowKey: string; token: string }[] = [];
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const index = store.index('compound');
        const range = IDBKeyRange.only([field, token]);
        const request = index.openCursor(range);
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            resolve();
            return;
          }
          const value = cursor.value as Record<string, string>;
          results.push({ rowKey: value.rowKey, token: value.token });
          cursor.continue();
        };
        request.onerror = () => reject(request.error);
      });
      return results;
    },
    async removeTokensForRow(rowKey: string): Promise<void> {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const index = store.index('rowKey');
        const request = index.openCursor(IDBKeyRange.only(rowKey));
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            resolve();
            return;
          }
          cursor.delete();
          cursor.continue();
        };
        request.onerror = () => reject(request.error);
      });
    },
    async clearField(field: string): Promise<void> {
      await withTransaction('readwrite', (store) => {
        const index = store.index('field');
        const request = index.openCursor(IDBKeyRange.only(field));
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) return;
          cursor.delete();
          cursor.continue();
        };
      });
    },
    async clearAll(): Promise<void> {
      await withTransaction('readwrite', (store) => store.clear());
    },
  };
}
