import { create } from 'zustand';
import { formatNumber } from '../utils/formatting';
import { devtools, persist, subscribeWithSelector, type PersistStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PainEntry, EmergencyPanelData, ActivityLogEntry, ReportTemplate } from '../types';
import type { MoodEntry } from '../types/quantified-empathy';
import { makeMoodEntry } from '../utils/mood-entry-factory';
import type { FibromyalgiaEntry } from '../types/fibromyalgia';
import { privacyAnalytics } from '../services/PrivacyAnalyticsService';
import { hipaaComplianceService } from '../services/HIPAACompliance';
import { migratePainTrackerState } from './pain-tracker-migrations';
import { trackMoodEntryLogged } from '../analytics/ga4-events';

// Error counters for silent failures (prevents data loss blindspots)
let analyticsErrorCount = 0;
let auditErrorCount = 0;

type PersistedPainTrackerSlice = Pick<
  PainTrackerState,
  'entries' | 'moodEntries' | 'emergencyData' | 'activityLogs' | 'scheduledReports'
>;

function getSafeLocalStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

// Persist storage that never throws on corrupted JSON.
// If data is corrupted, we clear it (best-effort) and start fresh.
const safePersistStorage: PersistStorage<PersistedPainTrackerSlice | undefined> = {
  getItem: (name: string) => {
    const ls = getSafeLocalStorage();
    if (!ls) return null;

    const raw = ls.getItem(name);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as { state: PersistedPainTrackerSlice | undefined; version?: number };
    } catch {
      try {
        ls.removeItem(name);
      } catch {
        // ignore
      }
      return null;
    }
  },
  setItem: (name: string, value: { state: PersistedPainTrackerSlice | undefined; version?: number }) => {
    const ls = getSafeLocalStorage();
    if (!ls) return;
    ls.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    const ls = getSafeLocalStorage();
    if (!ls) return;
    ls.removeItem(name);
  },
};

/** Get current error counts for monitoring/debugging */
export function getStoreErrorCounts() {
  return { analyticsErrorCount, auditErrorCount };
}

/** Reset error counters (for testing) */
export function resetStoreErrorCounts() {
  analyticsErrorCount = 0;
  auditErrorCount = 0;
}

export interface UIState {
  showWCBReport: boolean;
  showOnboarding: boolean;
  showWalkthrough: boolean;
  showEmpathyDashboard: boolean;
  currentFormSection: number;
  reportPeriod: {
    start: string;
    end: string;
  };
}

export interface PainTrackerState {
  // Data
  entries: PainEntry[];
  moodEntries: MoodEntry[];
  fibromyalgiaEntries: FibromyalgiaEntry[];
  emergencyData: EmergencyPanelData | null;
  activityLogs: ActivityLogEntry[];

  // UI State
  ui: UIState;
  // Preferences
  crisisDetectionEnabled: boolean;

  // Loading/Error states
  isLoading: boolean;
  error: string | null;

  // Actions
  addEntry: (entry: Omit<PainEntry, 'id' | 'timestamp'>) => void;
  updateEntry: (id: string | number, updates: Partial<PainEntry>) => void;
  deleteEntry: (id: string | number) => void;

  // Mood Entry Actions
  addMoodEntry: (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => void;
  updateMoodEntry: (idOrTimestamp: number | string, updates: Partial<MoodEntry>) => void;
  deleteMoodEntry: (idOrTimestamp: number | string) => void;

  // Fibromyalgia Entry Actions
  addFibromyalgiaEntry: (entry: FibromyalgiaEntry) => void;
  updateFibromyalgiaEntry: (id: number, updates: Partial<FibromyalgiaEntry>) => void;
  deleteFibromyalgiaEntry: (id: number) => void;

  // UI Actions
  setShowWCBReport: (show: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setShowWalkthrough: (show: boolean) => void;
  setShowEmpathyDashboard: (show: boolean) => void;
  setCurrentFormSection: (section: number) => void;
  setReportPeriod: (period: Partial<UIState['reportPeriod']>) => void;

  setCrisisDetectionEnabled: (enabled: boolean) => void;

  // Emergency Actions
  updateEmergencyData: (data: EmergencyPanelData) => void;

  // Activity Log Actions
  addActivityLog: (log: Omit<ActivityLogEntry, 'id'>) => void;
  updateActivityLog: (id: string | number, updates: Partial<ActivityLogEntry>) => void;

  // Utility Actions
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearAllData: () => void;
  loadSampleData: () => void;
  loadChronicPainTestData: () => void;
  // Reporting
  scheduledReports: import('../types').ScheduledReport[];
  addScheduledReport: (report: import('../types').ScheduledReport) => void;
  deleteScheduledReport: (id: string) => void;
  updateScheduledReport: (id: string, updates: Partial<import('../types').ScheduledReport>) => void;
  runScheduledReport: (id: string) => Promise<void>;
}

export const usePainTrackerStore = create<PainTrackerState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer(set => ({
          entries: [],
          moodEntries: [],
          fibromyalgiaEntries: [],
          emergencyData: null,
          activityLogs: [],
          ui: {
            showWCBReport: false,
            showOnboarding: false,
            showWalkthrough: false,
            showEmpathyDashboard: false,
            currentFormSection: 0,
            reportPeriod: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end: new Date().toISOString().split('T')[0],
            },
          },
          isLoading: false,
          error: null,
          crisisDetectionEnabled: true,
          scheduledReports: [],

          // Entry Management
          addEntry: entryData => {
            set(state => {
              // Generate collision-resistant ID: timestamp + random suffix
              const uniqueId = Date.now() * 1000 + Math.floor(Math.random() * 1000);
              const newEntry: PainEntry = {
                id: uniqueId,
                timestamp: new Date().toISOString(),
                baselineData: {
                  pain: entryData.baselineData?.pain || 0,
                  locations: entryData.baselineData?.locations || [],
                  symptoms: entryData.baselineData?.symptoms || [],
                },
                functionalImpact: {
                  limitedActivities: entryData.functionalImpact?.limitedActivities || [],
                  assistanceNeeded: entryData.functionalImpact?.assistanceNeeded || [],
                  mobilityAids: entryData.functionalImpact?.mobilityAids || [],
                },
                medications: {
                  current: entryData.medications?.current || [],
                  changes: entryData.medications?.changes || '',
                  effectiveness: entryData.medications?.effectiveness || '',
                },
                treatments: {
                  recent: entryData.treatments?.recent || [],
                  effectiveness: entryData.treatments?.effectiveness || '',
                  planned: entryData.treatments?.planned || [],
                },
                qualityOfLife: {
                  sleepQuality: entryData.qualityOfLife?.sleepQuality || 0,
                  moodImpact: entryData.qualityOfLife?.moodImpact || 0,
                  socialImpact: entryData.qualityOfLife?.socialImpact || [],
                },
                workImpact: {
                  missedWork: entryData.workImpact?.missedWork || 0,
                  modifiedDuties: entryData.workImpact?.modifiedDuties || [],
                  workLimitations: entryData.workImpact?.workLimitations || [],
                },
                comparison: {
                  worseningSince: entryData.comparison?.worseningSince || '',
                  newLimitations: entryData.comparison?.newLimitations || [],
                },
                notes: entryData.notes || '',
                // Optional analytics-rich fields — preserve when provided so downstream
                // dashboards and correlation panels (e.g., weather) stay populated
                triggers: entryData.triggers ?? [],
                intensity: entryData.intensity ?? entryData.baselineData?.pain ?? 0,
                location: entryData.location ?? entryData.baselineData?.locations?.[0], // treat first logged location as primary when explicit value is missing
                quality: entryData.quality ?? [],
                reliefMethods: entryData.reliefMethods ?? [],
                activityLevel: entryData.activityLevel ?? undefined,
                weather: entryData.weather,
                sleep: entryData.sleep ?? entryData.qualityOfLife?.sleepQuality, // keep flat alias in sync with QoL field
                mood: entryData.mood ?? entryData.qualityOfLife?.moodImpact, // map mood impact into flattened field for analytics
                stress: entryData.stress ?? undefined,
                activities: entryData.activities ?? [],
                medicationAdherence: entryData.medicationAdherence,
              };

              state.entries.push(newEntry);
              state.error = null;

              // Track analytics (async, fire-and-forget)
              // GA4 events are sent automatically from PrivacyAnalyticsService
              privacyAnalytics.trackPainEntry(newEntry).catch(() => {
                // Track failure but don't affect user experience
                analyticsErrorCount++;
              });
            });
          },

          updateEntry: (id, updates) => {
            set(state => {
              const index = state.entries.findIndex(entry => entry.id === id);
              if (index >= 0) {
                state.entries[index] = { ...state.entries[index], ...updates };
              }
            });
          },

          deleteEntry: id => {
            set(state => {
              state.entries = state.entries.filter(entry => entry.id !== id);
            });
          },

          // Mood Entry Management
          addMoodEntry: entryData => {
            set(state => {
              const newMoodEntry: MoodEntry = makeMoodEntry(entryData as Partial<MoodEntry>);

              state.moodEntries.push(newMoodEntry);
              state.error = null;

              // Track GA4 custom event for mood entry
              trackMoodEntryLogged(newMoodEntry.mood);
            });
          },

          updateMoodEntry: (idOrTimestamp, updates) => {
            set(state => {
              const index = state.moodEntries.findIndex(entry => {
                if (typeof idOrTimestamp === 'number') return entry.id === idOrTimestamp;
                // Normalize timestamp strings
                const incoming = idOrTimestamp;
                return entry.timestamp === incoming || new Date(entry.timestamp).toISOString() === new Date(incoming).toISOString();
              });
              if (index >= 0) {
                state.moodEntries[index] = { ...state.moodEntries[index], ...updates };
              }
            });
          },

          deleteMoodEntry: idOrTimestamp => {
            set(state => {
              state.moodEntries = state.moodEntries.filter(entry => {
                if (typeof idOrTimestamp === 'number') return entry.id !== idOrTimestamp;
                const incoming = idOrTimestamp;
                return !(entry.timestamp === incoming || new Date(entry.timestamp).toISOString() === new Date(incoming).toISOString());
              });
            });
          },

          // Fibromyalgia Entry Actions
          addFibromyalgiaEntry: entry => {
            set(state => {
              state.fibromyalgiaEntries.push(entry);
            });
          },

          updateFibromyalgiaEntry: (id, updates) => {
            set(state => {
              const index = state.fibromyalgiaEntries.findIndex(entry => entry.id === id);
              if (index !== -1) {
                state.fibromyalgiaEntries[index] = {
                  ...state.fibromyalgiaEntries[index],
                  ...updates,
                };
              }
            });
          },

          deleteFibromyalgiaEntry: id => {
            set(state => {
              state.fibromyalgiaEntries = state.fibromyalgiaEntries.filter(
                entry => entry.id !== id
              );
            });
          },

          // UI Actions
          setShowWCBReport: show => {
            set(state => {
              state.ui.showWCBReport = show;
            });
          },

          setShowOnboarding: show => {
            set(state => {
              state.ui.showOnboarding = show;
            });
          },

          setShowWalkthrough: show => {
            set(state => {
              state.ui.showWalkthrough = show;
            });
          },

          setShowEmpathyDashboard: show => {
            set(state => {
              state.ui.showEmpathyDashboard = show;
            });
          },

          setCurrentFormSection: section => {
            set(state => {
              state.ui.currentFormSection = section;
            });
          },

          setReportPeriod: period => {
            set(state => {
              state.ui.reportPeriod = { ...state.ui.reportPeriod, ...period };
            });
          },

          setCrisisDetectionEnabled: enabled => {
            set(state => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (state as any).crisisDetectionEnabled = enabled;
            });
          },

          // Emergency Data
          updateEmergencyData: data => {
            set(state => {
              state.emergencyData = data;
            });
          },

          // Activity Logs
          addActivityLog: logData => {
            set(state => {
              const newLog: ActivityLogEntry = {
                id: Date.now(),
                ...logData,
              };
              state.activityLogs.push(newLog);
            });
          },

          updateActivityLog: (id, updates) => {
            set(state => {
              const index = state.activityLogs.findIndex(log => log.id === id);
              if (index >= 0) {
                state.activityLogs[index] = { ...state.activityLogs[index], ...updates };
              }
            });
          },

          // Utility Actions
          setError: error => {
            set(state => {
              state.error = error;
            });
          },

          setLoading: loading => {
            set(state => {
              state.isLoading = loading;
            });
          },

          clearAllData: () => {
            set(state => {
              state.entries = [];
              state.moodEntries = [];
              state.fibromyalgiaEntries = [];
              state.activityLogs = [];
              state.emergencyData = null;
              state.scheduledReports = [];
              state.error = null;
            });
          },

          loadSampleData: () => {
            const state = usePainTrackerStore.getState();
            // Prevent concurrent loads
            if (state.isLoading) return;
            
            set(s => { s.isLoading = true; });
            
            import('../data/sampleData')
              .then(({ samplePainEntries }) => {
                set(s => {
                  s.entries = samplePainEntries;
                  s.isLoading = false;
                });
              })
              .catch((error) => {
                console.error('[Store] Failed to load sample data:', error);
                set(s => {
                  s.error = 'Failed to load sample data';
                  s.isLoading = false;
                });
              });
          },

          loadChronicPainTestData: () => {
            const state = usePainTrackerStore.getState();
            // Prevent concurrent loads
            if (state.isLoading) return;
            
            set(s => { s.isLoading = true; });
            
            import('../data/chronic-pain-12-month-seed')
              .then(({ chronicPain12MonthPainEntries, chronicPain12MonthMoodEntries, chronicPainDataStats }) => {
                console.log('[Store] Loading 12-month chronic pain test data:', chronicPainDataStats);
                set(s => {
                  s.entries = chronicPain12MonthPainEntries;
                  s.moodEntries = chronicPain12MonthMoodEntries;
                  s.isLoading = false;
                });
              })
              .catch((error) => {
                console.error('[Store] Failed to load chronic pain test data:', error);
                set(s => {
                  s.error = 'Failed to load test data';
                  s.isLoading = false;
                });
              });
          },

          // Reporting
          addScheduledReport: schedule => {
            set(state => {
              state.scheduledReports.push(schedule);
            });
            // Log audit event for creation
            void hipaaComplianceService.logAuditEvent({
              actionType: 'create',
              userId: 'local-user',
              userRole: 'patient',
              resourceType: 'ScheduledReport',
              resourceId: schedule.id,
              outcome: 'success',
              details: { name: schedule.name, frequency: schedule.frequency, recipients: schedule.recipients },
            }).catch(() => {
              // Track audit failure but don't block user flow
              auditErrorCount++;
            });
          },

          deleteScheduledReport: id => {
            set(state => {
              state.scheduledReports = state.scheduledReports.filter(s => s.id !== id);
            });
            void hipaaComplianceService.logAuditEvent({
              actionType: 'delete',
              userId: 'local-user',
              userRole: 'patient',
              resourceType: 'ScheduledReport',
              resourceId: id,
              outcome: 'success',
              details: { action: 'delete' },
            }).catch(() => {
              auditErrorCount++;
            });
          },

          updateScheduledReport: (id, updates) => {
            set(state => {
              const idx = state.scheduledReports.findIndex(s => s.id === id);
              if (idx >= 0) {
                state.scheduledReports[idx] = { ...state.scheduledReports[idx], ...updates };
              }
            });
            void hipaaComplianceService.logAuditEvent({
              actionType: 'update',
              userId: 'local-user',
              userRole: 'patient',
              resourceType: 'ScheduledReport',
              resourceId: id,
              outcome: 'success',
              details: { updates },
            }).catch(() => {
              auditErrorCount++;
            });
          },

          runScheduledReport: async id => {
            const state = usePainTrackerStore.getState();
            const schedule = state.scheduledReports.find(s => s.id === id);
            if (!schedule) return;

            try {
              // Lazy load PDF generator for better initial load performance
              const { generatePDFReport } = await import('../utils/pdfReportGenerator');
              
              // Create PDF options using template placeholder and store entries for the period
                // For now, create a simple date range of last 30 days
              const end = new Date().toISOString().split('T')[0];
              const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

              await generatePDFReport({
                template: { id: schedule.templateId, name: schedule.name, description: schedule.name, type: 'summary', sections: [], createdAt: new Date().toISOString(), lastModified: new Date().toISOString() } as ReportTemplate,
                entries: state.entries,
                dateRange: { start, end },
                includeCharts: true,
                includeRawData: false,
              });

              // Update lastRun and audit
              set(s => {
                const idx = s.scheduledReports.findIndex(r => r.id === id);
                if (idx >= 0) s.scheduledReports[idx].lastRun = new Date().toISOString();
              });

              void hipaaComplianceService.logAuditEvent({
                actionType: 'export',
                userId: 'local-user',
                userRole: 'patient',
                resourceType: 'ScheduledReport',
                resourceId: schedule.id,
                outcome: 'success',
                details: { runNow: true, recipients: schedule.recipients },
              }).catch(() => {
                auditErrorCount++;
              });
            } catch (err) {
              void hipaaComplianceService.logAuditEvent({
                actionType: 'export',
                userId: 'local-user',
                userRole: 'patient',
                resourceType: 'ScheduledReport',
                resourceId: id,
                outcome: 'failure',
                details: { error: (err as Error).message || 'unknown' },
              }).catch(() => {
                auditErrorCount++;
              });
            }
          },
        }))
      ),
      {
        name: 'pain-tracker-storage',
        version: 2,
        storage: safePersistStorage,
        migrate: (persistedState: unknown, fromVersion: number) => {
          const migrated = migratePainTrackerState(
            persistedState as Partial<PainTrackerState> | undefined,
            fromVersion,
          );
          if (!migrated) return undefined;
          return {
            entries: Array.isArray(migrated.entries) ? migrated.entries : [],
            moodEntries: Array.isArray(migrated.moodEntries) ? migrated.moodEntries : [],
            emergencyData: migrated.emergencyData ?? null,
            activityLogs: Array.isArray(migrated.activityLogs) ? migrated.activityLogs : [],
            scheduledReports: Array.isArray(migrated.scheduledReports) ? migrated.scheduledReports : [],
          };
        },
        partialize: state => ({
          entries: state.entries,
          moodEntries: state.moodEntries,
          emergencyData: state.emergencyData,
          activityLogs: state.activityLogs,
          scheduledReports: state.scheduledReports,
        }),
      }
    ),
    { name: 'PainTracker Store' }
  )
);

// Selectors for optimized component subscriptions
export const selectEntries = (state: PainTrackerState) => state.entries;
export const selectMoodEntries = (state: PainTrackerState) => state.moodEntries;
export const selectUIState = (state: PainTrackerState) => state.ui;
export const selectError = (state: PainTrackerState) => state.error;
export const selectIsLoading = (state: PainTrackerState) => state.isLoading;

// Computed selectors
export const selectEntriesCount = (state: PainTrackerState) => state.entries.length;
export const selectMoodEntriesCount = (state: PainTrackerState) => state.moodEntries.length;
export const selectLatestEntry = (state: PainTrackerState) =>
  state.entries.length > 0 ? state.entries[state.entries.length - 1] : null;
export const selectLatestMoodEntry = (state: PainTrackerState) =>
  state.moodEntries.length > 0 ? state.moodEntries[state.moodEntries.length - 1] : null;
export const selectAveragePain = (state: PainTrackerState) => {
  if (state.entries.length === 0) return 0;
  const sum = state.entries.reduce((acc, entry) => acc + entry.baselineData.pain, 0);
  return Number(formatNumber(sum / state.entries.length, 1));
};
export const selectAverageMood = (state: PainTrackerState) => {
  if (state.moodEntries.length === 0) return 0;
  const sum = state.moodEntries.reduce((acc, entry) => acc + entry.mood, 0);
  return Number(formatNumber(sum / state.moodEntries.length, 1));
};
