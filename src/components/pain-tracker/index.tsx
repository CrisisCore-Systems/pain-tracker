import { useState, useEffect, useRef } from 'react';

import type { PainEntry } from '../../types';
import { PainChart } from './PainChart';
import { PainHistory } from './PainHistory';
import { PainEntryForm } from './PainEntryForm';
import { WCBReportGenerator } from './WCBReport';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  ThemeToggle,
} from '../../design-system';
import { FileText, Plus, Activity, AlertCircle, HelpCircle, PlayCircle } from 'lucide-react';
import { OnboardingFlow } from '../onboarding';
import { EmptyState, TrackingIllustration } from '../empty-state';
import { useToast } from '../feedback';
import { useAdaptiveCopy } from '../../contexts/useTone';
import { emptyStates } from '../../content/microcopy';
// Dynamic imports: samplePainEntries and walkthroughSteps loaded on demand
import { secureStorage } from '../../lib/storage/secureStorage';
import { loadPainEntries, savePainEntry } from '../../utils/pain-tracker/storage';
import { Walkthrough } from '../tutorials';
import type { WalkthroughStep } from '../tutorials/Walkthrough';

// Validation Technology Integration (enabled by default)
const ENABLE_VALIDATION_TECH = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (import.meta as any) !== 'undefined' && (import.meta as any).env) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (import.meta as any).env.VITE_ENABLE_VALIDATION_TECH !== 'false';
    }
  } catch {
    // ignore
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof process !== 'undefined' && (process as any).env) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (process as any).env.ENABLE_VALIDATION_TECH !== 'false';
  }
  return true; // Default enabled
})();

// Conditionally import validation technology components
let ValidationTechnologyIntegration: React.ComponentType<any> | null = null;
if (ENABLE_VALIDATION_TECH) {
  try {
    // Dynamic import will be handled in useEffect
    console.log('Validation technology enabled');
  } catch (error) {
    console.warn('Validation technology integration not available:', error);
  }
}

const validatePainEntry = (entry: Partial<PainEntry>): boolean => {
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

export function PainTracker() {
  // Adaptive tone copy
  const noLogsHeadline = useAdaptiveCopy(emptyStates.noLogs.headline);
  const noLogsSubtext = useAdaptiveCopy(emptyStates.noLogs.subtext);
  const noLogsCTA = useAdaptiveCopy(emptyStates.noLogs.cta);
  const secondaryCTA = useAdaptiveCopy(emptyStates.noLogs.secondaryCta);

  const [error, setError] = useState<string | null>(null);
  // Validation technology component state
  const [ValidationTechComponent, setValidationTechComponent] = useState<React.ComponentType<{
    painEntries: PainEntry[];
    onPainEntrySubmit: (entry: Partial<PainEntry>) => void;
  }> | null>(null);
  // Attempt a synchronous initial read from secureStorage/localStorage so tests that
  // mock localStorage can assert DOM that depends on initial entries synchronously.
  const readInitialEntries = (): PainEntry[] => {
    try {
      const stored = secureStorage.get<PainEntry[]>('pain_tracker_entries', { encrypt: true });
      if (stored && Array.isArray(stored)) return stored;
      const raw = localStorage.getItem('pain_tracker_entries');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallthrough
    }
    return [];
  };

  const [entries, setEntries] = useState<PainEntry[]>(readInitialEntries);
  const [showWCBReport, setShowWCBReport] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughSteps, setWalkthroughSteps] = useState<WalkthroughStep[]>([]);
  const [reportPeriod, setReportPeriod] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0],
  });

  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Dynamic import of validation technology
  useEffect(() => {
    if (ENABLE_VALIDATION_TECH) {
      import('../integration/ValidationTechnologyIntegration')
        .then(module => {
          setValidationTechComponent(() => module.ValidationTechnologyIntegration);
        })
        .catch(error => {
          console.warn('Failed to load validation technology:', error);
        });
    }
  }, []);

  // Dynamic import of walkthrough steps
  useEffect(() => {
    import('../../data/sampleData')
      .then(({ walkthroughSteps: steps }) => {
        if (Array.isArray(steps)) {
          setWalkthroughSteps(steps as WalkthroughStep[]);
        } else {
          setWalkthroughSteps([]);
        }
      })
      .catch(error => {
        console.warn('Failed to load walkthrough steps:', error);
        setWalkthroughSteps([]); // Fallback to empty array
      });
  }, []);

  // Check for first-time user
  useEffect(() => {
    try {
      // Prefer secure flag
      const secureFlag = secureStorage.get<string>('pain-tracker-onboarding-completed', {
        encrypt: true,
      });
      let hasEntries = false;
      // Check secure entries key
      const secureEntries = secureStorage.get('pain_tracker_entries', { encrypt: true });
      if (secureEntries && Array.isArray(secureEntries) && secureEntries.length > 0)
        hasEntries = true;
      // Legacy fallback
      if (!secureFlag) {
        const legacyFlag = localStorage.getItem('pain-tracker-onboarding-completed');
        if (legacyFlag) {
          secureStorage.set('pain-tracker-onboarding-completed', legacyFlag, { encrypt: true });
        }
      }
      if (!hasEntries) {
        const legacyEntries = localStorage.getItem('painEntries');
        if (legacyEntries) {
          try {
            const parsed = JSON.parse(legacyEntries);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // migrate each silently
              parsed.forEach(p => {
                try {
                  savePainEntry(p);
                } catch {
                  /* ignore individual */
                }
              });
              hasEntries = true;
            }
          } catch {
            /* ignore */
          }
        }
      }
      if (!secureFlag && !hasEntries) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.warn('Unable to check onboarding status:', err);
    }
  }, []);

  // Handle localStorage separately to catch errors
  useEffect(() => {
    (async () => {
      try {
        const loaded = await loadPainEntries();
        setEntries(loaded);
      } catch (err) {
        setError('Unable to load pain entries. Please try refreshing the page.');
        console.error('Error loading pain entries:', err);
      }
    })();
  }, []);

  // Focus management for WCB report
  useEffect(() => {
    if (showWCBReport && startDateRef.current) {
      startDateRef.current.focus();
    }
  }, [showWCBReport]);

  const handleOnboardingComplete = (setupWithSampleData: boolean) => {
    try {
      secureStorage.set('pain-tracker-onboarding-completed', 'true', { encrypt: true });
    } catch (err) {
      console.warn('Unable to save onboarding status:', err);
    }
    setShowOnboarding(false);
    if (setupWithSampleData) {
      void (async () => {
        try {
          const { samplePainEntries } = await import('../../data/sampleData');
          setEntries(samplePainEntries);
          await Promise.allSettled(samplePainEntries.map(entry => savePainEntry(entry)));
          toast.success(
            'Sample data loaded!',
            'Explore the features with example pain entries. You can clear this data anytime.'
          );
        } catch (error) {
          console.error('Failed to load sample pain entries:', error);
          toast.error('Sample data unavailable', 'Unable to load example entries at this time.');
        }
      })();
    } else {
      toast.info('Welcome to Pain Tracker!', 'Start by recording your first pain entry above.');
    }
  };

  const handleOnboardingSkip = () => {
    try {
      secureStorage.set('pain-tracker-onboarding-completed', 'true', { encrypt: true });
    } catch {
      /* ignore */
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

  const handleAddEntry = (entryData: Partial<PainEntry>) => {
    try {
      // Validate entry data
      if (!validatePainEntry(entryData)) {
        setError('Invalid pain entry data. Please check your input values.');
        toast.error('Invalid Entry', 'Please check your input values and try again.');
        return;
      }

      const newEntry: PainEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        baselineData: {
          pain: 0,
          locations: [],
          symptoms: [],
          ...entryData.baselineData,
        },
        functionalImpact: {
          limitedActivities: [],
          assistanceNeeded: [],
          mobilityAids: [],
          ...entryData.functionalImpact,
        },
        medications: {
          current: [],
          changes: '',
          effectiveness: '',
          ...entryData.medications,
        },
        treatments: {
          recent: [],
          effectiveness: '',
          planned: [],
          ...entryData.treatments,
        },
        qualityOfLife: {
          sleepQuality: 0,
          moodImpact: 0,
          socialImpact: [],
          ...entryData.qualityOfLife,
        },
        workImpact: {
          missedWork: 0,
          modifiedDuties: [],
          workLimitations: [],
          ...entryData.workImpact,
        },
        comparison: {
          worseningSince: '',
          newLimitations: [],
          ...entryData.comparison,
        },
        notes: entryData.notes || '',
      };

      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      try {
        savePainEntry(newEntry)
          .then(() => {
            setError(null);
            toast.success('Entry Saved', 'Your pain entry has been recorded successfully.');
          })
          .catch(err => {
            setError('Failed to save entry. Your changes may not persist after refresh.');
            toast.warning('Save Warning', 'Entry added but may not persist after refresh.');
            console.error('Error saving entry:', err);
          });
      } catch (err) {
        setError('Failed to save entry. Your changes may not persist after refresh.');
        toast.warning('Save Warning', 'Entry added but may not persist after refresh.');
        console.error('Error saving entry:', err);
      }
    } catch (err) {
      setError('Failed to add pain entry. Please try again.');
      toast.error('Save Failed', 'Unable to add pain entry. Please try again.');
      console.error('Error adding pain entry:', err);
    }
  };

  const handleToggleReport = () => {
    setShowWCBReport(!showWCBReport);
    if (!showWCBReport) {
      // Will focus start date input via useEffect
    } else {
      // Focus back on toggle button when closing
      toggleButtonRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleReport();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Pain Tracker</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleStartWalkthrough}
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                type="button"
                aria-label="Start interactive tutorial"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
              <Button
                ref={toggleButtonRef}
                onClick={handleToggleReport}
                onKeyDown={handleKeyDown}
                variant="outline"
                className="hidden sm:flex"
                type="button"
                aria-expanded={showWCBReport}
                aria-controls="wcb-report-section"
              >
                <FileText className="h-4 w-4 mr-2" />
                {showWCBReport ? 'Hide WCB Report' : 'Show WCB Report'}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2" role="alert" aria-live="polite">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <strong className="font-semibold text-destructive">Error: </strong>
                  <span className="text-destructive">{error}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showWCBReport && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>WCB Report</span>
              </CardTitle>
              <CardDescription>
                Generate a comprehensive report for WorkSafe BC submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    htmlFor="start-date"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Start Date
                  </label>
                  <input
                    ref={startDateRef}
                    id="start-date"
                    type="date"
                    value={reportPeriod.start}
                    onChange={e => setReportPeriod(prev => ({ ...prev, start: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Report start date"
                  />
                </div>
                <div>
                  <label
                    htmlFor="end-date"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    End Date
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={reportPeriod.end}
                    onChange={e => setReportPeriod(prev => ({ ...prev, end: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Report end date"
                  />
                </div>
              </div>
              <WCBReportGenerator entries={entries} period={reportPeriod} />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <Card className="xl:col-span-1" data-walkthrough="pain-entry-form">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Record Pain Entry</span>
              </CardTitle>
              <CardDescription>Track your pain levels, symptoms, and daily impact</CardDescription>
            </CardHeader>
            <CardContent>
              {ValidationTechComponent ? (
                <ValidationTechComponent painEntries={entries} onPainEntrySubmit={handleAddEntry} />
              ) : (
                <PainEntryForm onSubmit={handleAddEntry} />
              )}
            </CardContent>
          </Card>

          <Card className="xl:col-span-1" data-walkthrough="pain-chart">
            <CardHeader>
              <CardTitle>Pain History Chart</CardTitle>
              <CardDescription>
                Visual representation of your pain patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PainChart entries={entries} />
            </CardContent>
          </Card>
        </div>

        {entries.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8">
              <EmptyState
                title={noLogsHeadline}
                description={noLogsSubtext}
                primaryAction={{
                  label: noLogsCTA,
                  onClick: handleStartWalkthrough,
                  icon: <PlayCircle className="h-4 w-4" />,
                }}
                secondaryAction={{
                  label: secondaryCTA,
                  onClick: () => handleOnboardingComplete(true),
                }}
                illustration={<TrackingIllustration />}
              />
            </CardContent>
          </Card>
        ) : (
          <Card data-walkthrough="pain-history">
            <CardHeader>
              <CardTitle>Pain History</CardTitle>
              <CardDescription>Detailed view of all your pain entries and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <PainHistory entries={entries} />
            </CardContent>
          </Card>
        )}

        {/* Onboarding Flow */}
        {showOnboarding && (
          <OnboardingFlow onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />
        )}

        {/* Interactive Walkthrough */}
        <Walkthrough
          steps={walkthroughSteps}
          isActive={showWalkthrough}
          onComplete={handleWalkthroughComplete}
          onSkip={handleWalkthroughSkip}
        />
      </main>
    </div>
  );
}
