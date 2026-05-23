# The False Positive Problem: Calibrating Crisis Detection Without Becoming The Boy Who Cried Wolf

<!-- markdownlint-disable-file MD013 MD032 MD036 MD060 -->

*Part of the CrisisCore Build Log - trauma-informed systems engineering*

**Important:** This is not mental-health diagnosis; it's UX safety + reliability.

---

When I built crisis detection into Pain Tracker, I knew the stakes were high in both directions:

**Miss a real crisis** → Someone doesn't get help when they need it.
**Trigger on normal behavior** → The system becomes annoying noise, users disable it, and then you've lost them when it actually matters.

This is the calibration problem. Here's how I approached it.

If you want the origin story and design philosophy behind building crisis detection at all, start with [Two People, Same Body](https://dev.to/crisiscoresystems/two-people-same-body-a-developers-crisis-architecture-25ko).

---

## The Core Challenge: Fast Clicks ≠ Panic

The first version of my crisis detection was embarrassingly naive:

```typescript
// 🚫 Don't do this
if (clicksPerSecond > 5) {
  activateEmergencyMode(); // 😬
}
```

Within hours I had reports of people accidentally triggering emergency mode while:
- Scrolling through body map locations
- Quickly rating multiple symptoms
- Just… using the app normally on their phone

Rapid input isn't distress. It's often efficiency.

---

## Multi-Signal Detection: The Weighted Approach

The fix was to stop looking for **any single indicator** and instead track a **weighted constellation** of signals:

```typescript
// Calculate overall stress level from multiple factors
const overallStress =
  (currentIndicators.painLevel / 10) * 0.3 +        // User-reported pain
  currentIndicators.cognitiveLoad * 0.25 +           // Task difficulty signals
  currentIndicators.inputErraticBehavior * 0.2 +     // Click pattern variance
  currentIndicators.errorRate * 0.15 +               // Mistakes and corrections
  currentIndicators.frustrationMarkers * 0.1;        // Back navigation, help requests

// Only escalate when composite score crosses threshold
let severity: 'none' | 'mild' | 'moderate' | 'severe' | 'critical' = 'none';
if (overallStress >= 0.8) severity = 'critical';
else if (overallStress >= 0.6) severity = 'severe';
else if (overallStress >= 0.4) severity = 'moderate';
else if (overallStress >= 0.2) severity = 'mild';
```

No single signal can trigger emergency mode on its own. You need **convergent evidence**.

---

## What Actually Counts as "Erratic Input"?

Fast clicking doesn't matter. **Irregular** clicking does.

Someone efficiently tapping through a familiar flow will have consistent intervals between clicks. Someone struggling will show high variance—long pauses followed by frustrated rapid taps.

```typescript
const calculateInputErraticBehavior = useCallback(() => {
  if (clickTimes.current.length < 3) return 0;

  const recentClicks = clickTimes.current.filter(
    time => Date.now() - time < 30000 // Last 30 seconds
  );

  if (recentClicks.length < 3) return 0;

  // Calculate click frequency variance
  const intervals: number[] = [];
  for (let i = 1; i < recentClicks.length; i++) {
    intervals.push(recentClicks[i] - recentClicks[i - 1]);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce(
    (sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0
  ) / intervals.length;

  return Math.min(1, variance / 10000); // Normalize to 0-1
});
```

**High variance** + **high error rate** + **elevated pain level** = Something's probably wrong.

**High click rate** + **consistent intervals** + **normal error rate** = Power user, leave them alone.

---

## The Frustration Stack

Beyond click patterns, we track what I call the "frustration stack":

```typescript
interface CrisisTrigger {
  type: 'pain_spike' | 'cognitive_fog' | 'rapid_input' | 
        'error_pattern' | 'emotional_distress' | 'timeout';
  value: number;
  threshold: number;
  timestamp: Date;
  context: string;
}
```

Each trigger has its own threshold, tuned by sensitivity setting:

| Trigger | Low Sensitivity | Medium | High |
|---------|-----------------|--------|------|
| Pain spike | ≥9/10 | ≥8/10 | ≥7/10 |
| Cognitive load | ≥0.8 | ≥0.6 | ≥0.5 |
| Error rate | ≥0.5 | ≥0.3 | ≥0.2 |
| Frustration markers | ≥0.7 | ≥0.5 | ≥0.3 |

Users choose their sensitivity. Some want the system watching closely. Others find it intrusive. Both are valid.

---

## Cognitive Load ≠ Crisis

One of the trickiest calibrations: distinguishing "I'm working through something complex" from "I'm drowning."

High cognitive load alone isn't a problem. High cognitive load **plus** rising error rate **plus** help requests **plus** back-navigation? That's a pattern.

```typescript
const calculateCognitiveLoad = useCallback(() => {
  const recentErrors = errorEvents.current.filter(
    time => Date.now() - time.getTime() < 60000 // Last minute
  ).length;

  const recentHelp = helpRequests.current.filter(
    time => Date.now() - time.getTime() < 60000
  ).length;

  return Math.min(
    1,
    recentErrors * 0.2 + 
    recentHelp * 0.3 + 
    behaviorMetrics.current.timeSpentOnPage * 0.1
  );
});
```

The help button isn't just support—it's a signal. One help request is learning. Three in a minute is struggling.

---

## The 5-Second Deactivation Delay

Here's a subtle but critical pattern: **don't immediately deactivate** when stress drops.

```typescript
useEffect(() => {
  if (crisisSettings.autoActivation.enabled) {
    // ... activation logic ...

    } else if (crisisLevel === 'none' && isCrisisModeActive) {
      // Auto-deactivate when stress returns to normal
      setTimeout(() => {
        setIsCrisisModeActive(false);
        setCrisisFeatures(prev => ({
          ...prev,
          emergencyMode: false,
          cognitiveFogSupport: false,
          multiModalInput: false,
        }));
      }, 5000); // 5 second delay to prevent flapping
    }
  }
}, [crisisLevel, crisisSettings.autoActivation, isCrisisModeActive]);
```

Why the delay? Because crisis states aren't binary switches. Someone might calm down briefly, then spike again. Rapid mode-switching is disorienting and erodes trust.

The 5-second buffer creates **hysteresis**—the system requires sustained stability before standing down.

---

## Recovery Flows: Graceful Exit from Emergency Mode

Emergency mode activation is immediate. Deactivation is gradual.

When a user manually resolves a crisis or the system detects sustained calm:

```typescript
const deactivateEmergencyMode = useCallback(() => {
  setIsCrisisModeActive(false);
  setCrisisFeatures({
    emergencyMode: false,
    cognitiveFogSupport: false,
    multiModalInput: false,
    stressResponsiveUI: true, // This stays on
  });
  resetCrisisDetection('resolved');
}, [resetCrisisDetection]);
```

Note what stays active: **stress-responsive UI**. Even after crisis resolution, we keep monitoring. The guardrails stay up longer than the emergency sirens.

---

## Session Recording: Learning From Each Episode

Every crisis episode becomes a learning opportunity—for the user and for the system:

```typescript
interface CrisisSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  triggers: CrisisTrigger[];
  responses: CrisisResponse[];
  userActions: string[];
  outcome: 'resolved' | 'escalated' | 'timed_out' | 'user_dismissed' | 'ongoing';
  duration: number;
  effectiveInterventions: string[];
  userFeedback?: string;
}
```

This isn't sent anywhere—it's local data for the user's own pattern recognition. Over time, they might notice:

- "My crisis episodes usually start with back-navigation loops"
- "Simplified mode actually helps me finish entries"
- "I tend to dismiss too early"

Self-knowledge is the ultimate calibration.

---

## The Sensitivity Dial: User Control

Different people need different trigger points. The system offers three sensitivity levels:

```typescript
thresholds: {
  painLevel:
    preferences.crisisDetectionSensitivity === 'high' ? 7 :
    preferences.crisisDetectionSensitivity === 'medium' ? 8 : 9,
  distressKeywords:
    preferences.crisisDetectionSensitivity === 'high' ? 1 :
    preferences.crisisDetectionSensitivity === 'medium' ? 2 : 3,
}
```

**High sensitivity**: Catches more, risks more false positives. Good for users who want active support.

**Low sensitivity**: Fewer triggers, but might miss subtle distress. Good for users who find monitoring intrusive.

**The user decides.** Not us.

---

## What We Explicitly Don't Do

Some things that might seem like good signals are actually invasive or unreliable:

❌ **Keystroke dynamics** — Too surveillance-y, poor signal-to-noise
❌ **Time between sessions** — People have lives; absence isn't distress
❌ **Content analysis of notes** — Privacy violation; users should write freely
❌ **Device accelerometer** — Shaking could be pain, exercise, or a bus ride
❌ **Camera/microphone** — Absolutely not

The goal is to infer state from **interaction patterns**, not to spy on content or biology.

---

## Testing the Boundaries

How do you QA a crisis detection system? You can't exactly trigger real crises.

We use simulation modes:

1. **Rapid-fire interaction testing** — Verify fast normal use doesn't trigger
2. **Error injection** — Simulate high error rates without other signals
3. **Threshold boundary testing** — Verify exact trigger points
4. **Composite scenario testing** — Combine multiple signals at various levels
5. **Recovery timing validation** — Ensure deactivation delays work correctly

The test isn't just "does it trigger when it should?" It's also "does it stay quiet when it shouldn't?"

---

## The Ongoing Calibration

This isn't a solved problem. Every few months I revisit the weights and thresholds based on:

- User feedback ("it triggered when I was fine" vs "it missed when I needed help")
- Pattern analysis from anonymized session structures
- My own experience using the app on bad days

The best crisis detection system is one you forget exists—until it quietly makes things easier exactly when you need it.

---

## The Bigger Lesson

False positives aren't just technical failures. They're **trust failures**.

Every unnecessary alarm trains users to ignore the system. Every missed intervention is a broken promise.

The calibration work isn't about finding perfect thresholds. It's about understanding that:

- Fast ≠ panicked
- Slow ≠ calm
- Errors ≠ incompetence
- Variance ≠ chaos

Context is everything. And context requires multiple signals, observed over time, weighted by user preference.

That's the engineering. The empathy is remembering that behind every data point is someone just trying to get through their day.

---

For the full stress formula, threshold logic, and privacy-preserving implementation details behind this calibration work, read [Trauma-informed design left everyone asking: "How does it actually know I'm struggling without spying?"](https://dev.to/crisiscoresystems/trauma-informed-design-left-everyone-asking-how-does-it-actually-know-im-struggling-without-26a0).

---

If you're building something similar and want to compare notes, the crisis detection code is open source: [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

If your own pages look like mine and you're struggling:
- In Canada, call or text **9-8-8**
- In the US, call or text **988**
- Elsewhere, reach out to your local crisis line

You're not a false positive. You're a system under load.
