# Audit Sink Implementation Notes

Purpose
- Document the current local-first secure audit persistence design.
- Provide a runbook for degraded reason codes so maintainers can troubleshoot safely.

Scope
- `src/services/SecureAuditSink.ts`
- `src/services/AuditLogger.ts`
- `src/components/security/AuditSinkAlertBridge.tsx`
- `src/utils/TeardownCoordinator.ts` (pre-IndexedDB shutdown hook)

## Current Architecture

### Storage model
- Primary sink: IndexedDB database `pain-tracker-audit`.
- Event store: `audit_events` (indexed by `timestamp`).
- Key store: `audit_keys` for active local HMAC key material.
- Browser-local only; no remote audit shipping in the default architecture.

### Integrity model
- Each appended audit event is signed with a local HMAC key via WebCrypto.
- Signature is generated from canonical event fields before persistence.
- Degraded writes fail closed with `AUDIT_SINK_DEGRADED` to prevent silent integrity drift.

### Resilience model
- Init failures are retryable (failed open does not permanently cache a rejected promise).
- Repeated init failures can trigger a short cooldown lockout to avoid aggressive retry loops.
- Quota pressure attempts bounded oldest-first pruning (10%) and retries write once.
- If recovery fails, the sink remains degraded and emits structured reason codes.

### Teardown alignment
- `SecureAuditSink.shutdown()` closes open DB handles and clears sink runtime references.
- `TeardownCoordinator` accepts `beforeIndexedDbTeardown` and calls this hook before deleting databases.

## Degraded Event Contract

Degraded events are emitted as `audit-sink-degraded` with telemetry-safe detail:

- `reasonCode`
- `at`
- `message` (sanitized guidance text)

Reason codes:
- `INDEXEDDB_UNAVAILABLE`
- `INIT_OPEN_FAILED`
- `INIT_LOCKOUT`
- `SIGNING_KEY_UNAVAILABLE`
- `QUOTA_RECOVERY_FAILED`
- `WRITE_FAILED`
- `UNKNOWN`

## Operator Runbook

- `INDEXEDDB_UNAVAILABLE`:
  - Likely unsupported/private browsing mode or restricted environment.
  - Action: move to supported browser profile/session.

- `INIT_OPEN_FAILED`:
  - Temporary IndexedDB open/lock issue.
  - Action: retry after short delay; verify storage availability.

- `INIT_LOCKOUT`:
  - Cooldown active after repeated init failures.
  - Action: wait for cooldown window, then retry.

- `SIGNING_KEY_UNAVAILABLE`:
  - WebCrypto or key retrieval/generation unavailable.
  - Action: restart app/session and confirm browser crypto support.

- `QUOTA_RECOVERY_FAILED`:
  - Device storage full and prune+retry did not recover capacity.
  - Action: free local space and retry; inspect repeated occurrences.

- `WRITE_FAILED`:
  - Non-quota write failure.
  - Action: monitor recovery events; treat persistent repeats as storage fault.

- `UNKNOWN`:
  - Unclassified failure.
  - Action: capture environment + browser details and escalate.

## Exposure Minimization Rules

- Do not emit raw IndexedDB/DOMException internals to user-facing alerts.
- Use reason codes and high-level remediation guidance only.
- Keep audit event payloads non-reconstructive (metadata over raw content).

## Verification Baseline

Keep these tests green for audit resilience:
- `src/services/__tests__/secure-audit-sink.degradation.test.ts`
- `src/services/__tests__/audit-sink.test.ts`
- `src/utils/__tests__/TeardownCoordinator.test.ts`
