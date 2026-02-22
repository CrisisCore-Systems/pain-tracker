# PainTracker.ca ↔ Overton v0.2 Control Mapping (Repo-Grounded)

**Status:** working draft (engineering-facing)

See also: `docs/engineering/checklists/paintracker-overton-v1.3-compliance-matrix.md` (living matrix; implemented/evidence/gaps/human-review).

**Purpose:** Map PainTracker’s current implementation surfaces to the Overton v0.2 Companion control families (PC‑1..PC‑6) to support accurate claims, scoped assessments, and remediation planning.

**Non-overclaim rule:** This mapping is descriptive. If a control is not clearly implemented, mark it as **UNKNOWN** or **NOT IMPLEMENTED**.

---

## Assessed profile (default)

This mapping assumes the PainTracker PWA profile where Essential Operations are:

- Create/view/edit entries
- View local trends/insights/visualizations
- Generate offline exports: CSV/JSON/PDF
- Generate WorkSafeBC PDF export offline (only if claimed)
- Enter/exit panic/crisis low-stimulus features

Network-capable features (weather capture, WCB submission, Stripe checkout, etc.) are treated as **non-essential** unless explicitly claimed otherwise.

---

## PC‑1 Local Authority Controls (Failure Containment)

- **PC‑1.1 Offline Essential Operations** — **LIKELY**
  - Evidence anchors:
    - Offline-first claim narrative: `docs/notes/cmlazyqfe000a02jogpqh76ng.md`
    - PWA infra: `src/utils/pwa-utils.ts`
  - Remaining work:
    - Level A run: perform Essential Operations with devtools “Offline”, including reload/restart.

- **PC‑1.2 Local read/create without remote services** — **LIKELY**
  - Evidence anchors:
    - Local export implementations are client-side: `src/utils/pain-tracker/export.ts`, `src/utils/pain-tracker/wcb-export.ts`
  - Remaining work:
    - Verify no flows require remote identity to open/create entries.

---

## PC‑2 Reversibility Controls (Radical Reversibility)

- **PC‑2.1 Destructive actions reversible within window** — **UNKNOWN**
  - Known deletion/clear surfaces are documented in `docs/security/EXPORT_AND_DELETION_AUDIT.md`.
  - Key clearing routine exists:
    - `src/utils/clear-all-user-data.ts` (clears in-memory store, Zustand persist key, PWA/IndexedDB layers, and legacy raw key)
  - Remaining work:
    - Enumerate destructive actions exposed in UI and declare restoration windows (or explicitly mark irreversible).

- **PC‑2.2 Offline recovery without vendor intervention** — **UNKNOWN**
  - Remaining work:
    - Confirm any restore/undo flows work offline.

- **PC‑2.3 Temporal buffering for irreversible outcomes** — **UNKNOWN**
  - Remaining work:
    - Determine whether any hard-delete/GC paths exist and whether they are staged.

---

## PC‑3 Exposure Minimization Controls (Minimum Necessary Exposure)

- **PC‑3.1 No plaintext content egress (except explicit carve-outs)** — **UNKNOWN (needs scoped testing)**
  - Known network-capable features exist:
    - Weather fetch + geolocation (opt-in): `src/services/weatherAutoCapture.ts`, `src/services/weather.ts`
    - WCB submission service: `src/services/wcb-submission.ts`
    - Stripe checkout: `src/utils/stripe-checkout.ts`
  - Remaining work:
    - Define what is “in scope” for Essential Operations, then run network-capture checks for those workflows.

- **PC‑3.2 Telemetry optional, minimized, no bypass** — **PARTIALLY IMPLEMENTED**
  - Evidence anchors:
    - Consent + env gating for GA4 script load: `src/analytics/analytics-loader.ts`
    - Enforcement tests: `src/analytics/analytics-loader.test.ts`, `src/analytics/analytics-gate.test.ts`
    - Doc red-zones for consent/claims: `docs/security/DOCS_REVIEW_RED_ZONES.md`
  - Remaining work:
    - Confirm no analytics events are emitted when env disabled/consent absent (beyond script load).

---

## PC‑4 Crisis UX Controls (Cognitive Load Preservation)

- **PC‑4.1 Accessible mechanism to enter/exit protective interaction modes** — **PARTIALLY IMPLEMENTED**
  - Evidence anchors:
    - Panic mode component + accessibility tests: `src/components/accessibility/PanicMode.tsx`, `src/test/accessibility.test.tsx`
    - Crisis integration scaffolding: `src/components/accessibility/CrisisModeIntegration.tsx`
  - Notes:
    - Panic Mode applies a temporary, non-persistent **Automatic Zoom** override (base font + touch target multiplier) while the overlay is active via `--ti-zoom-multiplier`.

- **PC‑4.2 Suppress nonessential prompts; Safe Exit predictable** — **PARTIALLY IMPLEMENTED**
  - Recent fix:
    - The Crisis Alert Banner “Exit Crisis Mode” action is now wired to actually exit by deactivating emergency mode: `src/components/accessibility/CrisisModeIntegration.tsx`.
  - Remaining work:
    - Validate exit affordance is consistently reachable under stress variants and doesn’t get blocked by prompts/modals.

---

## PC‑5 Coercion and Duress Controls (Asymmetric Power Defense)

- **PC‑5.1 User-controlled duress/concealment mechanism** — **PARTIAL (duress support), NOT IMPLEMENTED (concealment)**
  - Evidence anchors:
    - Panic mode (low-stimulus / cognitive support): `src/components/accessibility/PanicMode.tsx`
  - Notes:
    - Panic/crisis support can satisfy “duress” for cognitive load preservation, but it is not the same as neutral presentation/concealment.

- **PC‑5.2 Offline export in non-proprietary formats** — **IMPLEMENTED**
  - Evidence anchors:
    - Reports UI: `src/components/reports/ReportsPage.tsx`
    - Export functions: `src/utils/pain-tracker/export.ts`, `src/utils/pain-tracker/wcb-export.ts`

- **PC‑5.3 Neutral presentation tell minimization** — **NOT IMPLEMENTED (as a product feature)**
  - Framework readiness:
    - The Overton Companion includes scaled tell evaluation and timing/latency tell guidance, but PainTracker must implement a neutral presentation mode before this control applies to product behavior.

- **PC‑5.4 User-triggered cryptographic erasure** — **UNKNOWN / SECURITY-CRITICAL**
  - Related surfaces:
    - Vault kill-switch and emergency wipe exist, but requirements/guarantees must be verified carefully before claiming alignment.

---

## PC‑6 Supply Chain and Update Integrity Controls

- **PC‑6.1 Authenticated updates + change-control** — **UNKNOWN (process-level)**
- **PC‑6.2 SBOM/dependency pinning for traceability** — **UNKNOWN (process-level)**
- **PC‑6.3 Reproducible builds or independent verification path** — **UNKNOWN (process-level)**

---

## Next actions (practical)

1. Run the Level A checklist and produce an evidence packet:
   - `docs/engineering/checklists/paintracker-overton-v0.2-level-a-self-assessment.md`
2. Decide whether PainTracker is claiming Overton PC‑5 neutral presentation / concealment; if yes, plan a dedicated feature + human-factors testing.
3. If public claims include “no network calls” or “zero analytics”, reconcile with known opt-in weather and GA4 gating and update claims accordingly.
