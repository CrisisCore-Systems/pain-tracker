/**
 * Offline Storage Service using IndexedDB
 * Provides robust data persistence for PWA offline functionality
 */

// Define specific data types for better type safety
type PainEntryData = {
  pain_level: number;
  location: string;
  description?: string;
  triggers?: string[];
  medications?: string[];
  activities?: string[];
  mood?: string;
  weather?: string;
  notes?: string;
};

type EmergencyData = {
  contactName: string;
  phoneNumber: string;
  relationship: string;
  medicalInfo?: string;
  allergies?: string[];
  medications?: string[];
};

type ActivityLogData = {
  activity: string;
  duration?: number;
  intensity?: number;
  painBefore?: number;
  painAfter?: number;
  notes?: string;
};

type SettingsData = {
  key: string;
  value: unknown;
} | {
  [key: string]: unknown;
};

type SyncQueueData = {
  operation: string;
  payload: unknown;
  priority: 'high' | 'medium' | 'low';
};

type StoredDataPayload = PainEntryData | EmergencyData | ActivityLogData | SettingsData | SyncQueueData;

interface StoredData {
  id?: number;
  timestamp: string;
  type: 'pain-entry' | 'emergency-data' | 'activity-log' | 'settings' | 'sync-queue';
  data: StoredDataPayload;
  synced?: boolean;
  lastModified: string;
}

interface SyncQueueItem {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  retryCount?: number;
  type: string;
  metadata?: Record<string, unknown>;
}

export class OfflineStorageService {
  private dbName = 'pain-tracker-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private static _instance: OfflineStorageService | null = null;

  // Store names
  private stores = {
    data: 'offline-data',
    syncQueue: 'sync-queue',
    cache: 'cache-metadata'
  };

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Offline data store
        if (!db.objectStoreNames.contains(this.stores.data)) {
          const dataStore = db.createObjectStore(this.stores.data, {
            keyPath: 'id',
            autoIncrement: true
          });
          dataStore.createIndex('type', 'type', { unique: false });
          dataStore.createIndex('timestamp', 'timestamp', { unique: false });
          dataStore.createIndex('synced', 'synced', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(this.stores.syncQueue)) {
          const syncStore = db.createObjectStore(this.stores.syncQueue, {
            keyPath: 'id',
            autoIncrement: true
          });
          syncStore.createIndex('priority', 'priority', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('retryCount', 'retryCount', { unique: false });
        }

        // Cache metadata store
        if (!db.objectStoreNames.contains(this.stores.cache)) {
          const cacheStore = db.createObjectStore(this.stores.cache, {
            keyPath: 'url'
          });
          cacheStore.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }

  // Key-value helpers (backed by EnhancedLocalStorage and IndexedDB settings)
  async setItem(key: string, value: unknown): Promise<void> {
    try {
      // Store in localStorage for fast access and in IndexedDB for durability
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore localStorage failures
    }
    await this.storeData('settings', { key, value });
  }

  async getItem<T = unknown>(key: string): Promise<T | null> {
    try {
      const v = localStorage.getItem(key);
      if (v !== null) return JSON.parse(v) as T;
    } catch {
      // ignore
    }
    try {
      const settings = await this.getData('settings');
      const match = settings.find(s => s.data && typeof s.data === 'object' && 'key' in s.data && (s.data as Record<string, unknown>).key === key);
      if (match && match.data && typeof match.data === 'object' && 'value' in match.data) {
        return (match.data as Record<string, unknown>).value as T;
      }
    } catch {
      // ignore
    }
    return null;
  }

  // Table-like helpers implemented via settings key prefixes: table:{tableName}:{id}
  private makeTableKey(tableName: string, id: string): string {
    return `table:${tableName}:${id}`;
  }

  private parseTableKey(key: string): { table: string; id: string } | null {
    if (!key.startsWith('table:')) return null;
    const parts = key.split(':');
    if (parts.length < 3) return null;
    return { table: parts[1], id: parts.slice(2).join(':') };
    }

  async getAllFromTable<T = unknown>(tableName: string): Promise<T[]> {
    const settings = await this.getData('settings');
    const items: T[] = [];
    for (const entry of settings) {
      if (entry.data && typeof entry.data === 'object' && 'key' in entry.data && 'value' in entry.data) {
        const key = (entry.data as Record<string, unknown>).key as string;
        const parsed = this.parseTableKey(key);
        if (parsed && parsed.table === tableName) {
          items.push((entry.data as Record<string, unknown>).value as T);
        }
      }
    }
    return items;
  }

  async replaceTable<T = unknown>(tableName: string, items: T[]): Promise<void> {
    const settings = await this.getData('settings');
    // Remove existing rows for table
    const deletions: Promise<void>[] = [];
    for (const entry of settings) {
      if (entry.id !== undefined && entry.data && typeof entry.data === 'object' && 'key' in entry.data) {
        const key = (entry.data as Record<string, unknown>).key as string;
        const parsed = this.parseTableKey(key);
        if (parsed && parsed.table === tableName) {
          deletions.push(this.deleteData(entry.id));
        }
      }
    }
    await Promise.allSettled(deletions);
    // Add new items
    for (const item of items) {
      const id = (item as unknown as { id?: string }).id || crypto.randomUUID();
      await this.storeData('settings', { key: this.makeTableKey(tableName, String(id)), value: item });
    }
  }

  async addToTable<T = unknown>(tableName: string, item: T & { id?: string }): Promise<void> {
    const id = item.id || crypto.randomUUID();
    await this.storeData('settings', { key: this.makeTableKey(tableName, String(id)), value: { ...item, id } });
  }

  async updateInTable<T = unknown>(tableName: string, id: string | number, item: T): Promise<void> {
    const settings = await this.getData('settings');
    const keyToFind = this.makeTableKey(tableName, String(id));
    const match = settings.find(s => s.data && typeof s.data === 'object' && 'key' in s.data && (s.data as Record<string, unknown>).key === keyToFind);
    if (match && match.id !== undefined) {
      await this.updateData(match.id, { key: keyToFind, value: item });
    } else {
      // If not found, add
      await this.storeData('settings', { key: keyToFind, value: item });
    }
  }

  async removeFromTable(tableName: string, id: string | number): Promise<void> {
    const settings = await this.getData('settings');
    const keyToFind = this.makeTableKey(tableName, String(id));
    const match = settings.find(s => s.data && typeof s.data === 'object' && 'key' in s.data && (s.data as Record<string, unknown>).key === keyToFind);
    if (match && match.id !== undefined) {
      await this.deleteData(match.id);
    }
  }

  async getFromTable<T = unknown>(tableName: string, id: string | number): Promise<T | null> {
    const settings = await this.getData('settings');
    const keyToFind = this.makeTableKey(tableName, String(id));
    const match = settings.find(s => s.data && typeof s.data === 'object' && 'key' in s.data && (s.data as Record<string, unknown>).key === keyToFind);
    if (match && match.data && typeof match.data === 'object' && 'value' in match.data) {
      return (match.data as Record<string, unknown>).value as T;
    }
    return null;
  }

  // Data Storage Methods
  async storeData(type: StoredData['type'], data: StoredDataPayload): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.data], 'readwrite');
      const store = transaction.objectStore(this.stores.data);

      const storedData: StoredData = {
        timestamp: new Date().toISOString(),
        type,
        data,
        synced: false,
        lastModified: new Date().toISOString()
      };

      const request = store.add(storedData);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async updateData(id: number, data: StoredDataPayload): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.data], 'readwrite');
      const store = transaction.objectStore(this.stores.data);

      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          existing.data = data;
          existing.lastModified = new Date().toISOString();
          existing.synced = false;

          const updateRequest = store.put(existing);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Data not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getData(type: StoredData['type']): Promise<StoredData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.data], 'readonly');
      const store = transaction.objectStore(this.stores.data);
      const index = store.index('type');

      const request = index.getAll(type);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedData(): Promise<StoredData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.data], 'readonly');
      const store = transaction.objectStore(this.stores.data);
      const index = store.index('synced');

      const request = index.getAll(0); // Use 0 instead of false for unsynced items
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.data], 'readwrite');
      const store = transaction.objectStore(this.stores.data);

      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Data not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteData(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.data], 'readwrite');
      const store = transaction.objectStore(this.stores.data);

      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync Queue Methods
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.stores.syncQueue);

      const queueItem: SyncQueueItem = {
        ...item,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };

      const request = store.add(queueItem);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readonly');
      const store = transaction.objectStore(this.stores.syncQueue);

      const request = store.getAll();
      request.onsuccess = () => {
        // Sort by priority and timestamp
        const items = request.result.sort((a: SyncQueueItem, b: SyncQueueItem) => {
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          const priorityDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateSyncQueueItem(id: number, updates: Partial<SyncQueueItem>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.stores.syncQueue);

      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          Object.assign(item, updates);
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Sync queue item not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async removeSyncQueueItem(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.stores.syncQueue);

      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.data, this.stores.syncQueue], 'readwrite');
      let completed = 0;

      const complete = () => {
        completed++;
        if (completed === 2) resolve();
      };

      const dataStore = transaction.objectStore(this.stores.data);
      const syncStore = transaction.objectStore(this.stores.syncQueue);

      const clearData = dataStore.clear();
      const clearSync = syncStore.clear();

      clearData.onsuccess = complete;
      clearSync.onsuccess = complete;
      clearData.onerror = () => reject(clearData.error);
      clearSync.onerror = () => reject(clearSync.error);
    });
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { used: 0, quota: 0 };
  }

  async exportData(): Promise<{ data: StoredData[]; syncQueue: SyncQueueItem[] }> {
    const [data, syncQueue] = await Promise.all([
      this.getAllData(),
      this.getSyncQueue()
    ]);

    return { data, syncQueue };
  }

  private async getAllData(): Promise<StoredData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.data], 'readonly');
      const store = transaction.objectStore(this.stores.data);

      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async importData(data: StoredData[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.data], 'readwrite');
      const store = transaction.objectStore(this.stores.data);

      let completed = 0;
      const total = data.length;

      if (total === 0) {
        resolve();
        return;
      }

      const complete = () => {
        completed++;
        if (completed === total) resolve();
      };

      data.forEach(item => {
        // Remove ID to let IndexedDB assign new ones
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...itemWithoutId } = item;
        const request = store.add(itemWithoutId);
        request.onsuccess = complete;
        request.onerror = () => reject(request.error);
      });
    });
  }

  // Singleton accessor
  public static getInstance(): OfflineStorageService {
    if (!this._instance) {
      this._instance = new OfflineStorageService();
    }
    return this._instance;
  }
}

// Export singleton instance via getInstance for backward compatibility
// Provide a static getInstance on the class for other modules that call it
// (some code imports OfflineStorageService and calls getInstance())
export const offlineStorage = OfflineStorageService.getInstance();

// (namespace shim removed - class provides static getInstance)

// Enhanced local storage with fallback to IndexedDB
export class EnhancedLocalStorage {
  private static instance: EnhancedLocalStorage;
  private storage: OfflineStorageService;

  constructor() {
    this.storage = offlineStorage;
  }

  static getInstance(): EnhancedLocalStorage {
    if (!EnhancedLocalStorage.instance) {
      EnhancedLocalStorage.instance = new EnhancedLocalStorage();
    }
    return EnhancedLocalStorage.instance;
  }

  async setItem(key: string, value: unknown): Promise<void> {
    try {
      // Try localStorage first
      localStorage.setItem(key, JSON.stringify(value));
      
      // Also store in IndexedDB as backup
      await this.storage.storeData('settings', { key, value });
    } catch (error) {
      // Fallback to IndexedDB only
      console.warn('localStorage failed, using IndexedDB:', error);
      await this.storage.storeData('settings', { key, value });
    }
  }

  async getItem(key: string): Promise<unknown> {
    try {
      // Try localStorage first
      const item = localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.warn('localStorage read failed:', error);
    }

    // Fallback to IndexedDB
    try {
      const settings = await this.storage.getData('settings');
      const setting = settings.find(s => {
        // Type guard to check if data has key property
        return s.data && typeof s.data === 'object' && 'key' in s.data && s.data.key === key;
      });
      return setting && setting.data && typeof setting.data === 'object' && 'value' in setting.data 
        ? setting.data.value 
        : null;
    } catch (error) {
      console.error('IndexedDB read failed:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage removal failed:', error);
    }

    // Also remove from IndexedDB
    try {
      const settings = await this.storage.getData('settings');
      const setting = settings.find(s => {
        // Type guard to check if data has key property
        return s.data && typeof s.data === 'object' && 'key' in s.data && s.data.key === key;
      });
      if (setting && setting.id) {
        await this.storage.deleteData(setting.id);
      }
    } catch (error) {
      console.error('IndexedDB removal failed:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('localStorage clear failed:', error);
    }

    // Clear from IndexedDB - just clear all settings instead of filtering
    try {
      const settings = await this.storage.getData('settings');
      await Promise.all(
        settings
          .filter(setting => setting.id !== undefined)
          .map(setting => this.storage.deleteData(setting.id!))
      );
    } catch (error) {
      console.error('IndexedDB clear failed:', error);
    }
  }
}

export const enhancedStorage = EnhancedLocalStorage.getInstance();
