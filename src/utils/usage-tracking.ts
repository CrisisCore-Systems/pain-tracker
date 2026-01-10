/**
 * Usage Tracking Utilities
 *
 * Centralized utilities for tracking user engagement and feature usage.
 * All data is stored locally and only anonymized metrics go to GA4.
 */

// ============================================
// TYPES
// ============================================

export interface UsageEvent {
  type: string;
  category: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface ExportActivity {
  type: 'csv' | 'pdf' | 'json' | 'wcb' | 'fhir';
  timestamp: number;
  recordCount: number;
}

// ============================================
// LOCAL STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
  USAGE_EVENTS: 'pain-tracker:usage-events',
  SESSION_DATA: 'pain-tracker:session-data',
  FEATURE_COUNTS: 'pain-tracker:feature-counts',
  NAV_PATTERNS: 'pain-tracker:nav-patterns',
  EXPORT_HISTORY: 'pain-tracker:export-history',
} as const;

// ============================================
// STORAGE UTILITIES
// ============================================

export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.debug('[UsageTracking] Failed to store data:', key);
  }
}

// ============================================
// USAGE TRACKING FUNCTIONS
// ============================================

export function trackUsageEvent(
  type: string,
  category: string,
  metadata?: Record<string, unknown>
): void {
  const events = getStoredData<UsageEvent[]>(STORAGE_KEYS.USAGE_EVENTS, []);
  const event: UsageEvent = {
    type,
    category,
    timestamp: Date.now(),
    metadata,
  };

  // Keep last 500 events to avoid storage bloat
  const updatedEvents = [...events.slice(-499), event];
  setStoredData(STORAGE_KEYS.USAGE_EVENTS, updatedEvents);

  // Update feature counts
  const featureCounts = getStoredData<Record<string, number>>(STORAGE_KEYS.FEATURE_COUNTS, {});
  const featureKey = `${category}:${type}`;
  featureCounts[featureKey] = (featureCounts[featureKey] || 0) + 1;
  setStoredData(STORAGE_KEYS.FEATURE_COUNTS, featureCounts);
}

export function trackNavigation(from: string, to: string): void {
  const navPatterns = getStoredData<Record<string, number>>(STORAGE_KEYS.NAV_PATTERNS, {});
  const pattern = `${from} → ${to}`;
  navPatterns[pattern] = (navPatterns[pattern] || 0) + 1;
  setStoredData(STORAGE_KEYS.NAV_PATTERNS, navPatterns);
  trackUsageEvent('navigation', 'navigation', { from, to });
}

export function trackExport(
  type: 'csv' | 'pdf' | 'json' | 'wcb' | 'fhir',
  recordCount: number
): void {
  const exportHistory = getStoredData<ExportActivity[]>(STORAGE_KEYS.EXPORT_HISTORY, []);
  const activity: ExportActivity = {
    type,
    timestamp: Date.now(),
    recordCount,
  };
  // Keep last 100 exports
  const updated = [...exportHistory.slice(-99), activity];
  setStoredData(STORAGE_KEYS.EXPORT_HISTORY, updated);
  trackUsageEvent(`export_${type}`, 'export', { recordCount });
}

// ============================================
// SESSION TRACKING
// ============================================

let sessionStartTime = Date.now();
let sessionActions = 0;

export function trackSessionStart(): void {
  sessionStartTime = Date.now();
  sessionActions = 0;
  trackUsageEvent('session_start', 'session');
}

export function incrementSessionAction(): void {
  sessionActions++;
}

export function getSessionStats(): { duration: number; actions: number } {
  return {
    duration: Math.floor((Date.now() - sessionStartTime) / 1000),
    actions: sessionActions,
  };
}

export function getSessionStartTime(): number {
  return sessionStartTime;
}
