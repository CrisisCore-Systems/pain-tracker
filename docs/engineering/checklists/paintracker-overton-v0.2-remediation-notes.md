# PainTracker.ca — Overton v0.2 Remediation Notes (Human-Review Items)

**Purpose:** Identify the gaps and decisions required to *claim* Overton-aligned protective properties without overclaiming. This file is intentionally conservative and flags red-zone work that requires human review.

**Hard-stop boundaries (per `.github/copilot-instructions.md`):** encryption/key handling, export/report formats, CSP/service worker/caching rules, new network calls/telemetry, and any new handling of Class A data.

---

## A) Profile decisions (required before engineering changes)

1. **Are we claiming coercion-grade concealment/neutral presentation?**
   - If **No**: keep PC‑5.1 satisfied only as “duress/cognitive-load” (panic mode) and do not claim neutral presentation (PC‑5.3) as a product feature.
   - If **Yes**: plan a dedicated neutral-presentation feature + human-factors evaluation protocol (naive/informed observers, plus timing/latency tell checks).

2. **Are we claiming “no network calls” globally?**
   - Current repo includes optional network-capable features (weather, WCB submission, Stripe checkout). Claims must be scoped (“Essential Operations work offline”) rather than absolute.

---

## B) PC‑2 (Reversibility) red-zone candidates

- **Deletion/clear semantics unification**
  - The repo has multiple storage layers (Zustand persist, `secureStorage` namespace, offline IndexedDB, service worker caches). A single “Delete all data” contract should specify exactly what is cleared and what is not.
  - Any changes here touch Class A handling and require human review.

- **Temporal buffering (PC‑2.3)**
  - If there are hard-delete/GC behaviors, decide on a dwell-time and reaffirmation pattern and then enforce it across all deletion pathways (UI, background maintenance, migrations).

---

## C) PC‑3 (Exposure / Telemetry) red-zone candidates

- **Telemetry policy truth-in-advertising**
  - GA4 script loading is gated by env + explicit consent, with tests in place.
  - Decide whether Settings-level “analytics consent” state must also gate *local* analytics event emission.
  - Any change to telemetry behavior or network calls requires human review.

- **Network feature scoping**
  - Weather capture: ensure opt-in remains default-off and is clearly disclosed.
  - WCB submission: if it remains in product, it must be very explicitly separated from “local-only” claims.

---

## D) PC‑5 (Coercion / Erasure) red-zone candidates

- **Cryptographic erasure vs emergency wipe guarantees (PC‑5.4)**
  - There are existing “emergency wipe / kill switch” surfaces.
  - Before claiming Overton alignment, create a disclosure artifact (“what is erased/disabled; what remains; recovery; bounded guarantees”), and validate with the PC‑5.4 walkthrough steps.
  - Changes to the vault/encryption boundary are human-review required.

---

## E) PC‑6 (Supply chain / integrity) process work

- If PainTracker plans to claim audit-grade properties, define:
  - change-control policy for security-critical paths
  - dependency diff review process
  - release artifacts and (optionally) SBOM
  - build verification expectations

---

## Recommended path to “Overton-aligned claims”

1. Run the Level A checklist and generate an evidence packet for the current release.
2. Publish only scoped claims supported by evidence (Level A).
3. Decide which red-zone items are required for your target protective claims (especially PC‑5 concealment and PC‑5.4 erasure guarantees).
4. Schedule human-reviewed implementation work for any red-zone changes.
