import { useEffect } from 'react';
import type { PainEntry } from '../types';
import { analyzeEntriesForTriggers } from '../utils/notifications/intelligent';

export const useAutomaticTriggerAnalysis = (entries: PainEntry[], enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled || entries.length === 0) return;

    // Analyze entries for intelligent triggers
    // This will run whenever entries change significantly
    const recentEntries = entries.slice(-10); // Last 10 entries for analysis

    if (recentEntries.length >= 3) {
      // Need at least 3 entries for meaningful analysis
      analyzeEntriesForTriggers(recentEntries).catch(error => {
        console.error('Failed to analyze entries for triggers:', error);
      });
    }
  }, [entries, enabled]);
};
