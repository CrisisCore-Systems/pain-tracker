import { Suspense, lazy, useEffect } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { OfflineBanner } from '../components/pwa/OfflineIndicator';
import NotificationConsentPrompt from '../components/NotificationConsentPrompt';
import AnalyticsConsentPrompt from '../components/AnalyticsConsentPrompt';
import { PWAInstallPrompt } from '../components/pwa/PWAInstallPrompt';
import { PWAStatusIndicator } from '../components/pwa/PWAStatusIndicator';
import { ToneStateTester } from '../components/dev/ToneStateTester';
import { BlackBoxSplashScreen } from '../components/branding/BlackBoxSplashScreen';
import { usePatternAlerts } from '../hooks/usePatternAlerts';
import { usePainTrackerStore, selectEntries } from '../stores/pain-tracker-store';
import { pwaManager } from '../utils/pwa-utils';

const PainTrackerContainer = lazy(() =>
  import('../containers/PainTrackerContainer').then((m) => ({ default: m.PainTrackerContainer }))
);

const ErrorFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 bg-card rounded-lg border shadow-lg max-w-md mx-4">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

const LoadingFallback = () => {
  return <BlackBoxSplashScreen message="Loading..." />;
};

export function ProtectedAppShell({ initialView }: { initialView?: string } = {}) {
  // Initialize PWA features for the protected app experience.
  useEffect(() => {
    // Touch the singleton to ensure init has run.
    pwaManager.isAppInstalled();

    // Add debugging method to window for development
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).resetPWA = async () => {
        try {
          await pwaManager.resetServiceWorker();
        } catch (error) {
          console.error('PWA Reset failed:', error);
        }
      };

      // Expose test data loaders for console access
      (window as unknown as Record<string, unknown>).loadChronicPainTestData = () => {
        import('../data/chronic-pain-12-month-seed').then(
          ({ chronicPain12MonthPainEntries, chronicPain12MonthMoodEntries, chronicPainDataStats }) => {
            console.log('[Dev] Loading 12-month chronic pain test data:', chronicPainDataStats);
            usePainTrackerStore.getState().clearAllData();
            usePainTrackerStore.setState({
              entries: chronicPain12MonthPainEntries,
              moodEntries: chronicPain12MonthMoodEntries,
            });
            console.log(
              '[Dev] Loaded',
              chronicPainDataStats.totalPainEntries,
              'pain entries and',
              chronicPainDataStats.totalMoodEntries,
              'mood entries'
            );
          }
        );
      };

      console.log('[Dev] Available commands: window.resetPWA(), window.loadChronicPainTestData()');
    }
  }, []);

  // Subscribe to entries and wire pattern alerts (app-only)
  const storeEntries = usePainTrackerStore(selectEntries);
  const patternEntries = storeEntries.map((e) => ({
    time: e.timestamp,
    pain: e.baselineData?.pain ?? 0,
  }));
  usePatternAlerts(patternEntries);

  return (
    <div
      className="min-h-screen bg-background transition-colors"
      role="application"
      aria-label="Pain Tracker Pro Application"
    >
      <OfflineBanner />
      <NotificationConsentPrompt />
      <AnalyticsConsentPrompt />

      <ErrorBoundary fallback={<ErrorFallback />}>
        <Suspense fallback={<LoadingFallback />}>
          <PainTrackerContainer initialView={initialView} />
        </Suspense>
      </ErrorBoundary>

      <PWAInstallPrompt />
      <PWAStatusIndicator />
      <ToneStateTester />
    </div>
  );
}
