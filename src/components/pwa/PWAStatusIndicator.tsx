import { useEffect, useState } from "react";

interface PWAStatus {
  isOnline: boolean;
  pendingSync: number;
  isSyncing: boolean;
}

/**
 * PWA Status Indicator Component
 * Shows offline/online status, sync status, and pending sync items
 */
export function PWAStatusIndicator() {
  const [status, setStatus] = useState<PWAStatus>({
    isOnline: navigator.onLine,
    pendingSync: 0,
    isSyncing: false
  });

  useEffect(() => {
    const updateStatus = async () => {
      try {
        // Get pending sync count if background sync is available
        const { backgroundSync } = await import('../../lib/background-sync');
        const pendingSync = await backgroundSync.getPendingItemsCount();
        const { isSyncing } = backgroundSync.getSyncStatus();

        setStatus(prev => ({
          ...prev,
          pendingSync,
          isSyncing
        }));
      } catch {
        // Background sync not available, continue without it
        setStatus(prev => ({
          ...prev,
          pendingSync: 0,
          isSyncing: false
        }));
      }
    };

    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      updateStatus(); // Refresh sync status when back online
    };

    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    const handleSyncUpdate = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('background-sync-sync-completed', handleSyncUpdate);
    window.addEventListener('background-sync-sync-started', handleSyncUpdate);

    updateStatus();

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('background-sync-sync-completed', handleSyncUpdate);
      window.removeEventListener('background-sync-sync-started', handleSyncUpdate);
      clearInterval(interval);
    };
  }, []);

  // Don't show anything if everything is good
  if (status.isOnline && status.pendingSync === 0 && !status.isSyncing) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg border shadow-lg border-l-4 border-l-blue-500 p-3 max-w-xs">
        <div className="flex items-center space-x-2">
          {!status.isOnline && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-red-700">Offline</span>
            </div>
          )}
          {status.isSyncing && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">Syncing...</span>
            </div>
          )}
          {status.pendingSync > 0 && !status.isSyncing && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-700">
                {status.pendingSync} pending
              </span>
            </div>
          )}
        </div>
        {!status.isOnline && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Your data is saved locally and will sync when you're back online
          </p>
        )}
      </div>
    </div>
  );
}
