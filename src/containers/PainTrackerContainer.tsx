import { useEffect, useState, lazy, Suspense } from 'react';
import { secureStorage } from '../lib/storage/secureStorage';
import type { PainEntry } from '../types';
import type { WalkthroughStep } from '../components/tutorials/Walkthrough';
import { usePainTrackerStore } from '../stores/pain-tracker-store';
import { ModernAppLayout } from '../components/layouts/ModernAppLayout';
import { ClinicalDashboard } from '../design-system/fused-v2';
import QuickLogOneScreen from '../design-system/fused-v2/QuickLogOneScreen';
import { useToast } from '../components/feedback';
import { maybeCaptureWeatherForNewEntry } from '../services/weatherAutoCapture';
import { EmptyStatePanel } from '../components/widgets/EmptyStatePanel';
import { BrandedLoadingScreen } from '../components/branding/BrandedLoadingScreen';
import { HistoryPage } from '../components/history/HistoryPage';
import { FirstEntrySuccessPanel } from '../components/onboarding/FirstEntrySuccessPanel';
import { subscriptionService } from '../services/SubscriptionService';
import { getLocalUserId } from '../utils/user-identity';
import {
  DEFAULT_WORKFLOW_PREFERENCES,
  WORKFLOW_PREFERENCES_UPDATED_EVENT,
  readWorkflowPreferences,
} from '../utils/workflowPreferences';

// Lazy load heavy components for faster initial load (mobile optimization)
const AnalyticsDashboard = lazy(() =>
  import('../components/analytics/AnalyticsDashboard').then(m => ({
    default: m.AnalyticsDashboard,
  }))
);
const PremiumAnalyticsDashboard = lazy(() =>
  import('../components/analytics/PremiumAnalyticsDashboard').then(m => ({
    default: m.PremiumAnalyticsDashboard,
  }))
);
const CalendarView = lazy(() =>
  import('../components/calendar/CalendarView').then(m => ({ default: m.CalendarView }))
);
const BodyMapPage = lazy(() =>
  import('../components/body-mapping/BodyMapPage').then(m => ({ default: m.BodyMapPage }))
);
const FibromyalgiaTracker = lazy(() =>
  import('../components/fibromyalgia/FibromyalgiaTracker').then(m => ({
    default: m.FibromyalgiaTracker,
  }))
);
const DailyCheckin = lazy(() =>
  import('../components/checkin/DailyCheckin').then(m => ({ default: m.default }))
);
const SettingsPage = lazy(() =>
  import('../pages/SettingsPage').then(m => ({ default: m.default }))
);
const HelpAndSupportPage = lazy(() =>
  import('../pages/HelpAndSupportPage').then(m => ({ default: m.default }))
);
const BlogResourcesPage = lazy(() =>
  import('../pages/BlogResourcesPage').then(m => ({ default: m.default }))
);
const ReportsPage = lazy(() =>
  import('../components/reports').then(m => ({ default: m.ReportsPage }))
);

// Lazy load onboarding and tutorial components (Phase 2 optimization)
const OnboardingFlow = lazy(() =>
  import('../components/onboarding').then(m => ({ default: m.OnboardingFlow }))
);
const Walkthrough = lazy(() =>
  import('../components/tutorials').then(m => ({ default: m.Walkthrough }))
);

export function PainTrackerContainer({ initialView }: { initialView?: string } = {}) {
  const { entries, ui, addEntry, setShowOnboarding, setShowWalkthrough, setError } =
    usePainTrackerStore();
  const updateEntry = usePainTrackerStore(s => s.updateEntry);
  const [workflowPreferences, setWorkflowPreferences] = useState(() =>
    typeof window === 'undefined' ? DEFAULT_WORKFLOW_PREFERENCES : readWorkflowPreferences()
  );
  const industrialFieldMode = workflowPreferences.industrialFieldMode;

  const toast = useToast();
  const [walkthroughSteps, setWalkthroughSteps] = useState<WalkthroughStep[]>([]);
  const [currentView, setCurrentView] = useState<string>(() => {
    const defaultView =
      initialView ?? (industrialFieldMode || entries.length === 0 ? 'new-entry' : 'dashboard');
    return workflowPreferences.showFibromyalgiaHubNavItem || defaultView !== 'fibromyalgia'
      ? defaultView
      : 'dashboard';
  });
  const [editingEntryId, setEditingEntryId] = useState<PainEntry['id'] | null>(null);
  const [onboardingDemoEntries, setOnboardingDemoEntries] = useState<PainEntry[] | null>(null);
  const [firstEntryCompletionCount, setFirstEntryCompletionCount] = useState<number | null>(null);
  const isOnboardingDemoActive = onboardingDemoEntries !== null && entries.length === 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePreferencesUpdate = () => setWorkflowPreferences(readWorkflowPreferences());
    window.addEventListener(WORKFLOW_PREFERENCES_UPDATED_EVENT, handlePreferencesUpdate);
    return () =>
      window.removeEventListener(WORKFLOW_PREFERENCES_UPDATED_EVENT, handlePreferencesUpdate);
  }, []);

  useEffect(() => {
    if (!workflowPreferences.showFibromyalgiaHubNavItem && currentView === 'fibromyalgia') {
      setCurrentView('dashboard');
    }
  }, [workflowPreferences.showFibromyalgiaHubNavItem, currentView]);

  useEffect(() => {
    if (entries.length > 0 && onboardingDemoEntries !== null) {
      setOnboardingDemoEntries(null);
    }
  }, [entries.length, onboardingDemoEntries]);

  // Load walkthrough steps dynamically to avoid circular dependency
  useEffect(() => {
    let isMounted = true;
    if (typeof window !== 'undefined') {
      import('../data/sampleData').then(({ walkthroughSteps: steps }) => {
        if (isMounted) setWalkthroughSteps(steps);
      });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Check for first-time user
  useEffect(() => {
    try {
      const hasSeenOnboarding = secureStorage.get<string>('pain-tracker-onboarding-completed');
      const hasEntries = entries.length > 0;

      if (!hasSeenOnboarding && !hasEntries) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.warn('Unable to check onboarding status:', err);
    }
  }, [entries.length, setShowOnboarding]);

  const startOnboardingAnalyticsDemo = () => {
    void (async () => {
      try {
        const { samplePainEntries } = await import('../data/sampleData');
        setOnboardingDemoEntries(samplePainEntries);
        setCurrentView('analytics');
        toast.info(
          'Mock analytics preview',
          'These example entries are separate from your record. Start your own entry to end the preview.'
        );
      } catch (error) {
        console.error('Failed to load mock analytics preview:', error);
        setError('Unable to load the mock analytics preview.');
        toast.error('Preview unavailable', 'Start with your own entry instead.');
        setCurrentView('new-entry');
      }
    })();
  };

  const handleOnboardingComplete = (setupWithSampleData: boolean) => {
    try {
      secureStorage.set('pain-tracker-onboarding-completed', 'true');
    } catch (err) {
      console.warn('Unable to save onboarding status:', err);
    }

    setShowOnboarding(false);

    if (setupWithSampleData) {
      startOnboardingAnalyticsDemo();
    } else {
      setOnboardingDemoEntries(null);
      setCurrentView('new-entry');
      toast.info('Start your first entry', 'Your first saved entry starts your local record.');
    }
  };

  const handleOnboardingSkip = () => {
    try {
      secureStorage.set('pain-tracker-onboarding-completed', 'true');
    } catch (err) {
      console.warn('Unable to save onboarding status:', err);
    }

    setShowOnboarding(false);
    setOnboardingDemoEntries(null);
    toast.info('Onboarding skipped', 'You can always access help from the help menu.');
  };

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!target || !(target instanceof HTMLElement)) return false;
      if (target.isContentEditable) return true;
      const tag = target.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select';
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === 'n') {
        event.preventDefault();
        setCurrentView('new-entry');
      }
      if (key === 'c') {
        event.preventDefault();
        setCurrentView('calendar');
      }
      if (key === 'h') {
        event.preventDefault();
        setCurrentView('history');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    toast.success('Tutorial completed!', "You're all set to start tracking your pain effectively.");
  };

  const handleWalkthroughSkip = () => {
    setShowWalkthrough(false);
  };

  const handleNavigate = (nextView: string) => {
    if (nextView !== 'first-entry-success') {
      setFirstEntryCompletionCount(null);
    }

    if (nextView === 'fibromyalgia' && !workflowPreferences.showFibromyalgiaHubNavItem) {
      setCurrentView('dashboard');
      return;
    }

    if (
      onboardingDemoEntries !== null &&
      (nextView === 'new-entry' || nextView === 'daily-checkin')
    ) {
      setOnboardingDemoEntries(null);
      toast.info('Mock preview ended', 'Advanced analytics access is back to your current plan.');
    }

    setCurrentView(nextView);
  };

  const validatePainEntry = (entry: Omit<PainEntry, 'id' | 'timestamp'>): boolean => {
    if (!entry.baselineData) return false;

    const { pain } = entry.baselineData;
    if (typeof pain !== 'number' || pain < 0 || pain > 10) return false;

    if (entry.qualityOfLife) {
      const { sleepQuality, moodImpact } = entry.qualityOfLife;
      if (
        typeof sleepQuality !== 'number' ||
        sleepQuality < 0 ||
        sleepQuality > 10 ||
        typeof moodImpact !== 'number' ||
        moodImpact < 0 ||
        moodImpact > 10
      ) {
        return false;
      }
    }

    return true;
  };

  const handleAddEntry = (
    entryData: Omit<PainEntry, 'id' | 'timestamp'>,
    options?: { stayOnSave?: boolean }
  ) => {
    try {
      if (!validatePainEntry(entryData)) {
        setError('Invalid pain entry data. Please check your input values.');
        toast.error('Invalid Entry', 'Please check your input values and try again.');
        return;
      }

      const storeApi = usePainTrackerStore as unknown as {
        getState?: () => { entries?: PainEntry[] };
      };

      const beforeCount = storeApi.getState?.()?.entries?.length ?? entries.length;
      if (onboardingDemoEntries !== null) {
        setOnboardingDemoEntries(null);
      }
      addEntry(entryData);

      // Best-effort: enrich the just-saved entry with local weather (opt-in).
      // This must never block saving the entry.
      const created = storeApi.getState?.()?.entries?.[beforeCount];
      if (created) {
        void (async () => {
          const captured = await maybeCaptureWeatherForNewEntry();
          if (!captured) return;
          updateEntry(created.id, { weather: captured.summary });
        })();
      }
      setError(null);
      const isFirstSavedEntry = beforeCount === 0;
      toast.success(
        isFirstSavedEntry ? 'Entry saved locally' : 'Entry saved',
        isFirstSavedEntry
          ? 'Your first entry is stored on this device. Export or keep logging when ready.'
          : "Your update is safely stored. You can explore your dashboard or analytics whenever you're ready."
      );
      // Navigate back to dashboard after saving unless caller requested staying on the save view
      if (!options?.stayOnSave) {
        if (isFirstSavedEntry) {
          setFirstEntryCompletionCount(beforeCount + 1);
          setCurrentView('first-entry-success');
        } else {
          setFirstEntryCompletionCount(null);
          setCurrentView('dashboard');
        }
      }
    } catch (err) {
      setError('Failed to add pain entry. Please try again.');
      toast.error('Save Failed', 'Unable to add pain entry. Please try again.');
      console.error('Error adding pain entry:', err);
    }
  };

  // Calculate stats for header
  const stats = {
    totalEntries: entries.length,
    avgPain:
      entries.length > 0
        ? entries.reduce((sum, e) => sum + e.baselineData.pain, 0) / entries.length
        : 0,
    streak: entries.length > 0 ? Math.min(entries.length, 7) : 0, // Simplified streak calc
  };

  // Loading component for lazy-loaded views
  const ViewLoadingFallback = () => <BrandedLoadingScreen message="Loading..." />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return entries.length > 0 ? (
          <ClinicalDashboard
            entries={entries}
            onLogNow={() => setCurrentView('new-entry')}
            onViewCalendar={() => setCurrentView('calendar')}
            onViewAnalytics={() => setCurrentView('analytics')}
            onExport={() => {
              setCurrentView('reports');
            }}
            onOpenSettings={() => setCurrentView('settings')}
            onOpenHelp={() => setCurrentView('help')}
          />
        ) : (
          <EmptyStatePanel
            onPreviewAnalyticsDemo={startOnboardingAnalyticsDemo}
            onStartEntry={() => handleNavigate('new-entry')}
          />
        );

      case 'new-entry':
        return (
          <QuickLogOneScreen
            firstEntryMode={entries.length === 0}
            interactionMode={industrialFieldMode ? 'industrial' : 'standard'}
            onComplete={data => {
              const entryToAdd: Omit<PainEntry, 'id' | 'timestamp'> = {
                baselineData: {
                  pain: data.pain,
                  locations: data.locations,
                  symptoms: data.symptoms,
                },
                notes: data.notes,
                functionalImpact: {
                  limitedActivities: [],
                  assistanceNeeded: [],
                  mobilityAids: [],
                },
                medications: {
                  current: [],
                  changes: '',
                  effectiveness: '',
                },
                treatments: {
                  recent: [],
                  effectiveness: '',
                  planned: [],
                },
                qualityOfLife: {
                  sleepQuality: typeof data.sleep === 'number' ? data.sleep : 0,
                  moodImpact: 0,
                  socialImpact: [],
                },
                workImpact: {
                  missedWork: 0,
                  modifiedDuties: [],
                  workLimitations: [],
                },
                comparison: {
                  worseningSince: '',
                  newLimitations: [],
                },

                // Optional analytics-rich fields
                intensity: data.pain,
                location: data.locations?.[0],
                activityLevel: data.activityLevel,
                activities: data.activities,
                triggers: data.triggers,
                medicationAdherence: data.medicationAdherence,
                sleep: data.sleep,
                occupationalImpact: data.occupationalImpact,
              };

              handleAddEntry(entryToAdd);
            }}
            onCancel={() => setCurrentView('dashboard')}
          />
        );

      case 'history':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <HistoryPage
              entries={entries}
              onEditEntry={id => {
                setEditingEntryId(id);
                setCurrentView('edit-entry');
              }}
            />
          </Suspense>
        );

      case 'edit-entry': {
        const entry = entries.find(e => e.id === editingEntryId);
        if (!entry) {
          toast.error('Entry not found', 'Unable to edit that entry right now.');
          setEditingEntryId(null);
          setCurrentView('history');
          return null;
        }

        return (
          <QuickLogOneScreen
            mode="edit"
            interactionMode={industrialFieldMode ? 'industrial' : 'standard'}
            initialData={{
              pain: entry.baselineData.pain,
              locations: entry.baselineData.locations ?? [],
              symptoms: entry.baselineData.symptoms ?? [],
              notes: entry.notes ?? '',
              sleep: entry.sleep,
              activityLevel: entry.activityLevel,
              medicationAdherence: entry.medicationAdherence,
              activities: entry.activities,
              triggers: entry.triggers,
              occupationalImpact: entry.occupationalImpact,
            }}
            onComplete={data => {
              try {
                const updates: Partial<PainEntry> = {
                  baselineData: {
                    ...entry.baselineData,
                    pain: data.pain,
                    locations: data.locations,
                    symptoms: data.symptoms,
                  },
                  notes: data.notes,
                  intensity: data.pain,
                  location: data.locations?.[0],
                };

                if (typeof data.sleep === 'number') {
                  updates.sleep = data.sleep;
                  updates.qualityOfLife = {
                    ...entry.qualityOfLife,
                    sleepQuality: data.sleep,
                  };
                }

                if (typeof data.activityLevel === 'number') {
                  updates.activityLevel = data.activityLevel;
                }

                if (data.medicationAdherence) {
                  updates.medicationAdherence = data.medicationAdherence;
                }

                if (data.activities) {
                  updates.activities = data.activities;
                }

                if (data.triggers) {
                  updates.triggers = data.triggers;
                }

                if (data.occupationalImpact) {
                  updates.occupationalImpact = data.occupationalImpact;
                }

                updateEntry(entry.id, updates);
                toast.success('Entry updated', 'Your changes are saved locally.');
                setCurrentView('history');
              } catch (err) {
                console.error('Error updating pain entry:', err);
                toast.error('Update failed', 'Unable to update that entry. Please try again.');
              }
            }}
            onCancel={() => {
              setEditingEntryId(null);
              setCurrentView('history');
            }}
          />
        );
      }

      case 'first-entry-success':
        return (
          <FirstEntrySuccessPanel
            entryCount={firstEntryCompletionCount ?? entries.length}
            onAddAnother={() => {
              setFirstEntryCompletionCount(null);
              setCurrentView('new-entry');
            }}
            onDone={() => {
              setFirstEntryCompletionCount(null);
              setCurrentView('dashboard');
            }}
            onExportReport={() => {
              setFirstEntryCompletionCount(null);
              setCurrentView('reports');
            }}
          />
        );

      case 'daily-checkin':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <DailyCheckin
              entries={entries}
              onComplete={(entry: Omit<PainEntry, 'id' | 'timestamp'>) => {
                // Save but stay on the check-in so the component can surface insights
                handleAddEntry(entry, { stayOnSave: true });
              }}
              onCancel={() => setCurrentView('dashboard')}
              onDone={() => setCurrentView('dashboard')}
            />
          </Suspense>
        );

      case 'analytics': {
        if (isOnboardingDemoActive && onboardingDemoEntries) {
          return (
            <Suspense fallback={<ViewLoadingFallback />}>
              <AnalyticsDashboard
                demoMode
                entries={onboardingDemoEntries}
                onCreateFirstEntry={() => handleNavigate('new-entry')}
              />
            </Suspense>
          );
        }

        const analyticsTier = subscriptionService.getUserTier(getLocalUserId());
        const AnalyticsView =
          analyticsTier === 'pro' || analyticsTier === 'enterprise'
            ? PremiumAnalyticsDashboard
            : AnalyticsDashboard;

        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <AnalyticsView entries={entries} />
          </Suspense>
        );
      }

      case 'body-map':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <BodyMapPage />
          </Suspense>
        );

      case 'fibromyalgia':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <FibromyalgiaTracker />
          </Suspense>
        );

      case 'calendar':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <CalendarView entries={entries} />
          </Suspense>
        );

      case 'reports':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <ReportsPage entries={entries} />
          </Suspense>
        );

      case 'settings':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <SettingsPage />
          </Suspense>
        );
      case 'help':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <HelpAndSupportPage />
          </Suspense>
        );

      case 'blog-resources':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <BlogResourcesPage />
          </Suspense>
        );

      default:
        return entries.length > 0 ? (
          <ClinicalDashboard
            entries={entries}
            onLogNow={() => setCurrentView('new-entry')}
            onViewCalendar={() => setCurrentView('calendar')}
            onViewAnalytics={() => setCurrentView('analytics')}
            onExport={() => {
              setCurrentView('reports');
            }}
            onOpenSettings={() => setCurrentView('settings')}
            onOpenHelp={() => setCurrentView('help')}
          />
        ) : (
          <EmptyStatePanel
            onPreviewAnalyticsDemo={startOnboardingAnalyticsDemo}
            onStartEntry={() => handleNavigate('new-entry')}
          />
        );
    }
  };

  return (
    <>
      <ModernAppLayout
        currentView={currentView}
        onNavigate={handleNavigate}
        stats={stats}
        analyticsDemoActive={isOnboardingDemoActive}
        showFibromyalgiaNavItem={workflowPreferences.showFibromyalgiaHubNavItem}
      >
        {renderView()}
      </ModernAppLayout>

      {/* Onboarding Flow - Lazy loaded only when needed */}
      {ui.showOnboarding && (
        <Suspense fallback={null}>
          <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />
        </Suspense>
      )}

      {/* Interactive Walkthrough - Lazy loaded only when needed */}
      {ui.showWalkthrough && (
        <Suspense fallback={null}>
          <Walkthrough
            steps={walkthroughSteps}
            isActive={ui.showWalkthrough}
            onComplete={handleWalkthroughComplete}
            onSkip={handleWalkthroughSkip}
          />
        </Suspense>
      )}
    </>
  );
}
