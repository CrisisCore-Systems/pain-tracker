import React, { useId, useMemo, useState } from 'react';
import { Activity, Brain, Heart, Moon, Zap, TrendingUp, BookOpen, Users, ChevronRight } from 'lucide-react';
import type { FibromyalgiaEntry } from '../../types/fibromyalgia';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../design-system';
import { useToast } from '../feedback';
import { computeFibroAnalytics } from '../../utils/pain-tracker/fibroAnalytics';
import { computeFibroDiagnosticHistory } from '../../utils/pain-tracker/fibroDiagnostic';

/** Severity color helper for fibro scores (WPI 0-19, SSS 0-12) */
const fibroScoreColor = (score: number, max: number) => {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.7) return { text: 'text-red-400', bg: 'bg-red-500/15', bar: 'bg-red-500', ring: 'ring-red-500/30' };
  if (pct >= 0.5) return { text: 'text-orange-400', bg: 'bg-orange-500/15', bar: 'bg-orange-500', ring: 'ring-orange-500/30' };
  if (pct >= 0.3) return { text: 'text-amber-400', bg: 'bg-amber-500/15', bar: 'bg-amber-500', ring: 'ring-amber-500/30' };
  return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', bar: 'bg-emerald-500', ring: 'ring-emerald-500/30' };
};

/** SSS button severity colors */
const sssButtonColor = (score: number) => {
  if (score === 3) return 'bg-red-500/15 text-red-300 border-red-500/30';
  if (score === 2) return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
  if (score === 1) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
};

export const FibromyalgiaTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'track' | 'patterns' | 'education' | 'community'>(
    'track'
  );

  const tabsId = useId();

  const tabs = [
    { id: 'track', label: 'Daily Tracking', icon: Activity },
    { id: 'patterns', label: 'Patterns & Insights', icon: TrendingUp },
    { id: 'education', label: 'Learn About Fibro', icon: BookOpen },
    { id: 'community', label: 'Support & Tips', icon: Users },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with accent bar */}
      <header className="relative border-b border-border/60 bg-gradient-to-b from-primary/[0.04] to-transparent">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
              <Heart className="w-7 h-7" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Fibromyalgia Support Hub</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Comprehensive tracking and support for living with fibromyalgia
              </p>
            </div>
          </div>

          {/* Pill-style tabs */}
          <div className="mt-5" role="tablist" aria-label="Fibromyalgia hub sections">
            <div className="inline-flex gap-1 rounded-xl bg-muted/50 p-1 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const tabId = `${tabsId}-tab-${tab.id}`;
                const panelId = `${tabsId}-panel-${tab.id}`;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    id={tabId}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    aria-controls={panelId}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                      transition-all whitespace-nowrap
                      ${isActive
                        ? 'bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" aria-hidden />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'track' && (
          <div role="tabpanel" id={`${tabsId}-panel-track`} aria-labelledby={`${tabsId}-tab-track`}>
            <DailyTracking />
          </div>
        )}
        {activeTab === 'patterns' && (
          <div role="tabpanel" id={`${tabsId}-panel-patterns`} aria-labelledby={`${tabsId}-tab-patterns`}>
            <PatternsInsights />
          </div>
        )}
        {activeTab === 'education' && (
          <div role="tabpanel" id={`${tabsId}-panel-education`} aria-labelledby={`${tabsId}-tab-education`}>
            <EducationResources />
          </div>
        )}
        {activeTab === 'community' && (
          <div role="tabpanel" id={`${tabsId}-panel-community`} aria-labelledby={`${tabsId}-tab-community`}>
            <CommunitySupport />
          </div>
        )}
      </main>
    </div>
  );
};

// Daily Tracking Component
const DailyTracking: React.FC = () => {
  const addFibromyalgiaEntry = usePainTrackerStore(state => state.addFibromyalgiaEntry);
  const toast = useToast();
  const [wpiRegions, setWpiRegions] = useState<Record<string, boolean>>({});
  const [sssScores, setSssScores] = useState({
    fatigue: 0,
    waking_unrefreshed: 0,
    cognitive_symptoms: 0,
    somatic_symptoms: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  const wpiBodyRegions = [
    { id: 'leftShoulder', label: 'Left Shoulder', side: 'left' },
    { id: 'rightShoulder', label: 'Right Shoulder', side: 'right' },
    { id: 'leftUpperArm', label: 'Left Upper Arm', side: 'left' },
    { id: 'rightUpperArm', label: 'Right Upper Arm', side: 'right' },
    { id: 'leftLowerArm', label: 'Left Lower Arm', side: 'left' },
    { id: 'rightLowerArm', label: 'Right Lower Arm', side: 'right' },
    { id: 'leftHip', label: 'Left Hip', side: 'left' },
    { id: 'rightHip', label: 'Right Hip', side: 'right' },
    { id: 'leftUpperLeg', label: 'Left Upper Leg', side: 'left' },
    { id: 'rightUpperLeg', label: 'Right Upper Leg', side: 'right' },
    { id: 'leftLowerLeg', label: 'Left Lower Leg', side: 'left' },
    { id: 'rightLowerLeg', label: 'Right Lower Leg', side: 'right' },
    { id: 'jaw', label: 'Jaw', side: 'central' },
    { id: 'chest', label: 'Chest', side: 'central' },
    { id: 'abdomen', label: 'Abdomen', side: 'central' },
    { id: 'upperBack', label: 'Upper Back', side: 'central' },
    { id: 'lowerBack', label: 'Lower Back', side: 'central' },
    { id: 'neck', label: 'Neck', side: 'central' },
  ];

  const leftRegions = wpiBodyRegions.filter(r => r.side === 'left');
  const rightRegions = wpiBodyRegions.filter(r => r.side === 'right');
  const centralRegions = wpiBodyRegions.filter(r => r.side === 'central');

  const wpiScore = useMemo(() => Object.values(wpiRegions).filter(Boolean).length, [wpiRegions]);
  const sssScore = useMemo(
    () => Object.values(sssScores).reduce((sum, val) => sum + val, 0),
    [sssScores]
  );
  const meetsCriteria =
    (wpiScore >= 7 && sssScore >= 5) || (wpiScore >= 4 && wpiScore <= 6 && sssScore >= 9);

  const wpiColor = fibroScoreColor(wpiScore, 19);
  const sssColor = fibroScoreColor(sssScore, 12);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entry: FibromyalgiaEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),

        // ACR 2016 Criteria - WPI as nested object
        wpi: {
          leftShoulder: wpiRegions.leftShoulder || false,
          rightShoulder: wpiRegions.rightShoulder || false,
          leftUpperArm: wpiRegions.leftUpperArm || false,
          rightUpperArm: wpiRegions.rightUpperArm || false,
          leftLowerArm: wpiRegions.leftLowerArm || false,
          rightLowerArm: wpiRegions.rightLowerArm || false,
          leftHip: wpiRegions.leftHip || false,
          rightHip: wpiRegions.rightHip || false,
          leftUpperLeg: wpiRegions.leftUpperLeg || false,
          rightUpperLeg: wpiRegions.rightUpperLeg || false,
          leftLowerLeg: wpiRegions.leftLowerLeg || false,
          rightLowerLeg: wpiRegions.rightLowerLeg || false,
          jaw: wpiRegions.jaw || false,
          chest: wpiRegions.chest || false,
          abdomen: wpiRegions.abdomen || false,
          upperBack: wpiRegions.upperBack || false,
          lowerBack: wpiRegions.lowerBack || false,
          neck: wpiRegions.neck || false,
        },

        // SSS as nested object
        sss: {
          fatigue: sssScores.fatigue as 0 | 1 | 2 | 3,
          waking_unrefreshed: sssScores.waking_unrefreshed as 0 | 1 | 2 | 3,
          cognitive_symptoms: sssScores.cognitive_symptoms as 0 | 1 | 2 | 3,
          somatic_symptoms: sssScores.somatic_symptoms as 0 | 1 | 2 | 3,
        },

        // Default symptoms object
        symptoms: {
          headache: false,
          migraine: false,
          ibs: false,
          temporomandibularDisorder: false,
          restlessLegSyndrome: false,
          lightSensitivity: false,
          soundSensitivity: false,
          temperatureSensitivity: false,
          chemicalSensitivity: false,
          clothingSensitivity: false,
          touchSensitivity: false,
          numbnessTingling: false,
          muscleStiffness: false,
          jointPain: false,
          brainfog: false,
          memoryProblems: false,
          concentrationDifficulty: false,
        },

        // Default triggers
        triggers: {},

        // Default impact
        impact: {
          sleepQuality: 2 as 0 | 1 | 2 | 3 | 4 | 5,
          moodRating: 2 as 0 | 1 | 2 | 3 | 4 | 5,
          anxietyLevel: 2 as 0 | 1 | 2 | 3 | 4 | 5,
          functionalAbility: 2 as 0 | 1 | 2 | 3 | 4 | 5,
        },

        // Default activity
        activity: {
          activityLevel: 'moderate',
          restPeriods: 0,
          overexerted: false,
          paybackPeriod: false,
        },

        // Default interventions
        interventions: {},

        // Metadata
        notes: '',
      };

      await addFibromyalgiaEntry(entry);

      // Reset form
      setWpiRegions({});
      setSssScores({
        fatigue: 0,
        waking_unrefreshed: 0,
        cognitive_symptoms: 0,
        somatic_symptoms: 0,
      });

      toast.success('Entry saved', "Your fibromyalgia check-in was saved locally.");
    } catch (error) {
      console.error('Failed to save fibromyalgia entry:', error);
      toast.error('Could not save entry', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ACR Criteria Summary — colored score cards with progress bars */}
      <div className={`rounded-2xl border p-5 transition-colors ${meetsCriteria ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : 'border-border/60 bg-card/50'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">ACR 2016 Diagnostic Criteria</h2>
            <p className="text-sm text-muted-foreground">WPI ≥7 and SSS ≥5, or WPI 4–6 and SSS ≥9</p>
          </div>
          {meetsCriteria && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Criteria met
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* WPI Score */}
          <div className={`rounded-xl p-4 ${wpiColor.bg} ring-1 ${wpiColor.ring}`}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Widespread Pain Index</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-3xl font-bold tabular-nums ${wpiColor.text}`}>{wpiScore}</span>
              <span className="text-sm text-muted-foreground">/ 19</span>
            </div>
            <div className="mt-2.5 h-2 rounded-full bg-muted/60 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${wpiColor.bar}`} style={{ width: `${(wpiScore / 19) * 100}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Need ≥7 for primary criteria</p>
          </div>
          {/* SSS Score */}
          <div className={`rounded-xl p-4 ${sssColor.bg} ring-1 ${sssColor.ring}`}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Symptom Severity Scale</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-3xl font-bold tabular-nums ${sssColor.text}`}>{sssScore}</span>
              <span className="text-sm text-muted-foreground">/ 12</span>
            </div>
            <div className="mt-2.5 h-2 rounded-full bg-muted/60 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${sssColor.bar}`} style={{ width: `${(sssScore / 12) * 100}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Need ≥5 for primary criteria</p>
          </div>
        </div>
      </div>

      {/* Widespread Pain Index — grouped by body side */}
      <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-primary" aria-hidden />
            <h3 className="text-base font-semibold text-foreground">Widespread Pain Index (WPI)</h3>
          </div>
          <p className="text-sm text-muted-foreground">Select all areas where you've had pain in the last week.</p>
        </div>
        <div className="px-5 pb-5 space-y-4">
          {/* Left Side */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Left Side</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {leftRegions.map(region => {
                const selected = Boolean(wpiRegions[region.id]);
                return (
                  <button
                    key={region.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setWpiRegions(prev => ({ ...prev, [region.id]: !prev[region.id] }))}
                    className={`
                      text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-all border
                      ${selected
                        ? 'bg-primary/15 text-primary border-primary/30 ring-1 ring-primary/20'
                        : 'bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/60 hover:text-foreground'
                      }
                    `}
                  >
                    {region.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Right Side */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Right Side</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {rightRegions.map(region => {
                const selected = Boolean(wpiRegions[region.id]);
                return (
                  <button
                    key={region.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setWpiRegions(prev => ({ ...prev, [region.id]: !prev[region.id] }))}
                    className={`
                      text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-all border
                      ${selected
                        ? 'bg-primary/15 text-primary border-primary/30 ring-1 ring-primary/20'
                        : 'bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/60 hover:text-foreground'
                      }
                    `}
                  >
                    {region.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Central */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Central</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {centralRegions.map(region => {
                const selected = Boolean(wpiRegions[region.id]);
                return (
                  <button
                    key={region.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setWpiRegions(prev => ({ ...prev, [region.id]: !prev[region.id] }))}
                    className={`
                      text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-all border
                      ${selected
                        ? 'bg-primary/15 text-primary border-primary/30 ring-1 ring-primary/20'
                        : 'bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/60 hover:text-foreground'
                      }
                    `}
                  >
                    {region.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Symptom Severity Scale — severity-tinted buttons */}
      <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-amber-400" aria-hidden />
            <h3 className="text-base font-semibold text-foreground">Symptom Severity Scale (SSS)</h3>
          </div>
          <p className="text-sm text-muted-foreground">Rate each symptom over the past week (0 = none, 3 = severe).</p>
        </div>
        <div className="px-5 pb-5 space-y-3">
          {[
            { id: 'fatigue', label: 'Fatigue', icon: Moon },
            { id: 'waking_unrefreshed', label: 'Waking Unrefreshed', icon: Moon },
            { id: 'cognitive_symptoms', label: 'Cognitive Symptoms (Fibro Fog)', icon: Brain },
            {
              id: 'somatic_symptoms',
              label: 'Somatic Symptoms (Headache, IBS, etc.)',
              icon: Heart,
            },
          ].map(symptom => {
            const Icon = symptom.icon;
            const selectedScore = sssScores[symptom.id as keyof typeof sssScores];
            return (
              <div key={symptom.id} className="rounded-xl bg-muted/20 border border-border/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-muted-foreground" aria-hidden />
                  <span className="font-medium text-sm text-foreground">{symptom.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-2" role="group" aria-label={`${symptom.label} severity`}>
                  {[0, 1, 2, 3].map(score => {
                    const isSelected = selectedScore === score;
                    return (
                      <button
                        key={score}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() =>
                          setSssScores(prev => ({ ...prev, [symptom.id]: score as 0 | 1 | 2 | 3 }))
                        }
                        className={`
                          rounded-lg py-2 text-sm font-semibold transition-all border
                          ${isSelected
                            ? sssButtonColor(score)
                            : 'bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/60'
                          }
                        `}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-muted-foreground px-1">
                  <span>None</span>
                  <span>Severe</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        loading={isSaving}
        disabled={isSaving}
        fullWidth
        size="lg"
        className={meetsCriteria ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
      >
        Save today's entry
      </Button>
    </div>
  );
};

// Patterns & Insights Component
const PatternsInsights: React.FC = () => {
  const fibromyalgiaEntries = usePainTrackerStore(state => state.fibromyalgiaEntries);

  const analytics = useMemo(() => computeFibroAnalytics(fibromyalgiaEntries), [fibromyalgiaEntries]);
  const diagnostic = useMemo(
    () => computeFibroDiagnosticHistory(fibromyalgiaEntries),
    [fibromyalgiaEntries]
  );

  if (fibromyalgiaEntries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/10 p-8 text-center">
        <TrendingUp className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" aria-hidden />
        <h3 className="text-lg font-semibold text-foreground">No insights yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Add a few daily tracking entries to unlock patterns in WPI/SSS, flares, and triggers.
        </p>
      </div>
    );
  }

  const wpiPctColor = fibroScoreColor(analytics.wpiScore, 19);
  const sssPctColor = fibroScoreColor(analytics.sssScore, 12);

  return (
    <div className="space-y-6">
      {/* ACR Snapshot */}
      <div className={`rounded-2xl border p-5 ${analytics.meetsDiagnosticCriteria ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : 'border-border/60 bg-card/50'}`}>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">ACR Criteria Snapshot</h3>
            <p className="text-sm text-muted-foreground">Based on your most recent entry (WPI ≥7 and SSS ≥5, or WPI 4–6 and SSS ≥9).</p>
          </div>
          {analytics.meetsDiagnosticCriteria
            ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Criteria met</span>
            : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted/40 text-muted-foreground ring-1 ring-border/40">Criteria not met</span>
          }
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`rounded-xl p-3 ${wpiPctColor.bg} ring-1 ${wpiPctColor.ring}`}>
            <p className="text-xs text-muted-foreground">WPI</p>
            <p className={`text-2xl font-bold tabular-nums ${wpiPctColor.text}`}>{analytics.wpiScore} <span className="text-sm font-normal text-muted-foreground">/ 19</span></p>
          </div>
          <div className={`rounded-xl p-3 ${sssPctColor.bg} ring-1 ${sssPctColor.ring}`}>
            <p className="text-xs text-muted-foreground">SSS</p>
            <p className={`text-2xl font-bold tabular-nums ${sssPctColor.text}`}>{analytics.sssScore} <span className="text-sm font-normal text-muted-foreground">/ 12</span></p>
          </div>
          <div className="rounded-xl p-3 bg-muted/20 ring-1 ring-border/40">
            <p className="text-xs text-muted-foreground">Recent status</p>
            <p className="text-sm font-medium text-foreground mt-1">
              {diagnostic.latest?.meetsCriteria ? 'Meets criteria' : 'Does not meet criteria'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{diagnostic.latest?.date?.slice(0, 10) ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Flare Patterns + Symptom Trends — side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flare Patterns */}
        <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" aria-hidden />
            <h3 className="text-base font-semibold text-foreground">Flare Patterns</h3>
          </div>
          <p className="px-5 text-sm text-muted-foreground mb-4">Estimates based on your logged days and flare episodes.</p>
          <div className="px-5 pb-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Flares / month', value: analytics.flareFrequency.toFixed(1) },
              { label: 'Avg duration', value: `${analytics.averageFlareDuration.toFixed(1)}d` },
              { label: 'Intensity', value: analytics.flareIntensity },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-muted/20 border border-border/40 p-3 text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xl font-bold text-foreground mt-0.5 capitalize">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Symptom Trends */}
        <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-base font-semibold text-foreground">Symptom Trends (recent)</h3>
            <p className="text-sm text-muted-foreground">Trend direction compares earliest vs latest in the recent window.</p>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {(
              [
                { key: 'fatigue', label: 'Fatigue', value: analytics.symptomTrends.fatigue },
                { key: 'cognition', label: 'Cognition', value: analytics.symptomTrends.cognition },
                { key: 'sleep', label: 'Sleep', value: analytics.symptomTrends.sleep },
              ] as const
            ).map(row => (
              <div key={row.key} className="rounded-xl bg-muted/20 border border-border/40 p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{row.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Current: <span className="text-foreground">{row.value.current}</span> · Avg: <span className="text-foreground">{row.value.average.toFixed(1)}</span>
                  </p>
                </div>
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                  ${row.value.trend === 'improving'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : row.value.trend === 'worsening'
                      ? 'bg-red-500/15 text-red-400'
                      : 'bg-muted/40 text-muted-foreground'
                  }
                `}>
                  {row.value.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most Affected Regions + Common Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-base font-semibold text-foreground">Most Affected Regions</h3>
            <p className="text-sm text-muted-foreground">How often each region was selected in WPI.</p>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {analytics.mostAffectedRegions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No WPI regions logged yet.</p>
            ) : (
              analytics.mostAffectedRegions.map(region => (
                <div key={region.region} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{region.region}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{region.frequency} · {region.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                      <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${region.percentage}%` }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-base font-semibold text-foreground">Common Triggers</h3>
            <p className="text-sm text-muted-foreground">Most frequently logged triggers (including weather/food buckets).</p>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {analytics.commonTriggers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No triggers logged yet.</p>
            ) : (
              analytics.commonTriggers.map(trigger => (
                <div key={trigger.trigger} className="flex items-center justify-between gap-3 rounded-lg bg-muted/20 px-3 py-2">
                  <span className="text-sm font-medium text-foreground">{trigger.trigger}</span>
                  <span className="text-xs font-semibold tabular-nums bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">{trigger.frequency}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* What Helps */}
      <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">What Seems To Help (early signal)</h3>
          <p className="text-sm text-muted-foreground">
            Compares average functional impact on days with vs without a logged intervention.
          </p>
        </div>
        <div className="px-5 pb-5">
          {analytics.effectiveInterventions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Not enough intervention data yet. If you log meds, heat, PT, etc., this section will populate.
            </p>
          ) : (
            <div className="space-y-2">
              {analytics.effectiveInterventions.map(item => (
                <div key={item.intervention} className="flex items-center justify-between gap-3 rounded-lg bg-muted/20 px-3 py-2">
                  <span className="text-sm font-medium text-foreground">{item.intervention}</span>
                  <span className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full ${
                    item.correlationWithImprovement > 0
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}>
                    Δ {item.correlationWithImprovement.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Education Resources Component
const EducationResources: React.FC = () => {
  const resources = [
    {
      title: 'Understanding Fibromyalgia',
      description: 'Learn about the ACR diagnostic criteria, symptoms, and latest research',
      category: 'diagnosis',
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      title: 'Managing Flare-Ups',
      description: 'Strategies for identifying triggers and reducing flare severity',
      category: 'management',
      color: 'bg-amber-500/10 text-amber-400',
    },
    {
      title: 'Pacing & Energy Management',
      description: 'Learn the "energy envelope" theory and avoid boom-bust cycles',
      category: 'management',
      color: 'bg-amber-500/10 text-amber-400',
    },
    {
      title: 'Latest Research',
      description: 'Stay informed about new treatments and clinical trials',
      category: 'research',
      color: 'bg-emerald-500/10 text-emerald-400',
    },
  ];

  return (
    <div className="space-y-3">
      {resources.map((resource, index) => (
        <div
          key={index}
          className="group rounded-2xl border border-border/60 bg-card/50 p-5 hover:border-primary/30 hover:bg-primary/[0.02] transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-base font-semibold text-foreground">{resource.title}</h3>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${resource.color}`}>
                  {resource.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
            </div>
            <div className="flex items-center gap-2 mt-1 shrink-0">
              <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden />
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/70 transition-colors" aria-hidden />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Community Support Component
const CommunitySupport: React.FC = () => {
  const tips = [
    {
      title: 'Pacing is Key',
      content: 'Break tasks into smaller chunks. Rest BEFORE you feel exhausted, not after.',
      author: 'Community Tip',
      accent: 'border-l-primary',
    },
    {
      title: 'Track Your Baseline',
      content: 'Find your "good day" activity level and stay at 70% of that to avoid crashes.',
      author: 'Clinical Guideline',
      accent: 'border-l-emerald-500',
    },
    {
      title: 'Weather Watch',
      content:
        'Many report flares with barometric pressure changes. Track weather alongside symptoms.',
      author: 'Community Insight',
      accent: 'border-l-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Supportive banner */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] border border-primary/15 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold text-foreground">You are not alone</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Many people live with fibromyalgia. Community tips and validated strategies can help.
        </p>
      </div>

      {/* Tip cards with colored left border */}
      <div className="space-y-3">
        {tips.map((tip, index) => (
          <div
            key={index}
            className={`rounded-xl border border-border/60 bg-card/50 p-4 border-l-4 ${tip.accent}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{tip.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tip.content}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">— {tip.author}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
