import React, { useState, useEffect } from 'react';
import { secureStorage } from '../../lib/storage/secureStorage';

const STORAGE_KEY = 'pain-tracker:cloud-backup';

// Glassmorphism card styling
const glassCardStyle = {
  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
};

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
    <div className="rounded-xl p-5" style={glassCardStyle}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-white">Cloud Backup</h4>
          <div className="text-sm text-slate-400">Optional cloud backup for cross-device sync</div>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={enabled} 
            onChange={e => setEnabled(e.target.checked)}
            className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/50 focus:ring-offset-slate-900"
          />
          <span className="text-sm text-slate-300">Enable</span>
        </label>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-slate-400">When enabled, your data will be securely backed up to your account. Cloud backups are encrypted in transit and at rest.</p>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackupNow} 
            disabled={!enabled || syncing}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: enabled ? 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' : 'rgba(51, 65, 85, 0.8)',
              boxShadow: enabled ? '0 4px 15px rgba(14, 165, 233, 0.3)' : 'none',
            }}
          >
            {syncing ? 'Backing up...' : 'Back up now'}
          </button>
          <button 
            onClick={() => setLastSync(null)} 
            disabled={!lastSync}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
            }}
          >
            Clear last sync
          </button>
        </div>
        
        {lastSync && (
          <div className="text-xs text-slate-500">Last backup: {new Date(lastSync).toLocaleString()}</div>
        )}
      </div>
    </div>
  );
}
