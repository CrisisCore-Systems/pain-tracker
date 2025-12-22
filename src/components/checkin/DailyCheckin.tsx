import React, { useEffect, useRef, useState } from 'react';
import { QuickLogStepper } from '../../design-system/fused-v2/QuickLogStepper';
import type { PainEntry } from '../../types';
import { useToast } from '../../components/feedback';
import { FocusManager, announceToScreenReader } from '../../utils/accessibility';
import type { CheckinInsight } from '../../utils/pain-tracker/checkinInsights';
import { generateCheckinInsights } from '../../utils/pain-tracker/checkinInsights';

interface DailyCheckinProps {
  onComplete: (data: Omit<PainEntry, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
  // pass existing entries so the empathy engine can use historical data
  entries: PainEntry[];
  userId?: string;
  onDone?: () => void;
}

export default function DailyCheckin({ onComplete, onCancel, entries, onDone }: DailyCheckinProps) {
  const [mood, setMood] = useState<number>(5);
  const [sleepQuality, setSleepQuality] = useState<number>(6);
  const [insights, setInsights] = useState<CheckinInsight[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mountedRef = useRef(true);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();

  // Manage focus trap and keyboard behavior for the modal
  useEffect(() => {
    if (!isModalOpen || !modalRef.current) return;

    // Save previous focus and move to the modal container
    FocusManager.saveFocusAndMoveTo(modalRef.current);

    // Create focus trap
    const releaseTrap = FocusManager.createFocusTrap(modalRef.current);

    // Announce modal open to screen readers
    announceToScreenReader('Insights are available. Dialog opened.', 'polite');

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsModalOpen(false);
        setInsights(null);
        FocusManager.restoreFocus();
        announceToScreenReader('Insights dismissed', 'polite');
      }
    };

    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
      releaseTrap();
    };
  }, [isModalOpen]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Test-only: allow showing canned insights immediately when the test flag is present
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('test_show_insights') === '1') {
        const canned: CheckinInsight[] = [
          {
            id: 'test-immediate-1',
            title: 'Immediate test insight',
            description: 'Canned insight shown for E2E tests.',
            confidence: 80,
          },
        ];
        setInsights(canned.slice(0, 5));
        setIsModalOpen(true);
        announceToScreenReader('Insights are available. Dialog opened.', 'polite');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleComplete = async (data: { pain: number; locations: string[]; symptoms: string[]; notes: string }) => {
    const entry: Omit<PainEntry, 'id' | 'timestamp'> = {
      baselineData: {
        pain: data.pain,
        locations: data.locations,
        symptoms: data.symptoms,
      },
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
      treatments: { recent: [], effectiveness: '', planned: [] },
      qualityOfLife: {
        sleepQuality: sleepQuality, // 0-10 scale
        moodImpact: mood, // 0-10 scale
        socialImpact: [],
      },
      workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
      comparison: { worseningSince: '', newLimitations: [] },
      notes: data.notes,
    };

    // Save immediately
    try {
      onComplete(entry);
    } catch (err) {
      // If parent throws, still attempt empathy work but surface a toast
      console.error('onComplete threw', err);
      toast.error('Save failed', 'Your check-in could not be saved.');
      return;
    }

    // Generate pain-focused insights (no empathy framing) and show the top insight via toast
    (async () => {
      // Test hook: if test_insights query param is present, short-circuit with canned insights
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('test_insights') === '1') {
          const canned: CheckinInsight[] = [
            {
              id: 'test-1',
              title: 'Test insight',
              description: 'This is a test insight.',
              confidence: 90,
            },
          ];
          if (!mountedRef.current) {
            if (canned.length > 0) {
              const top = canned[0];
              toast.info(top.title, top.description ?? 'A new insight is ready in your app.');
            }
            return;
          }

          setInsights(canned.slice(0, 5));
          setIsModalOpen(true);
          if (canned.length > 0) {
            const top = canned[0];
            toast.success(top.title, top.description ?? 'We found something you might find helpful.');
          }
          return;
        }
      } catch {
        // ignore test hook failures
      }
      try {
        // Ensure we pass full PainEntry objects (with id + timestamp) for consistent analysis
        const savedEntryForInsights = {
          ...entry,
          id: Date.now(),
          timestamp: new Date().toISOString(),
        } as PainEntry;
        const combinedPainEntries = [...(entries || []), savedEntryForInsights];

        const insightsResult = generateCheckinInsights({
          newEntry: savedEntryForInsights,
          allEntries: combinedPainEntries,
        });

        if (!mountedRef.current) {
          // Component unmounted — surface quick summary via toast
          if (insightsResult && insightsResult.length > 0) {
            const top = insightsResult[0];
            toast.info(top.title, top.description ?? 'A new insight is ready in your app.');
          }
          return;
        }

        const slice = insightsResult.slice(0, 5);
        setInsights(slice);
        setIsModalOpen(true);
        if (insightsResult && insightsResult.length > 0) {
          const top = insightsResult[0];
          toast.success(top.title, top.description ?? 'We found something you might find helpful.');
        }
      } catch (err) {
        console.warn('Check-in insights failed', err);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Daily Check-in</h1>
          <p className="text-sm text-muted-foreground mt-2">
            How are you holding up today? This quick check-in helps the app give kinder,
            more useful insights.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <label className="text-sm text-foreground">Mood (0-10)</label>
          <input
            type="range"
            min={0}
            max={10}
            value={mood}
            onChange={e => setMood(Number(e.target.value))}
            aria-label="Mood"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Mood: {mood}</span>
            <div className="flex items-center gap-2">
              <label className="text-sm">Sleep quality (0-10)</label>
              <input
                type="range"
                min={0}
                max={10}
                value={sleepQuality}
                onChange={e => setSleepQuality(Number(e.target.value))}
                className="w-40"
                aria-label="Sleep quality"
              />
              <span className="ml-2">{sleepQuality}</span>
            </div>
          </div>
        </div>

        {/* Reuse QuickLogStepper for the quick pain intensity + body map flow */}
        <QuickLogStepper onComplete={handleComplete} onCancel={onCancel} />

        {/* Accessible insights modal */}
        {insights && isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="presentation"
            aria-hidden={!isModalOpen}
          >
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50"
              aria-hidden="true"
              onClick={() => {
                // Clicking overlay dismisses the insights (but keeps user on check-in)
                setIsModalOpen(false);
                setInsights(null);
                FocusManager.restoreFocus();
                announceToScreenReader('Insights dismissed', 'polite');
              }}
            />

            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="insights-title"
              aria-describedby="insights-desc"
              className="relative z-10 w-full max-w-2xl mx-4 bg-panel rounded-lg shadow-lg p-6 focus:outline-none"
            >
              <h3 id="insights-title" className="text-lg font-semibold">
                Thoughtful follow-up
              </h3>
              <p id="insights-desc" className="text-sm text-muted-foreground mt-1">
                Here are a few insights based on your recent check-in.
              </p>

              <ul className="mt-3 space-y-2">
                {insights.map(i => (
                  <li key={i.id} className="p-2 bg-background rounded">
                    <strong>{i.title}</strong>
                    <div className="text-sm text-muted-foreground">{i.description}</div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setInsights(null);
                    FocusManager.restoreFocus();
                    announceToScreenReader('Insights dismissed', 'polite');
                  }}
                >
                  Dismiss
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setInsights(null);
                    FocusManager.restoreFocus();
                    announceToScreenReader('Insights accepted. Returning to dashboard.', 'polite');
                    if (typeof onDone === 'function') {
                      onDone();
                    }
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
