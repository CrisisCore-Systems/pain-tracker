---
title: "Trauma-Informed React Hooks"
published: true
description: "React hooks that adapt to user stress, cognitive load, and emotional states. Crisis detection without surveillance."
tags: ["react", "accessibility", "typescript", "ux"]
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/trauma-informed-hooks-cover.png
canonical_url: 
---

# Trauma-Informed React Hooks

Early testing feedback: "The interface was unusable when I needed it most."

During pain flares—exactly when they needed the app—cognitive fog, trembling hands, and emotional distress made the UI impossible.

I know this feedback intimately. I've been that user. Shaking hands. Brain fog so thick I can't remember what screen I was on. Trying to log pain levels while in too much pain to think.

Traditional UX assumes a "normal" user in optimal conditions. I don't have optimal conditions. Neither do the people I'm building for.

---

## The Problem

Your user might be:
- In physical pain
- Emotionally triggered
- Cognitively impaired
- Using the app during a crisis
- All of the above, simultaneously

Design for the hardest moment. Everyone benefits.

---

## Preference System

Everything is configurable. Defaults are conservative—start simple, never lose data:

```typescript
export interface TraumaInformedPreferences {
  // Cognitive
  simplifiedMode: boolean;
  showMemoryAids: boolean;
  autoSave: boolean;

  // Visual
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  contrast: 'normal' | 'high' | 'extra-high';
  reduceMotion: boolean;

  // Interaction
  touchTargetSize: 'normal' | 'large' | 'extra-large';
  confirmationLevel: 'minimal' | 'standard' | 'high';

  // Emotional
  gentleLanguage: boolean;
  showComfortPrompts: boolean;

  // Crisis
  enableCrisisDetection: boolean;
  crisisDetectionSensitivity: 'low' | 'medium' | 'high';
}
```

`autoSave: true` by default. Because I've lost entries during flares. Because I've closed the app by accident with trembling hands. Because data loss during a pain spike is not acceptable.

`touchTargetSize: 'large'` by default. 56px minimum. Because WCAG's 44px minimum assumes your hands aren't shaking.

---

## Core Hook

```typescript
export const useTraumaInformed = () => useContext(TraumaInformedContext);

export function useCognitiveSupport() {
  const { preferences } = useTraumaInformed();

  return useMemo(() => ({
    isSimplified: preferences.simplifiedMode,
    showMemoryAids: preferences.showMemoryAids,
    autoSave: preferences.autoSave,
  }), [preferences]);
}
```

Components consume these. The form knows to auto-save. The navigation knows to show breadcrumbs. The interface knows to strip itself to essentials.

---

## Crisis Detection

This is the hard part. Detecting when a user is struggling—without surveilling them.

No keystroke logging. No behavioral analytics sent to servers. Everything local. Everything deletable.

```typescript
export function useCrisisDetection(config: Partial<CrisisDetectionConfig> = {}) {
  const { updatePreferences } = useTraumaInformed();
  
  const clickTimes = useRef<number[]>([]);
  const errorEvents = useRef<Date[]>([]);

  const calculateCognitiveLoad = useCallback(() => {
    const recentErrors = errorEvents.current.filter(
      time => Date.now() - time.getTime() < 60000
    ).length;
    return Math.min(1, recentErrors * 0.2);
  }, []);

  const calculateErraticBehavior = useCallback(() => {
    if (clickTimes.current.length < 3) return 0;
    
    const recentClicks = clickTimes.current.filter(
      time => Date.now() - time < 30000
    );
    
    if (recentClicks.length < 3) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < recentClicks.length; i++) {
      intervals.push(recentClicks[i] - recentClicks[i - 1]);
    }

    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce(
      (sum, interval) => sum + Math.pow(interval - avg, 2), 
      0
    ) / intervals.length;

    return Math.min(1, variance / 10000);
  }, []);
```

High error rate + erratic clicking + high pain level = crisis mode.

---

## Emergency Mode

When crisis is detected, the interface simplifies automatically:

```typescript
const activateEmergencyMode = useCallback(() => {
  updatePreferences({
    simplifiedMode: true,
    showMemoryAids: true,
    autoSave: true,
    touchTargetSize: 'extra-large',
    confirmationLevel: 'high',
    showComfortPrompts: true,
  });
}, [updatePreferences]);
```

72px touch targets. Memory aids everywhere. Extra confirmation before destructive actions. Auto-save on every change.

The user doesn't have to ask for help. The interface notices and adapts.

---

## Detection Logic

```typescript
const detectCrisis = useCallback((currentPainLevel: number) => {
  const triggers: CrisisTrigger[] = [];
  
  const cognitiveLoad = calculateCognitiveLoad();
  const erraticBehavior = calculateErraticBehavior();

  if (currentPainLevel >= 7) {
    triggers.push({
      type: 'pain_spike',
      value: currentPainLevel / 10,
      threshold: 0.7,
      timestamp: new Date(),
    });
  }

  if (cognitiveLoad >= 0.6) {
    triggers.push({
      type: 'cognitive_fog',
      value: cognitiveLoad,
      threshold: 0.6,
      timestamp: new Date(),
    });
  }

  if (erraticBehavior >= 0.7) {
    triggers.push({
      type: 'rapid_input',
      value: erraticBehavior,
      threshold: 0.7,
      timestamp: new Date(),
    });
  }

  const overallStress =
    (currentPainLevel / 10) * 0.3 +
    cognitiveLoad * 0.25 +
    erraticBehavior * 0.2;

  let severity: 'none' | 'mild' | 'moderate' | 'severe' | 'critical' = 'none';
  if (overallStress >= 0.8) severity = 'critical';
  else if (overallStress >= 0.6) severity = 'severe';
  else if (overallStress >= 0.4) severity = 'moderate';
  else if (overallStress >= 0.2) severity = 'mild';

  if (severity === 'critical') {
    activateEmergencyMode();
  }

  return { isInCrisis: triggers.length > 0, severity, triggers };
}, [calculateCognitiveLoad, calculateErraticBehavior, activateEmergencyMode]);
```

Pain level 7+ is a spike. Error rate above threshold suggests cognitive fog. Erratic clicking suggests distress.

None of this data leaves the device. All of it can be deleted. The user can disable detection entirely.

---

## Gentle Language

```typescript
export function useEmotionalSafety() {
  const { preferences } = useTraumaInformed();

  return useMemo(() => ({
    useGentleLanguage: preferences.gentleLanguage,
    
    getMessage: (gentle: string, standard: string) =>
      preferences.gentleLanguage ? gentle : standard,
  }), [preferences]);
}
```

Usage:

```tsx
<button>
  {getMessage(
    "Save when you're ready",
    "Submit"
  )}
</button>
```

"Submit" is fine for most apps. For someone tracking pain during a flare, it's one more demand. "Save when you're ready" acknowledges their state.

---

## Progressive Disclosure

Not everyone needs every feature. Start with essentials. Reveal complexity when requested.

```typescript
export function useProgressiveDisclosure() {
  const { preferences } = useTraumaInformed();

  const isVisible = useCallback(
    (requiredLevel: 'essential' | 'helpful' | 'advanced' | 'expert') => {
      const levels = ['essential', 'helpful', 'advanced', 'expert'];
      const currentIndex = levels.indexOf(preferences.defaultDisclosureLevel);
      const requiredIndex = levels.indexOf(requiredLevel);
      return currentIndex >= requiredIndex;
    },
    [preferences.defaultDisclosureLevel]
  );

  return { isVisible };
}
```

Usage:

```tsx
{isVisible('essential') && <PainLevelSelector />}
{isVisible('helpful') && <LocationSelector />}
{isVisible('advanced') && <TriggerAnalysis />}
{isVisible('expert') && <RawDataExport />}
```

New users see pain level. That's it. As they get comfortable, they can reveal more. Or not. Their call.

---

## The Provider

```tsx
export function TraumaInformedProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<TraumaInformedPreferences>(
    defaultPreferences
  );

  const updatePreferences = useCallback((
    updates: Partial<TraumaInformedPreferences>
  ) => {
    setPreferences(prev => ({ ...prev, ...updates }));
    localStorage.setItem('trauma-informed-preferences', JSON.stringify({
      ...preferences,
      ...updates,
    }));
  }, [preferences]);

  return (
    <TraumaInformedContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </TraumaInformedContext.Provider>
  );
}
```

Wrap the app. Every component has access. Preferences persist locally.

---

## Why This Matters

I built crisis detection because I needed it.

I've had flares where I couldn't remember what I'd just entered. Where I clicked the same button three times because my hands wouldn't cooperate. Where I gave up on apps because they expected me to function like someone without a chronic illness.

Most UX research happens on users in controlled environments. Comfortable chairs. Good lighting. No pain. No brain fog. No tremors.

That's not my life. That's not my users' lives.

If you're building for people who might be struggling when they use your app—and you probably are, even if you don't know it—consider what "struggling" actually looks like. Then build for that.

---

**Repository**: [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

The hooks are in `src/components/accessibility/`. The crisis detection is in `useCrisisDetection.ts`. Read it. Use it. Tell me what doesn't work.
