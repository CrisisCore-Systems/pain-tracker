import { create } from 'zustand';
import { formatNumber } from '../utils/formatting';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PainEntry, EmergencyPanelData, ActivityLogEntry } from '../types';
import type { MoodEntry } from '../types/quantified-empathy';
import { privacyAnalytics } from '../services/PrivacyAnalyticsService';

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
  emergencyData: EmergencyPanelData | null;
  activityLogs: ActivityLogEntry[];
  
  // UI State
  ui: UIState;
  
  // Loading/Error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addEntry: (entry: Omit<PainEntry, 'id' | 'timestamp'>) => void;
  updateEntry: (id: string | number, updates: Partial<PainEntry>) => void;
  deleteEntry: (id: string | number) => void;
  
  // Mood Entry Actions
  addMoodEntry: (entry: Omit<MoodEntry, 'timestamp'>) => void;
  updateMoodEntry: (timestamp: string, updates: Partial<MoodEntry>) => void;
  deleteMoodEntry: (timestamp: string) => void;
  
  // UI Actions
  setShowWCBReport: (show: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setShowWalkthrough: (show: boolean) => void;
  setShowEmpathyDashboard: (show: boolean) => void;
  setCurrentFormSection: (section: number) => void;
  setReportPeriod: (period: Partial<UIState['reportPeriod']>) => void;
  
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
}



export const usePainTrackerStore = create<PainTrackerState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set) => ({
          entries: [],
          moodEntries: [],
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
              end: new Date().toISOString().split('T')[0]
            }
          },
          isLoading: false,
          error: null,

          // Entry Management
          addEntry: (entryData) => {
            set((state) => {
              const newEntry: PainEntry = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                baselineData: {
                  pain: entryData.baselineData?.pain || 0,
                  locations: entryData.baselineData?.locations || [],
                  symptoms: entryData.baselineData?.symptoms || []
                },
                functionalImpact: {
                  limitedActivities: entryData.functionalImpact?.limitedActivities || [],
                  assistanceNeeded: entryData.functionalImpact?.assistanceNeeded || [],
                  mobilityAids: entryData.functionalImpact?.mobilityAids || []
                },
                medications: {
                  current: entryData.medications?.current || [],
                  changes: entryData.medications?.changes || '',
                  effectiveness: entryData.medications?.effectiveness || ''
                },
                treatments: {
                  recent: entryData.treatments?.recent || [],
                  effectiveness: entryData.treatments?.effectiveness || '',
                  planned: entryData.treatments?.planned || []
                },
                qualityOfLife: {
                  sleepQuality: entryData.qualityOfLife?.sleepQuality || 0,
                  moodImpact: entryData.qualityOfLife?.moodImpact || 0,
                  socialImpact: entryData.qualityOfLife?.socialImpact || []
                },
                workImpact: {
                  missedWork: entryData.workImpact?.missedWork || 0,
                  modifiedDuties: entryData.workImpact?.modifiedDuties || [],
                  workLimitations: entryData.workImpact?.workLimitations || []
                },
                comparison: {
                  worseningSince: entryData.comparison?.worseningSince || '',
                  newLimitations: entryData.comparison?.newLimitations || []
                },
                notes: entryData.notes || ''
              };

              state.entries.push(newEntry);
              state.error = null;

              // Track analytics (async, fire-and-forget)
              privacyAnalytics.trackPainEntry(newEntry).catch(() => {
                // Silently fail - analytics should not affect user experience
              });
            });
          },

          updateEntry: (id, updates) => {
            set((state) => {
              const index = state.entries.findIndex(entry => entry.id === id);
              if (index >= 0) {
                state.entries[index] = { ...state.entries[index], ...updates };
              }
            });
          },

          deleteEntry: (id) => {
            set((state) => {
              state.entries = state.entries.filter(entry => entry.id !== id);
            });
          },

          // Mood Entry Management
          addMoodEntry: (entryData) => {
            set((state) => {
              const newMoodEntry: MoodEntry = {
                timestamp: new Date(),
                mood: entryData.mood || 5,
                energy: entryData.energy || 5,
                anxiety: entryData.anxiety || 5,
                stress: entryData.stress || 5,
                hopefulness: entryData.hopefulness || 5,
                selfEfficacy: entryData.selfEfficacy || 5,
                emotionalClarity: entryData.emotionalClarity || 5,
                emotionalRegulation: entryData.emotionalRegulation || 5,
                context: entryData.context || '',
                triggers: entryData.triggers || [],
                copingStrategies: entryData.copingStrategies || [],
                socialSupport: entryData.socialSupport || 'none',
                notes: entryData.notes || ''
              };

              state.moodEntries.push(newMoodEntry);
              state.error = null;
            });
          },

          updateMoodEntry: (timestamp, updates) => {
            set((state) => {
              const index = state.moodEntries.findIndex(
                entry => entry.timestamp.toISOString() === timestamp
              );
              if (index >= 0) {
                state.moodEntries[index] = { ...state.moodEntries[index], ...updates };
              }
            });
          },

          deleteMoodEntry: (timestamp) => {
            set((state) => {
              state.moodEntries = state.moodEntries.filter(
                entry => entry.timestamp.toISOString() !== timestamp
              );
            });
          },

          // UI Actions
          setShowWCBReport: (show) => {
            set((state) => {
              state.ui.showWCBReport = show;
            });
          },

          setShowOnboarding: (show) => {
            set((state) => {
              state.ui.showOnboarding = show;
            });
          },

          setShowWalkthrough: (show) => {
            set((state) => {
              state.ui.showWalkthrough = show;
            });
          },

          setShowEmpathyDashboard: (show) => {
            set((state) => {
              state.ui.showEmpathyDashboard = show;
            });
          },

          setCurrentFormSection: (section) => {
            set((state) => {
              state.ui.currentFormSection = section;
            });
          },

          setReportPeriod: (period) => {
            set((state) => {
              state.ui.reportPeriod = { ...state.ui.reportPeriod, ...period };
            });
          },

          // Emergency Data
          updateEmergencyData: (data) => {
            set((state) => {
              state.emergencyData = data;
            });
          },

          // Activity Logs
          addActivityLog: (logData) => {
            set((state) => {
              const newLog: ActivityLogEntry = {
                id: Date.now(),
                ...logData
              };
              state.activityLogs.push(newLog);
            });
          },

          updateActivityLog: (id, updates) => {
            set((state) => {
              const index = state.activityLogs.findIndex(log => log.id === id);
              if (index >= 0) {
                state.activityLogs[index] = { ...state.activityLogs[index], ...updates };
              }
            });
          },

          // Utility Actions
          setError: (error) => {
            set((state) => {
              state.error = error;
            });
          },

          setLoading: (loading) => {
            set((state) => {
              state.isLoading = loading;
            });
          },

          clearAllData: () => {
            set((state) => {
              state.entries = [];
              state.moodEntries = [];
              state.activityLogs = [];
              state.emergencyData = null;
              state.error = null;
            });
          },

          loadSampleData: () => {
            // Import and load sample data
            import('../data/sampleData').then(({ samplePainEntries }) => {
              set((state) => {
                state.entries = samplePainEntries;
              });
            });
          }
        }))
      ),
      {
        name: 'pain-tracker-storage',
        partialize: (state) => ({
          entries: state.entries,
          moodEntries: state.moodEntries,
          emergencyData: state.emergencyData,
          activityLogs: state.activityLogs
        })
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