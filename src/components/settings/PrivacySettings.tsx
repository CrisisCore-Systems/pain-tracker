import React, { useState, useEffect } from 'react';
import { secureStorage } from '../../lib/storage/secureStorage';

const STORAGE_KEY = 'pain-tracker:privacy-settings';

// Glassmorphism card styling
const glassCardStyle = {
  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
};

export default function PrivacySettings() {
  const [sharing, setSharing] = useState<boolean>(() => secureStorage.safeJSON(STORAGE_KEY, { dataSharing: false }).dataSharing ?? false);
  const [analytics, setAnalytics] = useState<boolean>(() => secureStorage.safeJSON(STORAGE_KEY, { analyticsConsent: true }).analyticsConsent ?? true);
  const [retention, setRetention] = useState<number>(() => secureStorage.safeJSON(STORAGE_KEY, { retentionDays: 365 }).retentionDays ?? 365);

  useEffect(() => {
    secureStorage.set(STORAGE_KEY, { dataSharing: sharing, analyticsConsent: analytics, retentionDays: retention });
  }, [sharing, analytics, retention]);

  return (
    <div className="rounded-xl p-5" style={glassCardStyle}>
      <h4 className="font-semibold text-white mb-4">Privacy & Data Controls</h4>
      <div className="space-y-4">
        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-slate-200">Share de-identified data</div>
            <div className="text-sm text-slate-400">Enable sharing of aggregated, de-identified data for research</div>
          </div>
          <input 
            type="checkbox" 
            checked={sharing} 
            onChange={e => setSharing(e.target.checked)}
            className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-slate-900"
          />
        </label>

        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-slate-200">Analytics & Telemetry</div>
            <div className="text-sm text-slate-400">Allow us to collect anonymous usage statistics to improve features</div>
          </div>
          <input 
            type="checkbox" 
            checked={analytics} 
            onChange={e => setAnalytics(e.target.checked)}
            className="h-5 w-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-slate-900"
          />
        </label>

        <div>
          <div className="font-medium text-slate-200">Data retention (days)</div>
          <div className="text-sm text-slate-400 mb-2">Control how long your data is retained before automatic deletion</div>
          <select 
            value={String(retention)} 
            onChange={e => setRetention(Number(e.target.value))} 
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'rgba(51, 65, 85, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
            }}
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
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
            }}
          >
            Reset preferences
          </button>
          <button 
            onClick={() => secureStorage.set(STORAGE_KEY, { dataSharing: sharing, analyticsConsent: analytics, retentionDays: retention })}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ade80',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
