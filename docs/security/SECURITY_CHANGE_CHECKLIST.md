# Security Change Checklist

This repo is healthcare software with a security-first, offline-first architecture. Use this checklist for any PR that touches encryption, storage, exports, audit logging, or PHI/PII handling.

## When this checklist is required

Run this checklist if your change touches any of:

- Encryption, key management, vault behavior: `src/services/EncryptionService.ts`, `src/services/KeyManagement.ts`, `src/services/VaultService.ts`, `src/services/SecurityService.ts`
- HIPAA-aligned audit logging / compliance: `src/services/HIPAACompliance.ts`, `src/services/AuditLogger.ts`, `src/services/SecureAuditSink.ts`
- Local persistence and offline sync: `src/stores/pain-tracker-store.ts` (persist), `src/stores/pain-tracker-migrations.ts`, `src/lib/offline-storage.ts`, `src/lib/storage/encryptedIndexedDB.ts`
- Export pipelines and report generation: `src/services/PDFExportService.ts`, `src/services/ClinicalPDFExporter.ts`, `src/services/ReportGenerationService.ts`, `src/services/wcb-submission.ts`, `src/utils/pain-tracker/wcb-export` (if present)
- Any “migration” or “recovery” tooling: `src/tools/migrate-legacy-encryption.ts`, store migration tests under `src/test/stores/`

If you are unsure, assume it applies.

## Stop-and-ask (human review required)

Do not merge without human review if you:

- Change cryptographic primitives, modes, parameters, key derivation, or key storage
- Change how/where encryption keys are persisted or unlocked
- Change what is considered “sensitive” or how PHI/PII is detected/handled
- Change audit event structure/retention semantics for data operations

## Pre-flight

- Run `make doctor`
- Run `make test` (or at minimum, the most relevant focused tests)
- Run `npm run -s check-security` (includes privacy gates + consent-gating tests)

## Checklist

### 1) Data classification

- [ ] List the data fields you touched (e.g., pain entries, mood entries, emergency data, reports).
- [ ] Confirm whether any touched fields could be PHI/PII (assume “yes” unless clearly not).

### 2) Data flow + storage inventory

- [ ] Note the storage layer(s) affected:
  - `zustand` persisted store (`pain-tracker-storage` key; migration via `migratePainTrackerState`)
  - `OfflineStorageService` IndexedDB (`pain-tracker-offline`)
  - Vault-backed encrypted IndexedDB (`src/lib/storage/encryptedIndexedDB.ts`)
- [ ] Ensure sensitive payloads are encrypted at rest where intended (and never stored in plaintext “by accident”).

### 3) Threat model (small and explicit)

- [ ] Identify attacker model(s): local device access, XSS, malicious extension, stolen browser profile, etc.
- [ ] Identify assets at risk: pain history, emergency contacts, exported reports, keys.
- [ ] State what mitigations the change relies on (CSP, encryption-at-rest, consent gates, audit logs).

### 4) Audit trail correctness (CRUD + export)

- [ ] For create/update/delete/export of user data, confirm an audit event is emitted (see patterns in `src/stores/pain-tracker-store.ts`).
- [ ] Ensure audit event details do not leak sensitive payloads (prefer metadata/ids over raw content).

### 5) Backward compatibility + migrations

- [ ] If stored formats changed, add/adjust a migration:
  - Zustand persist migrations: `src/stores/pain-tracker-migrations.ts`
  - IndexedDB record migrations: `src/lib/storage/encryptedIndexedDB.ts` and tools like `src/tools/migrate-legacy-encryption.ts`
- [ ] Include a safe fallback behavior (do not brick the app on unknown/legacy records).
- [ ] If a migration writes data, confirm there is a backup/export path (see `migrate-legacy-encryption.ts`).

### 6) Testing

- [ ] Add/adjust unit tests for:
  - encryption/decryption round-trips and tamper failures (see `src/test/encryption-webcrypto.test.ts`)
  - IndexedDB integration (see `src/test/integration/encryption-indexeddb.test.ts`)
  - store migrations (see `src/test/stores/migration.test.ts` and `src/test/stores/persist-migrate.test.ts`)
- [ ] Ensure tests run in jsdom with the IndexedDB polyfill (`src/test/setup.ts`).

### 7) Documentation

- [ ] Update `SECURITY.md` if the change affects CSP, scan triage, or security posture.
- [ ] Update `docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md` if the change affects persistence or migration behavior.

## PR template snippet (optional)

Copy into the PR description:

- Security checklist: ✅/❌
- Affected storage layers: localStorage persist / IndexedDB offline / encrypted IndexedDB
- Migration required: yes/no (where)
- Tests added/updated: (files)
- Human security review required: yes/noproceed

