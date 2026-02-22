# Overton v1.3 — Human Review “Implementation Gates” (Red-Zone) — 2026-02-20

This document is a **review checklist**, not an implementation plan.

It exists because several Overton v1.3 items require changes inside security-critical boundaries (Class A data semantics, crypto/key handling, service worker + CSP, export/report pipelines, and any network/telemetry).

Per `.github/copilot-instructions.md`, the agent must **stop and request human review** before implementing any of the items below.

## What this is for

- Convert the “needs human review before implementation” bullets into **explicit decisions + verifications**.
- Prevent overclaiming by tying any future claims to:
  - concrete behavior,
  - code pointers,
  - and reproducible evidence.

## Gate A — Radical Reversibility (PC-2) / Class A deletion semantics

### Current repo reality (inventory)

- Store-level clear (in-memory):
  - `usePainTrackerStore.getState().clearAllData()` clears entries + related slices.
  - See: `src/stores/pain-tracker-store.ts` (method `clearAllData`).

- Persisted state clear (Zustand persist + localStorage key):
  - Persist key name: `pain-tracker-storage`
  - Best-effort clear: `persist.clearStorage()` and `localStorage.removeItem('pain-tracker-storage')`
  - See: `src/utils/clear-all-user-data.ts`

- PWA/offline layer clear:
  - Clears SW caches + OfflineStorageService IndexedDB + additional DBs (e.g. `pain-tracker-tone`) + `secureStorage` namespaced keys.
  - See: `src/utils/pwa-utils.ts` (`PWAManager.clearPWAData`).

- Emergency wipe path:
  - `performEmergencyWipe(...)` → `clearAllUserData()`.
  - Trigger: Vault kill switch after failed unlock attempts (default ON).
  - See: `src/services/VaultService.ts`, `src/services/emergency-wipe.ts`, `src/utils/clear-all-user-data.ts`.

- Current documentation:
  - Delete/clear/export mapping: `docs/security/EXPORT_AND_DELETION_AUDIT.md`.

### Reviewer decisions required

1. **Define the reversibility contract** (what are we promising?):
   - soft-delete (tombstones) vs hard-delete
   - restore window duration
   - UX affordances (undo, “restore from trash”, export-before-delete)
   - what “irreversible” means for encrypted-at-rest data

2. **Define the “Delete all data” contract across layers**:
   - in-memory store state
   - persisted store (`pain-tracker-storage`)
   - `secureStorage` namespace (pt:*)
   - Offline IndexedDB + any “side DBs”
   - service worker caches

3. **Evidence requirements** (before making a claim):
   - tests that demonstrate restore windows / undo (if claimed)
   - evidence packet artifacts showing deletion behaves as specified (without capturing Class A content)

### Non-negotiable safety constraints

- Any new retention/deletion semantics touching Class A must minimize reconstruction risk.
- Avoid writing logs that include free-text notes or export content.

## Gate B — Duress / Coercion defenses (PC-5 / “Asymmetric Power Defense”)

### Current repo reality (inventory)

- Panic Mode provides a protective interaction mode (cognitive-load preservation) but is **not** neutral presentation / concealment by itself.
  - Component: `src/components/accessibility/PanicMode.tsx`

- Existing red-zone candidate:
  - Vault kill switch + emergency wipe after repeated failed unlock attempts.
  - See: `src/services/VaultService.ts`, `src/services/emergency-wipe.ts`.

- Docs contain product-language about coercion/“hiding” that must be verified against actual behavior.
  - Search for coercion/panic/wipe claims under `docs/notes/` and `docs/product/`.

### Reviewer decisions required

1. Are we claiming **neutral presentation / concealment** as a product feature?
   - If **no**: do not claim PC-5.3-like behavior; document Panic Mode as a cognitive-load aid only.
   - If **yes**: define the threat model (who, what, when), success metrics (tell minimization), and required user testing.

2. Are we claiming **duress codes** / alternate unlock semantics?
   - If yes, requires careful design + auditability without creating new coercion risks.

3. Are we claiming **panic protocol / crypto erasure** guarantees?
   - If yes, ensure the current “best-effort wipe” is either sufficient or explicitly described as best-effort.

## Gate C — Crypto erasure / emergency wipe guarantees (PC-5.4)

### Current repo reality (inventory)

- Vault lock attempts trigger wipe at threshold:
  - `MAX_FAILED_UNLOCK_ATTEMPTS` path invokes `performEmergencyWipe('vault_failed_attempts')`.
  - Fail-safe: if wipe fails, vault metadata is still cleared.
  - See: `src/services/VaultService.ts`.

- Wipe implementation:
  - `performEmergencyWipe` calls `clearAllUserData`.
  - See: `src/services/emergency-wipe.ts`, `src/utils/clear-all-user-data.ts`.

### Reviewer verification checklist

- Confirm which keys are destroyed/removed and whether any encrypted blobs remain recoverable.
- Confirm whether SW caches can rehydrate sensitive UI state after a wipe.
- Confirm whether “wipe” language in product/docs needs to be softened to “best-effort wipe” (if appropriate).

## Gate D — CSP / Service Worker / Network boundaries (PC-1, PC-3)

### Current repo reality (inventory)

- WCB submission is disabled by default and requires explicit env flags.
  - UI gating: `src/components/pain-tracker/WCBReportPreview.tsx`
  - Network calls: `src/services/wcb-submission.ts`

- CSP/security config validation exists and includes warnings around production endpoint HTTPS.
  - See: `src/config/security.ts`

### Reviewer decisions required

- Define “Essential Operations” for any “no egress” claim scope.
- Decide what network-capable features are in-scope vs out-of-scope for Overton evidence.
- Any change to CSP, SW caching rules, or network defaults must be reviewed as security-critical.

## Gate E — Export/report pipeline (PC-5 portability + PC-3 exposure)

### Current repo reality (inventory)

- Export implementations + UI entry points are mapped in `docs/security/EXPORT_AND_DELETION_AUDIT.md`.
- Export paths may emit analytics events (review required to avoid exposure/overclaiming).

### Reviewer decisions required

- Define what export “portability” means (one contract vs multiple pipelines).
- Confirm whether analytics events on export are acceptable, and under what consent gates.
- Any changes to PDF/CSV/JSON formats or export templates require review.

## Outcome of this gate review

After reviewers decide the above, we can safely:

- break each gate into an implementation PR,
- add narrowly-scoped tests/evidence,
- and update the v1.3 matrix from **Unknown/Gaps** → **Implemented/Evidence** with reproducible artifacts.
