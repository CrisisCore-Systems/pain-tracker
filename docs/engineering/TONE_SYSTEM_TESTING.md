# 🎭 Tone System Testing Guide

> **Manual Testing Documentation for the Adaptive Tone System**

## 📋 Overview

This guide walks through manual testing of the adaptive tone system across all 4 patient states and 8 major UI areas.

---

## 🛠️ Setup: Enable the Tone State Tester

The tone system includes a **dev-only testing widget** for manually forcing patient states and adjusting preferences.

### 1. Start Development Server
```bash
npm run dev
```

### 2. Open Application
Navigate to `http://localhost:3000`

### 3. Locate Tone Tester
Look for the **purple "🎭 Tone Tester"** button in the **bottom-right corner** of the screen.

![Tone Tester Widget](https://via.placeholder.com/300x400?text=Tone+Tester+Widget)

---

## 🎯 Patient States

Test all 4 states by clicking buttons in the Tone Tester:

| State | Emoji | When It Occurs | Tone Characteristics |
|-------|-------|----------------|----------------------|
| **Stable** | 😌 | Pain ≤ 3.0 for 7+ days | Brief, upbeat, professional-warm |
| **Rising** | 😟 | Pain increasing (delta > 0.5) | Steady, specific, encouraging |
| **Flare** | 😣 | Pain ≥ 7.0 in last 7 days | Short lines, imperative, slow cadence |
| **Recovery** | 🙂 | Pain decreasing after flare | Warm, factual, no cheerleading |

---

## 🧪 Testing Checklist

### Area 1: QuickLogStepper

**Test Locations:**
- `src/components/pain-tracker/QuickLogStepper.tsx`

**What to Test:**

| Element | Stable | Rising | Flare | Recovery |
|---------|--------|--------|-------|----------|
| **Greeting** | "How are you doing today?" | "Let's track your pain—any changes since last time?" | "Rate your pain" | "Let's track where you're at today" |
| **Pain Slider** | "Rate your pain" | "Use the slider to select today's pain level" | "Tap the slider" | "Use the slider to select today's pain level" |
| **Location Button** | "Mark location(s)" | "Mark location(s) on the body map" | "Tap locations" | "Mark location(s) on the body map" |
| **Symptoms Button** | "Pick symptoms" | "Select any symptoms you're experiencing" | "Pick what applies" | "Select any symptoms you're experiencing" |
| **Notes Placeholder** | "Anything else you'd like to note?" | "Note any changes in your pain or symptoms" | "Quick note (optional)" | "Note your recovery progress" |
| **Submit Button** | "Log entry" | "Save entry" | "Done" | "Save entry" |
| **Keyboard Hint** | "Press Enter or Space to submit" | "Press Enter or Space to submit" | "Press Enter" | "Press Enter or Space to submit" |

**Steps:**
1. Open QuickLogStepper (click "+" button)
2. Force each state in Tone Tester
3. Verify all text elements adapt correctly
4. Check that flare mode uses **shorter, imperative** language
5. Confirm stable mode is **brief and upbeat**

---

### Area 2: PanicMode

**Test Location:**
- `src/components/PanicMode.tsx`

**What to Test:**

| Element | Stable | Rising | Flare | Recovery |
|---------|--------|--------|-------|----------|
| **Greeting** | "You're safe. Let's breathe together." | "You're safe. Let's slow things down with breathing." | "You're safe. Breathe with me." | "You're safe. Let's take a moment to breathe." |
| **Inhale** | "Breathe in slowly..." | "Inhale gently through your nose..." | "In..." | "Breathe in gently..." |
| **Hold** | "Hold for 4 seconds" | "Hold for 4 seconds" | "Hold" | "Hold for 4 seconds" |
| **Exhale** | "Exhale slowly..." | "Release slowly through your mouth..." | "Out..." | "Release slowly..." |
| **Pause** | "Pause" | "Pause between breaths" | "Pause" | "Pause" |
| **Crisis Resources** | "Need more support? Here are some resources..." | "If you need more support, these resources are available..." | "Need help?" | "If you'd like additional support, here are resources..." |
| **Close Button** | "Close" | "Close panic mode" | "Close" | "Close" |

**Steps:**
1. Trigger PanicMode (click panic button)
2. Force each state in Tone Tester
3. Verify breathing instructions adapt
4. Check that **flare mode uses minimal text** ("In...", "Out...", "Hold")
5. Confirm **stable mode is reassuring** but not verbose

---

### Area 3: Dashboard Empty States

**Test Locations:**
- `src/components/analytics/DashboardOverview.tsx`
- `src/components/analytics/AdvancedAnalyticsView.tsx`
- `src/components/analytics/QuantifiedEmpathyDashboard.tsx`

**What to Test:**

| Screen | Stable | Rising | Flare | Recovery |
|--------|--------|--------|-------|----------|
| **Dashboard Empty** | "You haven't logged any pain yet. Start tracking to see patterns and insights." | "Track your first entry to begin understanding your pain patterns" | "Log pain when ready" | "Begin tracking to monitor your recovery journey" |
| **Analytics Empty** | "No data yet—log a few entries and we'll show trends" | "Log entries over time to unlock pattern insights" | "No entries yet" | "Track a few entries to see your recovery trends" |
| **Empathy Dashboard Empty** | "Your emotional tracking dashboard will appear here once you start logging" | "Start logging to see emotional patterns and supportive insights" | "Log pain to see insights" | "Track entries to see emotional recovery patterns" |

**Steps:**
1. Clear all pain entries (or use fresh install)
2. Navigate to Dashboard
3. Force each state in Tone Tester
4. Verify empty state text adapts
5. Check that **flare mode is minimal** and non-pushy
6. Confirm **stable mode encourages** without pressure

---

### Area 4: EmptyStatePanel

**Test Location:**
- `src/components/EmptyStatePanel.tsx`

**What to Test:**

Check that `EmptyStatePanel` respects adaptive copy when used with `useAdaptiveCopy` integration.

**Steps:**
1. Find components using `EmptyStatePanel`
2. Verify they pass adaptive copy (not hardcoded strings)
3. Test across all 4 states

---

### Area 5: Analytics Insights

**Test Locations:**
- `src/components/analytics/DashboardOverview.tsx` (progress summaries)
- `src/components/analytics/AdvancedAnalyticsView.tsx` (trend descriptions)

**What to Test:**

| Insight Type | Stable | Rising | Flare | Recovery |
|--------------|--------|--------|-------|----------|
| **Improving Trend** | "Your pain levels are decreasing—keep up the good work!" | "Your pain is trending down. Continue monitoring for consistency." | "Pain down from peak" | "You're recovering well—pain levels are decreasing steadily" |
| **Worsening Trend** | "Pain levels are rising. Consider consulting your care team." | "Your pain is increasing. This may warrant attention from your provider." | "Pain up. Get help if needed" | "Pain levels rising—monitor closely and reach out to your care team if needed" |
| **Stable Trend** | "Pain levels are holding steady" | "Your pain is stable. Keep tracking to catch any changes." | "Pain steady" | "Pain levels are stable as you continue recovering" |

**Steps:**
1. Log several pain entries with varying levels
2. Navigate to Analytics/Dashboard
3. Force each state in Tone Tester
4. Verify insight summaries adapt
5. Check that **flare mode is brief and directive**
6. Confirm **recovery mode is warm but factual**

---

### Area 6: Reflections

**Test Location:**
- `src/content/microcopy.ts` → `reflections` section

**What to Test:**

| Reflection Type | Stable | Rising | Flare | Recovery |
|-----------------|--------|--------|-------|----------|
| **Weekly Summary** | "This week you logged X entries. Your average pain was Y." | "This week you logged X entries. Pain averaged Y—watch for changes." | "Week: X entries, Y avg pain" | "This week you logged X entries. Average pain: Y—trending down" |
| **Monthly Summary** | "Great month of tracking! You logged X entries." | "You've logged X entries this month. Keep monitoring your patterns." | "Month: X entries logged" | "You logged X entries this month—nice consistency during recovery" |

**Steps:**
1. Log entries over time (use dev tools to backdate if needed)
2. Navigate to Reflections/Summary screens
3. Force each state in Tone Tester
4. Verify summary language adapts

---

### Area 7: Education Content

**Test Location:**
- `src/content/microcopy.ts` → `education` section

**What to Test:**

| Content Type | Stable | Rising | Flare | Recovery |
|--------------|--------|--------|-------|----------|
| **Pacing Tip** | "Pacing helps you conserve energy and reduce flares. Break tasks into smaller chunks." | "Pacing: break activities into manageable pieces to avoid overexertion" | "Pace yourself. Rest between tasks" | "As you recover, pacing can help prevent re-injury" |
| **Sleep Tip** | "Quality sleep supports pain management. Aim for consistent sleep/wake times." | "Sleep consistency can improve pain levels—stick to a regular schedule" | "Sleep helps. Keep routine" | "Prioritize sleep to support your recovery process" |

**Steps:**
1. Navigate to Education/Tips screens (if implemented)
2. Force each state in Tone Tester
3. Verify educational content adapts

---

### Area 8: Notifications & Errors

**Test Locations:**
- `src/content/microcopy.ts` → `notifications` and `errors` sections

**What to Test:**

| Type | Stable | Rising | Flare | Recovery |
|------|--------|--------|-------|----------|
| **Reminder** | "Time to log your pain—it only takes a moment" | "Gentle reminder to log your pain today" | "Log pain when ready" | "Don't forget to track today's entry" |
| **Streak Milestone** | "5 days in a row! Nice consistency." | "You've logged 5 days straight—great job staying consistent" | "5-day streak" | "5 days tracked—excellent consistency during recovery" |
| **Error (Network)** | "Couldn't sync—check your connection and try again" | "Unable to sync. Please verify your internet connection" | "Sync failed. Retry?" | "Sync issue—check connection and try again" |

**Steps:**
1. Trigger notifications (use dev tools or wait for scheduled)
2. Force errors (disconnect network, etc.)
3. Force each state in Tone Tester
4. Verify notification and error text adapts

---

## ⚙️ Preference Testing

The Tone Tester includes **4 preference toggles**:

| Preference | Default | Effect |
|------------|---------|--------|
| **Warmth** | Neutral (0) | Warm (1): Adds encouragement and supportive language |
| **Coach Intensity** | Minimal (0) | Guided (1): Adds educational hints and suggestions |
| **Medical Terms** | Off | On: Uses clinical terminology ("exacerbation" vs "flare") |
| **Allow Lightness** | On | Off: Removes any gentle humor or lighthearted phrases |

**Steps:**
1. Force **Stable** state
2. Toggle **Warmth** to 1 (Warm)
3. Verify QuickLogStepper greetings become more encouraging
4. Toggle **Coach Intensity** to 1 (Guided)
5. Verify buttons/placeholders include more hints
6. Toggle **Medical Terms** On
7. Verify clinical terminology appears
8. Toggle **Allow Lightness** Off
9. Verify any playful language disappears

---

## 📊 Expected Results

### Key Behaviors to Verify

✅ **Flare Mode (😣)**
- **Shortest possible text** everywhere
- **Imperative voice** ("Log", "Tap", "Done")
- **Minimal instructions**
- **No cheerleading** or upbeat language

✅ **Stable Mode (😌)**
- **Brief but friendly** tone
- **Professional-warm** language
- **Encouraging** without being pushy

✅ **Rising Mode (😟)**
- **Steady, clear** instructions
- **Specific guidance** (e.g., "Mark location(s) on the body map")
- **Gently encouraging** to stay consistent

✅ **Recovery Mode (🙂)**
- **Warm but factual** tone
- **Acknowledges progress** without over-celebrating
- **Monitors trends** closely

---

## 🐛 Troubleshooting

### Tone Tester Not Showing
- **Check**: You're in development mode (`npm run dev`)
- **Check**: `import.meta.env.DEV` is `true`

### Copy Not Changing
- **Check**: Component is using `useAdaptiveCopy` hook
- **Check**: Correct keys are passed to `useAdaptiveCopy`
- **Check**: ToneProvider is wrapping the app

### State Not Updating
- **Check**: `forceState()` is being called correctly
- **Check**: ToneContext is not being bypassed

### Preferences Not Applying
- **Check**: `updatePreferences()` is updating context
- **Check**: Adaptive copy logic respects preferences

---

## 📝 Test Report Template

```markdown
## Tone System Test Report

**Date**: YYYY-MM-DD  
**Tester**: [Your Name]  
**Environment**: Development / Staging / Production

### QuickLogStepper
- [ ] Stable state: All copy adapts correctly
- [ ] Rising state: All copy adapts correctly
- [ ] Flare state: All copy adapts correctly
- [ ] Recovery state: All copy adapts correctly

### PanicMode
- [ ] Stable state: Breathing instructions adapt
- [ ] Rising state: Breathing instructions adapt
- [ ] Flare state: Minimal text verified
- [ ] Recovery state: Warm tone verified

### Dashboard Empty States
- [ ] Stable state: Encouraging language
- [ ] Rising state: Steady guidance
- [ ] Flare state: Minimal text
- [ ] Recovery state: Factual warmth

### Analytics Insights
- [ ] Trend summaries adapt across states
- [ ] Evidence-based language maintained

### Preferences
- [ ] Warmth toggle works
- [ ] Coach Intensity toggle works
- [ ] Medical Terms toggle works
- [ ] Allow Lightness toggle works

### Issues Found
1. [Describe issue]
2. [Describe issue]

### Overall Assessment
- [ ] Pass
- [ ] Pass with minor issues
- [ ] Fail (requires fixes)
```

---

## 🎯 Next Steps

After manual testing:

1. **Document Issues**: File bugs for any incorrect copy or state mismatches
2. **Automated Tests**: Write Vitest tests for critical tone paths
3. **Accessibility Check**: Run screen reader tests on adaptive copy
4. **Performance**: Verify no lag when forcing state changes
5. **Production**: Disable/hide `ToneStateTester` in production builds

---

**Questions?** See `docs/engineering/TONE_SYSTEM_IMPLEMENTATION.md` for architecture details.
