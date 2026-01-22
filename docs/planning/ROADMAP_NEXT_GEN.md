# Next-Gen Roadmap: From "Tracker" to "Assistant" (2026 Strategy)

**Reasoning Model**: Tree of Thoughts (ToT) Synthesis  
**Strategic Theme**: "Active Intervention & User Agency"  
**Status**: DRAFT | **Target**: v1.2.0 - v2.0.0

---

## 🌳 Strategic Reasoning (The "Why")

We applied a branching reasoning model to determine the next evolution of Pain Tracker.

### Branch 1: The "Cloud Community" Path (Pruned ✂️)
*   **Idea**: Social sharing, peer support, "strava for pain".
*   **Evaluation**: Rejected. Contradicts the "Local-First / Class A Privacy" mandate. High risk of shame/comparison dynamics (not trauma-informed).

### Branch 2: The "Machine Learning" Path (Selected 🌿)
*   **Idea**: Predictive analytics for flare-ups.
*   **Constraint**: Must run **strictly in-browser** (TensorFlow.js / ONNX) to maintain privacy.
*   **Verdict**: High value for user agency ("Knowing what's coming"). Prioritize for Phase 2.

### Branch 3: The "Intervention" Path (Selected 🌿)
*   **Idea**: Moving beyond *recording* pain to *managing* energy (Pacing/Spoon Theory).
*   **Verdict**: Immediate clinical value. Reduces "logging fatigue" by giving tools, not just forms. Prioritize for Phase 1.

### Branch 4: The "Passive Data" Path (Selected 🌿)
*   **Idea**: Wearable integration (Sleep, HR).
*   **Constraint**: PWA limitations make direct Bluetooth/HealthKit hard.
*   **Verdict**: Essential for holistic data. Will use "File Import" bridges first, then Native Wrapper (TWA) later.

---

## 🗺️ The Roadmap (2026)

### Phase 4: The "Agency & Pacing" Update (v1.2)
**Theme**: _"Help me manage my energy before I crash."_
**Target**: Q1 2026

The app currently tracks the *crash*. This phase adds tools to prevent it.

#### 1. Activity Pacing (The "Spoon" Tracker)
*   **Feature**: A daily "Energy Budget" visualizations.
*   **Mechanism**:
    *   Users set a daily baseline (e.g., 10 "spoons").
    *   Logging an activity costs spoons (e.g., "Grocery Shopping" = -3).
    *   **Alert**: "You have used 80% of your energy capacity. Recommended: Rest."
*   **Tech**: Zustand store extension `energy-budget.ts`.

#### 2. Digital Advocacy Cards
*   **Feature**: Full-screen, high-contrast "Flash Cards" for non-verbal episodes.
*   **Use Case**: User cannot speak due to pain/seizure. Shows phone to bystander/medic.
*   **Content**: "I have a chronic pain condition.", "Please do not call 911 unless...", "I need quiet."
*   **Tech**: New `AdvocacyView` component with "Lock Screen" mode.

#### 3. Offline Media Vault (Intervention)
*   **Feature**: Store guided meditations, breathing pacers, and grounding audio *locally* (IndexedDB/CacheStorage).
*   **Why**: Crisis often happens offline (subways, rural areas). Streaming is not reliable.
*   **Tech**: Service Worker cache expansion for static media assets.

---

### Phase 5: Local Intelligence (v1.3)
**Theme**: _"Do the thinking for me."_
**Status**: ✅ Complete (Beta)

Use the data we have for strictly local predictive modeling.

#### 1. The "Flare Forecast" (Bayesian Model)
*   **Feature**: A probability indicator for today's risk level.
*   **Status**: Implemented (`BayesianInferenceService.ts`, `FlareForecastWidget.tsx`).

#### 2. Trigger Detective
*   **Feature**: Automated association mining.
*   **Status**: Implemented (`detectTriggerCorrelations`).

---

### Phase 6: The Native Bridge (v2.0)
**Theme**: _"Connect to my body."_
**Target**: Q3 2026
**Status**: 🚧 In Progress

Breaking the PWA "Sandbox" to get biometric truth.

#### 1. Passive Data Imports (Bridge 1)
*   **Feature**: Wizards to import "Apple Health Export.xml" or "Google Takeout".
*   **Status**: ✅ Complete.
    *   Importer: `AppleHealthChunkParser.ts`
    *   Store: `health-data-store.ts`
    *   Viz: `PainChart.tsx` now supports overlaying Heart Rate data onto Pain history.
*   **Why**: Allows analyzing Heart Rate Variability (HRV) vs Pain without building a native app.
*   **Tech**: Client-side XML/JSON parsers (streaming) to avoid memory crashes.

#### 2. Trusted Web Activity (TWA) Wrapper (Bridge 2)
*   **Feature**: Wrap the PWA in a thin Android/iOS container.
*   **Goal**: Gain access to `HealthConnect` and `HealthKit` APIs directly.
*   **Status**: ⏸️ Pending (Scheduled for dedicated infrastructure session).

---

## 📊 Updated Success Metrics (v2.0)

| Metric | Definition | Goal |
| :--- | :--- | :--- |
| **Pacing Adherence** | % of days user stays within "Energy Budget" | > 60% |
| **Crisis De-escalation** | usage of "Media Vault" during Panic Mode | > 30% |
| **Prediction Accuracy** | User feedback ("Was this forecast helpful?") | > 4/5 |
| **Zero-Leak Guarantee** | Biometric imports never sent to network | **100% (Audited)** |

---

## 🛑 Risk Assessment

### 1. Medical Device Liability
*   **Risk**: Algorithms (Pacing/Prediction) could be seen as "Diagnostic".
*   **Mitigation**: Strong disclaimers. "Informational purposes only." Labels are "Forecasts" not "Prognosis".

### 2. Device Storage Limits
*   **Risk**: Storing audio media + biometric datasets in IndexedDB hits browser quotas.
*   **Mitigation**: Implement "Storage Manager" UI. Auto-prune old biometric raw data (keep only daily aggregates).
