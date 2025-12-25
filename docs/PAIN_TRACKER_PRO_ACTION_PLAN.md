# Pain Tracker Pro — Comprehensive Action Plan (Engineering)

_Last Updated: 2025-12-22_

This document converts the external “Pain Tracker Pro” requirements list into an executable plan for this repository, with:
- **Current status** (Implemented / Partial / Planned) grounded in existing code/docs
- **Risk gates** aligned to `.github/copilot-instructions.md` (human review required zones)
- **Acceptance criteria** so we can say “done” honestly

## Non‑Negotiable Constraints (Project Rules)

- **Local‑first** by default (Class A data stays on device)
- **No Class A telemetry by default** (optional anonymous usage analytics may be enabled by deploy/build config such as `VITE_ENABLE_ANALYTICS`)
- **WCAG 2.2 AA target**
- **Security‑critical boundaries require human review**: exports/report formats, crypto/key handling, network calls/telemetry, crisis escalation logic.

## Status Legend

- **Implemented**: exists in product code and is plausibly usable today
- **Partial**: scaffolding exists, but gaps remain for safety, UX completeness, or validation
- **Planned**: documented but not built

---

## Tier 1 — Critical (Launch‑Readiness Claims)

### 1.1 Crisis Detection & Mental Health Alerts

**Repo reality**

**Status**: **Partial**

**Gaps vs requested spec**

**Risk gate**: **HUMAN REVIEW REQUIRED** (crisis logic + escalation protocol)

**Acceptance criteria (minimum to claim “crisis support”)**

**Acceptance criteria (to claim “crisis detection”)**
  - baseline computation window
  - spike detection threshold (e.g. +20%)
  - debounce/cooldown
  - false positive mitigation

  - Implemented: local-only crisis detection heuristic with baseline + threshold rules, visible banner and modal resources, coarse audit logging, and unit/component tests. See `docs/CRISIS_DETECTION.md` for design and rationale. ✅
  - Next: Add PHQ-9/GAD-7 opt-in screens, add a Settings toggle to control detection, and add a clinician-facing scoping doc for networked alerts (human review required).
    - Done: PHQ-9 opt-in component added and accessible from Alerts settings; clinician portal scoping document created (`docs/CLINICIAN_PORTAL_SCOPING.md`). **Human review required** before any networked clinician features are implemented. ✅

### 1.2 Medication Tracking Integration

**Repo reality**
- Medication fields exist in the canonical schema (`src/types/pain-entry.ts` includes `medications.current[]`).
- Store persists medication fields (`src/stores/pain-tracker-store.ts` maps `entryData.medications`).
- UI components exist (e.g. `src/components/pain-tracker/form-sections/MedicationsSection.tsx`, `src/components/pain-tracker/Medications.tsx`).
- Notification category includes medication alerts (`src/utils/notifications/*`).

**Status**: **Implemented (core logging)** / **Partial (clinical rigor)**

**Gaps vs requested spec**
- “Medication library/autocomplete” may be limited or absent as a curated dataset.
- “Efficacy: (before-after)/time lag” requires timestamped med events (route/time) and pairing logic.
- “Drug interaction warnings” is a **medical-device-adjacent** risk and should be avoided or framed as “informational” with a trusted offline dataset + strong disclaimers.

**Risk gate**: **HUMAN REVIEW RECOMMENDED** for interaction warnings; otherwise normal.

**Acceptance criteria (logging)**
- User can add multiple meds with at least: name + dose + timing.
- Meds are visible in entry review and at least one timeline surface.

**Acceptance criteria (analytics)**
- Effectiveness calculation varies with data (not constant) and includes “insufficient data” messaging.

---

### 1.3 Clinician Portal & Provider Integration

**Repo reality**
- Clinic portal docs exist (`docs/CLINIC_PORTAL.md`) and routes are described (`/clinic/*`).
- There is server/admin auth code (`api-lib/adminAuth.ts`) and multiple `api/clinic/*` routes in the repo tree.

**Status**: **Partial**

**Key architectural decision (must be explicit)**
- A true portal with messaging and multi‑patient dashboards implies **networked infrastructure**, which conflicts with “no cloud dependency” unless redesigned as:
  - export/import based sharing
  - local clinic deployment (on‑prem) with explicit consent

**Risk gate**: **HUMAN REVIEW REQUIRED** for any new network calls, sharing permissions, clinician access, or audit logging semantics.

**Acceptance criteria (local‑first compatible baseline)**
- A clinician‑ready export workflow (PDF/CSV/JSON) that the patient initiates.
- A “clinic portal” label should not be used unless clinic functionality is actually accessible and secured.

---

### 1.4 Data Export & Portability

**Repo reality**
- Export code exists:
  - General CSV/JSON/PDF: `src/utils/pain-tracker/export.ts`
  - CSV helper: `src/features/export/exportCsv.ts`
  - WorkSafeBC PDF export: `src/utils/pain-tracker/wcb-export.ts` (+ tests)
- FHIR service exists (`src/services/FHIRService.ts`).
- Store includes `clearAllData()` (`src/stores/pain-tracker-store.ts`).

**Status**: **Implemented (core)** / **Partial (validation + interoperability)**

**Verified mapping (2025-12-22)**
- See `docs/EXPORT_AND_DELETION_AUDIT.md` for a repo-grounded map of export entry points and delete/clear semantics.

**Known gaps (portability + deletion semantics)**
- Multiple CSV export pipelines exist (a “full” fixed-column CSV via `src/utils/pain-tracker/export.ts` and a “light” id/timestamp/pain/notes CSV used by some dashboards).
- Some export UI toggles are currently inert (e.g. “Include charts” in `src/components/settings/ExportSettings.tsx`; “include medications/treatments/etc” toggles in `src/components/export/DataExportModal.tsx`).
- “Delete all data” does not currently clear all persisted state (e.g. `scheduledReports` is persisted but not cleared by `clearAllData()`), and PWA “clear data” does not clear the Zustand persisted key `pain-tracker-storage`.

**Risk gate**: **HUMAN REVIEW REQUIRED** for export/report formats and any scheduling that writes/exports automatically.

**Acceptance criteria (portability)**
- CSV export includes full entry fields (or clearly documents what’s included).
- PDF export is printable and includes disclaimers.
- JSON export round‑trips (export → import) without data loss (if import exists).
- “Delete all data” is user accessible, confirmed, and tested.

---

## Tier 2 — High Priority (Clinical Safety + Validation)

### 2.1 Clinical Validation Study

**Status**: **Planned** (process, not code)

**Deliverables**
- Usability protocol + consent template
- Metrics: entry time, completion rate, errors, perceived burden
- “Clinical‑grade” marketing claim requires an evidence policy (what qualifies).

---

### 2.2 Algorithm Accuracy & Confidence Intervals

**Repo reality**
- Health insights/predictions exist (linear forecast) in `src/workers/health-insights-worker.ts`.

**Status**: **Partial**

**Acceptance criteria**
- For each insight: show minimum sample warnings and a confidence explanation.
- For medication effectiveness: prove non‑constant output via unit tests.

---

### 2.3 Mental Health Integration

**Repo reality**
- Mood tracking infrastructure exists (`moodEntries` in store; `src/types/quantified-empathy.ts`).

**Status**: **Partial**

**Risk gate**: **HUMAN REVIEW REQUIRED** (screening + suicide‑risk protocol)

**Acceptance criteria**
- Mood scale is available in the primary entry flow.
- Optional PHQ‑9/GAD‑7 are gated behind explicit consent, clear disclaimers, and safe UX.

---

## Tier 3 — High Priority (Feature Completeness)

### 3.1 Fibromyalgia Hub

**Repo reality**
- Fibro types + scoring appear to exist (`src/types/fibromyalgia.ts`), and there are fibro docs (e.g. `docs/FIBROMYALGIA_FEATURES.md`).

**Status**: **Partial**

**Acceptance criteria**
- WPI/SSS interpretation text is present in‑app.
- Educational content is accessible offline (or clearly labeled as external links).

---

### 3.2 Predictions

**Repo reality**
- A “prediction” insight exists (linear trend) in `src/workers/health-insights-worker.ts`.

**Status**: **Partial**

**Acceptance criteria**
- The UI labels should reflect the actual method (e.g. “trend projection”) unless ML is truly implemented.
- Confidence is explained; sample size requirements enforced.

---

### 3.3 Accessibility Tabs

**Repo reality (verified)**
- `AccessibilitySettingsPanel` provides **Cognitive / Visual / Motor / Mobile / Emotional** tabs (`src/components/accessibility/AccessibilitySettings.tsx`).
- Visual + Motor preferences are persisted and applied (CSS vars + body classes) via the trauma-informed provider.
- Key toggles are actively consumed in core UI (e.g. memory aids and progress display in `src/components/layouts/TraumaInformedPainTrackerLayout.tsx`, progress sections in `src/components/pain-tracker/PainEntryForm.tsx`).

**Status**: **Implemented (core)** / **Partial (duplication cleanup)**

**Known gaps / notes**
- Multiple theme/contrast surfaces exist (ThemeProvider vs trauma-informed contrast classes). Keep language precise in UX and docs.
- Mobile-only toggles previously stored to localStorage are now mapped onto existing app behavior (theme / reduce motion / font size / voice input), but the remaining mobile-only items (e.g. haptics, TTS) still need their own wiring.

**Next step**
- Reconcile and de-duplicate “theme/high contrast” surfaces so there is one consistent source of truth.
- Update `docs/ACCESSIBILITY_IMPLEMENTATION_CHECKLIST.md` with verified reality vs checklist claims.

---

### 3.4 Settings & Preferences

**Repo reality (verified)**
- A dedicated settings page exists and composes accessibility + notifications + privacy + backup/export surfaces (`src/pages/SettingsPage.tsx`).
- Several preference toggles are wired end-to-end (stored + consumed in real UI).

**Status**: **Partial**

**Next step**
- Continue a “toggle audit” pass: for each visible setting, record where it is stored and where it has runtime effect (or mark as inert).

---

## Tier 4–5 — Medium Priority (Data Quality + UX)

These items should be tracked as issues once Tier 1 claims are honest.

- Medication effectiveness correctness (unit tests + edge cases)
- Trigger analysis minimum observation thresholds + confounding warnings
- Body map interactivity + region analytics
- Onboarding + IA cleanup (remove duplicates, hide “coming soon” tabs when empty)

---

## Recommended Sequencing (Practical)

1. **Claims alignment**: Update landing/app wording to match what exists.
  - In progress: removed/softened “AI-powered” and “clinical-grade” claims in primary landing and in-app taglines (e.g. `src/pages/LandingPage.tsx`, `src/components/landing/*`, `src/design-system/brand.ts`, key headers).
2. **Export verification**: Confirm CSV/PDF/FHIR output quality and data deletion UX.
3. **Medication + mood rigor**: Fix any constant effectiveness and add minimum‑sample warnings.
4. **Crisis support**: Strengthen resources UX before expanding detection.
5. **Clinician track decision**: local‑share vs real portal (cloud/on‑prem).

## Open Questions (Need Product Decision)

- What jurisdictions must crisis resources support (US/CA/global)?
- “Clinician Portal” target: local export workflow or networked SaaS?
- Are medication interaction warnings in scope, given safety/liability?
