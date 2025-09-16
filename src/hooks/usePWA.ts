/**
 * Enhanced PWA Hooks for Pain Tracker
 * Provides React hooks for PWA functionality integration
 */

import { useState, useEffect, useCallback } from 'react';
import { pwaManager } from '../utils/pwa-utils';
import { backgroundSync } from '../lib/background-sync';
import { offlineStorage } from '../lib/offline-storage';

// PWA Status Hook
export function usePWAStatus() {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    isInstalled: false,
    hasServiceWorker: false,
    canInstall: false
  });

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const diagnostics = await pwaManager.getDiagnostics();
        setStatus({
          isOnline: diagnostics.isOnline,
          isInstalled: diagnostics.isInstalled,
          hasServiceWorker: diagnostics.hasServiceWorker,
          canInstall: pwaManager.isInstallPromptAvailable()
        });
      } catch (error) {
        console.error('Failed to update PWA status:', error);
      }
    };

    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));
    const handleInstallAvailable = () => setStatus(prev => ({ ...prev, canInstall: true }));
    const handleInstalled = () => setStatus(prev => ({ ...prev, isInstalled: true, canInstall: false }));

    // Setup event listeners
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
    };
  }, []);

  const install = useCallback(async () => {
    try {
      return await pwaManager.showInstallPrompt();
    } catch (error) {
      console.error('Failed to show install prompt:', error);
      return false;
    }
  }, []);

  return { ...status, install };
}

// Background Sync Hook
export function useBackgroundSync() {
  const [syncStatus, setSyncStatus] = useState({
    isSyncing: false,
    pendingItems: 0,
    lastSync: null as string | null,
    error: null as string | null
  });

  useEffect(() => {
    const updateSyncStatus = async () => {
      try {
        const { isSyncing } = backgroundSync.getSyncStatus();
        const pendingItems = await backgroundSync.getPendingItemsCount();
        const lastSync = localStorage.getItem('last-sync-time');
        
        setSyncStatus({
          isSyncing,
          pendingItems,
          lastSync,
          error: null
        });
      } catch (error) {
        setSyncStatus(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    const handleSyncCompleted = (event: any) => {
      const stats = event.detail;
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        pendingItems: prev.pendingItems - stats.successCount,
        lastSync: new Date().toISOString(),
        error: stats.errors.length > 0 ? stats.errors[0] : null
      }));
    };

    const handleSyncStarted = () => {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
    };

    window.addEventListener('background-sync-sync-completed', handleSyncCompleted);
    window.addEventListener('background-sync-sync-started', handleSyncStarted);

    updateSyncStatus();

    // Update every 30 seconds
    const interval = setInterval(updateSyncStatus, 30000);

    return () => {
      window.removeEventListener('background-sync-sync-completed', handleSyncCompleted);
      window.removeEventListener('background-sync-sync-started', handleSyncStarted);
      clearInterval(interval);
    };
  }, []);

  const forceSync = useCallback(async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
      await backgroundSync.forcSync();
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      }));
    }
  }, []);

  return { ...syncStatus, forceSync };
}

// Offline Storage Hook
export function useOfflineStorage() {
  const [storageStatus, setStorageStatus] = useState({
    isSupported: false,
    usage: { used: 0, quota: 0 },
    isReady: false
  });

  useEffect(() => {
    const initStorage = async () => {
      try {
        await offlineStorage.init();
        const usage = await offlineStorage.getStorageUsage();
        
        setStorageStatus({
          isSupported: true,
          usage,
          isReady: true
        });
      } catch (error) {
        console.error('Failed to initialize offline storage:', error);
        setStorageStatus({
          isSupported: false,
          usage: { used: 0, quota: 0 },
          isReady: false
        });
      }
    };

    initStorage();
  }, []);

  const storeData = useCallback(async (type: string, data: any) => {
    try {
      await offlineStorage.storeData(type as any, data);
      return true;
    } catch (error) {
      console.error('Failed to store data:', error);
      return false;
    }
  }, []);

  const getData = useCallback(async (type: string) => {
    try {
      return await offlineStorage.getData(type as any);
    } catch (error) {
      console.error('Failed to get data:', error);
      return [];
    }
  }, []);

  const clearData = useCallback(async () => {
    try {
      await offlineStorage.clearAllData();
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }, []);

  return {
    ...storageStatus,
    storeData,
    getData,
    clearData
  };
}

// PWA Analytics Hook
export function usePWAAnalytics() {
  const [analytics, setAnalytics] = useState({
    cacheHitRatio: 0,
    loadTime: 0,
    connectionQuality: 'unknown' as string,
    serviceWorkerVersion: 'unknown' as string
  });

  useEffect(() => {
    const handlePerformanceMetrics = (event: any) => {
      setAnalytics(prev => ({
        ...prev,
        loadTime: event.detail.loadTime || 0,
        cacheHitRatio: parseFloat(event.detail.cacheHitRatio || '0')
      }));
    };

    const handleConnectionTest = (event: any) => {
      setAnalytics(prev => ({
        ...prev,
        connectionQuality: event.detail.quality || 'unknown'
      }));
    };

    const handleCachePerformance = (event: any) => {
      setAnalytics(prev => ({
        ...prev,
        cacheHitRatio: parseFloat(event.detail.hitRatio || '0')
      }));
    };

    window.addEventListener('pwa-performance-metrics', handlePerformanceMetrics);
    window.addEventListener('pwa-connection-test', handleConnectionTest);
    window.addEventListener('pwa-cache-performance', handleCachePerformance);

    return () => {
      window.removeEventListener('pwa-performance-metrics', handlePerformanceMetrics);
      window.removeEventListener('pwa-connection-test', handleConnectionTest);
      window.removeEventListener('pwa-cache-performance', handleCachePerformance);
    };
  }, []);

  return analytics;
}

// PWA Notifications Hook
export function usePWANotifications() {
  const [notificationStatus, setNotificationStatus] = useState({
    permission: Notification.permission,
    isSupported: 'Notification' in window
  });

  const requestPermission = useCallback(async () => {
    if (!notificationStatus.isSupported) return false;

    try {
      const permission = await pwaManager.requestNotificationPermission();
      setNotificationStatus(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [notificationStatus.isSupported]);

  const scheduleReminder = useCallback(async (title: string, body: string, triggerTime: Date) => {
    if (notificationStatus.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      await pwaManager.scheduleHealthReminder(title, body, triggerTime);
      return true;
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      return false;
    }
  }, [notificationStatus.permission, requestPermission]);

  const subscribeToPush = useCallback(async () => {
    try {
      const subscription = await pwaManager.subscribeToPushNotifications();
      return subscription !== null;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }, []);

  return {
    ...notificationStatus,
    requestPermission,
    scheduleReminder,
    subscribeToPush
  };
}

// Complete PWA Hook that combines all functionality
export function usePWA() {
  const pwaStatus = usePWAStatus();
  const syncStatus = useBackgroundSync();
  const storageStatus = useOfflineStorage();
  const analytics = usePWAAnalytics();
  const notifications = usePWANotifications();

  return {
    status: pwaStatus,
    sync: syncStatus,
    storage: storageStatus,
    analytics,
    notifications
  };
}

// Utility hook for PWA health check
export function usePWAHealthCheck() {
  const [health, setHealth] = useState({
    score: 0,
    issues: [] as string[],
    recommendations: [] as string[]
  });

  useEffect(() => {
    const checkHealth = async () => {
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 100;

      try {
        const diagnostics = await pwaManager.getDiagnostics();

        // Check service worker
        if (!diagnostics.hasServiceWorker) {
          issues.push('Service Worker not active');
          recommendations.push('Enable Service Worker for offline functionality');
          score -= 30;
        }

        // Check storage usage
        const storagePercentage = diagnostics.storageUsage.quota > 0 
          ? (diagnostics.storageUsage.used / diagnostics.storageUsage.quota) * 100 
          : 0;

        if (storagePercentage > 80) {
          issues.push('Storage usage is high');
          recommendations.push('Clear cache or unused data');
          score -= 10;
        }

        // Check sync status
        if (diagnostics.pendingSyncItems > 10) {
          issues.push('Many items pending sync');
          recommendations.push('Check internet connection and force sync');
          score -= 20;
        }

        // Check capabilities
        const capabilities = diagnostics.capabilities;
        if (!capabilities.pushNotifications) {
          recommendations.push('Enable push notifications for reminders');
          score -= 10;
        }

        if (!capabilities.persistentStorage) {
          recommendations.push('Grant persistent storage permission');
          score -= 10;
        }

        setHealth({
          score: Math.max(0, score),
          issues,
          recommendations
        });
      } catch (error) {
        console.error('PWA health check failed:', error);
        setHealth({
          score: 0,
          issues: ['Health check failed'],
          recommendations: ['Refresh the application']
        });
      }
    };

    checkHealth();

    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return health;
}
