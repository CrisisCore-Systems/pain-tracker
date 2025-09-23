import { useEffect, useRef } from 'react';
import { detectSuddenSpike } from '../services/patterns';
import { rollingAverageSpike, simpleZScoreOutlier } from '../services/detectors';
import { saveAlert } from '../components/AlertsActivityLog';

const SETTINGS_KEY = 'pain-tracker:alerts-settings';
const CONSENT_KEY = 'pain-tracker:notification-consent';

export function usePatternAlerts(entries: {time:string; pain:number}[]) {
  const seen = useRef<Set<number>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const settings = raw ? JSON.parse(raw) : { threshold: 3 };
      const consent = localStorage.getItem(CONSENT_KEY);

      const series = entries.map(e => e.pain);
      // Run multiple detectors; first to report an index wins
      const detectors = [
        (s: number[]) => detectSuddenSpike(s, settings.threshold),
        (s: number[]) => rollingAverageSpike(s, 3, 1),
        (s: number[]) => simpleZScoreOutlier(s, 2),
      ];
      let idx = -1;
      for (const d of detectors) {
        const r = d(series);
        if (r >= 0) { idx = r; break; }
      }

      if (idx >= 0 && !seen.current.has(idx)) {
        seen.current.add(idx);
        const message = `Sudden pain increase to ${series[idx]} (entry ${idx + 1})`;
        // Save to alerts log
        try {
          saveAlert({ id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, time: new Date().toISOString(), message });
          window.dispatchEvent(new Event('alerts-log-updated'));
        } catch {}

        // Only notify if user has explicitly allowed notifications
        if (consent === 'granted' && typeof Notification !== 'undefined') {
          new Notification('Pain pattern detected', { body: message });
        } else {
          console.debug('Pattern alert suppressed (no consent)');
        }
      }
    } catch (e) {
      console.debug('usePatternAlerts: error', e);
    }
  }, [entries]);
}
