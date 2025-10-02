# Threat Model: Quantified Empathy Data Flow

Scope: the EmpathyMetricsCollector, EmpathyIntelligenceEngine, RealTimeEmpathyMonitor, and downstream storage/exports for QuantifiedEmpathyMetrics.

Summary: This document enumerates likely threats (STRIDE), assets, trust boundaries, and mitigations for the empathy metrics pipeline. It is intended as a review artifact for security and architecture teams.

Assets
- Raw user notes (free text) — HIGH sensitivity (may contain PII/PHI)
- PainEntry / MoodEntry baseline numeric data — MEDIUM sensitivity
- Derived QuantifiedEmpathyMetrics — MEDIUM
- Audit logs & retention metadata — HIGH

Trust Boundaries
- UI ↔ EmpathyMetricsCollector (consent signal, raw notes)
- Collector ↔ AnalyticsEngine (sanitized data)
- In-memory stores ↔ Persisted stores (hashed keys, retention)

STRIDE threats and mitigations

- Spoofing: attacker impersonates a user to submit fabricated entries.
  - Mitigations: require authenticated requests or session tokens; rate-limit submissions; log and monitor anomalous user activity.

- Tampering: alteration of metrics or audit logs.
  - Mitigations: immutable audit logs, HMAC-signed events, restrict write privileges, CI checks for code that mutates persisted metrics.

- Repudiation: user or system denies operations (e.g., deletion/export).
  - Mitigations: include signed audit trail entries with timestamps and operation types; preserve minimal metadata on deletions.

- Information disclosure: leakage of raw notes, emails, phone numbers.
  - Mitigations: redact PII at collector boundary, never persist raw notes without explicit consent & encryption; persist only hashed or numeric aggregates when privacy mode enabled.

- Denial of Service: large text fields or many submissions causing resource exhaustion.
  - Mitigations: length caps (current 2000 chars), quota limits per user, input validation.

- Elevation of Privilege: analytics workers exfiltrate raw text or bypass sanitization.
  - Mitigations: separation of privileges, code review for analytics modules, tests ensuring sanitized outputs, restrict analytics runtime permissions.

Additional notes
- Differential privacy: plan to replace uniform noise with Laplace mechanism and track epsilon budget. Current implementation is a placeholder and must be reviewed before production.
  - Current repo artifacts: `src/services/EmpathyMetricsCollector.ts` contains `METRIC_SENSITIVITY` map (conservative defaults) and the Laplace noise implementation.
  - Tests: `src/services/__tests__/sensitivity-noise.test.ts` demonstrates that higher sensitivity increases average noise magnitude; reviewers should inspect and accept the sensitivity values.
  - Policy: see `docs/DP_POLICY.md` for recommended sensitivities and epsilon budgets (draft).
  - HIPAA: a minimal `src/services/HIPAACompliance.ts` stub exists for PHI detection; security must review and expand detectors and logging behavior.
- Consent: collector enforces consentRequired flag from SecurityService; UI must provide explicit consent flows and allow revocation.

Security sign-off required:
- Approve default epsilon and sensitivity assumptions used by the collector.
- Approve Key Management approach (KMS vs in-memory stub) and rotation policy.
- Approve audit log retention and signing format for DP budget events.

Review checklist for human approvers
- Confirm PII regex list and expand to cover emails, phones, addresses, national IDs.
- Approve noise model and epsilon budget for DP if used in production.
- Validate retention policy for in-memory and persisted stores.
- Approve audit logging format and storage lifecycle.

Next steps
- Security/architecture team to review and sign off. After approval implement production-grade crypto, key management, and rigorous DP mechanism.
