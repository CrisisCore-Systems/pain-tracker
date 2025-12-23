import { useEffect, useState, lazy, Suspense } from 'react';
import { secureStorage } from '../lib/storage/secureStorage';
import type { PainEntry } from '../types';
import type { WalkthroughStep } from '../components/tutorials/Walkthrough';
import { usePainTrackerStore } from '../stores/pain-tracker-store';
import { ModernAppLayout } from '../components/layouts/ModernAppLayout';
import { ClinicalDashboard } from '../design-system/fused-v2';
import QuickLogOneScreen from '../design-system/fused-v2/QuickLogOneScreen';
import { useToast } from '../components/feedback';
import { EmptyStatePanel } from '../components/widgets/EmptyStatePanel';
import { BrandedLoadingScreen } from '../components/branding/BrandedLoadingScreen';

// Lazy load heavy components for faster initial load (mobile optimization)
const PremiumAnalyticsDashboard = lazy(() =>
  import('../components/analytics/PremiumAnalyticsDashboard').then(m => ({ default: m.PremiumAnalyticsDashboard }))
);
const CalendarView = lazy(() =>
  import('../components/calendar/CalendarView').then(m => ({ default: m.CalendarView }))
);
const BodyMapPage = lazy(() =>
  import('../components/body-mapping/BodyMapPage').then(m => ({ default: m.BodyMapPage }))
);
const FibromyalgiaTracker = lazy(() =>
  import('../components/fibromyalgia/FibromyalgiaTracker').then(m => ({ default: m.FibromyalgiaTracker }))
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
  const { entries, ui, addEntry, setShowOnboarding, setShowWalkthrough, setError, loadSampleData } =
    usePainTrackerStore();

  const toast = useToast();
  const [walkthroughSteps, setWalkthroughSteps] = useState<WalkthroughStep[]>([]);
  const [currentView, setCurrentView] = useState<string>(initialView ?? 'dashboard');

  // Load walkthrough steps dynamically to avoid circular dependency
  useEffect(() => {
    let isMounted = true;
    if (typeof window !== 'undefined') {
      import('../data/sampleData').then(({ walkthroughSteps: steps }) => {
        if (isMounted) setWalkthroughSteps(steps);
      });
    }
    return () => { isMounted = false; };
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

  const handleOnboardingComplete = (setupWithSampleData: boolean) => {
    try {
      secureStorage.set('pain-tracker-onboarding-completed', 'true');
    } catch (err) {
      console.warn('Unable to save onboarding status:', err);
    }

    setShowOnboarding(false);

    if (setupWithSampleData) {
      loadSampleData();
      toast.success(
        'Sample data loaded!',
        'Explore the features with example pain entries. You can clear this data anytime.'
      );
    } else {
      toast.info('Welcome to Pain Tracker!', 'Start by recording your first pain entry above.');
    }
  };

  const handleOnboardingSkip = () => {
    try {
      secureStorage.set('pain-tracker-onboarding-completed', 'true');
    } catch (err) {
      console.warn('Unable to save onboarding status:', err);
    }

    setShowOnboarding(false);
    toast.info('Onboarding skipped', 'You can always access help from the help menu.');
  };

  const handleStartWalkthrough = () => {
    setShowWalkthrough(true);
  };

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    toast.success('Tutorial completed!', "You're all set to start tracking your pain effectively.");
  };

  const handleWalkthroughSkip = () => {
    setShowWalkthrough(false);
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

      addEntry(entryData);
      setError(null);
      toast.success(
        'Entry saved',
        "Your update is safely stored. You can explore your dashboard or analytics whenever you're ready."
      );
      // Navigate back to dashboard after saving unless caller requested staying on the save view
      if (!options?.stayOnSave) {
        setCurrentView('dashboard');
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
  const ViewLoadingFallback = () => (
    <BrandedLoadingScreen message="Loading..." />
  );

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
              // TODO: Implement PDF export
              toast.info('Export', 'PDF export coming soon');
            }}
            onOpenSettings={() => setCurrentView('settings')}
            onOpenHelp={() => setCurrentView('help')}
          />
        ) : (
          <EmptyStatePanel onStartWalkthrough={handleStartWalkthrough} />
        );

      case 'new-entry':
        return (
          <QuickLogOneScreen
            onComplete={data => {
              handleAddEntry({
                baselineData: {
                  pain: data.pain,
                  locations: data.locations,
                  symptoms: data.symptoms,
                },
                notes: data.notes,
              } as Omit<PainEntry, 'id' | 'timestamp'>);
            }}
            onCancel={() => setCurrentView('dashboard')}
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

      case 'analytics':
        return (
          <Suspense fallback={<ViewLoadingFallback />}>
            <PremiumAnalyticsDashboard entries={entries} />
          </Suspense>
        );

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

      default:
        return entries.length > 0 ? (
          <ClinicalDashboard
            entries={entries}
            onLogNow={() => setCurrentView('new-entry')}
            onViewCalendar={() => setCurrentView('calendar')}
            onViewAnalytics={() => setCurrentView('analytics')}
            onExport={() => {
              toast.info('Export', 'PDF export coming soon');
            }}
            onOpenSettings={() => setCurrentView('settings')}
            onOpenHelp={() => setCurrentView('help')}
          />
        ) : (
          <EmptyStatePanel onStartWalkthrough={handleStartWalkthrough} />
        );
    }
  };

  return (
    <>
      <ModernAppLayout currentView={currentView} onNavigate={setCurrentView} stats={stats}>
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
