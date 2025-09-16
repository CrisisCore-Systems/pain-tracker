/**
 * Simple PWA status hook without complex TypeScript dependencies
 */
import { useState, useEffect } from 'react';

// Simple PWA status interface
interface PWAStatus {
  isOnline: boolean;
  isInstalling: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  pendingSync: number;
  isSyncing: boolean;
}

// Type helpers for PWA properties
type PWAWindow = Window & {
  backgroundSync?: {
    getPendingItemsCount(): Promise<number>;
  };
  pwaManager?: {
    showInstallPrompt(): Promise<void>;
    resetServiceWorker?: () => Promise<void>;
  };
  forcePWASync?: () => Promise<void>;
};

type PWANavigator = Navigator & {
  getInstalledRelatedApps?: () => Promise<unknown[]>;
};

// Simple hook for PWA status
export function usePWAStatus() {
  const [status, setStatus] = useState<PWAStatus>({
    isOnline: navigator.onLine,
    isInstalling: false,
    isInstalled: false,
    canInstall: false,
    pendingSync: 0,
    isSyncing: false
  });

  useEffect(() => {
    // Online/Offline status
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    // PWA install events
    const handleInstallAvailable = () => setStatus(prev => ({ ...prev, canInstall: true }));
    const handleInstalled = () => setStatus(prev => ({ 
      ...prev, 
      isInstalled: true, 
      canInstall: false, 
      isInstalling: false 
    }));

    // Background sync events
    const handleSyncStart = () => setStatus(prev => ({ ...prev, isSyncing: true }));
    const handleSyncComplete = (event: Event) => {
      const customEvent = event as Event & { detail?: { successCount?: number } };
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        pendingSync: Math.max(0, prev.pendingSync - (customEvent.detail?.successCount || 0))
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);
    window.addEventListener('background-sync-sync-started', handleSyncStart);
    window.addEventListener('background-sync-sync-completed', handleSyncComplete);

    // Check initial state
    const checkInitialState = async () => {
      try {
        const extWindow = window as PWAWindow;
        const extNavigator = navigator as PWANavigator;
        
        // Check if app is installed
        if (extNavigator.getInstalledRelatedApps) {
          const apps = await extNavigator.getInstalledRelatedApps();
          if (apps.length > 0) {
            setStatus(prev => ({ ...prev, isInstalled: true }));
          }
        }

        // Check for pending sync items
        if (extWindow.backgroundSync) {
          const pendingCount = await extWindow.backgroundSync.getPendingItemsCount();
          setStatus(prev => ({ ...prev, pendingSync: pendingCount }));
        }
      } catch (error) {
        console.warn('PWA: Failed to check initial state:', error);
      }
    };

    checkInitialState();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
      window.removeEventListener('background-sync-sync-started', handleSyncStart);
      window.removeEventListener('background-sync-sync-completed', handleSyncComplete);
    };
  }, []);

  return status;
}

// Simple install function
export function useInstallPWA() {
  const [isInstalling, setIsInstalling] = useState(false);

  const install = async () => {
    try {
      setIsInstalling(true);
      const extWindow = window as PWAWindow;
      
      if (extWindow.pwaManager?.showInstallPrompt) {
        await extWindow.pwaManager.showInstallPrompt();
      } else {
        throw new Error('Install prompt not available');
      }
    } catch (error) {
      console.error('PWA: Install failed:', error);
      throw error;
    } finally {
      setIsInstalling(false);
    }
  };

  return { install, isInstalling };
}

// Simple sync function
export function useBackgroundSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const forceSync = async () => {
    try {
      setIsSyncing(true);
      const extWindow = window as PWAWindow;
      
      if (extWindow.forcePWASync) {
        await extWindow.forcePWASync();
      } else {
        throw new Error('Background sync not available');
      }
    } catch (error) {
      console.error('PWA: Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return { forceSync, isSyncing };
}

// Simple offline storage hook
export function useOfflineStorage() {
  const [storageStats, setStorageStats] = useState({
    used: 0,
    quota: 0,
    available: 0,
    percentage: 0
  });

  useEffect(() => {
    const updateStorageStats = async () => {
      try {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          const used = estimate.usage || 0;
          const quota = estimate.quota || 0;
          const available = quota - used;
          const percentage = quota > 0 ? (used / quota) * 100 : 0;

          setStorageStats({ used, quota, available, percentage });
        }
      } catch (error) {
        console.warn('PWA: Failed to get storage stats:', error);
      }
    };

    updateStorageStats();
    
    // Update periodically
    const interval = setInterval(updateStorageStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return storageStats;
}
