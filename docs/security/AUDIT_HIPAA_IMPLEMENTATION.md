# Audit & HIPAA Implementation (draft)

Purpose
- Describe a secure, append-only audit sink for privacy-sensitive events (DP budget consumption, PHI/PII detections, key rotations), retention and access control recommendations, and HIPAA alerting flow.

Design goals
- Immutable, append-only logs with cryptographic signing (HMAC or AES-GCM) to detect tampering.
- Minimal surface: only log event metadata (event type, timestamp, user id hash, metric, epsilon consumed) and a redacted sample when necessary.
- Access controls: logs stored in a secure storage (S3 with Object Lock or cloud KMS-backed blob store) with restricted ACLs and WG-approved retention.

Key components

- SecureAuditSink (interface + implementations)
  - `InMemoryAuditSink` for tests.
  - `FileAuditSink` (dev): append-only local file with HMAC signature per entry.
  - `CloudAuditSink` (prod): signed, versioned objects in cloud storage with server-side encryption and Object Lock/immutable retention where available.

- KeyManager
  - KMS-backed keys in production, in-memory stub for dev.
  - Key rotation policy: rotate yearly or on suspicion; old keys kept read-only for verification and log rehydration.

Event schema (compact)
- event_id: uuid
- timestamp: ISO8601
- event_type: string (e.g., "DP_BUDGET_CONSUMED", "PHI_DETECTED", "KEY_ROTATION")
- user_id_hash: HMAC(user_id, audit_key) // store only HMAC to avoid raw identifiers
- details: object (epsilon, metric, sensitivity, redaction_count, sample)
- signature: base64(hmac_sha256(audit_key, serialized_entry_without_signature))

Retention & access
- Minimum retention: 1 year (subject to legal/regulatory). Review with legal counsel.
- Access: RBAC via cloud IAM; provide read-only exports for security/audit teams; all accesses audited.

HIPAA alerting flow
- On PHI detection, create a high-priority audit event and (optionally) trigger a secure alert to Security/Privacy inbox (encrypted and logged).
- PHI detection should not store raw text in the audit log; instead, store redaction counts and a short, hashed sample (HMAC) for verification.

Tests & migration
- Unit tests for `InMemoryAuditSink` verifying append-only semantics, signature validity and replay protection.
- Integration test harness to run `FileAuditSink` and verify signatures using rotated keys.

Open questions for Security review
- Acceptable retention window?
- Production key storage choice (cloud KMS provider)?
- Legal/regulatory export/incident-reporting responsibilities.

Next steps
- Implement `SecureAuditSink` stub in `src/services` and add unit tests. Wire `EmpathyMetricsCollector` audit calls to this sink.
