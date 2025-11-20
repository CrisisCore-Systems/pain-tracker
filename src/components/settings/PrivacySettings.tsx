import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../design-system';
import { secureStorage } from '../../lib/storage/secureStorage';

const STORAGE_KEY = 'pain-tracker:privacy-settings';

export default function PrivacySettings() {
  const [sharing, setSharing] = useState<boolean>(() => secureStorage.safeJSON(STORAGE_KEY, { dataSharing: false }).dataSharing ?? false);
  const [analytics, setAnalytics] = useState<boolean>(() => secureStorage.safeJSON(STORAGE_KEY, { analyticsConsent: true }).analyticsConsent ?? true);
  const [retention, setRetention] = useState<number>(() => secureStorage.safeJSON(STORAGE_KEY, { retentionDays: 365 }).retentionDays ?? 365);

  useEffect(() => {
    secureStorage.set(STORAGE_KEY, { dataSharing: sharing, analyticsConsent: analytics, retentionDays: retention });
  }, [sharing, analytics, retention]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy & Data Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Share de-identified data</div>
              <div className="text-sm text-muted-foreground">Enable sharing of aggregated, de-identified data for research</div>
            </div>
            <input type="checkbox" checked={sharing} onChange={e => setSharing(e.target.checked)} />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium">Analytics & Telemetry</div>
              <div className="text-sm text-muted-foreground">Allow us to collect anonymous usage statistics to improve features</div>
            </div>
            <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} />
          </label>

          <div>
            <div className="font-medium">Data retention (days)</div>
            <div className="text-sm text-muted-foreground">Control how long your data is retained before automatic deletion</div>
            <div className="mt-2">
              <select value={String(retention)} onChange={e => setRetention(Number(e.target.value))} className="px-2 py-1 border rounded">
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">365 days</option>
                <option value="0">Keep indefinitely</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => secureStorage.remove(STORAGE_KEY)}>Reset preferences</Button>
            <Button variant="outline" onClick={() => secureStorage.set(STORAGE_KEY, { dataSharing: sharing, analyticsConsent: analytics, retentionDays: retention })}>Save</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
