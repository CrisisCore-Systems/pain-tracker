import type { FibromyalgiaEntry, FibromyalgiaAnalytics } from '../../types/fibromyalgia';

/**
 * Calculate WPI and SSS scores and diagnostic status for a set of fibromyalgia entries.
 * Returns the most recent diagnostic status and a history for trend display.
 */
export function computeFibroDiagnosticHistory(entries: FibromyalgiaEntry[]): {
  latest: {
    wpi: number;
    sss: number;
    meetsCriteria: boolean;
    date: string;
  } | null;
  history: Array<{
    wpi: number;
    sss: number;
    meetsCriteria: boolean;
    date: string;
  }>;
} {
  if (!entries.length) return { latest: null, history: [] };
  const history = entries.map(e => {
    const wpi = Object.values(e.wpi).filter(Boolean).length;
    const sss = Object.values(e.sss).reduce((sum, v) => sum + v, 0);
    const meetsCriteria = (wpi >= 7 && sss >= 5) || (wpi >= 4 && wpi <= 6 && sss >= 9);
    return {
      wpi,
      sss,
      meetsCriteria,
      date: e.timestamp,
    };
  });
  const latest = history[history.length - 1];
  return { latest, history };
}
