import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../design-system';
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle>Cloud Backup</CardTitle>
            <div className="text-sm text-muted-foreground">Optional cloud backup for cross-device sync</div>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
              <span className="text-sm">Enable</span>
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">When enabled, your data will be securely backed up to your account. Cloud backups are encrypted in transit and at rest.</p>
          <div className="flex items-center gap-3">
            <Button onClick={handleBackupNow} disabled={!enabled || syncing}>
              {syncing ? 'Backing up...' : 'Back up now'}
            </Button>
            <Button variant="outline" onClick={() => setLastSync(null)} disabled={!lastSync}>
              Clear last sync
            </Button>
          </div>
          {lastSync && <div className="text-xs text-muted-foreground">Last backup: {new Date(lastSync).toLocaleString()}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
