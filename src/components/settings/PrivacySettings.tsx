import React, { useState, useEffect } from 'react';
import { secureStorage } from '../../lib/storage/secureStorage';
import { privacyAnalytics } from '../../services/PrivacyAnalyticsService';
import { loadAnalyticsIfAllowed } from '../../analytics/analytics-loader';
import {
  buildAnonymousLocalUsageReport,
  downloadJsonReport,
  getUsageMetrics,
  resetUsageMetrics,
  type UsageMetrics,
} from '../../services/localUsageMetrics';
import {
  PRIVACY_SETTINGS_STORAGE_KEY,
  readPrivacySettings,
  writePrivacySettings,
} from '../../utils/privacySettings';

export default function PrivacySettings() {
  const [sharing, setSharing] = useState<boolean>(() => readPrivacySettings().dataSharing);
  const [analytics, setAnalytics] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pain-tracker:analytics-consent') === 'granted';
    } catch {
      return false;
    }
  });
  const [vaultKillSwitchEnabled, setVaultKillSwitchEnabled] = useState<boolean>(
    () => readPrivacySettings().vaultKillSwitchEnabled
  );
  const [retention, setRetention] = useState<number>(() => readPrivacySettings().retentionDays);
  const [weatherAutoCapture, setWeatherAutoCapture] = useState<boolean>(() => readPrivacySettings().weatherAutoCapture);
  const [localUsageCountersEnabled, setLocalUsageCountersEnabled] = useState<boolean>(
    () => readPrivacySettings().localUsageCountersEnabled
  );
  const [usage, setUsage] = useState<UsageMetrics | null>(null);

  const localUsageCountersDisabled = !localUsageCountersEnabled;

  useEffect(() => {
    writePrivacySettings({
      dataSharing: sharing,
      analyticsConsent: analytics,
      vaultKillSwitchEnabled,
      retentionDays: retention,
      weatherAutoCapture,
      localUsageCountersEnabled,
    });
  }, [sharing, analytics, vaultKillSwitchEnabled, retention, weatherAutoCapture, localUsageCountersEnabled]);

  useEffect(() => {
    // Keep the canonical analytics consent state in sync.
    // This controls both local-only analytics and any outbound GA events/scripts.
    if (analytics) {
      void privacyAnalytics.requestConsent().finally(() => {
        // Ensure GA4 loads only after opt-in.
        loadAnalyticsIfAllowed();
      });
    } else {
      privacyAnalytics.revokeConsent();
    }
  }, [analytics]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const m = await getUsageMetrics();
        if (mounted) setUsage(m);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Privacy & Data Controls</h4>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div id="privacy-sharing-label" className="font-medium text-gray-700 dark:text-slate-200">Share de-identified data</div>
            <div id="privacy-sharing-desc" className="text-sm text-gray-500 dark:text-slate-400">Enable sharing of aggregated, de-identified data for research</div>
          </div>
          <input
            type="checkbox"
            checked={sharing}
            onChange={e => setSharing(e.target.checked)}
            aria-labelledby="privacy-sharing-label"
            aria-describedby="privacy-sharing-desc"
            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div id="privacy-analytics-label" className="font-medium text-gray-700 dark:text-slate-200">Analytics & Telemetry</div>
            <div id="privacy-analytics-desc" className="text-sm text-gray-500 dark:text-slate-400">Allow us to collect anonymous usage statistics to improve features</div>
          </div>
          <input
            type="checkbox"
            checked={analytics}
            onChange={e => setAnalytics(e.target.checked)}
            aria-labelledby="privacy-analytics-label"
            aria-describedby="privacy-analytics-desc"
            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900/30 p-3">
          <div className="font-medium text-gray-700 dark:text-slate-200">Local usage summary (stored on this device)</div>
          <div className="text-sm text-gray-500 dark:text-slate-400">
            {usage ? (
              <span>
                {usage.sessionCount} sessions across {usage.activeDayCount} active days (first used {usage.firstSeenDate}).
              </span>
            ) : (
              <span>Loading…</span>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            <div className="font-medium">Stored only on this device.</div>
            <div>Export contains only aggregate counts + day-level dates. No IDs, no content, no network.</div>
          </div>

          <div className="flex items-center justify-between gap-4 mt-3">
            <div id="privacy-local-usage-label" className="font-medium text-gray-700 dark:text-slate-200">
              Enable local usage counters
            </div>
            <input
              type="checkbox"
              checked={localUsageCountersEnabled}
              onChange={e => setLocalUsageCountersEnabled(e.target.checked)}
              aria-labelledby="privacy-local-usage-label"
              className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            />
          </div>

          {localUsageCountersDisabled ? (
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Usage counters are currently disabled. No new sessions will be recorded.
            </div>
          ) : null}

          <div className="mt-2">
            <button
              type="button"
              onClick={async () => {
                await resetUsageMetrics();
                const fresh = await getUsageMetrics();
                setUsage(fresh);
              }}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Reset local usage counters
            </button>

            <button
              type="button"
              onClick={async () => {
                const isDisabled = localUsageCountersDisabled;
                const report = await buildAnonymousLocalUsageReport({
                  countersEnabledAtExportTime: !isDisabled,
                });
                const filename = isDisabled
                  ? `paintracker-usage-report-disabled-${report.generatedDate}.json`
                  : `paintracker-usage-report-${report.generatedDate}.json`;
                downloadJsonReport(filename, report);
              }}
              className="ml-3 px-3 py-2 rounded-lg text-sm font-medium transition-all bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Export anonymous usage report (JSON)
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            Exports: sessionCount, activeDayCount, firstSeenDate, lastActiveDate
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div id="privacy-killswitch-label" className="font-medium text-gray-700 dark:text-slate-200">Emergency wipe on repeated failed unlocks</div>
            <div id="privacy-killswitch-desc" className="text-sm text-gray-500 dark:text-slate-400">
              If enabled, the app will wipe local data after 3 failed vault unlock attempts. This can protect you on a lost/shared device,
              but it also increases the risk of accidental data loss if someone mistypes your passphrase.
            </div>
          </div>
          <input
            type="checkbox"
            checked={vaultKillSwitchEnabled}
            onChange={e => setVaultKillSwitchEnabled(e.target.checked)}
            aria-labelledby="privacy-killswitch-label"
            aria-describedby="privacy-killswitch-desc"
            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div id="privacy-weather-label" className="font-medium text-gray-700 dark:text-slate-200">Auto-capture local weather</div>
            <div id="privacy-weather-desc" className="text-sm text-gray-500 dark:text-slate-400">
              If enabled, the app may ask for location access to fetch current weather from Open‑Meteo. Only a short summary (e.g.,
              “12°C, cloudy, 65% humidity”) is stored with the entry — coordinates are not saved.
            </div>
          </div>
          <input
            type="checkbox"
            checked={weatherAutoCapture}
            onChange={e => setWeatherAutoCapture(e.target.checked)}
            aria-labelledby="privacy-weather-label"
            aria-describedby="privacy-weather-desc"
            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
        </div>

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
            onClick={() => secureStorage.remove(PRIVACY_SETTINGS_STORAGE_KEY)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-red-100 dark:bg-red-500/15 border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/25"
          >
            Reset preferences
          </button>
          <button 
            onClick={() =>
              writePrivacySettings({
                dataSharing: sharing,
                analyticsConsent: analytics,
                vaultKillSwitchEnabled,
                retentionDays: retention,
                weatherAutoCapture,
                localUsageCountersEnabled,
              })
            }
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-green-100 dark:bg-green-500/15 border border-green-300 dark:border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/25"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
