# Unified Tone System - Implementation Guide

**Status**: Core Infrastructure Complete  
**Date**: November 12, 2025  
**Version**: 1.0

---

## 🎯 Executive Summary

Successfully implemented a comprehensive adaptive tone system that adjusts copy based on patient state (stable, rising, flare, recovery), user preferences (warmth, coach intensity), and intent (log, coach, insight, motivate, notify, educate).

**Voice Pillars**:
1. **Calm, competent, human** (never cutesy; never sterile)
2. **Actionable empathy** ("what to do next" > platitudes)
3. **Empowering evidence** (show progress and why it matters)
4. **Plain language, precise edges** (5th–8th grade; medical terms glossed inline)

---

## 📊 Implementation Status

### ✅ Completed (Tasks 1-3)

**1. Core Tone System Infrastructure**
- ✅ `src/types/tone.ts` (280 lines) - Complete type system
- ✅ `src/services/ToneEngine.ts` (230 lines) - State detection, copy selection, metrics tracking
- ✅ `src/contexts/ToneContext.tsx` (90 lines) - React context provider
- ✅ `src/contexts/useTone.ts` (60 lines) - Hooks for consuming tone system

**2. Comprehensive Microcopy Dictionary**
- ✅ `src/content/microcopy.ts` (680+ lines) - All user-facing copy with adaptive variations
  - Home/Dashboard copy
  - QuickLog Stepper (all 3 steps)
  - Panic Mode (greeting, breathing phases, affirmations, crisis resources)
  - Analytics/Insights (progress summaries, confidence badges)
  - Empty states (4 variants: no logs, no trends, no reflections, no messages)
  - Daily Reflections (MMP-style prompts with quick chips)
  - Education modules (pacing, sleep, breathing)
  - Notifications (log reminders, insights, messages)
  - Errors (sync failures, export errors - all non-blocking and reassuring)
  - Offline mode
  - Export/Share (preview prompts, PDF, WorkSafe BC)
  - Settings (tone preferences UI copy)
  - Clinician-facing (summary template, smart-insert note, plan templates)
  - Accessibility (skip link, loading/saving/saved status)
  - A/B test variations

**3. QuickLogStepper Integration**
- ✅ Imported `useAdaptiveCopy` hook and `quickLogCopy` dictionary
- ✅ Replaced hardcoded copy with adaptive variables:
  - Pain slider label & hint
  - Locations label & hint
  - Notes label & placeholder
  - Continue/Save button text
  - Keyboard hints
- ✅ Copy now adapts to patient state automatically
- ✅ Zero breaking changes

### ⏳ In Progress (Task 4)

**4. PanicMode Copy Update**
- ✅ Imported `useAdaptiveCopy`, `useTone`, and `panicModeCopy`
- ✅ Replaced DEFAULT_AFFIRMATIONS with microcopy affirmations
- ✅ Added `handleClose` with time-to-calm tracking
- ✅ Added adaptive copy variables (greeting, crisis prompt, hotline, close button, breathing phases)
- ⏳ Need to apply variables to JSX (greeting, breathing instructions, crisis resources, close button)
- ⏳ Need to update cycle counter with adaptive copy function

### 📋 Remaining Tasks (5-12)

**5. Dashboard & Analytics Copy** - Update with evidence-based insights
**6. Empty States** - Apply empathetic, non-pushy copy
**7. Daily Reflection Component** - Create MMP-style reflection UI
**8. Clinician Summary Component** - Create concise clinical format
**9. Tone Personalization Settings** - UI for warmth/coach/lightness toggles
**10. Error Messages** - Apply non-blocking, reassuring tone
**11. Tone Testing Dashboard** - A/B test interface and metrics
**12. Documentation** - Create TONE_SYSTEM.md style guide

---

## 🏗️ Architecture Overview

### Data Flow

```
User Interaction
    ↓
Pain Entries → ToneEngine.detectState() → PatientState (stable/rising/flare/recovery)
    ↓
ToneContext.buildContext() → ToneContext (state + preferences + painTrend)
    ↓
Component: useAdaptiveCopy(copy) → ToneEngine.selectCopy(copy, context)
    ↓
Rendered Copy (adapts to state/warmth/medical terms)
    ↓
User Response → ToneEngine.trackMeasurement() → IndexedDB
    ↓
Analytics: Acceptance rates, time to calm, perceived burden
```

### Key Components

**1. ToneEngine** (`src/services/ToneEngine.ts`)
- `detectState(entries)` - Detects patient state from pain data
- `calculatePainTrend(entries)` - Gets pain direction (up/down/stable)
- `buildContext(entries, preferences)` - Creates ToneContext
- `selectCopy(copy, context)` - Chooses appropriate variation
- `generateInsight(entries, days)` - Creates progress insights with confidence
- `trackMeasurement(measurement)` - Stores effectiveness data
- `getAcceptanceRate(intent, state)` - Retrieves metric
- `getAverageTimeToCalm()` - Panic mode effectiveness

**2. ToneProvider** (`src/contexts/ToneContext.tsx`)
- Wraps app, provides tone context
- Stores preferences in localStorage
- Updates context when entries/preferences change
- Exposes `getCopy`, `trackInteraction`, `trackTimeToCalm`, `forceState`

**3. useAdaptiveCopy Hook** (`src/contexts/useTone.ts`)
```typescript
const painLabel = useAdaptiveCopy({
  base: "Pain intensity (0–10)",
  states: {
    flare: "Pain level",
  },
  medical: {
    plain: "Pain intensity",
    withTerms: "Pain intensity (numeric rating scale)",
  },
});
```

**4. Microcopy Dictionary** (`src/content/microcopy.ts`)
- Centralized copy for entire app
- Adaptive variations for every use case
- Functions for dynamic copy (progress summaries, clinician notes)
- A/B test variants ready

---

## 📖 Usage Patterns

### Basic Adaptive Copy

```typescript
import { useAdaptiveCopy } from '../../contexts/useTone';
import { quickLogCopy } from '../../content/microcopy';

function MyComponent() {
  const painLabel = useAdaptiveCopy(quickLogCopy.painSliderLabel);
  
  return <h2>{painLabel}</h2>;
  // Stable: "Pain intensity (0–10)"
  // Flare: "Pain level"
}
```

### Tracking Interactions

```typescript
import { usePromptTracking } from '../../contexts/useTone';

function CoachingPrompt() {
  const trackPrompt = usePromptTracking('coach');
  
  const handleAccept = () => {
    trackPrompt(true);  // User accepted coaching
    // ... proceed with action
  };
  
  const handleDismiss = () => {
    trackPrompt(false); // User dismissed
  };
  
  return (
    <div>
      <p>Try 5 minutes of pacing. I'll time it.</p>
      <button onClick={handleAccept}>Start</button>
      <button onClick={handleDismiss}>Not now</button>
    </div>
  );
}
```

### Tracking Time to Calm

```typescript
function PanicMode() {
  const { trackTimeToCalm } = useTone();
  const [activationTime] = useState(Date.now());
  
  const handleClose = () => {
    const timeElapsed = (Date.now() - activationTime) / 1000;
    trackTimeToCalm(timeElapsed);
    onClose();
  };
  
  // Component renders breathing guide...
}
```

### Dynamic Copy (Progress Insights)

```typescript
import { analyticsCopy } from '../../content/microcopy';

function ProgressCard() {
  const avgPrev = 5.8;
  const avgCurr = 5.2;
  const days = 14;
  
  const summary = useAdaptiveCopy(
    analyticsCopy.progressSummary(avgPrev, avgCurr, days)
  );
  
  return <p>{summary}</p>;
  // Base: "Last 14 days: average pain 5.8 → 5.2."
  // Stable: "14-day average: 5.8 → 5.2"
}
```

### Clinician Summary

```typescript
import { clinicianCopy } from '../../content/microcopy';

function ClinicianExport() {
  const summary = clinicianCopy.summaryTemplate({
    days: 14,
    painAvg: 5.2,
    painChange: -0.6,
    variability: 'low',
    flareCount: 2,
    sleepChange: 45,
    adherence: 74,
    adherenceChange: -6,
    newSymptoms: ['L-shoulder'],
  });
  
  // Output: "14-day: pain avg 5.2 (↓0.6), variability ↓, flares 2. Sleep +45m. Adherence 74% (-6%). New: L-shoulder."
  
  const smartInsert = clinicianCopy.smartInsertTemplate({
    days: 14,
    painAvg: 5.2,
    painChange: -0.6,
    variability: 'low',
    flareCount: 2,
    contributors: ['earlier bedtime', 'paced activity'],
    plan: 'continue pacing; trial 3-min breathwork during prodromes',
  });
  
  // EHR-safe plain text for copy-paste
}
```

---

## 🎨 State Detection Logic

### Thresholds (from `src/types/tone.ts`)

```typescript
export const STATE_THRESHOLDS = {
  risingPainIncrease: 1.5,    // Pain +1.5 from previous = 'rising'
  flarePainLevel: 7,           // Pain ≥7 = 'flare'
  recoveryHours: 24,           // <24h since flare = 'recovery'
  stableVariability: 1.2,      // Low variability = 'stable'
} as const;
```

### Detection Algorithm

```typescript
detectState(entries, timeSinceFlare) {
  // 1. High pain → FLARE
  if (currentPain >= 7) return 'flare';
  
  // 2. Recent flare → RECOVERY
  if (timeSinceFlare < 24h) return 'recovery';
  
  // 3. Significant increase → RISING
  if (painChange >= 1.5) return 'rising';
  
  // 4. Default → STABLE
  return 'stable';
}
```

---

## 📐 Copy Variation Logic

### Selection Priority (highest to lowest)

1. **State-specific** - `states: { flare: "..." }`
2. **Warmth** - `warmth: { warm: "..." }` (if preference.warmth === 1)
3. **Medical terms** - `medical: { withTerms: "..." }` (if preference.medicalTerms === true)
4. **Base** - Always present fallback

Example:
```typescript
const copy: AdaptiveCopy = {
  base: "Pain intensity (0–10)",
  states: {
    flare: "Pain level",  // ← Selected if state === 'flare'
  },
  warmth: {
    neutral: "Pain intensity",
    warm: "How much pain right now?",  // ← Selected if warmth === 1 AND state !== 'flare'
  },
  medical: {
    plain: "Pain intensity",
    withTerms: "Pain intensity (numeric rating scale)",  // ← Selected if medicalTerms === true AND no state match AND warmth === 0
  },
};
```

---

## 📊 Measurement Framework

### Metrics Tracked

1. **Prompt Acceptance Rate**
   - Intent: coach, motivate, educate, notify
   - Value: 0 (dismissed) or 1 (accepted)
   - Tracked: `trackInteraction(intent, accepted)`

2. **Time to Calm**
   - Context: Panic mode activation
   - Value: seconds from activation to close
   - Tracked: `trackTimeToCalm(seconds)`
   - Target: Minimize (currently <2s activation, measure total calming time)

3. **Reflection Completion**
   - Intent: Daily reflection prompts
   - Value: 0 (skipped) or 1 (completed)
   - Target: ≥30% completion after flares

4. **Note Edit Delta** (future)
   - Context: Clinician smart-insert
   - Value: Time saved vs manual composition
   - Target: ≥30% reduction

5. **Perceived Burden** (survey)
   - Question: "Logging feels heavy/light" (1-5 scale)
   - Tracked: Monthly surveys
   - Target: Trending down month-over-month

### Storage

- Measurements persist to IndexedDB (`pain-tracker-tone` database, `tone-measurements` store)
- Schema: `{ metric, value, context: { state, intent, variation }, timestamp }`
- Retrieved: `toneEngine.getAcceptanceRate(intent, state)`

---

## 🧪 A/B Testing System

### Test Variations (from `microcopy.ts`)

```typescript
export const measurementCopy = {
  reflectionVariants: {
    control: "What helped today?",
    variant: "One thing worth keeping?",
  },
  insightFramingVariants: {
    control: "Likely contributors:",
    variant: "Patterns we noticed:",
  },
  nudgeTimingVariants: {
    control: "5pm reminder",
    variant: "3 hours since last activity",
  },
};
```

### Implementation Pattern

```typescript
// Assign user to variant (50/50)
const variant = Math.random() < 0.5 ? 'control' : 'variant';
localStorage.setItem('reflection_variant', variant);

// Render appropriate copy
const question = variant === 'control'
  ? measurementCopy.reflectionVariants.control
  : measurementCopy.reflectionVariants.variant;

// Track with variant context
trackInteraction('motivate', accepted, { variation: variant });

// Analyze results
const controlRate = getAcceptanceRate('motivate', undefined, 'control');
const variantRate = getAcceptanceRate('motivate', undefined, 'variant');
// Compare and determine winner
```

---

## 🌍 Localization Support

### Structure (from guidelines)

- Write neutral-first (avoid idioms)
- Use ICU message format for plurals, numbers
- Medical terms: Plain + glossed inline
- Non-gendered defaults
- Regional resources (e.g., Indigenous/First Nations support links)

### Example

```typescript
const copy: AdaptiveCopy = {
  base: "Log pain (10s)",
  // ICU format for localization:
  // {duration, plural, =1 {1 second} other {# seconds}}
  
  medical: {
    plain: "Record pain intensity",
    withTerms: "Record pain intensity (NRS 0-10)",
  },
};
```

---

## 🔧 Integration Checklist

### For New Components

1. **Import hooks**
   ```typescript
   import { useAdaptiveCopy } from '../../contexts/useTone';
   import { [sectionName]Copy } from '../../content/microcopy';
   ```

2. **Use adaptive copy**
   ```typescript
   const headlineText = useAdaptiveCopy([sectionName]Copy.headline);
   ```

3. **Track interactions** (if applicable)
   ```typescript
   const trackPrompt = usePromptTracking('coach');
   // ... on action: trackPrompt(true/false)
   ```

4. **Test all states**
   ```typescript
   const { forceState } = useTone();
   
   // Test stable
   forceState('stable');
   
   // Test rising
   forceState('rising');
   
   // Test flare
   forceState('flare');
   
   // Test recovery
   forceState('recovery');
   ```

### For Existing Components

1. **Add copy to `microcopy.ts`** with all variations
2. **Import and apply** in component
3. **Replace hardcoded strings** with adaptive variables
4. **Add tracking** for user interactions
5. **Test state transitions**

---

## 📚 Examples by Component Type

### Empty States

```typescript
import { emptyStates } from '../../content/microcopy';

function NoLogsView() {
  const { headline, subtext, cta } = emptyStates.noLogs;
  
  return (
    <div>
      <h2>{headline}</h2> {/* "Two days of logs unlock patterns." */}
      <p>{subtext}</p>     {/* "Start with today—10 seconds." */}
      <button>{cta}</button> {/* "Log first entry" */}
    </div>
  );
}
```

### Error Messages

```typescript
import { errorCopy } from '../../content/microcopy';

function SyncError() {
  const errorMsg = useAdaptiveCopy(errorCopy.syncFailed);
  const retryBtn = useAdaptiveCopy(errorCopy.retryButton);
  
  return (
    <div role="alert">
      <p>{errorMsg}</p>  {/* "Didn't send yet. Your log is safe here—retry." */}
      <button>{retryBtn}</button> {/* "Retry" (stable) or "Try again" (flare) */}
    </div>
  );
}
```

### Notifications

```typescript
import { notificationCopy } from '../../content/microcopy';

function LogReminderNotification() {
  const message = useAdaptiveCopy(notificationCopy.logReminder);
  
  // Push notification or in-app banner
  notify({
    title: "Pain Tracker",
    body: message, // Adapts: "Time to log? Takes 10 seconds." or "Quick check-in?"
  });
}
```

---

## 🎓 Best Practices

### Do's ✅

1. **Use adaptive copy for all user-facing text**
2. **Provide state-specific variations for critical flows** (log, flare, coach)
3. **Track interactions for data-driven refinement**
4. **Test all 4 states** during development
5. **Keep base copy simple and clear** (fallback for all cases)
6. **Use medical terminology sparingly** (only when user opts in)
7. **Measure and iterate** based on acceptance rates

### Don'ts ❌

1. **Don't hardcode copy in components** (use microcopy dictionary)
2. **Don't use hooks inside functions** (only at component top level)
3. **Don't skip flare state testing** (most critical UX)
4. **Don't overuse warmth** (neutral default, opt-in warm)
5. **Don't make causal claims** ("likely contributors" not "because of")
6. **Don't pressure users** ("you can" not "you must")
7. **Don't use exclamation points or emojis** (except opt-in lightness mode)

---

## 🚀 Next Steps

### Immediate (Complete Current Sprint)

1. **Finish PanicMode integration** - Apply adaptive copy to all JSX
2. **Update Dashboard & Analytics** - Evidence-based insights
3. **Apply empty state copy** - All 4 variants
4. **Test end-to-end** - Verify state transitions work correctly

### Short-Term (Next Sprint)

5. **Build Daily Reflection component** - MMP-style with quick chips
6. **Create Clinician Summary component** - Export-ready format
7. **Add Tone Settings UI** - User preferences panel
8. **Update all error messages** - Non-blocking, reassuring
9. **Wrap app in ToneProvider** - Enable tone system globally

### Medium-Term (Future Iterations)

10. **Build Tone Testing Dashboard** - View metrics, compare variants
11. **Run A/B tests** - Reflection phrasing, insight framing, nudge timing
12. **Gather user feedback** - "Perceived burden" surveys
13. **Refine based on data** - Adjust copy for low-performing prompts

### Long-Term (Continuous Improvement)

14. **Localization** - Translate microcopy to multiple languages
15. **Advanced personalization** - Machine learning for optimal tone
16. **Clinical validation** - Confirm effectiveness with providers
17. **Expand affirmations** - User-contributed, culturally diverse

---

## 📦 File Inventory

### Core System (1,250+ lines)
- `src/types/tone.ts` (280 lines) - Type definitions
- `src/services/ToneEngine.ts` (230 lines) - State detection, copy selection, metrics
- `src/contexts/ToneContext.tsx` (90 lines) - React provider
- `src/contexts/useTone.ts` (60 lines) - Custom hooks
- `src/content/microcopy.ts` (680+ lines) - All user-facing copy

### Integrated Components
- ✅ `src/design-system/fused-v2/QuickLogStepper.tsx` - Adaptive copy applied
- ⏳ `src/components/accessibility/PanicMode.tsx` - Partial integration

### Pending Integration
- ⏳ Dashboard components
- ⏳ Analytics views
- ⏳ Empty states
- ⏳ Error boundaries
- ⏳ Notification system
- ⏳ Settings UI
- ⏳ Export dialogs

---

## 💡 Key Insights

### Why This Matters

1. **Trauma-informed by design** - Adapts to user's emotional state automatically
2. **Evidence over platitudes** - Shows actual progress, not generic encouragement
3. **Empowers agency** - User controls tone preferences, no forced cheerfulness
4. **Clinically credible** - Plain language with medical terms option
5. **Data-driven refinement** - Tracks what copy works, iterates based on evidence

### Design Decisions

**Decision**: Neutral warmth by default, opt-in warm  
**Rationale**: Avoids infantilizing users in pain; respects diverse preferences

**Decision**: State-specific copy for flare mode  
**Rationale**: Short lines, imperative tone reduces cognitive load during crisis

**Decision**: "Likely contributors" not "causes"  
**Rationale**: Avoids causal overreach with observational data

**Decision**: No exclamation points or emojis (except opt-in)  
**Rationale**: Maintains professional-warm tone, avoids toxic positivity

**Decision**: Medical terms glossed inline  
**Rationale**: Educates without patronizing; respects user intelligence

---

## 🔗 Related Documentation

- `.github/copilot-instructions.md` - AI agent guidelines (includes trauma-informed patterns)
- `docs/ACCESSIBILITY_COMFORT_SPEC.md` - WCAG 2.2 AA/AAA compliance
- `docs/UX_ENHANCEMENT_IMPLEMENTATION.md` - User experience patterns
- `EMPATHY_ENHANCEMENT_SUMMARY.md` - Empathy intelligence engine

---

**Implementation By**: GitHub Copilot (AI Agent)  
**Review Status**: Awaiting human validation  
**Next Review**: After QuickLogStepper + PanicMode user testing

