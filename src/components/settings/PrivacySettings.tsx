import React, { useState, useEffect } from 'react';
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
    <div className="rounded-xl p-5 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Privacy & Data Controls</h4>
      <div className="space-y-4">
        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-gray-700 dark:text-slate-200">Share de-identified data</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Enable sharing of aggregated, de-identified data for research</div>
          </div>
          <input 
            type="checkbox" 
            checked={sharing} 
            onChange={e => setSharing(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
        </label>

        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-gray-700 dark:text-slate-200">Analytics & Telemetry</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">Allow us to collect anonymous usage statistics to improve features</div>
          </div>
          <input 
            type="checkbox" 
            checked={analytics} 
            onChange={e => setAnalytics(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
        </label>

        <div>
          <div className="font-medium text-gray-700 dark:text-slate-200">Data retention (days)</div>
          <div className="text-sm text-gray-500 dark:text-slate-400 mb-2">Control how long your data is retained before automatic deletion</div>
          <select 
            value={String(retention)} 
            onChange={e => setRetention(Number(e.target.value))} 
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all bg-gray-100 dark:bg-slate-700/80 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-slate-200"
          >
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">365 days</option>
            <option value="0">Keep indefinitely</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button 
            onClick={() => secureStorage.remove(STORAGE_KEY)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-red-100 dark:bg-red-500/15 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/25"
          >
            Reset preferences
          </button>
          <button 
            onClick={() => secureStorage.set(STORAGE_KEY, { dataSharing: sharing, analyticsConsent: analytics, retentionDays: retention })}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-green-100 dark:bg-green-500/15 border border-green-300 dark:border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/25"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
