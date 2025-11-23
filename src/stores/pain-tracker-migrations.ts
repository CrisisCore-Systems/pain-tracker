import type { PainTrackerState } from './pain-tracker-store';
import type { MoodEntry } from '../types/quantified-empathy';
import type { PainEntry } from '../types';
import type { ActivityLogEntry, ScheduledReport } from '../types';
import { toIsoString } from '../utils/date-utils';

export function migratePainTrackerState(
  persistedState: Partial<PainTrackerState> | undefined,
  _fromVersion?: number
): Partial<PainTrackerState> | undefined {
  if (!persistedState) return persistedState;

  const state = { ...persistedState } as Partial<PainTrackerState>;

  if (Array.isArray(state.moodEntries)) {
    state.moodEntries = state.moodEntries.map((entry): MoodEntry => {
      const e: Partial<MoodEntry> = { ...entry } as Partial<MoodEntry>;

      // Ensure id exists
      if (e.id === undefined || e.id === null) {
        // Use a high-entropy id to reduce collision risk
        e.id = Date.now() + Math.floor(Math.random() * 10000);
      }

      // Ensure timestamp is an ISO string
      const ts = toIsoString(e.timestamp);
      e.timestamp = ts ?? new Date().toISOString();

      return e as MoodEntry;
    });
  }

  // Normalize pain entries: ensure id and timestamp strings
  if (Array.isArray(state.entries)) {
    state.entries = state.entries.map((entry): PainEntry => {
      const e = { ...entry } as PainEntry;
      if (!e.id) e.id = Date.now() + Math.floor(Math.random() * 10000);
  e.timestamp = toIsoString(e.timestamp) ?? new Date().toISOString();
      // Normalize nested treatment dates to ISO strings if present
      if (e.treatments && Array.isArray(e.treatments.recent)) {
  e.treatments.recent = e.treatments.recent.map(t => ({ ...t, date: toIsoString(t.date) ?? new Date().toISOString() }));
      }
      return e;
    });
  }

  // Normalize activity logs: ensure id and date and activity timestamps
  if (Array.isArray(state.activityLogs)) {
    state.activityLogs = state.activityLogs.map((log): ActivityLogEntry => {
      const a = { ...log } as ActivityLogEntry;
      if (!a.id) a.id = Date.now() + Math.floor(Math.random() * 10000);
  a.date = toIsoString(a.date) ?? new Date().toISOString();
      if (Array.isArray(a.activities)) {
  a.activities = a.activities.map(act => ({ ...act, timestamp: toIsoString(act.timestamp) ?? new Date().toISOString() }));
      }
      return a;
    });
  }

  // Normalize scheduled reports: ensure id and nextRun/lastRun strings
  if (Array.isArray(state.scheduledReports)) {
    state.scheduledReports = state.scheduledReports.map((s): ScheduledReport => {
      const sr = { ...s } as ScheduledReport;
      if (!sr.id) sr.id = `sr-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  sr.nextRun = toIsoString(sr.nextRun) ?? new Date().toISOString();
  sr.lastRun = toIsoString(sr.lastRun) ?? sr.lastRun;
      return sr;
    });
  }

  // Migrate other timestamp-like fields if needed (emotional triggers, recovery metrics)
  if (Array.isArray(state.scheduledReports)) {
    // no-op for scheduledReports for now
  }

  return state;
}

export default migratePainTrackerState;
