/**
 * Enhanced Pain Tracker Storage Hook with PWA Integration
 * Provides offline-first data management for pain tracking
 */

import { useCallback, useEffect, useState } from 'react';
import { usePainTrackerStore } from '../stores/pain-tracker-store';
import type { PainEntry } from '../types';

interface OfflineEntry extends PainEntry {
  syncStatus?: 'pending' | 'synced' | 'error';
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
  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalEntries: 0,
    syncedEntries: 0,
    pendingEntries: 0,
    storageUsed: 0,
    lastSync: null
  });

  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    const updateStorageStats = async () => {
      try {
        const entries = store.entries;
        const offlineEntries = entries as OfflineEntry[];
        
        const syncedCount = offlineEntries.filter(e => e.syncStatus === 'synced').length;
        const pendingCount = offlineEntries.filter(e => e.syncStatus === 'pending').length;
        
        // Estimate storage usage
        const entriesSize = new Blob([JSON.stringify(entries)]).size;
        const lastSync = localStorage.getItem('last-sync-time');

        setStorageStats({
          totalEntries: entries.length,
          syncedEntries: syncedCount,
          pendingEntries: pendingCount,
          storageUsed: entriesSize,
          lastSync
        });
      } catch (error) {
        console.error('Failed to update storage stats:', error);
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    updateStorageStats();

    // Update stats when entries change
    const unsubscribe = usePainTrackerStore.subscribe(
      (state) => state.entries,
      updateStorageStats
    );

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      unsubscribe();
    };
  }, [store.entries]);

  // Enhanced add entry with offline support
  const addEntryOffline = useCallback(async (entryData: Omit<PainEntry, 'id' | 'timestamp'>) => {
    try {
      // Create entry with offline metadata
      const enhancedEntry: Omit<OfflineEntry, 'id' | 'timestamp'> = {
        ...entryData,
        syncStatus: isOffline ? 'pending' : 'synced',
        lastModified: new Date().toISOString()
      };

      // Add to store
      store.addEntry(enhancedEntry);

      // If offline, queue for sync
      if (isOffline) {
        await queueForBackgroundSync('pain-entry', enhancedEntry);
      } else {
        // Try to sync immediately if online
        await syncEntry(enhancedEntry);
      }

      return true;
    } catch (error) {
      console.error('Failed to add entry offline:', error);
      store.setError('Failed to save entry. It will be retried when you\'re back online.');
      return false;
    }
  }, [isOffline, store]);

  // Queue entry for background sync
  const queueForBackgroundSync = useCallback(async (type: string, data: any) => {
    try {
      // Store in IndexedDB for background sync
      const { offlineStorage } = await import('../lib/offline-storage');
      await offlineStorage.storeData(type as any, data);
      
      // Add to sync queue
      const { backgroundSync } = await import('../lib/background-sync');
      await backgroundSync.queueForSync('/api/pain-entries', 'POST', data, 'high');
      
      return true;
    } catch (error) {
      console.error('Failed to queue for background sync:', error);
      return false;
    }
  }, []);

  // Sync individual entry
  const syncEntry = useCallback(async (entry: any) => {
    try {
      const { painTrackerSync } = await import('../lib/background-sync');
      await painTrackerSync.syncPainEntry(entry);
      return true;
    } catch (error) {
      console.error('Failed to sync entry:', error);
      return false;
    }
  }, []);

  // Force sync all pending entries
  const forceSyncAll = useCallback(async () => {
    if (isOffline) {
      store.setError('Cannot sync while offline');
      return false;
    }

    try {
      store.setLoading(true);
      const { painTrackerSync } = await import('../lib/background-sync');
      await painTrackerSync.forceSync();
      
      // Update sync timestamps
      localStorage.setItem('last-sync-time', new Date().toISOString());
      
      store.setLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to force sync:', error);
      store.setError('Sync failed. Please try again.');
      store.setLoading(false);
      return false;
    }
  }, [isOffline, store]);

  // Export data for backup
  const exportOfflineData = useCallback(async () => {
    try {
      const { pwaManager } = await import('../utils/pwa-utils');
      const data = await pwaManager.exportOfflineData();
      
      // Create downloadable file
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `pain-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Failed to export data:', error);
      store.setError('Failed to export data');
      return false;
    }
  }, [store]);

  // Import data from backup
  const importOfflineData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const { pwaManager } = await import('../utils/pwa-utils');
      await pwaManager.importOfflineData(data);
      
      // Reload entries from localStorage
      store.loadSampleData(); // This will trigger a reload
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      store.setError('Failed to import data. Please check the file format.');
      return false;
    }
  }, [store]);

  // Clear all offline data
  const clearOfflineData = useCallback(async () => {
    try {
      const { pwaManager } = await import('../utils/pwa-utils');
      await pwaManager.clearPWAData();
      
      // Clear store data
      store.clearAllData();
      
      return true;
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      return false;
    }
  }, [store]);

  // Get storage health status
  const getStorageHealth = useCallback(() => {
    const { totalEntries, syncedEntries, pendingEntries, storageUsed } = storageStats;
    
    const syncRatio = totalEntries > 0 ? syncedEntries / totalEntries : 1;
    const storageMB = storageUsed / (1024 * 1024);
    
    let health = 'good';
    const issues = [];
    
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
    
    if (isOffline) {
      issues.push('Currently offline');
    }
    
    return {
      health,
      issues,
      syncRatio: Math.round(syncRatio * 100),
      storageMB: Math.round(storageMB * 100) / 100
    };
  }, [storageStats, isOffline]);

  return {
    // Data operations
    addEntryOffline,
    forceSyncAll,
    exportOfflineData,
    importOfflineData,
    clearOfflineData,
    
    // Status and stats
    storageStats,
    isOffline,
    getStorageHealth: getStorageHealth(),
    
    // Store state
    entries: store.entries,
    isLoading: store.isLoading,
    error: store.error
  };
}

// Simplified hook for PWA status display
export function usePWAStatus() {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    isInstalled: false,
    canInstall: false,
    pendingSync: 0
  });

  useEffect(() => {
    const updateStatus = async () => {
      try {
        // Check if PWA is installed (simple detection)
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                           (window.navigator as any).standalone === true;

        // Check for pending sync items
        let pendingSync = 0;
        try {
          const { backgroundSync } = await import('../lib/background-sync');
          pendingSync = await backgroundSync.getPendingItemsCount();
        } catch (error) {
          // Background sync not available
        }

        setStatus({
          isOnline: navigator.onLine,
          isInstalled,
          canInstall: false, // Will be updated by install prompt events
          pendingSync
        });
      } catch (error) {
        console.error('Failed to update PWA status:', error);
      }
    };

    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));
    const handleInstallAvailable = () => setStatus(prev => ({ ...prev, canInstall: true }));
    const handleInstalled = () => setStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    updateStatus();

    // Update pending sync count periodically
    const interval = setInterval(updateStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
      clearInterval(interval);
    };
  }, []);

  return status;
}
