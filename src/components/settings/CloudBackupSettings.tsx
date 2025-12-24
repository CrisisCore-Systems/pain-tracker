import React, { useState, useEffect } from 'react';
import { secureStorage } from '../../lib/storage/secureStorage';

const STORAGE_KEY = 'pain-tracker:cloud-backup';

export default function CloudBackupSettings() {
  const [enabled, setEnabled] = useState<boolean>(() => secureStorage.safeJSON(STORAGE_KEY, { enabled: false }).enabled ?? false);
  const [lastSync, setLastSync] = useState<string | null>(() => secureStorage.safeJSON(STORAGE_KEY, { lastSync: null }).lastSync ?? null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    secureStorage.set(STORAGE_KEY, { enabled, lastSync });
  }, [enabled, lastSync]);

  const handleBackupNow = async () => {
    setSyncing(true);
    try {
      // In a real app this would call a cloud API; here we simulate a delay and set a timestamp
      await new Promise(resolve => setTimeout(resolve, 800));
      const ts = new Date().toISOString();
      setLastSync(ts);
    } catch {
      // swallow errors for now
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">Cloud Backup</h4>
          <div className="text-sm text-gray-600 dark:text-slate-400">Optional cloud backup for cross-device sync</div>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={enabled} 
            onChange={e => setEnabled(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sky-500 focus:ring-sky-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
          <span className="text-sm text-gray-600 dark:text-slate-300">Enable</span>
        </label>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-slate-400">When enabled, your data will be securely backed up to your account. Cloud backups are encrypted in transit and at rest.</p>

        {!enabled && (
          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 text-sm text-gray-700 dark:text-slate-300">
            Turn on Cloud Backup to enable manual backup and sync controls.
          </div>
        )}

        {enabled && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackupNow}
              disabled={syncing}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-sky-500 shadow-lg shadow-cyan-500/30"
            >
              {syncing ? 'Backing up...' : 'Back up now'}
            </button>
            <button
              onClick={() => setLastSync(null)}
              disabled={!lastSync}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10"
            >
              Clear last sync
            </button>
          </div>
        )}
        
        {lastSync && (
          <div className="text-xs text-gray-500 dark:text-slate-500">Last backup: {new Date(lastSync).toLocaleString()}</div>
        )}
      </div>
    </div>
  );
}
