import { useState, useEffect, useCallback } from 'react';
import { pwaManager } from '../utils/pwa-utils';
import { backgroundSync } from '../lib/background-sync';
import { offlineStorage } from '../lib/offline-storage';
import { secureStorage } from '../lib/storage/secureStorage';

type SyncStatus = {
  isSyncing: boolean;
  pendingItems: number;
  lastSync: string | null;
  error: string | null;
};

// PWA Status Hook
export function usePWAStatus() {
  const [status, setStatus] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInstalled: false,
    hasServiceWorker: false,
    canInstall: false,
  });

  useEffect(() => {
    let mounted = true;

    const updateStatus = async () => {
      try {
        const diagnostics = await pwaManager.getDiagnostics();
        if (!mounted) return;
        setStatus({
          isOnline: diagnostics.isOnline,
          isInstalled: diagnostics.isInstalled,
          hasServiceWorker: diagnostics.hasServiceWorker,
          canInstall: pwaManager.isInstallPromptAvailable(),
        });
      } catch (err) {
        console.error('Failed to update PWA status:', err);
      }
    };

    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));
    const handleInstallAvailable = () => setStatus(prev => ({ ...prev, canInstall: true }));
    const handleInstalled = () =>
      setStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    updateStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
      mounted = false;
    };
  }, []);

  const install = useCallback(async () => {
    try {
      return await pwaManager.showInstallPrompt();
    } catch (err) {
      console.error('Failed to show install prompt:', err);
      return false;
    }
  }, []);

  return { ...status, install };
}

// Background Sync Hook
export function useBackgroundSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingItems: 0,
    lastSync: null,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const updateSyncStatus = async () => {
      try {
        const { isSyncing } = backgroundSync.getSyncStatus();
        const pendingItems = await backgroundSync.getPendingItemsCount();
        // Prefer secure storage value; fallback to legacy localStorage once and migrate
        let lastSync = secureStorage.get<string>('last-sync-time');
        if (!lastSync) {
          try {
            const legacy = localStorage.getItem('last-sync-time');
            if (legacy) {
              secureStorage.set('last-sync-time', legacy, { encrypt: true });
              lastSync = legacy;
            }
          } catch {
            /* ignore */
          }
        }

        if (!mounted) return;
        setSyncStatus({ isSyncing, pendingItems, lastSync, error: null });
      } catch (err) {
        if (!mounted) return;
        setSyncStatus(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Unknown error',
        }));
      }
    };

    const handleSyncCompleted = (evt: Event) => {
      const ev = evt as CustomEvent<{ successCount?: number; errors?: string[] }>;
      const stats = ev.detail || { successCount: 0, errors: [] };
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        pendingItems: Math.max(0, prev.pendingItems - (stats.successCount || 0)),
        lastSync: new Date().toISOString(),
        error: stats.errors && stats.errors.length > 0 ? stats.errors[0] : null,
      }));
    };

    const handleSyncStarted = () => {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    };

    window.addEventListener('background-sync-sync-completed', handleSyncCompleted);
    window.addEventListener('background-sync-sync-started', handleSyncStarted);

    updateSyncStatus();

    const interval = setInterval(updateSyncStatus, 30000);

    return () => {
      mounted = false;
      window.removeEventListener('background-sync-sync-completed', handleSyncCompleted);
      window.removeEventListener('background-sync-sync-started', handleSyncStarted);
      clearInterval(interval);
    };
  }, []);

  const forceSync = useCallback(async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
      // Support both correct and legacy typo method names without using 'any'
      // cspell:ignore forc
      type MaybeForceSync = {
        forceSync?: () => Promise<unknown>;
        forcSync?: () => Promise<unknown>;
      };
      const svc = backgroundSync as unknown as MaybeForceSync;
      if (typeof svc.forceSync === 'function') {
        await svc.forceSync();
      } else if (typeof svc.forcSync === 'function') {
        await svc.forcSync();
      }
      return true;
    } catch (err) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: err instanceof Error ? err.message : 'Sync failed',
      }));
      return false;
    }
  }, []);

  return { ...syncStatus, forceSync };
}

// Offline Storage Hook
export function useOfflineStorage() {
  const [storageStatus, setStorageStatus] = useState({
    isSupported: false,
    usage: { used: 0, quota: 0 },
    isReady: false,
  });

  useEffect(() => {
    let mounted = true;
    const initStorage = async () => {
      try {
        await offlineStorage.init();
        const usage = await offlineStorage.getStorageUsage();

        if (!mounted) return;
        setStorageStatus({ isSupported: true, usage, isReady: true });
      } catch (err) {
        console.error('Failed to initialize offline storage:', err);
        if (!mounted) return;
        setStorageStatus({ isSupported: false, usage: { used: 0, quota: 0 }, isReady: false });
      }
    };

    initStorage();
    return () => {
      mounted = false;
    };
  }, []);

  const storeData = useCallback(async (type: string, data: unknown) => {
    try {
      const storageLike = offlineStorage as unknown as {
        storeData: (t: string, d: unknown) => Promise<number>;
      };
      await storageLike.storeData(type, data);
      return true;
    } catch (err) {
      console.error('Failed to store data:', err);
      return false;
    }
  }, []);

  const getData = useCallback(async (type: string) => {
    try {
      const storageLike = offlineStorage as unknown as {
        getData: (t: string) => Promise<Array<{ data: unknown }>>;
      };
      const records = await storageLike.getData(type);
      return records.map(r => r.data);
    } catch (err) {
      console.error('Failed to get data:', err);
      return [] as unknown[];
    }
  }, []);

  const clearData = useCallback(async () => {
    try {
      await offlineStorage.clearAllData();
      return true;
    } catch (err) {
      console.error('Failed to clear data:', err);
      return false;
    }
  }, []);

  return { ...storageStatus, storeData, getData, clearData };
}

// Combined hook
export function usePWA() {
  const status = usePWAStatus();
  const sync = useBackgroundSync();
  const storage = useOfflineStorage();

  return { status, sync, storage };
}

// Health check hook
export function usePWAHealthCheck() {
  const [health, setHealth] = useState({
    score: 0,
    issues: [] as string[],
    recommendations: [] as string[],
  });

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      try {
        const diagnostics = await pwaManager.getDiagnostics();

        if (!diagnostics.hasServiceWorker) {
          issues.push('Service Worker not active');
          recommendations.push('Enable Service Worker for offline functionality');
          score -= 30;
        }

        const storagePercentage =
          diagnostics.storageUsage.quota > 0
            ? (diagnostics.storageUsage.used / diagnostics.storageUsage.quota) * 100
            : 0;
        if (storagePercentage > 80) {
          issues.push('Storage usage is high');
          recommendations.push('Clear cache or unused data');
          score -= 10;
        }

        if (diagnostics.pendingSyncItems > 10) {
          issues.push('Many items pending sync');
          recommendations.push('Check internet connection and force sync');
          score -= 20;
        }

        const capabilities = diagnostics.capabilities;
        if (!capabilities.pushNotifications) {
          recommendations.push('Enable push notifications for reminders');
          score -= 10;
        }
        if (!capabilities.persistentStorage) {
          recommendations.push('Grant persistent storage permission');
          score -= 10;
        }

        if (!mounted) return;
        setHealth({ score: Math.max(0, score), issues, recommendations });
      } catch (err) {
        console.error('PWA health check failed:', err);
        if (!mounted) return;
        setHealth({
          score: 0,
          issues: ['Health check failed'],
          recommendations: ['Refresh the application'],
        });
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return health;
}

/**
 * Enhanced PWA Hooks for Pain Tracker
 * Provides React hooks for PWA functionality integration
 */
