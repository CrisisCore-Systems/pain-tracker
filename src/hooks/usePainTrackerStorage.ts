/**
 * Enhanced Pain Tracker Storage Hook with PWA Integration
 * Provides offline-first data management for pain tracking
 */

import { useCallback, useEffect, useState } from 'react';
import { secureStorage } from '../lib/storage/secureStorage';
import { usePainTrackerStore } from '../stores/pain-tracker-store';
import type { PainEntry } from '../types';

interface OfflineEntry extends PainEntry {
  syncStatus?: 'pending' | 'synced' | 'error' | 'local-only';
  lastModified?: string;
}

interface StorageStats {
  totalEntries: number;
  syncedEntries: number;
  pendingEntries: number;
  storageUsed: number;
  lastSync: string | null;
}

export function usePainTrackerStorage() {
  const store = usePainTrackerStore();
  // Remote replay endpoints are intentionally disabled until server routes exist.
  const remoteSyncEnabled = false;
  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalEntries: 0,
    syncedEntries: 0,
    pendingEntries: 0,
    storageUsed: 0,
    lastSync: null,
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);

    const updateStorageStats = async () => {
      try {
        const entries = store.entries;
        const offlineEntries = entries as OfflineEntry[];
        const syncedCount = offlineEntries.filter(
          e => e.syncStatus === 'synced' || e.syncStatus === 'local-only'
        ).length;
        const pendingCount = offlineEntries.filter(e => e.syncStatus === 'pending').length;
        const entriesSize = new Blob([JSON.stringify(entries)]).size;
        const lastSync = secureStorage.get<string>('last-sync-time');

        setStorageStats({
          totalEntries: entries.length,
          syncedEntries: syncedCount,
          pendingEntries: pendingCount,
          storageUsed: entriesSize,
          lastSync,
        });
      } catch (err) {
        console.error('Failed to update storage stats:', err);
      }
    };

    globalThis.addEventListener('online', updateOnlineStatus);
    globalThis.addEventListener('offline', updateOnlineStatus);
    updateStorageStats();

    const unsubscribe = usePainTrackerStore.subscribe(s => s.entries, updateStorageStats);
    return () => {
      globalThis.removeEventListener('online', updateOnlineStatus);
      globalThis.removeEventListener('offline', updateOnlineStatus);
      unsubscribe();
    };
  }, [store]);

  type StorableType = 'pain-entry' | 'emergency-data' | 'activity-log' | 'settings' | 'sync-queue';
  const queueForBackgroundSync = useCallback(async (type: StorableType, data: unknown) => {
    try {
      const { offlineStorage } = await import('../lib/offline-storage');
      // Ensure data is JSON-serializable for storage and queue payload
      let payload: Record<string, unknown> | string | number | boolean | null;
      if (data === null || data === undefined) {
        payload = null;
      } else if (typeof data === 'object') {
        // Shallow clone to strip functions/symbols
        payload = { ...(data as Record<string, unknown>) };
      } else if (['string', 'number', 'boolean'].includes(typeof data)) {
        payload = data as string | number | boolean;
      } else {
        // Drop unsupported payload types instead of coercing to ambiguous string values.
        payload = null;
      }

      await offlineStorage.storeData(type, payload as unknown as never);
      if (remoteSyncEnabled) {
        const { backgroundSync } = await import('../lib/background-sync');
        if (backgroundSync && typeof backgroundSync.queueForSync === 'function') {
          await backgroundSync.queueForSync('/api/pain-entries', 'POST', payload, 'high');
        }
      }
      return true;
    } catch (err) {
      console.error('Failed to queue for background sync:', err);
      return false;
    }
  }, []);

  const syncEntry = useCallback(async (entry: Partial<OfflineEntry>) => {
    if (!remoteSyncEnabled) {
      return true;
    }

    try {
      const { painTrackerSync } = await import('../lib/background-sync');
      if (painTrackerSync && typeof painTrackerSync.syncPainEntry === 'function') {
        await painTrackerSync.syncPainEntry(entry as Record<string, unknown>);
      }
      return true;
    } catch (err) {
      console.error('Failed to sync entry:', err);
      return false;
    }
  }, [remoteSyncEnabled]);

  const addEntryOffline = useCallback(
    async (entryData: Omit<PainEntry, 'id' | 'timestamp'>) => {
      try {
        let syncStatus: OfflineEntry['syncStatus'] = 'local-only';
        if (remoteSyncEnabled) {
          syncStatus = isOffline ? 'pending' : 'synced';
        }

        const enhancedEntry: Omit<OfflineEntry, 'id' | 'timestamp'> = {
          ...entryData,
          syncStatus,
          lastModified: new Date().toISOString(),
        };

        store.addEntry(enhancedEntry as unknown as PainEntry); // store expects PainEntry shape
        if (isOffline && remoteSyncEnabled) await queueForBackgroundSync('pain-entry', enhancedEntry);
        else await syncEntry(enhancedEntry);
        return true;
      } catch (err) {
        console.error('Failed to add entry offline:', err);
        store.setError("Failed to save entry. It will be retried when you're back online.");
        return false;
      }
    },
    [isOffline, remoteSyncEnabled, store, queueForBackgroundSync, syncEntry]
  );

  const forceSyncAll = useCallback(async () => {
    if (isOffline) {
      store.setError('Cannot sync while offline');
      return false;
    }
    try {
      store.setLoading(true);
      const { painTrackerSync } = await import('../lib/background-sync');
      if (painTrackerSync && typeof painTrackerSync.forceSync === 'function') {
        await painTrackerSync.forceSync();
      }
      secureStorage.set('last-sync-time', new Date().toISOString());
      store.setLoading(false);
      return true;
    } catch (err) {
      console.error('Failed to force sync:', err);
      store.setError('Sync failed. Please try again.');
      store.setLoading(false);
      return false;
    }
  }, [isOffline, store]);

  const clearOfflineData = useCallback(async () => {
    try {
      const { pwaManager } = await import('../utils/pwa-utils');
      await pwaManager.clearPWAData();
      store.clearAllData();

      // Also clear Zustand persisted state (not managed by secureStorage)
      try {
        localStorage.removeItem('pain-tracker-storage');
      } catch {
        // ignore
      }

      return true;
    } catch (err) {
      console.error('Failed to clear offline data:', err);
      return false;
    }
  }, [store]);

  const getStorageHealth = useCallback(() => {
    const { totalEntries, syncedEntries, pendingEntries, storageUsed } = storageStats;
    const syncRatio = totalEntries > 0 ? syncedEntries / totalEntries : 1;
    const storageMB = storageUsed / (1024 * 1024);
    let health = 'good';
    const issues: string[] = [];
    if (syncRatio < 0.5) {
      health = 'poor';
      issues.push(`${pendingEntries} entries need syncing`);
    } else if (syncRatio < 0.8) {
      health = 'warning';
      issues.push(`${pendingEntries} entries pending sync`);
    }
    if (storageMB > 50) {
      health = 'warning';
      issues.push('High storage usage');
    }
    if (!remoteSyncEnabled) {
      issues.push('Remote sync is disabled; entries are stored locally on this device only');
    }
    if (isOffline) {
      issues.push('Currently offline');
    }
    return {
      health,
      issues,
      syncRatio: Math.round(syncRatio * 100),
      storageMB: Math.round(storageMB * 100) / 100,
    };
  }, [storageStats, isOffline, remoteSyncEnabled]);

  return {
    addEntryOffline,
    forceSyncAll,
    clearOfflineData,
    storageStats,
    isOffline,
    isRemoteSyncEnabled: remoteSyncEnabled,
    syncMode: remoteSyncEnabled ? 'remote' : 'local-only',
    getStorageHealth: getStorageHealth(),
    entries: store.entries,
    isLoading: store.isLoading,
    error: store.error,
  };
}
