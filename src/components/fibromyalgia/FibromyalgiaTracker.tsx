import React, { useId, useMemo, useState } from 'react';
import { Activity, Brain, Heart, Moon, Zap, TrendingUp, BookOpen, Users } from 'lucide-react';
import type { FibromyalgiaEntry } from '../../types/fibromyalgia';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../design-system';
import { useToast } from '../feedback';
import { computeFibroAnalytics } from '../../utils/pain-tracker/fibroAnalytics';
import { computeFibroDiagnosticHistory } from '../../utils/pain-tracker/fibroDiagnostic';

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
      <header className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Heart className="w-7 h-7" aria-hidden />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Fibromyalgia Support Hub</h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive tracking and support for living with fibromyalgia
              </p>
            </div>
          </div>

          <div className="mt-6" role="tablist" aria-label="Fibromyalgia hub sections">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const tabId = `${tabsId}-tab-${tab.id}`;
                const panelId = `${tabsId}-panel-${tab.id}`;
                const isActive = activeTab === tab.id;

                return (
                  <Button
                    key={tab.id}
                    id={tabId}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={panelId}
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    leftIcon={<Icon className="w-4 h-4" aria-hidden />}
                    onClick={() => setActiveTab(tab.id)}
                    className="whitespace-nowrap"
                  >
                    {tab.label}
                  </Button>
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

  const wpiScore = useMemo(() => Object.values(wpiRegions).filter(Boolean).length, [wpiRegions]);
  const sssScore = useMemo(
    () => Object.values(sssScores).reduce((sum, val) => sum + val, 0),
    [sssScores]
  );
  const meetsCriteria =
    (wpiScore >= 7 && sssScore >= 5) || (wpiScore >= 4 && wpiScore <= 6 && sssScore >= 9);

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
      <Card variant={meetsCriteria ? 'accented' : 'default'} className="relative">
        <CardHeader>
          <div>
            <CardTitle className="text-xl">ACR 2016 Diagnostic Criteria</CardTitle>
            <CardDescription>
              WPI ≥7 and SSS ≥5, or WPI 4–6 and SSS ≥9
            </CardDescription>
          </div>
          {meetsCriteria ? <Badge variant="success">Criteria met</Badge> : null}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="filled" padding="sm">
              <div className="text-sm text-muted-foreground">Widespread Pain Index (WPI)</div>
              <div className="text-3xl font-semibold text-foreground">{wpiScore} / 19</div>
              <div className="text-xs text-muted-foreground mt-1">Need ≥7 for primary criteria</div>
            </Card>
            <Card variant="filled" padding="sm">
              <div className="text-sm text-muted-foreground">Symptom Severity Scale (SSS)</div>
              <div className="text-3xl font-semibold text-foreground">{sssScore} / 12</div>
              <div className="text-xs text-muted-foreground mt-1">Need ≥5 for primary criteria</div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Widespread Pain Index */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" aria-hidden />
              Widespread Pain Index (WPI)
            </CardTitle>
            <CardDescription>Select all areas where you've had pain in the last week.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {wpiBodyRegions.map(region => {
              const selected = Boolean(wpiRegions[region.id]);
              return (
                <Button
                  key={region.id}
                  type="button"
                  variant={selected ? 'secondary' : 'outline'}
                  size="sm"
                  fullWidth
                  aria-pressed={selected}
                  onClick={() => setWpiRegions(prev => ({ ...prev, [region.id]: !prev[region.id] }))}
                  className="justify-start h-auto py-3"
                >
                  <div className="text-left">
                    <div className="font-medium">{region.label}</div>
                    <div className="text-xs text-muted-foreground capitalize">{region.side}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Symptom Severity Scale */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" aria-hidden />
              Symptom Severity Scale (SSS)
            </CardTitle>
            <CardDescription>Rate each symptom over the past week (0 = none, 3 = severe).</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                <Card key={symptom.id} variant="filled" padding="sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-muted-foreground" aria-hidden />
                    <span className="font-medium text-foreground">{symptom.label}</span>
                  </div>
                  <div className="flex gap-2" role="group" aria-label={`${symptom.label} severity`}>
                    {[0, 1, 2, 3].map(score => (
                      <Button
                        key={score}
                        type="button"
                        variant={selectedScore === score ? 'secondary' : 'outline'}
                        size="sm"
                        aria-pressed={selectedScore === score}
                        onClick={() =>
                          setSssScores(prev => ({ ...prev, [symptom.id]: score as 0 | 1 | 2 | 3 }))
                        }
                        className="flex-1"
                      >
                        {score}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>None</span>
                    <span>Severe</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        loading={isSaving}
        disabled={isSaving}
        fullWidth
        size="lg"
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">No insights yet</CardTitle>
            <CardDescription>
              Add a few daily tracking entries to unlock patterns in WPI/SSS, flares, and triggers.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card variant={analytics.meetsDiagnosticCriteria ? 'accented' : 'default'}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">ACR Criteria Snapshot</CardTitle>
              <CardDescription>
                Based on your most recent entry (WPI ≥7 and SSS ≥5, or WPI 4–6 and SSS ≥9).
              </CardDescription>
            </div>
            {analytics.meetsDiagnosticCriteria ? <Badge variant="success">Criteria met</Badge> : <Badge>Criteria not met</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="filled" padding="sm">
              <div className="text-sm text-muted-foreground">WPI</div>
              <div className="text-2xl font-semibold text-foreground">{analytics.wpiScore} / 19</div>
            </Card>
            <Card variant="filled" padding="sm">
              <div className="text-sm text-muted-foreground">SSS</div>
              <div className="text-2xl font-semibold text-foreground">{analytics.sssScore} / 12</div>
            </Card>
            <Card variant="filled" padding="sm">
              <div className="text-sm text-muted-foreground">Recent status</div>
              <div className="text-sm text-foreground mt-1">
                {diagnostic.latest?.meetsCriteria ? 'Meets criteria' : 'Does not meet criteria'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Latest entry: {diagnostic.latest?.date?.slice(0, 10) ?? '—'}</div>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" aria-hidden />
              Flare Patterns
            </CardTitle>
            <CardDescription>Estimates based on your logged days and flare episodes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card variant="filled" padding="sm">
                <div className="text-sm text-muted-foreground">Flares / month</div>
                <div className="text-xl font-semibold text-foreground">{analytics.flareFrequency.toFixed(1)}</div>
              </Card>
              <Card variant="filled" padding="sm">
                <div className="text-sm text-muted-foreground">Avg duration</div>
                <div className="text-xl font-semibold text-foreground">{analytics.averageFlareDuration.toFixed(1)} days</div>
              </Card>
              <Card variant="filled" padding="sm">
                <div className="text-sm text-muted-foreground">Intensity</div>
                <div className="text-xl font-semibold text-foreground capitalize">{analytics.flareIntensity}</div>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Symptom Trends (recent)</CardTitle>
            <CardDescription>Trend direction compares earliest vs latest in the recent window.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(
                [
                  { key: 'fatigue', label: 'Fatigue', value: analytics.symptomTrends.fatigue },
                  { key: 'cognition', label: 'Cognition', value: analytics.symptomTrends.cognition },
                  { key: 'sleep', label: 'Sleep', value: analytics.symptomTrends.sleep },
                ] as const
              ).map(row => (
                <Card key={row.key} variant="filled" padding="sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-foreground">{row.label}</div>
                    <Badge>{row.value.trend}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Current: <span className="text-foreground">{row.value.current}</span> · Average:{' '}
                    <span className="text-foreground">{row.value.average.toFixed(1)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Affected Regions</CardTitle>
            <CardDescription>How often each region was selected in WPI.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.mostAffectedRegions.length === 0 ? (
                <div className="text-sm text-muted-foreground">No WPI regions logged yet.</div>
              ) : (
                analytics.mostAffectedRegions.map(region => (
                  <div key={region.region} className="flex items-center justify-between gap-3">
                    <div className="text-sm text-foreground">{region.region}</div>
                    <div className="text-sm text-muted-foreground">
                      {region.frequency} · {region.percentage.toFixed(0)}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Triggers</CardTitle>
            <CardDescription>Most frequently logged triggers (including weather/food buckets).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.commonTriggers.length === 0 ? (
                <div className="text-sm text-muted-foreground">No triggers logged yet.</div>
              ) : (
                analytics.commonTriggers.map(trigger => (
                  <div key={trigger.trigger} className="flex items-center justify-between gap-3">
                    <div className="text-sm text-foreground">{trigger.trigger}</div>
                    <div className="text-sm text-muted-foreground">{trigger.frequency}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What Seems To Help (early signal)</CardTitle>
          <CardDescription>
            Compares average functional impact on days with vs without a logged intervention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.effectiveInterventions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Not enough intervention data yet. If you log meds, heat, PT, etc., this section will populate.
            </div>
          ) : (
            <div className="space-y-2">
              {analytics.effectiveInterventions.map(item => (
                <div key={item.intervention} className="flex items-center justify-between gap-3">
                  <div className="text-sm text-foreground">{item.intervention}</div>
                  <div className="text-sm text-muted-foreground">Δ {item.correlationWithImprovement.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
    },
    {
      title: 'Managing Flare-Ups',
      description: 'Strategies for identifying triggers and reducing flare severity',
      category: 'management',
    },
    {
      title: 'Pacing & Energy Management',
      description: 'Learn the "energy envelope" theory and avoid boom-bust cycles',
      category: 'management',
    },
    {
      title: 'Latest Research',
      description: 'Stay informed about new treatments and clinical trials',
      category: 'research',
    },
  ];

  return (
    <div className="space-y-4">
      {resources.map((resource, index) => (
        <Card key={index} hover="scale">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </div>
              <BookOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" aria-hidden />
            </div>
          </CardHeader>
        </Card>
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
    },
    {
      title: 'Track Your Baseline',
      content: 'Find your "good day" activity level and stay at 70% of that to avoid crashes.',
      author: 'Clinical Guideline',
    },
    {
      title: 'Weather Watch',
      content:
        'Many report flares with barometric pressure changes. Track weather alongside symptoms.',
      author: 'Community Insight',
    },
  ];

  return (
    <div className="space-y-6">
      <Card variant="filled">
        <CardHeader>
          <CardTitle className="text-xl">You are not alone</CardTitle>
          <CardDescription>
            Many people live with fibromyalgia. Community tips and validated strategies can help.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <Card key={index}>
            <CardContent>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" aria-hidden />
                <div>
                  <div className="font-semibold text-foreground mb-2">{tip.title}</div>
                  <p className="text-sm text-muted-foreground mb-2">{tip.content}</p>
                  <div className="text-xs text-muted-foreground">— {tip.author}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
