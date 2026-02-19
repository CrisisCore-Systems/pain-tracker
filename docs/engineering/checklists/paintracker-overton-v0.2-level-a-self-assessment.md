# PainTracker.ca — Overton v0.2 Level A Self‑Assessment Checklist (Draft)

**Evidence tier:** Level A (self-assessed / community)

**Purpose:** A repo-grounded, reproducible self-check against the Overton v0.2 Implementation & Evidence Companion control families (PC‑1..PC‑6). This checklist is designed to prevent overclaiming by separating **what is implemented**, **what was tested**, and **what remains unknown**.

**Scope note:** This document proposes no product changes. Where results are unknown, mark **TODO/UNKNOWN** rather than inferring.

**Hard stop reminder:** Anything touching encryption/key handling, export formats, CSP/service worker/caching, or new network/telemetry behavior is a human-review boundary per `.github/copilot-instructions.md`.

---

## 0) What profile is being assessed?

Fill this in before running the checklist:

- **App variant:** PainTracker PWA (browser install)
- **Build environment:** `development` / `staging` / `production`
- **Commit / build hash:** (paste)
- **Offline guarantee window (declared):** (e.g., “indefinite after install”, or “X days without update”) — **must be explicitly declared**
- **Essential Operations (declared):** list the exact workflows considered “Essential Operations” for this assessment.
   - Default PainTracker profile (edit only if you are narrowing/broadening public claims):
      - Create a pain entry
      - View previous entries (timeline/history)
      - Edit an existing entry
      - View local trends/insights/visualizations
      - Generate offline exports: CSV, JSON, PDF
      - Generate the WorkSafeBC PDF report offline (if this is part of your public “Worksafebc export” claim set)
      - Access and exit low-stimulus crisis/panic features (entry + predictable exit)

- **Explicit non-essential / out-of-scope surfaces (record as such unless you deliberately claim them):**
   - Any network-backed submission flows (e.g., WCB submission) and any remote identity/authorization dependency.
   - Weather/geolocation enrichment (if present/enabled): treat as a separate, network-capable feature.

**Repo anchors (for evidence):**
- Offline + local-first claims: `docs/notes/cmlazyqfe000a02jogpqh76ng.md`
- Export surfaces + delete semantics: `docs/security/EXPORT_AND_DELETION_AUDIT.md`
- Analytics/telemetry accuracy red-zones: `docs/security/DOCS_REVIEW_RED_ZONES.md`

---

## 1) PC‑1 Local Authority Controls (Failure Containment)

### PC‑1.1 Essential Operations succeed offline

**Evidence to collect**
- Screenshot/video: PWA installed and running with network disabled.
- Short written “offline guarantee window” statement for the assessed build.

**Manual test procedure (Level A)**
1. Install/open the PWA.
2. Disable network (OS airplane mode or browser devtools “Offline”).
3. Perform each declared Essential Operation end-to-end.
4. Close the app/tab; reopen with network still disabled.
5. Repeat the Essential Operations.

**Pass criteria**
- No Essential Operation requires network connectivity.

**Fail criteria**
- Any Essential Operation is blocked, nags into failure, or requires remote identity/services.

**Status:** PASS / FAIL / TODO

### PC‑1.2 Loss of remote services does not deny local read/create

**Evidence to collect**
- Notes from the offline test confirming existing data remains readable.

**Manual test procedure (Level A)**
1. With network disabled, verify you can read historical entries.
2. Create new entries and verify they persist after reload/restart.

**Status:** PASS / FAIL / TODO

---

## 2) PC‑2 Reversibility Controls (Radical Reversibility)

**Repo reality check:** Current delete/clear semantics are documented in `docs/security/EXPORT_AND_DELETION_AUDIT.md` (multiple storage layers exist: Zustand persist key, `secureStorage` namespace, IndexedDB/offline store, service-worker caches).

### PC‑2.1 Destructive Actions reversible within a restoration window

**Evidence to collect**
- A list of destructive actions exposed in the UI (delete entry, bulk delete, “clear all data”, etc.).
- A declared restoration window for each destructive action (or explicit “irreversible”).

**Manual test procedure (Level A)**
1. Create a small dataset (5–10 representative entries).
2. Perform each destructive action.
3. Attempt restore/undo within the claimed restoration window.
4. Repeat after reload/restart.

**Status:** PASS / FAIL / TODO

### PC‑2.2 Recovery is offline and does not require vendor intervention

**Manual test procedure (Level A)**
- Repeat the PC‑2.1 restore checks with network disabled.

**Status:** PASS / FAIL / TODO

### PC‑2.3 Temporal buffering for irreversible outcomes

**Manual test procedure (Level A)**
1. Identify any irreversible delete/GC behavior.
2. Simulate degraded conditions (stress + interruption):
   - network disabled
   - reload/restart mid-flow
3. Attempt irreversible finalization.

**Pass criteria**
- Irreversible finalization requires explicit reaffirmation after dwell time and/or stable return.

**Status:** PASS / FAIL / TODO

---

## 3) PC‑3 Exposure Minimization Controls (Minimum Necessary Exposure)

### PC‑3.1 No plaintext user content egress

**Evidence to collect**
- A short inventory of **all** network-capable features actually present (even if disabled by default).
  - Known red-zones include weather auto-capture and any WCB submission service per `docs/security/DOCS_REVIEW_RED_ZONES.md`.

**Manual test procedure (Level A)**
1. Open browser devtools Network tab.
2. Use the app normally for a short workflow suite (create/edit entries, view reports, export).
3. Inspect requests (URLs, payloads) and confirm no Protected Record plaintext leaves the device.

**Status:** PASS / FAIL / TODO

### PC‑3.2 Telemetry is optional and minimized; no covert bypass when telemetry-off

**Repo anchors**
- GA4 script loader gates on env + consent: `src/analytics/analytics-loader.ts`.
- Documentation warns of consent-gating pitfalls and workflow reality: `docs/security/DOCS_REVIEW_RED_ZONES.md`.

**Manual test procedure (Level A)**
Run three cases and record screenshots of Network requests:

- **Case A (telemetry-off by default):** Ensure `VITE_ENABLE_ANALYTICS` is absent/false; clear `pain-tracker:analytics-consent`; reload. Confirm no GA4 script loads.
- **Case B (env enabled, consent not granted):** Set `VITE_ENABLE_ANALYTICS='true'` but do not grant consent. Confirm no GA4 script loads.
- **Case C (env enabled, consent granted):** Grant consent and confirm GA4 loads only after consent.

**Fail criteria**
- Remote analytics script loads without explicit consent, or telemetry-off is bypassed via background beacons.

**Status:** PASS / FAIL / TODO

---

## 4) PC‑4 Crisis UX Controls (Cognitive Load Preservation)

**Repo anchors**
- Crisis integration scaffolding exists: `src/components/accessibility/CrisisModeIntegration.tsx`.
- Panic mode component + accessibility tests exist: `src/components/accessibility/PanicMode.tsx`, `src/test/accessibility.test.tsx`.

### PC‑4.1 Accessible mechanism to enter/exit protective interaction modes

**Manual test procedure (Level A)**
1. Verify entry into “panic/crisis” affordances using:
   - keyboard only
   - screen reader basics (role/name discoverability)
   - large target / constrained input
2. Verify exit/close is predictable and does not require fine motor actions.

**Status:** PASS / FAIL / TODO

### PC‑4.2 Suppress nonessential prompts; Safe Exit predictable

**Manual test procedure (Level A)**
1. Enter panic/crisis mode.
2. Trigger common actions (export, navigate, close dialogs) and confirm no unexpected prompts block exit.

**Status:** PASS / FAIL / TODO

---

## 5) PC‑5 Coercion and Duress Controls (Asymmetric Power Defense)

### PC‑5.1 User-controlled duress/concealment mechanism

**Assessment note:** PainTracker includes “Panic Mode” features oriented to low-stimulus use. Determine whether any **coercion/neutral presentation** mode exists as defined by the Overton Companion (and document exactly what it does).

**Manual test procedure (Level A)**
- Identify the user-triggered mechanism(s) intended for protective interaction under coercion/duress.

**Status:** PASS / FAIL / TODO

### PC‑5.2 Offline export in non-proprietary formats

**Repo anchors**
- Reports & Export UI: `src/components/reports/ReportsPage.tsx`
- Export implementations and portability notes: `docs/security/EXPORT_AND_DELETION_AUDIT.md`

**Manual test procedure (Level A)**
1. Disable network.
2. Generate CSV, JSON, and PDF exports.
3. Confirm:
   - downloads succeed offline
   - CSV opens in a spreadsheet app
   - JSON is valid JSON

**Status:** PASS / FAIL / TODO

### PC‑5.3 Neutral presentation avoids coercion-relevant tells

**Manual test procedure (Level A)**
1. If a neutral presentation mode exists, run a “spot the difference” test:
   - at least 2 naive observers
   - no prompting
2. Record any cues flagged independently by both observers as “consistent tells.”

**Status:** PASS / FAIL / TODO

### PC‑5.4 User-triggered cryptographic erasure routine

**Important:** This is a security-critical boundary. Do not claim support unless there is a specific, user-triggered key-destruction/disable routine with disclosed guarantees.

**Manual test procedure (Level A)**
- If implemented, follow the Companion’s walkthrough procedure (PC‑5.4) and record the first failing step.

**Status:** PASS / FAIL / TODO

---

## 6) PC‑6 Supply Chain and Update Integrity Controls

**Level A posture:** record what exists; do not overclaim.

**Manual checks (Level A)**
- Are security-critical changes subject to explicit change-control?
- Are dependencies pinned and reviewable?
- Is there any documented build verification path for releases?

**Status:** PASS / FAIL / TODO

---

## 7) Level A Claim Template (use verbatim if publishing results)

> This assessment is **Level A (self-assessed)** against the Overton v0.2 Implementation & Evidence Companion. It reflects scripted manual tests and repo inspection only. Results are not audit-grade and do not prove the absence of covert signals or advanced forensic recovery. Any protections described are bounded by the threat model and documented exclusions.

---

## 8) Level A Evidence Packet Template (1 page)

Use this template to produce a shareable, reviewer-friendly bundle. The goal is **reproducibility**, not completeness.

**Packet metadata**
- Date/time (local):
- Tester(s):
- Device(s) and OS:
- Browser and version:
- App version + commit/build hash:
- Build environment: `development` / `staging` / `production`
- Declared offline guarantee window:
- Declared Essential Operations list:

**Optional automation (safe / local-only)**

This repo includes a helper that runs the Playwright evidence suite and writes artifacts into the recommended folder structure.

PowerShell (from repo root):

```powershell
./scripts/run-overton-level-a-evidence.ps1 -EnvName dev
```

Notes:
- This populates `00-scope.md`, `01-offline/`, `02-exports/`, `04-crisis-ux/`, and creates a `03-telemetry/` folder with instructions.
- Telemetry evidence (PC‑3.2) still requires **manual** Network-tab screenshots for the three consent/env cases.

**Folder naming**
- `evidence/overton-level-a/YYYY-MM-DD_<env>_<build-hash>/`

**Required artifacts (minimum)**
- `00-scope.md`: the filled-in Section 0 profile block (as text).
- `01-offline.mp4` (or screenshots): network disabled; perform Essential Operations end-to-end (PC‑1).
- `02-exports/`
   - `export.csv`
   - `export.json`
   - `report.pdf`
   - (optional) `worksafe-bc.pdf` if in-scope
- `03-telemetry/`
   - screenshots of Network tab for the three telemetry cases (PC‑3.2)
   - note stating `VITE_ENABLE_ANALYTICS` value and consent state used
- `04-crisis-ux.mp4` (or screenshots): enter/exit panic/crisis features via keyboard-only and demonstrate predictable exit (PC‑4).

**Results summary (fill in)**
- PC‑1 status: PASS / FAIL / TODO (failing step if FAIL)
- PC‑2 status: PASS / FAIL / TODO (failing step if FAIL)
- PC‑3 status: PASS / FAIL / TODO (failing step if FAIL)
- PC‑4 status: PASS / FAIL / TODO (failing step if FAIL)
- PC‑5 status: PASS / FAIL / TODO (note whether neutral presentation and crypto-erasure are implemented)
- PC‑6 status: PASS / FAIL / TODO

**Non-overclaim checklist (must answer Yes/No)**
- Did we explicitly label this as **Level A self-assessed**? Yes/No
- Did we avoid “no network calls” claims if any optional network features exist? Yes/No
- Did we avoid crypto/key-handling claims not verified in code/tests? Yes/No
