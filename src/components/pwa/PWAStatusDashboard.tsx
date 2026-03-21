import { useState, useEffect, useCallback } from 'react';
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
  Settings,
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
  syncEnabled?: boolean;
  pendingEntries: number;
  lastSync: string | null;
}

type CapabilityEntry = [string, boolean];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${formatNumber(bytes / Math.pow(k, i), 2)} ${sizes[i]}`;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
}

function getConnectionStatusColor(isOnline: boolean) {
  return isOnline ? 'text-green-600' : 'text-red-600';
}

function getConnectionQualityColor(quality: string) {
  switch (quality) {
    case 'good':
      return 'text-green-600';
    case 'moderate':
      return 'text-yellow-600';
    case 'poor':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

function getSyncHeadlineIcon(syncStatus: SyncStatus) {
  if (syncStatus.isSyncing) {
    return <Sync className="h-5 w-5 animate-spin text-blue-600" />;
  }

  if (syncStatus.pendingEntries > 0) {
    return <CloudOff className="h-5 w-5 text-yellow-600" />;
  }

  return <Cloud className="h-5 w-5 text-green-600" />;
}

function getSyncStatusLabel(syncStatus: SyncStatus) {
  if (syncStatus.syncEnabled === false) {
    return 'Local Only Mode';
  }

  if (syncStatus.isSyncing) {
    return 'Syncing...';
  }

  if (syncStatus.pendingEntries > 0) {
    return 'Pending';
  }

  return 'Up to date';
}

function getStorageBarClass(storagePercentage: number) {
  if (storagePercentage > 80) {
    return 'bg-red-600';
  }

  if (storagePercentage > 60) {
    return 'bg-yellow-600';
  }

  return 'bg-blue-600';
}

function formatCapabilityLabel(key: string) {
  return key.replaceAll(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function getConnectionIcon(isOnline: boolean) {
  return isOnline
    ? <Wifi className={`h-5 w-5 ${getConnectionStatusColor(true)}`} />
    : <WifiOff className={`h-5 w-5 ${getConnectionStatusColor(false)}`} />;
}

function getOnlineBadgeClass(isOnline: boolean) {
  return isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
}

function getInstalledBadgeClass(isInstalled: boolean) {
  return isInstalled
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
}

function getCapabilityStatusIcon(value: boolean) {
  return value
    ? <CheckCircle2 className="h-4 w-4 text-green-600" />
    : <XCircle className="h-4 w-4 text-red-600" />;
}

function getIndicatorContent(
  isOnline: boolean,
  isSyncing: boolean,
  pendingItems: number,
  syncEnabled: boolean
) {
  if (!isOnline) {
    return {
      icon: <WifiOff className="h-4 w-4 text-red-600" />,
      label: 'Offline',
    };
  }

  if (!syncEnabled) {
    return {
      icon: <CloudOff className="h-4 w-4 text-amber-600" />,
      label: 'Local Only Mode',
    };
  }

  if (isSyncing) {
    return {
      icon: <Sync className="h-4 w-4 text-blue-600 animate-spin" />,
      label: 'Syncing...',
    };
  }

  if (pendingItems > 0) {
    return {
      icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
      label: `${pendingItems} pending`,
    };
  }

  return null;
}

function ConnectionStatusPanel({
  connectionQuality,
  pwaStatus,
}: Readonly<{
  connectionQuality: string;
  pwaStatus: PWAStatusData;
}>) {
  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          {getConnectionIcon(pwaStatus.isOnline)}
          <span>Connection Status</span>
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${getOnlineBadgeClass(pwaStatus.isOnline)}`}>
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
            <span className={`text-sm font-medium px-2 py-1 rounded ${getOnlineBadgeClass(pwaStatus.hasServiceWorker)}`}>
              {pwaStatus.hasServiceWorker ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 dark:text-gray-400">PWA Installed</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${getInstalledBadgeClass(pwaStatus.isInstalled)}`}>
              {pwaStatus.isInstalled ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SyncStatusPanel({
  handleClearPWAData,
  handleForceSync,
  isRefreshing,
  pwaStatus,
  syncStatus,
}: Readonly<{
  handleClearPWAData: () => Promise<void>;
  handleForceSync: () => Promise<void>;
  isRefreshing: boolean;
  pwaStatus: PWAStatusData;
  syncStatus: SyncStatus;
}>) {
  const syncStatusLabel = getSyncStatusLabel(syncStatus);

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          {getSyncHeadlineIcon(syncStatus)}
          <span>Sync Status</span>
        </h3>
      </div>
      <div className="p-6">
        {!syncStatus.syncEnabled && (
          <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Local Only Mode: network sync is disabled. Manual export is required for sharing or backup.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
            <span className="text-sm font-medium">{syncStatusLabel}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pending Items</span>
            <span className="text-sm font-medium">{syncStatus.syncEnabled ? syncStatus.pendingEntries : 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 dark:text-gray-400">Pending Entries</span>
            <span className="text-sm font-medium">{syncStatus.syncEnabled ? syncStatus.pendingEntries : 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 dark:text-gray-400">Last Sync</span>
            <span className="text-xs">{formatDate(syncStatus.lastSync)}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleForceSync}
            disabled={isRefreshing || !pwaStatus.isOnline || !syncStatus.syncEnabled}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{syncStatus.syncEnabled ? 'Force Sync' : 'Sync Disabled'}</span>
          </button>
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
  );
}

function StorageUsagePanel({
  pwaStatus,
  storagePercentage,
}: Readonly<{
  pwaStatus: PWAStatusData;
  storagePercentage: number;
}>) {
  return (
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
              <span>
                {formatBytes(pwaStatus.storageUsage.used)} / {formatBytes(pwaStatus.storageUsage.quota)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getStorageBarClass(storagePercentage)}`}
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {formatNumber(storagePercentage, 1)}% of available storage used
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CapabilitiesPanel({ capabilities }: Readonly<{ capabilities: CapabilityEntry[] }>) {
  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>PWA Capabilities</span>
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {capabilities.map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              {getCapabilityStatusIcon(value)}
              <span className="text-sm">{formatCapabilityLabel(key)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PWAStatusDashboard() {
  const [pwaStatus, setPwaStatus] = useState<PWAStatusData | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<string>('unknown');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadPWAStatus = useCallback(async () => {
    try {
      const status = await pwaManager.getDiagnostics();
      setPwaStatus(status as unknown as PWAStatusData);
    } catch (error) {
      console.error('Failed to load PWA status:', error);
    }
  }, []);

  const loadSyncStatus = useCallback(async () => {
    try {
      const syncManager = await import('../../lib/background-sync').then(m => m.painTrackerSync);
      const status = await syncManager.getSyncStatus();
      const { isOnline, isSyncing } = backgroundSync.getSyncStatus();

      setSyncStatus({
        ...status,
        isOnline,
        isSyncing,
      });
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  }, []);

  const handleOnlineStatusChange = useCallback(() => {
    loadPWAStatus();
    loadSyncStatus();
  }, [loadPWAStatus, loadSyncStatus]);

  const handleConnectionQualityChange = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<Record<string, unknown>>;
    const detail = customEvent.detail || {};
    const quality = typeof detail.quality === 'string' ? detail.quality : 'unknown';
    setConnectionQuality(quality);
  }, []);

  const handleSyncCompleted = useCallback(() => {
    loadSyncStatus();
  }, [loadSyncStatus]);

  const setupEventListeners = useCallback(() => {
    globalThis.addEventListener('pwa-online', handleOnlineStatusChange);
    globalThis.addEventListener('pwa-offline', handleOnlineStatusChange);
    globalThis.addEventListener('pwa-connection-test', handleConnectionQualityChange);
    globalThis.addEventListener('background-sync-sync-completed', handleSyncCompleted);
  }, [handleOnlineStatusChange, handleConnectionQualityChange, handleSyncCompleted]);

  const cleanupEventListeners = useCallback(() => {
    globalThis.removeEventListener('pwa-online', handleOnlineStatusChange);
    globalThis.removeEventListener('pwa-offline', handleOnlineStatusChange);
    globalThis.removeEventListener('pwa-connection-test', handleConnectionQualityChange);
    globalThis.removeEventListener('background-sync-sync-completed', handleSyncCompleted);
  }, [handleOnlineStatusChange, handleConnectionQualityChange, handleSyncCompleted]);

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
  }, [loadPWAStatus, loadSyncStatus, setupEventListeners, cleanupEventListeners]);


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
    if (
      globalThis.confirm(
        'Are you sure you want to clear all PWA data? This will remove offline cache and sync queue.'
      )
    ) {
      try {
        await pwaManager.clearPWAData();
        await loadPWAStatus();
      } catch (error) {
        console.error('Failed to clear PWA data:', error);
      }
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
  const capabilities = Object.entries(pwaStatus.capabilities);

  return (
    <div className="space-y-6">
      <ConnectionStatusPanel connectionQuality={connectionQuality} pwaStatus={pwaStatus} />
      <SyncStatusPanel
        handleClearPWAData={handleClearPWAData}
        handleForceSync={handleForceSync}
        isRefreshing={isRefreshing}
        pwaStatus={pwaStatus}
        syncStatus={syncStatus}
      />
      <StorageUsagePanel pwaStatus={pwaStatus} storagePercentage={storagePercentage} />
      <CapabilitiesPanel capabilities={capabilities} />

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
  const [syncEnabled, setSyncEnabled] = useState(true);

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
        const enabled = backgroundSync.isSyncEnabled();
        setSyncEnabled(enabled);
        setPendingItems(enabled ? count : 0);
      } catch (error) {
        console.error('Failed to get pending items count:', error);
      }
    };

    globalThis.addEventListener('online', updateStatus);
    globalThis.addEventListener('offline', updateStatus);
    globalThis.addEventListener('background-sync-sync-started', handleSyncStart);
    globalThis.addEventListener('background-sync-sync-completed', handleSyncEnd);

    updateStatus();

    return () => {
      globalThis.removeEventListener('online', updateStatus);
      globalThis.removeEventListener('offline', updateStatus);
      globalThis.removeEventListener('background-sync-sync-started', handleSyncStart);
      globalThis.removeEventListener('background-sync-sync-completed', handleSyncEnd);
    };
  }, []);

  if (isOnline && pendingItems === 0 && !isSyncing) {
    return null; // Don't show anything when everything is good
  }

  const indicatorContent = getIndicatorContent(
    isOnline,
    isSyncing,
    pendingItems,
    syncEnabled,
  );

  if (!indicatorContent) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg border shadow-lg border-l-4 border-l-blue-500 p-3">
        <div className="flex items-center space-x-2">
          {indicatorContent.icon}
          <span className="text-sm font-medium">{indicatorContent.label}</span>
        </div>
      </div>
    </div>
  );
}
