import { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  HardDrive,
  RefreshCw as Sync,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Settings
} from 'lucide-react';
import { pwaManager } from '../../utils/pwa-utils';
import { formatNumber } from '../../utils/formatting';
import { backgroundSync } from '../../lib/background-sync';

interface PWAStatusData {
  isInstalled: boolean;
  hasServiceWorker: boolean;
  isOnline: boolean;
  storageUsage: { used: number; quota: number };
  capabilities: Record<string, boolean>;
  pendingSyncItems: number;
  lastSync: string | null;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingEntries: number;
  lastSync: string | null;
}

export function PWAStatusDashboard() {
  const [pwaStatus, setPwaStatus] = useState<PWAStatusData | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<string>('unknown');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadPWAStatus();
    loadSyncStatus();
    setupEventListeners();

    // Refresh status every 30 seconds
    const interval = setInterval(() => {
      loadPWAStatus();
      loadSyncStatus();
      setLastUpdate(new Date());
    }, 30000);

    return () => {
      clearInterval(interval);
      cleanupEventListeners();
    };
  }, []);

  const loadPWAStatus = async () => {
    try {
      const status = await pwaManager.getDiagnostics();
      // pwaManager.getDiagnostics() returns a typed PWACapabilities shape
      // which may not exactly match our local PWAStatusData type. Narrow
      // it here with a safe cast so the state updater accepts it.
      setPwaStatus(status as unknown as PWAStatusData);
    } catch (error) {
      console.error('Failed to load PWA status:', error);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const syncManager = await import('../../lib/background-sync').then(m => m.painTrackerSync);
      const status = await syncManager.getSyncStatus();
      const { isOnline, isSyncing } = backgroundSync.getSyncStatus();
      
      setSyncStatus({
        ...status,
        isOnline,
        isSyncing
      });
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const setupEventListeners = () => {
    window.addEventListener('pwa-online', handleOnlineStatusChange);
    window.addEventListener('pwa-offline', handleOnlineStatusChange);
    window.addEventListener('pwa-connection-test', handleConnectionQualityChange);
    window.addEventListener('background-sync-sync-completed', handleSyncCompleted);
  };

  const cleanupEventListeners = () => {
    window.removeEventListener('pwa-online', handleOnlineStatusChange);
    window.removeEventListener('pwa-offline', handleOnlineStatusChange);
    window.removeEventListener('pwa-connection-test', handleConnectionQualityChange);
    window.removeEventListener('background-sync-sync-completed', handleSyncCompleted);
  };

  const handleOnlineStatusChange = () => {
    loadPWAStatus();
    loadSyncStatus();
  };

  const handleConnectionQualityChange = (event: Event) => {
    const customEvent = event as CustomEvent<Record<string, unknown>>;
    const detail = customEvent.detail || {};
    const quality = typeof detail.quality === 'string' ? detail.quality : 'unknown';
    setConnectionQuality(quality);
  };

  const handleSyncCompleted = () => {
    loadSyncStatus();
  };

  const handleForceSync = async () => {
    setIsRefreshing(true);
    try {
      const syncManager = await import('../../lib/background-sync').then(m => m.painTrackerSync);
      await syncManager.forceSync();
      await loadSyncStatus();
    } catch (error) {
      console.error('Failed to force sync:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearPWAData = async () => {
    if (window.confirm('Are you sure you want to clear all PWA data? This will remove offline cache and sync queue.')) {
      try {
        await pwaManager.clearPWAData();
        await loadPWAStatus();
      } catch (error) {
        console.error('Failed to clear PWA data:', error);
      }
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${formatNumber(bytes / Math.pow(k, i), 2)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getConnectionStatusColor = (isOnline: boolean) => {
    return isOnline ? 'text-green-600' : 'text-red-600';
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'good': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!pwaStatus || !syncStatus) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading PWA status...
        </div>
      </div>
    );
  }

  const storagePercentage = pwaStatus.storageUsage.quota > 0 
    ? (pwaStatus.storageUsage.used / pwaStatus.storageUsage.quota) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            {pwaStatus.isOnline ? (
              <Wifi className={`h-5 w-5 ${getConnectionStatusColor(true)}`} />
            ) : (
              <WifiOff className={`h-5 w-5 ${getConnectionStatusColor(false)}`} />
            )}
            <span>Connection Status</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${pwaStatus.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {pwaStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">Quality</span>
              <span className={`text-sm font-medium ${getConnectionQualityColor(connectionQuality)}`}>
                {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">Service Worker</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${pwaStatus.hasServiceWorker ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {pwaStatus.hasServiceWorker ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">PWA Installed</span>
              <span className={`text-sm font-medium px-2 py-1 rounded ${pwaStatus.isInstalled ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                {pwaStatus.isInstalled ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            {syncStatus.isSyncing ? (
              <Sync className="h-5 w-5 animate-spin text-blue-600" />
            ) : syncStatus.pendingEntries > 0 ? (
              <CloudOff className="h-5 w-5 text-yellow-600" />
            ) : (
              <Cloud className="h-5 w-5 text-green-600" />
            )}
            <span>Sync Status</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
              <span className="text-sm font-medium">
                {syncStatus.isSyncing ? 'Syncing...' : 
                 syncStatus.pendingEntries > 0 ? 'Pending' : 'Up to date'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending Items</span>
              <span className="text-sm font-medium">{syncStatus.pendingEntries}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending Entries</span>
              <span className="text-sm font-medium">{syncStatus.pendingEntries}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Sync</span>
              <span className="text-xs">{formatDate(syncStatus.lastSync)}</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleForceSync}
              disabled={isRefreshing || !pwaStatus.isOnline}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Force Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Storage Usage</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Used Storage</span>
                <span>{formatBytes(pwaStatus.storageUsage.used)} / {formatBytes(pwaStatus.storageUsage.quota)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${storagePercentage > 80 ? 'bg-red-600' : storagePercentage > 60 ? 'bg-yellow-600' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {formatNumber(storagePercentage, 1)}% of available storage used
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleClearPWAData}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:bg-gray-900"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Cache</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PWA Capabilities */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>PWA Capabilities</span>
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(pwaStatus.capabilities).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                {value ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
}

export function PWAStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingItems, setPendingItems] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      loadPendingItems();
    };

    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncEnd = () => {
      setIsSyncing(false);
      loadPendingItems();
    };

    const loadPendingItems = async () => {
      try {
        const count = await backgroundSync.getPendingItemsCount();
        setPendingItems(count);
      } catch (error) {
        console.error('Failed to get pending items count:', error);
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    window.addEventListener('background-sync-sync-started', handleSyncStart);
    window.addEventListener('background-sync-sync-completed', handleSyncEnd);

    updateStatus();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      window.removeEventListener('background-sync-sync-started', handleSyncStart);
      window.removeEventListener('background-sync-sync-completed', handleSyncEnd);
    };
  }, []);

  if (isOnline && pendingItems === 0 && !isSyncing) {
    return null; // Don't show anything when everything is good
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg border shadow-lg border-l-4 border-l-blue-500 p-3">
        <div className="flex items-center space-x-2">
          {!isOnline ? (
            <>
              <WifiOff className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Offline</span>
            </>
          ) : isSyncing ? (
            <>
              <Sync className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-sm font-medium">Syncing...</span>
            </>
          ) : pendingItems > 0 ? (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">{pendingItems} pending</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
