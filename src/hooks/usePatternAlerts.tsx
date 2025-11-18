import { useEffect, useRef } from 'react';
// Mock implementations for pattern detection services
const detectSuddenSpike = (series: number[], threshold: number): number => {
  for (let i = 1; i < series.length; i++) {
    if (series[i] - series[i - 1] >= threshold) {
      return i;
    }
  }
  return -1;
};

const rollingAverageSpike = (series: number[], windowSize: number, threshold: number): number => {
  for (let i = windowSize; i < series.length; i++) {
    const avg = series.slice(i - windowSize, i).reduce((a, b) => a + b, 0) / windowSize;
    if (series[i] - avg >= threshold) {
      return i;
    }
  }
  return -1;
};

const simpleZScoreOutlier = (series: number[], threshold: number): number => {
  const mean = series.reduce((a, b) => a + b, 0) / series.length;
  const std = Math.sqrt(series.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / series.length);
  for (let i = 0; i < series.length; i++) {
    if (Math.abs(series[i] - mean) / std >= threshold) {
      return i;
    }
  }
  return -1;
};

// import { detectSuddenSpike } from '@pain-tracker/services/patterns';
// import { rollingAverageSpike, simpleZScoreOutlier } from '@pain-tracker/services/detectors';
import { saveAlert } from '../components/AlertsActivityLog';

const SETTINGS_KEY = 'pain-tracker:alerts-settings';
const CONSENT_KEY = 'pain-tracker:notification-consent';

export function usePatternAlerts(entries: { time: string; pain: number }[]) {
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
        if (r >= 0) {
          idx = r;
          break;
        }
      }

      if (idx >= 0 && !seen.current.has(idx)) {
        seen.current.add(idx);
        const message = `Sudden pain increase to ${series[idx]} (entry ${idx + 1})`;
        // Save to alerts log
        try {
          saveAlert({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            time: new Date().toISOString(),
            message,
          });
          window.dispatchEvent(new Event('alerts-log-updated'));
        } catch {
          // Alert logging failed, continue without saving
        }

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
