# CrisisCore Security Chokepoints (PainTracker)

This document is the **regression doctrine**: the 5–8 places where a “small” change can quietly turn PainTracker into a different kind of system.

If you touch any chokepoint file, keep the **Invariants** true and update/extend the **Regression tests**.

## Scope & threat model shorthand

- **Class A**: health data (pain entries, symptoms, meds, mood, notes, exports/backups)
- **Primary adversary**: XSS within our origin (plus malicious extensions). If XSS happens: assume local compromise.
- **Design posture**: local-first, minimal egress, explicit user-controlled export boundaries.

---

## 1) `src/lib/background-sync.ts`

### Invariants

- **Exact method+path allowlist** enforced at **enqueue AND replay**.
- **Same-origin only** (no baseUrl overrides that permit cross-origin).
- **No wildcard `/api/*`** permissions.
- **Drop + delete** disallowed queue items (no “skip but keep”).
- **Header allowlist only** for replay; do not replay arbitrary headers.

### Regression tests

- `src/test/background-sync-guard.test.ts` must keep:
  - same-origin but not allowlisted route is dropped
  - allowlisted route replays successfully
  - disallowed headers are stripped (if/when header allowlist is added)
  - queue items removed after drop

---

## 2) `src/components/settings/BackupSettings.tsx`

### Invariants

- **Settings-only** backup (Model A). Not a storage snapshot.
- Strict envelope: `{ schema, version, createdAt, data }`.
- **Allowlist + hard deny** applied on export AND import.
- **No writes** until preview is shown and user types confirm token `IMPORT`.
- Limits enforced:
  - file size <= 2MB
  - keys <= 200
  - value <= 100KB

### Regression tests

- Policy layer should be testable independent of UI. If policy logic is embedded in the component, extract to `src/lib/backup/*`.
- Required tests:
  - denied keys are never exported
  - denied keys are never imported
  - invalid schema/version rejected
  - import plan does not write without confirm token

---

## 3) `src/lib/offline-storage.ts`

### Invariants

- Treat IndexedDB as **Class A**: any new store or new data type must answer:
  - is it encrypted at rest? if not, what is the justification and minimization?
- Sync queue storage must never become a generalized **request replay cache**.
- Any migration path must be **bounded** (caps, pruning, no unbounded growth).

### Regression tests

- Queue items are bounded/prunable.
- Queue cannot store non-allowlisted route (enforced by the BackgroundSync chokepoint).
- Large payloads rejected (or demonstrably bounded).

---

## 4) `src/lib/storage/secureStorage.ts`

### Invariants

- Reject prototype-pollution keys (`__proto__`, `constructor`, etc.).
- Per-item size guard remains in place (or is explicitly superseded).
- No convenience method that mass-imports arbitrary keys without policy checks.

### Regression tests

- rejects dangerous key names
- rejects oversized payloads
- does not silently coerce types (string vs JSON behavior stays explicit)

---

## 5) `api/stripe/webhook.ts`

### Invariants

- Stripe signature verification is strict:
  - raw body preserved
  - `constructEvent` failures abort hard
- Webhook handler is **idempotent** and safe against replay.
- No logging of sensitive payload contents.

### Regression tests

- invalid signature returns 400
- duplicate event does not double-apply
- missing env secrets fails closed

---

## 6) `api-lib/adminAuth.ts` + `api/clinic/auth/verify.ts` (and admin endpoints)

### Invariants

- Admin trust is **fail-closed**, not best-effort.
- Token verification uses timing-safe comparisons where applicable.
- Rate limits are abuse control, not auth.

### Special note

Admin UI stores bearer token in `localStorage`.

- Consequence: **XSS == admin compromise**.
- This is acceptable only if admin UI is intentionally low-exposure and XSS prevention remains a top priority.
- If you want reduced blast radius: use HttpOnly session cookies for admin auth, or move admin to separate origin.

---

## 7) `vercel.json` (headers, CSP, rewrites)

### Invariants

- Keep `connect-src 'self'` (or equivalently narrow posture).
- Any external egress must go through a **same-origin chokepoint** (e.g. `/api/weather`).
- Any new rewrite is a new privacy boundary and needs review.

### Regression tests

- Assert CSP contains:
  - `default-src 'self'`
  - `connect-src 'self'`
- Assert CSP does not broaden unintentionally (e.g. `script-src *`).

---

## 8) Second backup channel: `src/hooks/usePainTrackerStorage.ts` + `src/utils/pwa-utils.ts`

### Invariants (must decide and lock)

There are currently two export/import channels:

- Settings backup (hardened)
- Offline data export/import (entries + settings) which is a Class A restore path

Pick a coherent posture and enforce it:

- **Option A (recommended)**: Offline data export/import becomes a **Vault Export** (encrypted + versioned + bounded + explicit).
- **Option B**: Offline data export/import is dev-only / advanced-only behind scary UI and strict limits.

### Regression tests

- offline import rejects unexpected shape
- offline import has size caps + count caps
- offline import cannot write to secureStorage except approved keys

---

## Tiny CI guardrail

We keep small unit tests that fail if:

- Background sync allowlist becomes wildcard
- Backup policy allow/deny/envelope is removed
- CSP broadens beyond our constraints
