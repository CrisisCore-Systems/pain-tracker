# Testing for Co-Occurrence: When Multiple Crises Happen Simultaneously

*Real crises are often layered. How do you test system behavior when pain flare + panic attack + dissociation all occur together?*

---

We designed our crisis detection to handle one crisis at a time. Pain flare? We've got you. Panic attack? Covered. Sensory overload? Handled.

Then reality intervened.

A user reported: "I was having a pain flare, which triggered a panic attack, and then I think I dissociated because I don't remember 20 minutes of using the app. Your system kept bouncing between different modes and I ended up more confused than before I opened it."

Crises don't queue politely. They stack. They interact. A pain spike triggers anxiety which triggers dissociation which makes the pain feel worse. Our single-crisis model was creating chaos when users needed stability most.

This is how we learned to test for crisis co-occurrence.

## The Co-Occurrence Problem

When multiple crisis types occur simultaneously, we face several challenges:

```typescript
interface CoOccurrenceChallenge {
  // What happens when signals overlap?
  signalConflict: {
    example: 'Panic shows rapid navigation, dissociation shows inactivity';
    question: 'Which signal do we trust?';
  };
  
  // What happens when interventions conflict?
  interventionConflict: {
    example: 'Panic needs immediate action, dissociation needs gentle patience';
    question: 'Which approach do we take?';
  };
  
  // What happens when modes clash?
  modeConflict: {
    example: 'Panic simplifies UI, sensory overload needs different simplification';
    question: 'How do we combine adaptations?';
  };
  
  // What happens with recovery?
  recoveryConflict: {
    example: 'Pain resolves but panic persists';
    question: 'When do we declare recovery?';
  };
}
```

## Modeling Crisis Interactions

First, we map how different crises interact:

```typescript
interface CrisisInteractionModel {
  primaryCrisis: CrisisType;
  secondaryCrisis: CrisisType;
  
  interaction: {
    type: 'triggering' | 'amplifying' | 'masking' | 'independent';
    direction: 'bidirectional' | 'unidirectional';
    strength: number; // 0-1
  };
  
  signalInterference: {
    conflictingSignals: string[];
    dominantSignal: string;
    resolutionStrategy: 'primary-wins' | 'combine' | 'context-dependent';
  };
  
  interventionPriority: {
    immediacyRanking: [CrisisType, CrisisType];
    reason: string;
  };
}

const CRISIS_INTERACTIONS: CrisisInteractionModel[] = [
  {
    primaryCrisis: 'pain_flare',
    secondaryCrisis: 'panic_attack',
    interaction: {
      type: 'triggering',
      direction: 'unidirectional', // Pain triggers panic, rarely reverse
      strength: 0.6
    },
    signalInterference: {
      conflictingSignals: ['navigation_pattern'], // Pain = slow, panic = fast
      dominantSignal: 'panic_navigation', // Panic overrides when present
      resolutionStrategy: 'context-dependent'
    },
    interventionPriority: {
      immediacyRanking: ['panic_attack', 'pain_flare'],
      reason: 'Panic requires immediate stabilization before pain management'
    }
  },
  
  {
    primaryCrisis: 'panic_attack',
    secondaryCrisis: 'dissociation',
    interaction: {
      type: 'masking',
      direction: 'unidirectional', // Dissociation can mask panic resolution
      strength: 0.7
    },
    signalInterference: {
      conflictingSignals: ['activity_level', 'input_pattern'],
      dominantSignal: 'most_recent_state',
      resolutionStrategy: 'temporal-analysis'
    },
    interventionPriority: {
      immediacyRanking: ['dissociation', 'panic_attack'],
      reason: 'Dissociation may indicate panic has overwhelmed - needs grounding'
    }
  },
  
  {
    primaryCrisis: 'sensory_overload',
    secondaryCrisis: 'panic_attack',
    interaction: {
      type: 'amplifying',
      direction: 'bidirectional',
      strength: 0.8
    },
    signalInterference: {
      conflictingSignals: ['preference_changes', 'navigation_speed'],
      dominantSignal: 'combined_severity',
      resolutionStrategy: 'combine'
    },
    interventionPriority: {
      immediacyRanking: ['sensory_overload', 'panic_attack'],
      reason: 'Reducing sensory load can help de-escalate panic'
    }
  },
  
  {
    primaryCrisis: 'pain_flare',
    secondaryCrisis: 'dissociation',
    interaction: {
      type: 'triggering',
      direction: 'unidirectional',
      strength: 0.5
    },
    signalInterference: {
      conflictingSignals: ['input_frequency', 'entry_completeness'],
      dominantSignal: 'dissociation_markers',
      resolutionStrategy: 'context-dependent'
    },
    interventionPriority: {
      immediacyRanking: ['dissociation', 'pain_flare'],
      reason: 'Dissociation indicates overwhelm - need grounding before pain logging'
    }
  }
];
```

## Testing Signal Priority

When multiple crises trigger, which signals take priority?

```typescript
describe('Crisis Signal Priority', () => {
  describe('Panic + Pain Flare Co-occurrence', () => {
    it('prioritizes panic signals over pain signals', () => {
      const coOccurringSignals: SignalSet = {
        // Pain signals
        painLevel: 9,
        painEscalation: 'rapid',
        
        // Panic signals
        navigationEntropy: 0.85,
        abandonedFlows: 3,
        exitVelocity: 'sudden'
      };
      
      const detector = new MultiCrisisDetector();
      const result = detector.analyze(coOccurringSignals);
      
      // Panic should be primary (more immediately dangerous)
      expect(result.primaryCrisis).toBe('panic_attack');
      expect(result.secondaryCrisis).toBe('pain_flare');
      
      // Both should be detected
      expect(result.detectedCrises).toHaveLength(2);
    });
    
    it('does not ignore secondary crisis when handling primary', () => {
      const coOccurringSignals: SignalSet = {
        painLevel: 9,
        navigationEntropy: 0.85,
        abandonedFlows: 3
      };
      
      const detector = new MultiCrisisDetector();
      const result = detector.analyze(coOccurringSignals);
      
      // Secondary attention should be maintained
      expect(result.secondaryAttention).toBeDefined();
      expect(result.secondaryAttention.crisis).toBe('pain_flare');
      expect(result.secondaryAttention.monitoring).toBe(true);
    });
  });
  
  describe('Dissociation masking other crises', () => {
    it('detects when dissociation masks panic resolution', async () => {
      const session: SessionSignals[] = [
        // Phase 1: Panic attack
        { timestamp: 0, signals: { navigationEntropy: 0.9, inputRate: 15 } },
        { timestamp: 60000, signals: { navigationEntropy: 0.85, inputRate: 12 } },
        
        // Phase 2: Sudden shift to dissociation (didn't resolve panic, just overwhelmed)
        { timestamp: 120000, signals: { navigationEntropy: 0.1, inputRate: 0.5, inactivityDuration: 180000 } },
        { timestamp: 300000, signals: { navigationEntropy: 0.1, inputRate: 0.2, repetitiveActions: 4 } },
      ];
      
      const detector = new TemporalCrisisDetector();
      const result = detector.analyzeSequence(session);
      
      // Should recognize dissociation as sequel to panic, not resolution
      expect(result.crisisSequence).toEqual([
        { crisis: 'panic_attack', phase: 'active', timeRange: [0, 120000] },
        { crisis: 'dissociation', phase: 'active', timeRange: [120000, 300000] },
        { crisis: 'panic_attack', phase: 'unresolved_masked', timeRange: [120000, 300000] }
      ]);
      
      expect(result.interpretation).toBe('dissociation_masking_panic');
    });
  });
});
```

## Testing Resource Allocation

When multiple crises compete, how do we allocate system resources?

```typescript
describe('Resource Allocation Under Multi-Crisis', () => {
  it('does not overwhelm with simultaneous adaptations', () => {
    const multiCrisis: DetectedCrises = {
      primary: 'sensory_overload',
      secondary: 'panic_attack',
      tertiary: 'pain_flare'
    };
    
    const adapter = new CrisisUIAdapter();
    const adaptations = adapter.getAdaptations(multiCrisis);
    
    // Should not apply all adaptations at once
    expect(adaptations.immediate.length).toBeLessThanOrEqual(3);
    
    // Should sequence adaptations
    expect(adaptations.sequence).toBeDefined();
    expect(adaptations.sequence[0].timing).toBe('immediate');
    expect(adaptations.sequence[1].timing).toBe('after-stabilization');
    
    // Total cognitive load of adaptations should be bounded
    const cognitiveLoad = adaptations.immediate.reduce(
      (sum, a) => sum + a.cognitiveLoad, 0
    );
    expect(cognitiveLoad).toBeLessThan(5); // Max cognitive load budget
  });
  
  it('prioritizes simplification for combined sensory overload + panic', () => {
    const multiCrisis: DetectedCrises = {
      primary: 'sensory_overload',
      secondary: 'panic_attack'
    };
    
    const adapter = new CrisisUIAdapter();
    const adaptations = adapter.getAdaptations(multiCrisis);
    
    // Both crises benefit from reduced stimulation
    expect(adaptations.immediate).toContainEqual(
      expect.objectContaining({ type: 'reduce_visual_complexity' })
    );
    
    // Should not add panic-specific busy elements
    expect(adaptations.immediate).not.toContainEqual(
      expect.objectContaining({ type: 'add_breathing_exercise_overlay' })
    );
    
    // Instead, offer calm minimal interface
    expect(adaptations.immediate).toContainEqual(
      expect.objectContaining({ type: 'minimal_crisis_support_view' })
    );
  });
  
  it('sequences interventions appropriately for pain + dissociation', () => {
    const multiCrisis: DetectedCrises = {
      primary: 'dissociation',
      secondary: 'pain_flare'
    };
    
    const interventionEngine = new InterventionEngine();
    const plan = interventionEngine.createPlan(multiCrisis);
    
    // Phase 1: Grounding for dissociation
    expect(plan.phases[0].focus).toBe('dissociation');
    expect(plan.phases[0].interventions).toContainEqual(
      expect.objectContaining({ type: 'gentle_grounding_prompt' })
    );
    
    // Phase 2: Only after grounding, address pain
    expect(plan.phases[1].focus).toBe('pain_flare');
    expect(plan.phases[1].condition).toBe('after_grounding_response');
    
    // Should not ask about pain while user is dissociated
    expect(plan.phases[0].interventions).not.toContainEqual(
      expect.objectContaining({ type: 'pain_assessment' })
    );
  });
});
```

## Testing Progressive Disclosure Under Load

When everything is complex, how do we simplify?

```typescript
describe('Progressive Disclosure Under Multi-Crisis Load', () => {
  it('reduces to absolute minimum during triple-crisis', () => {
    const tripleCrisis: DetectedCrises = {
      primary: 'panic_attack',
      secondary: 'sensory_overload',
      tertiary: 'pain_flare'
    };
    
    const disclosureEngine = new ProgressiveDisclosureEngine();
    const ui = disclosureEngine.calculateDisclosure(tripleCrisis);
    
    // Should show only essential elements
    expect(ui.visibleElements.length).toBeLessThanOrEqual(3);
    
    // Must include crisis support
    expect(ui.visibleElements).toContain('crisis_support_button');
    
    // Must include safe exit
    expect(ui.visibleElements).toContain('safe_close_option');
    
    // Everything else hidden but accessible
    expect(ui.hiddenButAccessible.length).toBeGreaterThan(0);
  });
  
  it('maintains escape routes during all crisis combinations', () => {
    const crisisCombinations = generateAllCrisisCombinations();
    
    for (const combination of crisisCombinations) {
      const disclosureEngine = new ProgressiveDisclosureEngine();
      const ui = disclosureEngine.calculateDisclosure(combination);
      
      // Must always have way to get help
      expect(ui.visibleElements).toContain('crisis_support_button');
      
      // Must always have way to close/exit
      expect(
        ui.visibleElements.includes('safe_close_option') ||
        ui.visibleElements.includes('close_button')
      ).toBe(true);
      
      // Must never trap user in overwhelmed state
      expect(ui.requiresComplex ActionToExit).toBe(false);
    }
  });
  
  it('gradually restores features as crises resolve', async () => {
    const initialCrisis: DetectedCrises = {
      primary: 'panic_attack',
      secondary: 'sensory_overload'
    };
    
    const disclosureEngine = new ProgressiveDisclosureEngine();
    
    // Initial state: minimal
    const minimalUI = disclosureEngine.calculateDisclosure(initialCrisis);
    expect(minimalUI.visibleElements.length).toBeLessThanOrEqual(4);
    
    // Panic resolves, only sensory overload remains
    const partialResolution: DetectedCrises = {
      primary: 'sensory_overload'
    };
    const partialUI = disclosureEngine.calculateDisclosure(partialResolution);
    expect(partialUI.visibleElements.length).toBeGreaterThan(minimalUI.visibleElements.length);
    
    // All crises resolve
    const fullResolution: DetectedCrises = {};
    const fullUI = disclosureEngine.calculateDisclosure(fullResolution);
    expect(fullUI.visibleElements.length).toBeGreaterThan(partialUI.visibleElements.length);
    
    // Restoration should be gradual, not instant
    expect(fullUI.transitionDuration).toBeGreaterThan(1000); // At least 1 second
  });
});

function generateAllCrisisCombinations(): DetectedCrises[] {
  const crisisTypes: CrisisType[] = ['pain_flare', 'panic_attack', 'dissociation', 'sensory_overload'];
  const combinations: DetectedCrises[] = [];
  
  // Single crises
  for (const crisis of crisisTypes) {
    combinations.push({ primary: crisis });
  }
  
  // Pairs
  for (let i = 0; i < crisisTypes.length; i++) {
    for (let j = i + 1; j < crisisTypes.length; j++) {
      combinations.push({
        primary: crisisTypes[i],
        secondary: crisisTypes[j]
      });
    }
  }
  
  // Triples
  for (let i = 0; i < crisisTypes.length; i++) {
    for (let j = i + 1; j < crisisTypes.length; j++) {
      for (let k = j + 1; k < crisisTypes.length; k++) {
        combinations.push({
          primary: crisisTypes[i],
          secondary: crisisTypes[j],
          tertiary: crisisTypes[k]
        });
      }
    }
  }
  
  // All four (rare but possible)
  combinations.push({
    primary: 'panic_attack',
    secondary: 'sensory_overload',
    tertiary: 'dissociation',
    quaternary: 'pain_flare'
  });
  
  return combinations;
}
```

## Testing Recovery Sequencing

When multiple crises resolve, the order matters:

```typescript
describe('Multi-Crisis Recovery Sequencing', () => {
  it('tracks independent recovery of each crisis', async () => {
    const multiCrisis: ActiveCrises = {
      'panic_attack': { startTime: 0, severity: 0.8 },
      'pain_flare': { startTime: 0, severity: 0.7 }
    };
    
    const recoveryTracker = new MultiCrisisRecoveryTracker(multiCrisis);
    
    // Panic resolves first
    recoveryTracker.update({
      'panic_attack': { severity: 0.1 }, // Resolved
      'pain_flare': { severity: 0.6 }    // Still active
    });
    
    const state1 = recoveryTracker.getState();
    expect(state1.resolved).toContain('panic_attack');
    expect(state1.active).toContain('pain_flare');
    expect(state1.overallRecovery).toBe(false);
    
    // Pain resolves second
    recoveryTracker.update({
      'panic_attack': { severity: 0 },
      'pain_flare': { severity: 0.1 }
    });
    
    const state2 = recoveryTracker.getState();
    expect(state2.resolved).toContain('panic_attack');
    expect(state2.resolved).toContain('pain_flare');
    expect(state2.overallRecovery).toBe(true);
  });
  
  it('handles recovery regression correctly', async () => {
    const recoveryTracker = new MultiCrisisRecoveryTracker({
      'panic_attack': { startTime: 0, severity: 0.8 },
      'pain_flare': { startTime: 0, severity: 0.7 }
    });
    
    // Both start resolving
    recoveryTracker.update({
      'panic_attack': { severity: 0.2 },
      'pain_flare': { severity: 0.3 }
    });
    
    // Pain flare resurges
    recoveryTracker.update({
      'panic_attack': { severity: 0.1 },
      'pain_flare': { severity: 0.8 } // Got worse
    });
    
    const state = recoveryTracker.getState();
    
    expect(state.regressions).toContainEqual({
      crisis: 'pain_flare',
      previousSeverity: 0.3,
      currentSeverity: 0.8,
      timestamp: expect.any(Number)
    });
    
    // Should NOT declare overall recovery despite panic resolving
    expect(state.overallRecovery).toBe(false);
    
    // Should note the resurgence pattern
    expect(state.patterns).toContain('pain_flare_resurgence_during_panic_recovery');
  });
  
  it('adapts UI based on partial recovery', async () => {
    const adapter = new CrisisUIAdapter();
    
    // Full multi-crisis UI
    const fullCrisisUI = adapter.getUI({
      active: ['panic_attack', 'sensory_overload'],
      resolved: []
    });
    expect(fullCrisisUI.mode).toBe('maximum_simplification');
    
    // Partial recovery UI
    const partialRecoveryUI = adapter.getUI({
      active: ['sensory_overload'],
      resolved: ['panic_attack']
    });
    expect(partialRecoveryUI.mode).toBe('moderate_simplification');
    expect(partialRecoveryUI.features).not.toContain('breathing_exercise'); // Not needed, panic resolved
    expect(partialRecoveryUI.features).toContain('reduced_visual_mode'); // Still needed for overload
    
    // Full recovery UI (with transition period)
    const fullRecoveryUI = adapter.getUI({
      active: [],
      resolved: ['panic_attack', 'sensory_overload'],
      inRecoveryWindow: true
    });
    expect(fullRecoveryUI.mode).toBe('gentle_transition');
    expect(fullRecoveryUI.transitionPeriod).toBe(true);
  });
});
```

## Testing Memory of Multi-Crisis States

The system should remember that crises co-occurred:

```typescript
describe('Multi-Crisis Memory', () => {
  it('remembers crisis co-occurrence patterns for user', async () => {
    const userHistory = new UserCrisisHistory('user-123');
    
    // Record co-occurrence
    userHistory.recordMultiCrisis({
      crises: ['pain_flare', 'panic_attack'],
      timestamp: Date.now(),
      resolution: {
        'pain_flare': { resolvedAfter: 3600000 },
        'panic_attack': { resolvedAfter: 1200000 }
      }
    });
    
    // Later: Pain flare detected
    const prediction = userHistory.predictCoOccurrence('pain_flare');
    
    expect(prediction.likelyCoOccurrence).toContain('panic_attack');
    expect(prediction.probability).toBeGreaterThan(0.3);
    expect(prediction.preventiveAction).toBe('monitor_panic_signals');
  });
  
  it('learns user-specific co-occurrence patterns', async () => {
    const userHistory = new UserCrisisHistory('user-456');
    
    // This user has pain → dissociation pattern (not typical)
    for (let i = 0; i < 5; i++) {
      userHistory.recordMultiCrisis({
        crises: ['pain_flare', 'dissociation'],
        timestamp: Date.now() - i * 86400000,
        resolution: { /* ... */ }
      });
    }
    
    // Should learn this user's specific pattern
    const prediction = userHistory.predictCoOccurrence('pain_flare');
    expect(prediction.likelyCoOccurrence).toContain('dissociation');
    
    // Should weight user history over population baseline
    expect(prediction.source).toBe('user_history');
  });
  
  it('uses co-occurrence memory for early intervention', async () => {
    const userHistory = new UserCrisisHistory('user-789');
    userHistory.recordMultiCrisis({
      crises: ['sensory_overload', 'panic_attack'],
      timestamp: Date.now() - 86400000
    });
    
    const interventionEngine = new InterventionEngine(userHistory);
    
    // Sensory overload detected
    const intervention = interventionEngine.plan({
      detectedCrisis: 'sensory_overload'
    });
    
    // Should preemptively prepare for possible panic
    expect(intervention.preparatory).toContainEqual(
      expect.objectContaining({
        type: 'preload_panic_resources',
        reason: 'historical_co_occurrence'
      })
    );
    
    // Should monitor panic signals more closely
    expect(intervention.monitoring.enhancedSignals).toContain('panic_attack');
  });
});
```

## The Multi-Crisis State Machine

We model the complex state transitions:

```typescript
interface MultiCrisisStateMachine {
  currentState: {
    activeCrises: Map<CrisisType, CrisisState>;
    modeStack: UIMode[];          // Stack of applied modes
    interventionQueue: Intervention[];
    recoveryTracking: RecoveryState;
  };
  
  transitions: {
    'crisis_detected': (newCrisis: CrisisType) => void;
    'crisis_escalated': (crisis: CrisisType) => void;
    'crisis_deescalated': (crisis: CrisisType) => void;
    'crisis_resolved': (crisis: CrisisType) => void;
    'co_occurrence_detected': (crises: CrisisType[]) => void;
  };
}

describe('Multi-Crisis State Machine', () => {
  it('handles rapid crisis type switching', async () => {
    const machine = new MultiCrisisStateMachine();
    
    // Rapid sequence of crisis changes
    machine.transition('crisis_detected', 'pain_flare');
    machine.transition('crisis_detected', 'panic_attack');
    machine.transition('crisis_deescalated', 'panic_attack');
    machine.transition('crisis_escalated', 'pain_flare');
    machine.transition('crisis_detected', 'dissociation');
    machine.transition('crisis_resolved', 'panic_attack');
    
    // Should maintain coherent state
    expect(machine.currentState.activeCrises.size).toBe(2);
    expect(machine.currentState.activeCrises.has('pain_flare')).toBe(true);
    expect(machine.currentState.activeCrises.has('dissociation')).toBe(true);
    expect(machine.currentState.activeCrises.has('panic_attack')).toBe(false);
    
    // UI should reflect current reality
    expect(machine.currentState.modeStack).toContain('pain_support');
    expect(machine.currentState.modeStack).toContain('grounding_mode');
  });
  
  it('prevents invalid state transitions', async () => {
    const machine = new MultiCrisisStateMachine();
    
    // Can't resolve a crisis that isn't active
    expect(() => {
      machine.transition('crisis_resolved', 'panic_attack');
    }).toThrow('Cannot resolve inactive crisis');
    
    // Can't escalate a resolved crisis
    machine.transition('crisis_detected', 'pain_flare');
    machine.transition('crisis_resolved', 'pain_flare');
    
    expect(() => {
      machine.transition('crisis_escalated', 'pain_flare');
    }).toThrow('Cannot escalate resolved crisis');
  });
  
  it('maintains UI consistency through complex transitions', async () => {
    const machine = new MultiCrisisStateMachine();
    const uiStates: UIState[] = [];
    
    machine.onUIChange((state) => uiStates.push(state));
    
    // Complex transition sequence
    machine.transition('crisis_detected', 'sensory_overload');
    machine.transition('crisis_detected', 'panic_attack');
    machine.transition('co_occurrence_detected', ['sensory_overload', 'panic_attack']);
    machine.transition('crisis_resolved', 'panic_attack');
    machine.transition('crisis_resolved', 'sensory_overload');
    
    // Each UI state should be internally consistent
    for (const state of uiStates) {
      expect(state.modeConflicts).toEqual([]);
      expect(state.visualConsistency).toBe(true);
    }
    
    // Final state should be recovery/normal
    const finalState = uiStates[uiStates.length - 1];
    expect(finalState.mode).toBe('recovery_transition');
  });
});
```

## Conclusion

Co-occurring crises are the rule, not the exception. Pain triggers anxiety triggers dissociation. Sensory overload amplifies panic. Our systems need to handle this complexity without adding to it.

Key takeaways:

1. **Model interactions**: Understand how crises trigger, amplify, and mask each other.

2. **Prioritize correctly**: Not all crises are equally immediate. Panic before pain, grounding before assessment.

3. **Don't overwhelm**: Multiple crises shouldn't mean multiple simultaneous adaptations. Simplify, don't complicate.

4. **Track independently**: Each crisis has its own resolution timeline. Don't declare victory too early.

5. **Remember patterns**: User's co-occurrence history predicts future needs. Use it for early intervention.

6. **Test the chaos**: Generate all combinations. Test rapid transitions. Verify consistency under load.

When users face cascading crises, our system should be a calm anchor, not another source of chaos. Testing for co-occurrence is how we verify we're helping, not hurting.

---

*This is Part 11 of our series on building trauma-informed healthcare applications. Previous posts covered [crisis detection](/blog/false-positives-calibrating-crisis-detection), [testing strategies](/blog/testing-the-untestable), [recovery testing](/blog/testing-recovery), [cultural contexts](/blog/internationalization-of-trauma), and [validation](/blog/testing-the-testing).*

**Coming Next**: "Testing Privacy-Preserving Analytics: Verifying That Insights Don't Leak Identity"

[![Pain Tracker - Privacy-first PWA for chronic pain tracking & management | Product Hunt](https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1063103&theme=light)](https://www.producthunt.com/products/pain-tracker?utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-pain-tracker)

---

**Tags**: #crisis-detection #state-machines #testing #healthcare #trauma-informed #complexity #react #typescript
