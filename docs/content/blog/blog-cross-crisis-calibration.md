# Cross-Crisis Calibration: Testing for Panic Attacks, Dissociation, and Sensory Overload

*Your system is tuned for pain flares, but trauma manifests differently. Here's how to detect—and test for—diverse crisis states.*

---

We built our crisis detection system to catch pain flares. It watches for rapid-fire high severity entries, escalating descriptors, phrases like "can't take this anymore." It works well for what it was designed for.

Then a user reached out: "Your app noticed when my pain got bad, but it completely missed my panic attack. I was tapping everywhere, couldn't figure out how to get help, and eventually just closed the app."

That's when we realized: **crisis isn't monolithic**. A pain flare looks nothing like a panic attack. Dissociation looks nothing like sensory overload. Our single-model approach was leaving users behind.

This is the story of how we built—and more importantly, tested—multi-modal crisis detection.

## The Many Faces of Crisis

Before writing any code, we mapped the behavioral signatures of different crisis states:

```typescript
interface CrisisSignature {
  type: CrisisType;
  behavioralMarkers: BehavioralMarker[];
  temporalPattern: 'rapid' | 'gradual' | 'sudden' | 'cyclical';
  typicalDuration: { min: number; max: number }; // minutes
  falsePositiveRisks: string[];
  interventionTiming: 'immediate' | 'gentle' | 'delayed';
}

const CRISIS_SIGNATURES: Record<CrisisType, CrisisSignature> = {
  pain_flare: {
    type: 'pain_flare',
    behavioralMarkers: [
      'high_severity_entries',
      'escalating_descriptors', 
      'distress_language',
      'medication_logging_spike'
    ],
    temporalPattern: 'gradual',
    typicalDuration: { min: 30, max: 480 },
    falsePositiveRisks: ['legitimate_bad_day', 'retrospective_logging'],
    interventionTiming: 'gentle'
  },
  
  panic_attack: {
    type: 'panic_attack',
    behavioralMarkers: [
      'rapid_navigation',
      'abandoned_flows',
      'erratic_input_patterns',
      'sudden_app_closure',
      'repeated_back_navigation'
    ],
    temporalPattern: 'sudden',
    typicalDuration: { min: 5, max: 30 },
    falsePositiveRisks: ['unfamiliar_user', 'app_confusion', 'accidental_touches'],
    interventionTiming: 'immediate'
  },
  
  dissociation: {
    type: 'dissociation',
    behavioralMarkers: [
      'extended_inactivity',
      'minimal_input',
      'repetitive_actions',
      'incomplete_entries',
      'time_gap_unawareness'
    ],
    temporalPattern: 'gradual',
    typicalDuration: { min: 10, max: 120 },
    falsePositiveRisks: ['distraction', 'stepped_away', 'thinking'],
    interventionTiming: 'gentle'
  },
  
  sensory_overload: {
    type: 'sensory_overload',
    behavioralMarkers: [
      'multiple_help_requests',
      'rapid_preference_changes',
      'theme_toggling',
      'font_size_changes',
      'feature_disabling',
      'simplification_seeking'
    ],
    temporalPattern: 'rapid',
    typicalDuration: { min: 5, max: 60 },
    falsePositiveRisks: ['customization_exploration', 'accessibility_setup'],
    interventionTiming: 'immediate'
  }
};
```

## Signal Detection by Crisis Type

### Panic Attack Signals

Panic attacks manifest as **chaotic interaction patterns**—the digital equivalent of looking for an exit:

```typescript
interface PanicSignalDetector {
  // Navigation entropy: how random is their path through the app?
  calculateNavigationEntropy(history: NavigationEvent[]): number;
  
  // Flow abandonment: starting something and bailing
  detectAbandonedFlows(interactions: Interaction[]): AbandonedFlow[];
  
  // Input chaos: erratic typing, rapid deletions, incomplete submissions
  analyzeInputPattern(inputs: InputEvent[]): InputChaosScore;
  
  // Exit velocity: how fast did they leave?
  measureExitVelocity(session: Session): ExitPattern;
}

class PanicSignalDetectorImpl implements PanicSignalDetector {
  calculateNavigationEntropy(history: NavigationEvent[]): number {
    if (history.length < 3) return 0;
    
    const recentWindow = history.slice(-10);
    const timeBetweenNavigations = recentWindow
      .slice(1)
      .map((event, i) => event.timestamp - recentWindow[i].timestamp);
    
    // High entropy = rapid, unpredictable navigation
    const avgTime = timeBetweenNavigations.reduce((a, b) => a + b, 0) / timeBetweenNavigations.length;
    const variance = timeBetweenNavigations.reduce(
      (sum, t) => sum + Math.pow(t - avgTime, 2), 0
    ) / timeBetweenNavigations.length;
    
    // Unique pages visited vs total navigations
    const uniquePages = new Set(recentWindow.map(e => e.page)).size;
    const revisitRatio = uniquePages / recentWindow.length;
    
    // Combine: fast + erratic + circling = high entropy
    const speedScore = Math.max(0, 1 - avgTime / 5000); // < 5s between pages = fast
    const erraticScore = Math.sqrt(variance) / avgTime;
    const circlingScore = 1 - revisitRatio;
    
    return (speedScore * 0.4 + erraticScore * 0.3 + circlingScore * 0.3);
  }
  
  detectAbandonedFlows(interactions: Interaction[]): AbandonedFlow[] {
    const flows: AbandonedFlow[] = [];
    
    // Define expected flow completions
    const flowDefinitions = {
      'pain_entry': ['open_form', 'fill_severity', 'fill_location', 'submit'],
      'medication_log': ['open_form', 'select_medication', 'confirm'],
      'help_request': ['open_help', 'select_topic', 'view_content'],
    };
    
    for (const [flowName, steps] of Object.entries(flowDefinitions)) {
      const flowInteractions = interactions.filter(i => i.flowId === flowName);
      
      if (flowInteractions.length > 0) {
        const completedSteps = new Set(flowInteractions.map(i => i.step));
        const lastStepIndex = steps.findIndex(s => !completedSteps.has(s));
        
        if (lastStepIndex > 0 && lastStepIndex < steps.length) {
          flows.push({
            flowName,
            completedSteps: lastStepIndex,
            totalSteps: steps.length,
            abandonedAt: steps[lastStepIndex],
            timeInFlow: flowInteractions[flowInteractions.length - 1].timestamp - 
                       flowInteractions[0].timestamp
          });
        }
      }
    }
    
    return flows;
  }
}
```

### Dissociation Signals

Dissociation is the opposite of panic—it's **absence** rather than chaos:

```typescript
interface DissociationSignalDetector {
  // Long gaps without the usual "I stepped away" patterns
  detectUnexplainedInactivity(session: Session): InactivityEvent[];
  
  // Repetitive actions: clicking the same thing over and over
  detectRepetitivePatterns(interactions: Interaction[]): RepetitionPattern[];
  
  // Incomplete entries that just... stop
  detectTrailingOffEntries(entries: PainEntry[]): IncompleteEntry[];
  
  // Time perception gaps: logged entry says "now" but it's been 2 hours
  detectTimePerceptionGaps(entries: PainEntry[]): TimeGap[];
}

class DissociationSignalDetectorImpl implements DissociationSignalDetector {
  detectUnexplainedInactivity(session: Session): InactivityEvent[] {
    const events: InactivityEvent[] = [];
    const interactions = session.interactions;
    
    for (let i = 1; i < interactions.length; i++) {
      const gap = interactions[i].timestamp - interactions[i - 1].timestamp;
      
      // Gap longer than 5 minutes
      if (gap > 5 * 60 * 1000) {
        // Check if there are signs of intentional pause
        const beforeGap = interactions[i - 1];
        const afterGap = interactions[i];
        
        const intentionalPause = 
          beforeGap.type === 'app_background' ||
          beforeGap.type === 'screen_lock' ||
          afterGap.type === 'app_foreground';
        
        if (!intentionalPause) {
          events.push({
            startTime: interactions[i - 1].timestamp,
            endTime: interactions[i].timestamp,
            duration: gap,
            precedingAction: beforeGap.type,
            followingAction: afterGap.type,
            likelyDissociation: gap > 10 * 60 * 1000 && !intentionalPause
          });
        }
      }
    }
    
    return events;
  }
  
  detectRepetitivePatterns(interactions: Interaction[]): RepetitionPattern[] {
    const patterns: RepetitionPattern[] = [];
    const window = 20; // Look at last 20 interactions
    
    const recent = interactions.slice(-window);
    
    // Find repeated sequences
    for (let seqLength = 2; seqLength <= 5; seqLength++) {
      const sequences: Map<string, number> = new Map();
      
      for (let i = 0; i <= recent.length - seqLength; i++) {
        const seq = recent
          .slice(i, i + seqLength)
          .map(int => int.type)
          .join('→');
        
        sequences.set(seq, (sequences.get(seq) || 0) + 1);
      }
      
      // Sequences that repeat 3+ times are concerning
      for (const [sequence, count] of sequences) {
        if (count >= 3) {
          patterns.push({
            sequence: sequence.split('→'),
            repetitions: count,
            totalInteractions: window,
            concernLevel: count >= 5 ? 'high' : count >= 4 ? 'medium' : 'low'
          });
        }
      }
    }
    
    return patterns;
  }
  
  detectTrailingOffEntries(entries: PainEntry[]): IncompleteEntry[] {
    return entries
      .filter(entry => {
        // Entry has severity but missing expected fields
        const hasBasics = entry.baselineData?.pain !== undefined;
        const missingLocation = !entry.baselineData?.primaryLocation;
        const missingDescription = !entry.notes || entry.notes.length < 10;
        const missingQoL = !entry.qualityOfLife;
        
        // Partial entry that trails off
        return hasBasics && (missingLocation || missingDescription) && missingQoL;
      })
      .map(entry => ({
        entryId: entry.id,
        completedFields: Object.keys(entry.baselineData || {}).length,
        expectedFields: 8,
        timeSpentOnEntry: entry.metadata?.editDuration || 0,
        trailedOff: true
      }));
  }
}
```

### Sensory Overload Signals

Sensory overload manifests as **desperate attempts to reduce stimulation**:

```typescript
interface SensoryOverloadDetector {
  // Rapid settings changes: trying to make things calmer
  detectPreferenceChurning(changes: PreferenceChange[]): ChurningPattern;
  
  // Help-seeking escalation: clicking help multiple times
  detectHelpEscalation(helpRequests: HelpRequest[]): EscalationPattern;
  
  // Theme/display toggling: can't find comfortable settings
  detectDisplayToggling(displayChanges: DisplayChange[]): TogglingPattern;
  
  // Feature disabling: turning things off to reduce overwhelm
  detectFeatureDisabling(featureChanges: FeatureChange[]): DisablingPattern;
}

class SensoryOverloadDetectorImpl implements SensoryOverloadDetector {
  detectPreferenceChurning(changes: PreferenceChange[]): ChurningPattern {
    const recentWindow = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    const recent = changes.filter(c => now - c.timestamp < recentWindow);
    
    // Count changes per preference
    const changeCounts: Map<string, number> = new Map();
    for (const change of recent) {
      changeCounts.set(
        change.preference, 
        (changeCounts.get(change.preference) || 0) + 1
      );
    }
    
    // Preferences changed multiple times = churning
    const churningPreferences = Array.from(changeCounts.entries())
      .filter(([_, count]) => count >= 2);
    
    return {
      totalChanges: recent.length,
      timeWindow: recentWindow,
      churningPreferences: churningPreferences.map(([pref, count]) => ({
        preference: pref,
        changeCount: count
      })),
      concernLevel: recent.length >= 10 ? 'high' : 
                    recent.length >= 5 ? 'medium' : 'low'
    };
  }
  
  detectDisplayToggling(displayChanges: DisplayChange[]): TogglingPattern {
    const recentWindow = 3 * 60 * 1000; // 3 minutes
    const now = Date.now();
    const recent = displayChanges.filter(c => now - c.timestamp < recentWindow);
    
    // Specific patterns that indicate overload
    const patterns = {
      darkModeToggles: recent.filter(c => c.type === 'theme').length,
      fontSizeChanges: recent.filter(c => c.type === 'fontSize').length,
      contrastChanges: recent.filter(c => c.type === 'contrast').length,
      reducedMotionToggles: recent.filter(c => c.type === 'reducedMotion').length,
    };
    
    const totalToggles = Object.values(patterns).reduce((a, b) => a + b, 0);
    
    return {
      patterns,
      totalToggles,
      timeWindow: recentWindow,
      likelySensoryOverload: totalToggles >= 4 || patterns.darkModeToggles >= 2
    };
  }
}
```

## Testing Multi-Modal Detection

Now the hard part: how do you test systems that detect panic attacks without having someone actually panic?

### Behavioral Scenario Simulation

We create detailed behavioral scenarios that replicate each crisis type:

```typescript
describe('Multi-Modal Crisis Detection', () => {
  describe('Panic Attack Detection', () => {
    it('detects rapid chaotic navigation pattern', async () => {
      const detector = new MultiModalCrisisDetector();
      
      // Simulate panic attack navigation pattern
      const panicNavigation: NavigationEvent[] = [
        { page: 'dashboard', timestamp: 0 },
        { page: 'pain-entry', timestamp: 800 },      // 0.8s - started entry
        { page: 'dashboard', timestamp: 1500 },      // 0.7s - backed out
        { page: 'help', timestamp: 2100 },           // 0.6s - looking for help
        { page: 'settings', timestamp: 2600 },       // 0.5s - maybe settings?
        { page: 'help', timestamp: 3000 },           // 0.4s - back to help
        { page: 'crisis-resources', timestamp: 3300 }, // 0.3s - found crisis page
        { page: 'help', timestamp: 3500 },           // 0.2s - no wait, help
        { page: 'dashboard', timestamp: 3700 },      // 0.2s - back to start
        // App closes at 4000ms
      ];
      
      const result = detector.analyze({
        navigation: panicNavigation,
        sessionDuration: 4000,
        exitType: 'force_close'
      });
      
      expect(result.detectedCrisis).toBe('panic_attack');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.signals).toContain('rapid_navigation');
      expect(result.signals).toContain('abandoned_flows');
      expect(result.signals).toContain('sudden_app_closure');
    });
    
    it('distinguishes panic from unfamiliar user exploration', async () => {
      const detector = new MultiModalCrisisDetector();
      
      // New user exploring the app - also fast, but more methodical
      const explorationNavigation: NavigationEvent[] = [
        { page: 'onboarding', timestamp: 0 },
        { page: 'dashboard', timestamp: 3000 },
        { page: 'pain-entry', timestamp: 5000 },
        { page: 'dashboard', timestamp: 8000 },
        { page: 'analytics', timestamp: 11000 },
        { page: 'settings', timestamp: 15000 },
        { page: 'help', timestamp: 18000 },
        { page: 'dashboard', timestamp: 22000 },
      ];
      
      const result = detector.analyze({
        navigation: explorationNavigation,
        sessionDuration: 25000,
        exitType: 'normal',
        isNewUser: true
      });
      
      expect(result.detectedCrisis).toBeNull();
      expect(result.signals).not.toContain('panic_attack');
    });
  });
  
  describe('Dissociation Detection', () => {
    it('detects unexplained long inactivity mid-task', async () => {
      const detector = new MultiModalCrisisDetector();
      
      // User starts entry, then... nothing. Then resumes confused.
      const dissociationSession: Interaction[] = [
        { type: 'open_form', timestamp: 0 },
        { type: 'input_severity', timestamp: 2000, value: 7 },
        { type: 'input_location', timestamp: 5000, value: 'back' },
        // 15 minute gap with no app background event
        { type: 'input_location', timestamp: 905000, value: 'back' }, // Same input again
        { type: 'input_location', timestamp: 908000, value: 'back' }, // And again
        { type: 'clear_form', timestamp: 915000 }, // Confused, start over
      ];
      
      const result = detector.analyze({
        interactions: dissociationSession,
        sessionDuration: 920000
      });
      
      expect(result.detectedCrisis).toBe('dissociation');
      expect(result.signals).toContain('extended_inactivity');
      expect(result.signals).toContain('repetitive_actions');
      expect(result.confidence).toBeGreaterThan(0.6);
    });
    
    it('does not flag intentional breaks', async () => {
      const detector = new MultiModalCrisisDetector();
      
      // User intentionally backgrounds app
      const intentionalBreak: Interaction[] = [
        { type: 'open_form', timestamp: 0 },
        { type: 'input_severity', timestamp: 2000, value: 5 },
        { type: 'app_background', timestamp: 5000 }, // Clear signal: user left intentionally
        { type: 'app_foreground', timestamp: 605000 }, // 10 min later
        { type: 'input_location', timestamp: 607000, value: 'shoulder' },
        { type: 'submit', timestamp: 612000 },
      ];
      
      const result = detector.analyze({
        interactions: intentionalBreak,
        sessionDuration: 615000
      });
      
      expect(result.detectedCrisis).toBeNull();
    });
  });
  
  describe('Sensory Overload Detection', () => {
    it('detects frantic preference changes', async () => {
      const detector = new MultiModalCrisisDetector();
      
      const overloadPreferences: PreferenceChange[] = [
        { preference: 'theme', value: 'dark', timestamp: 0 },
        { preference: 'fontSize', value: 'large', timestamp: 3000 },
        { preference: 'reducedMotion', value: true, timestamp: 5000 },
        { preference: 'theme', value: 'light', timestamp: 8000 },      // Toggle back
        { preference: 'theme', value: 'dark', timestamp: 12000 },      // And again
        { preference: 'contrast', value: 'high', timestamp: 15000 },
        { preference: 'fontSize', value: 'xlarge', timestamp: 18000 },
        { preference: 'simplifiedMode', value: true, timestamp: 20000 },
        { preference: 'theme', value: 'light', timestamp: 23000 },     // Still toggling
      ];
      
      const result = detector.analyze({
        preferenceChanges: overloadPreferences,
        timeWindow: 30000
      });
      
      expect(result.detectedCrisis).toBe('sensory_overload');
      expect(result.signals).toContain('theme_toggling');
      expect(result.signals).toContain('rapid_preference_changes');
    });
    
    it('allows normal settings exploration on first use', async () => {
      const detector = new MultiModalCrisisDetector();
      
      // New user configuring preferences - methodical, not frantic
      const setupPreferences: PreferenceChange[] = [
        { preference: 'theme', value: 'dark', timestamp: 0 },
        { preference: 'fontSize', value: 'medium', timestamp: 10000 },
        { preference: 'fontSize', value: 'large', timestamp: 25000 },  // Tried, adjusted
        { preference: 'notifications', value: true, timestamp: 45000 },
        { preference: 'reducedMotion', value: true, timestamp: 60000 },
      ];
      
      const result = detector.analyze({
        preferenceChanges: setupPreferences,
        timeWindow: 120000,
        isFirstSession: true
      });
      
      expect(result.detectedCrisis).toBeNull();
    });
  });
});
```

### Cross-Contamination Testing

One crisis type shouldn't be confused with another:

```typescript
describe('Cross-Crisis Differentiation', () => {
  const testCases: Array<{
    name: string;
    scenario: CrisisScenario;
    expectedType: CrisisType;
    shouldNotBe: CrisisType[];
  }> = [
    {
      name: 'rapid navigation with clear exit is panic, not overload',
      scenario: createPanicScenario(),
      expectedType: 'panic_attack',
      shouldNotBe: ['sensory_overload', 'dissociation']
    },
    {
      name: 'preference churning without navigation chaos is overload, not panic',
      scenario: createOverloadScenario(),
      expectedType: 'sensory_overload',
      shouldNotBe: ['panic_attack', 'dissociation']
    },
    {
      name: 'inactivity with repetition is dissociation, not system lag',
      scenario: createDissociationScenario(),
      expectedType: 'dissociation',
      shouldNotBe: ['panic_attack', 'sensory_overload']
    },
    {
      name: 'high pain entries with distress language is pain flare, not panic',
      scenario: createPainFlareScenario(),
      expectedType: 'pain_flare',
      shouldNotBe: ['panic_attack']
    }
  ];
  
  test.each(testCases)('$name', ({ scenario, expectedType, shouldNotBe }) => {
    const detector = new MultiModalCrisisDetector();
    const result = detector.analyze(scenario);
    
    expect(result.detectedCrisis).toBe(expectedType);
    
    for (const incorrectType of shouldNotBe) {
      expect(result.alternativeHypotheses.find(h => h.type === incorrectType)?.confidence)
        .toBeLessThan(result.confidence - 0.2);
    }
  });
});
```

## Condition-Specific Thresholds

Different users have different baselines. Someone with ADHD might naturally have higher navigation entropy. Someone with chronic fatigue might have longer natural pauses:

```typescript
interface UserCrisisProfile {
  userId: string;
  
  // Known conditions that affect baseline behavior
  conditions: Array<{
    condition: string;
    affectedSignals: string[];
    thresholdAdjustments: Record<string, number>;
  }>;
  
  // Learned baselines from this user's history
  baselineBehavior: {
    averageNavigationSpeed: number;
    typicalInactivityGaps: number[];
    normalPreferenceChangeRate: number;
    historicalCrisisPatterns: CrisisEvent[];
  };
  
  // User's self-reported crisis indicators
  selfReportedIndicators: {
    crisisType: CrisisType;
    userDescription: string;
    watchFor: string[];
  }[];
}

class PersonalizedCrisisDetector {
  constructor(private profile: UserCrisisProfile) {}
  
  adjustThresholds(baseThresholds: CrisisThresholds): CrisisThresholds {
    const adjusted = { ...baseThresholds };
    
    // Apply condition-specific adjustments
    for (const condition of this.profile.conditions) {
      for (const [signal, adjustment] of Object.entries(condition.thresholdAdjustments)) {
        if (adjusted[signal]) {
          adjusted[signal] *= adjustment;
        }
      }
    }
    
    // Apply learned baseline adjustments
    if (this.profile.baselineBehavior.averageNavigationSpeed > 0) {
      // User naturally navigates faster - raise the panic threshold
      adjusted.navigationEntropyThreshold *= 
        this.profile.baselineBehavior.averageNavigationSpeed / 3000; // Normalize to 3s baseline
    }
    
    return adjusted;
  }
  
  incorporateSelfReportedIndicators(signals: DetectedSignal[]): DetectedSignal[] {
    const enhanced = [...signals];
    
    for (const indicator of this.profile.selfReportedIndicators) {
      // Check if any of user's self-reported indicators are present
      const matchingSignals = indicator.watchFor.filter(
        watch => signals.some(s => s.name.includes(watch))
      );
      
      if (matchingSignals.length > 0) {
        enhanced.push({
          name: `user_reported_${indicator.crisisType}_indicator`,
          confidence: 0.8 + (matchingSignals.length * 0.05),
          source: 'self_reported',
          details: {
            crisisType: indicator.crisisType,
            matchedIndicators: matchingSignals,
            userDescription: indicator.userDescription
          }
        });
      }
    }
    
    return enhanced;
  }
}
```

Testing personalized detection:

```typescript
describe('Personalized Crisis Detection', () => {
  it('adjusts thresholds for ADHD users', () => {
    const adhdProfile: UserCrisisProfile = {
      userId: 'user-adhd',
      conditions: [{
        condition: 'ADHD',
        affectedSignals: ['navigation_entropy', 'task_switching'],
        thresholdAdjustments: {
          navigationEntropyThreshold: 1.5,  // 50% higher threshold
          taskSwitchingThreshold: 2.0       // Double threshold
        }
      }],
      baselineBehavior: {
        averageNavigationSpeed: 1500, // Faster than average
        typicalInactivityGaps: [30000, 60000, 120000],
        normalPreferenceChangeRate: 0.5,
        historicalCrisisPatterns: []
      },
      selfReportedIndicators: []
    };
    
    const detector = new PersonalizedCrisisDetector(adhdProfile);
    
    // Navigation that would trigger panic for baseline user
    const fastNavigation = createNavigationPattern({
      avgTimeBetweenPages: 1200,
      entropy: 0.7
    });
    
    const result = detector.analyze({ navigation: fastNavigation });
    
    // Should NOT detect panic - this is normal for this user
    expect(result.detectedCrisis).not.toBe('panic_attack');
  });
  
  it('incorporates user self-reported indicators', () => {
    const userProfile: UserCrisisProfile = {
      userId: 'user-custom',
      conditions: [],
      baselineBehavior: createDefaultBaseline(),
      selfReportedIndicators: [{
        crisisType: 'panic_attack',
        userDescription: 'When I panic, I usually try to find the breathing exercises',
        watchFor: ['breathing', 'calm', 'grounding']
      }]
    };
    
    const detector = new PersonalizedCrisisDetector(userProfile);
    
    // User searching for breathing exercises
    const session = createSession({
      searchQueries: ['breathing', 'calm down', 'grounding exercise'],
      navigationSpeed: 'normal' // Not showing typical panic patterns
    });
    
    const result = detector.analyze(session);
    
    // Should detect based on user's self-reported indicators
    expect(result.detectedCrisis).toBe('panic_attack');
    expect(result.signals).toContain('user_reported_panic_attack_indicator');
  });
});
```

## User-Configurable Crisis Profiles

We let users tell us what their crises look like:

```typescript
interface CrisisProfileEditor {
  // User's condition selection
  conditions: SelectableCondition[];
  
  // What signals matter to this user
  signalConfiguration: {
    signal: string;
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    userNotes?: string;
  }[];
  
  // Custom indicators
  customIndicators: {
    description: string;
    triggerBehaviors: string[];
    suggestedResponse: string;
  }[];
}

// UI Component for configuration
function CrisisProfileConfiguration() {
  const { preferences, updatePreferences } = useTraumaInformed();
  const [profile, setProfile] = useState<CrisisProfileEditor>(
    preferences.crisisProfile || createDefaultProfile()
  );
  
  return (
    <section aria-labelledby="crisis-profile-heading" className="space-y-6">
      <h2 id="crisis-profile-heading" className="text-xl font-semibold">
        Help Us Understand Your Experience
      </h2>
      
      <p className="text-slate-600 dark:text-slate-400">
        Everyone experiences crisis differently. Help us support you better by 
        sharing what your difficult moments look like.
      </p>
      
      {/* Condition Selection */}
      <fieldset>
        <legend className="text-lg font-medium mb-3">
          I experience... (select all that apply)
        </legend>
        
        <div className="space-y-2">
          {CONDITIONS.map(condition => (
            <label key={condition.id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={profile.conditions.includes(condition.id)}
                onChange={() => toggleCondition(condition.id)}
                className="mt-1"
              />
              <div>
                <span className="font-medium">{condition.name}</span>
                <p className="text-sm text-slate-500">{condition.description}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>
      
      {/* Custom Indicators */}
      <fieldset>
        <legend className="text-lg font-medium mb-3">
          When I'm struggling, I tend to...
        </legend>
        
        <div className="space-y-4">
          {BEHAVIORAL_OPTIONS.map(behavior => (
            <label key={behavior.id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={profile.signalConfiguration.find(
                  s => s.signal === behavior.id
                )?.enabled}
                onChange={() => toggleBehavior(behavior.id)}
                className="mt-1"
              />
              <div>
                <span>{behavior.userFriendlyDescription}</span>
                <p className="text-sm text-slate-500 italic">
                  Example: {behavior.example}
                </p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>
      
      {/* Free-form indicator */}
      <div>
        <label htmlFor="custom-indicator" className="block text-lg font-medium mb-2">
          Anything else we should watch for?
        </label>
        <textarea
          id="custom-indicator"
          value={profile.customIndicators[0]?.description || ''}
          onChange={(e) => updateCustomIndicator(e.target.value)}
          placeholder="Example: When I'm dissociating, I often start typing the same word over and over..."
          className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600"
          rows={3}
        />
      </div>
      
      {/* Response Preferences */}
      <fieldset>
        <legend className="text-lg font-medium mb-3">
          When you notice I'm struggling, please...
        </legend>
        
        <div className="space-y-2">
          {RESPONSE_OPTIONS.map(option => (
            <label key={option.id} className="flex items-center gap-3">
              <input
                type="radio"
                name="crisis-response"
                value={option.id}
                checked={profile.preferredResponse === option.id}
                onChange={() => setPreferredResponse(option.id)}
              />
              <span>{option.description}</span>
            </label>
          ))}
        </div>
      </fieldset>
      
      <Button onClick={() => saveProfile(profile)}>
        Save My Preferences
      </Button>
    </section>
  );
}

const BEHAVIORAL_OPTIONS = [
  {
    id: 'rapid_navigation',
    userFriendlyDescription: 'Jump around the app quickly, not sure what I\'m looking for',
    example: 'Tapping through screens fast without really reading them',
    crisisTypes: ['panic_attack']
  },
  {
    id: 'abandon_tasks',
    userFriendlyDescription: 'Start things but can\'t finish them',
    example: 'Beginning to log pain but giving up halfway through',
    crisisTypes: ['panic_attack', 'dissociation']
  },
  {
    id: 'zone_out',
    userFriendlyDescription: 'Lose track of time while using the app',
    example: 'Staring at a screen without doing anything for a while',
    crisisTypes: ['dissociation']
  },
  {
    id: 'repeat_actions',
    userFriendlyDescription: 'Do the same thing over and over',
    example: 'Clicking the same button multiple times without realizing',
    crisisTypes: ['dissociation']
  },
  {
    id: 'settings_frenzy',
    userFriendlyDescription: 'Frantically change settings trying to make things better',
    example: 'Toggling dark mode on and off, changing font sizes repeatedly',
    crisisTypes: ['sensory_overload']
  },
  {
    id: 'seek_simplicity',
    userFriendlyDescription: 'Look for ways to make the interface simpler',
    example: 'Turning off features, looking for a "simple mode"',
    crisisTypes: ['sensory_overload']
  }
];

const RESPONSE_OPTIONS = [
  {
    id: 'gentle_prompt',
    description: 'Gently ask if I\'d like support (I can dismiss it easily)'
  },
  {
    id: 'show_resources',
    description: 'Quietly show crisis resources without interrupting'
  },
  {
    id: 'simplify_immediately',
    description: 'Automatically switch to a calmer, simpler interface'
  },
  {
    id: 'do_nothing',
    description: 'Don\'t change anything - I\'ll ask for help if I need it'
  }
];
```

## Testing the Configuration Flow

```typescript
describe('Crisis Profile Configuration', () => {
  it('saves user-configured crisis profile', async () => {
    render(<CrisisProfileConfiguration />);
    
    // Select conditions
    await userEvent.click(screen.getByLabelText(/panic attacks/i));
    await userEvent.click(screen.getByLabelText(/dissociation/i));
    
    // Select behavioral indicators
    await userEvent.click(screen.getByLabelText(/jump around the app quickly/i));
    await userEvent.click(screen.getByLabelText(/lose track of time/i));
    
    // Add custom indicator
    await userEvent.type(
      screen.getByPlaceholderText(/example: when i'm dissociating/i),
      'I sometimes type random letters when dissociating'
    );
    
    // Select response preference
    await userEvent.click(screen.getByLabelText(/automatically switch to a calmer/i));
    
    // Save
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify saved
    const savedProfile = await getCrisisProfile();
    expect(savedProfile.conditions).toContain('panic_attacks');
    expect(savedProfile.conditions).toContain('dissociation');
    expect(savedProfile.signalConfiguration.find(s => s.signal === 'rapid_navigation')?.enabled)
      .toBe(true);
    expect(savedProfile.preferredResponse).toBe('simplify_immediately');
  });
  
  it('uses saved profile in detection', async () => {
    // Set up profile that indicates dissociation pattern
    await saveUserProfile({
      conditions: ['dissociation'],
      signalConfiguration: [
        { signal: 'zone_out', enabled: true, sensitivity: 'high' }
      ],
      customIndicators: [{
        description: 'type random letters',
        triggerBehaviors: ['gibberish_input']
      }],
      preferredResponse: 'simplify_immediately'
    });
    
    const detector = await createPersonalizedDetector();
    
    // Simulate gibberish input (user's custom indicator)
    const session = createSession({
      inputs: [
        { type: 'text', value: 'asdfasdfasdf', field: 'notes' },
        { type: 'text', value: 'jkljkljkl', field: 'notes' }
      ]
    });
    
    const result = detector.analyze(session);
    
    expect(result.detectedCrisis).toBe('dissociation');
    expect(result.matchedCustomIndicator).toBe('type random letters');
    expect(result.recommendedResponse).toBe('simplify_immediately');
  });
});
```

## The Complete Multi-Modal Detector

Bringing it all together:

```typescript
class MultiModalCrisisDetector {
  private panicDetector: PanicSignalDetector;
  private dissociationDetector: DissociationSignalDetector;
  private overloadDetector: SensoryOverloadDetector;
  private painFlareDetector: PainFlareDetector;
  private userProfile?: UserCrisisProfile;
  
  analyze(session: SessionData): CrisisAnalysisResult {
    // Gather signals from all detectors
    const signals: DetectedSignal[] = [
      ...this.panicDetector.analyze(session),
      ...this.dissociationDetector.analyze(session),
      ...this.overloadDetector.analyze(session),
      ...this.painFlareDetector.analyze(session)
    ];
    
    // Apply personalized adjustments if profile exists
    if (this.userProfile) {
      const personalizedDetector = new PersonalizedCrisisDetector(this.userProfile);
      signals = personalizedDetector.incorporateSelfReportedIndicators(signals);
    }
    
    // Score each crisis type
    const scores: Map<CrisisType, number> = new Map();
    
    for (const crisisType of CRISIS_TYPES) {
      const relevantSignals = signals.filter(s => 
        CRISIS_SIGNATURES[crisisType].behavioralMarkers.some(marker =>
          s.name.includes(marker)
        )
      );
      
      const score = this.calculateCrisisScore(crisisType, relevantSignals, session);
      scores.set(crisisType, score);
    }
    
    // Find highest scoring crisis (if above threshold)
    const [topCrisis, topScore] = [...scores.entries()]
      .sort(([, a], [, b]) => b - a)[0];
    
    const threshold = this.userProfile
      ? new PersonalizedCrisisDetector(this.userProfile)
          .adjustThresholds(DEFAULT_THRESHOLDS)[topCrisis]
      : DEFAULT_THRESHOLDS[topCrisis];
    
    return {
      detectedCrisis: topScore >= threshold ? topCrisis : null,
      confidence: topScore,
      signals: signals.map(s => s.name),
      alternativeHypotheses: [...scores.entries()]
        .filter(([type]) => type !== topCrisis)
        .map(([type, score]) => ({ type, confidence: score })),
      recommendedResponse: this.getRecommendedResponse(topCrisis, this.userProfile)
    };
  }
}
```

## Conclusion

Crisis detection isn't one-size-fits-all. By understanding the distinct behavioral signatures of different crisis states—and giving users the agency to tell us what their struggles look like—we can build systems that actually help when help is needed most.

Key takeaways:

1. **Map behavioral signatures**: Each crisis type has distinct patterns—chaos vs. absence vs. overwhelm
2. **Test cross-contamination**: Make sure panic isn't confused with exploration, dissociation with distraction
3. **Personalize thresholds**: ADHD users navigate fast. That's not panic. Adjust accordingly.
4. **Let users configure**: "When I'm struggling, I tend to..." gives us signals we'd never think of
5. **Respect user preferences**: Some want immediate intervention. Others want to be left alone.

The goal isn't to detect every crisis perfectly—it's to be helpful more often than we're intrusive, and to give users control over how we try to help.

---

*This is Part 7 of our series on building trauma-informed healthcare applications. Previous posts covered [crisis detection calibration](/blog/false-positives-calibrating-crisis-detection), [testing strategies](/blog/testing-the-untestable), [visual regression](/blog/visual-regression-adaptive-interfaces), [ethics of simulation](/blog/ethics-of-simulation), and [performance testing](/blog/performance-under-pressure).*

**Coming Next**: "The Recovery Arc: Detecting when crisis is over without forcing users to declare victory"

---

**Tags**: #crisis-detection #accessibility #healthcare #trauma-informed #testing #react #typescript #machine-learning
