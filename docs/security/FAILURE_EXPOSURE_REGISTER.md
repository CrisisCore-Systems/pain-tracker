# Failure & Exposure Register

This register captures known and likely failure modes that impact privacy, security, and
compliance posture.

It is designed to answer three questions:

- What are the biggest **privacy and compliance risks**?
- What **procedural/human-error failure modes** create real-world harm?
- What **"looks fine until it isnt"** conditions can quietly accumulate into exposure?

This document is not legal advice. It is an engineering and operational inventory.

## How to Use This Register

- Consult this before changes that touch: encryption, persistence, exports, analytics,
  service workers, clinic/FHIR, WCB submission, or any device capability (voice,
  clipboard, notifications, geolocation).
- For each item, treat **mitigations** as requirements and **signals** as your early
  warning system.
- When adding a new entry, prefer concrete call sites and storage surfaces.

See also:

- [docs/security/DATA_FLOW_MAP.md](docs/security/DATA_FLOW_MAP.md)
- [docs/security/DOCS_REVIEW_RED_ZONES.md](docs/security/DOCS_REVIEW_RED_ZONES.md)
- [docs/security/SECURITY_CHANGE_CHECKLIST.md](docs/security/SECURITY_CHANGE_CHECKLIST.md)

## Privacy & Compliance Risks

## Telemetry & Analytics Constraints (Hard Rules)

These are hard constraints intended to prevent silent privacy drift.

- No remote analytics script loads unless BOTH build-time enablement is on AND explicit consent is granted.
- No Class A payloads in telemetry (no raw notes, no identifiers, no precise locations).
- Prefer coarse/bucketed values (e.g., pain buckets) and non-reconstructive flags.
- Telemetry failures must be silent for UX, but must be detectable for maintainers via tests and gates.
- New third-party origins require:
  - explicit documentation in the data-flow map,
  - a privacy-gate allowlist entry, and
  - human review.

### P-01: Same-origin endpoints that proxy to third parties

- **Exposure**: Data leaves the device (third party) while looking like `connect-src 'self'`.
- **Data classes**: Usually Class B, sometimes Class A (e.g., location for weather).
- **Where it happens**: Same-origin `/api/*` routes that rewrite/proxy externally.
- **Signals**: Confusing network tab (all calls appear same-origin); CSP reviews miss it.
- **Mitigations**:
  - Document proxy targets in the data-flow map.
  - Treat `/api/*` changes as a privacy review boundary.

### P-02: Consent mismatch between UI and actual gating

- **Exposure**: Consent UI implies "off" while build flags still load remote scripts.
- **Data classes**: Primarily Class B (analytics), but risk depends on event payload.
- **Signals**: Remote scripts appear in network traces despite consent denial.
- **Mitigations**:
  - Treat consent as a product promise: verify it in code and via e2e checks.
  - Keep docs grounded: describe what the code does today, not intent.

### P-03: Exports and reports are an intentional egress boundary

- **Exposure**: Class A content becomes a file outside app control.
- **Data classes**: Class A.
- **Signals**: "Exported file" ends up synced by OS/cloud backups; user forwards by email.
- **Mitigations**:
  - Keep exports explicit, user-initiated, and clearly labeled.
  - Avoid surprising inclusions (e.g., hidden fields, debug metadata).

### P-04: Clipboard as cross-application egress

- **Exposure**: Copied content can be pasted into third-party apps.
- **Data classes**: Usually Class B summaries; can become Class A if not constrained.
- **Signals**: Support reports like "I pasted it somewhere by accident".
- **Mitigations**:
  - Keep clipboard payloads coarse by default.
  - Avoid copying raw notes/entries unless explicitly user-selected.

### P-05: Notifications as a disclosure channel

- **Exposure**: Notification text can appear on lock screens and shared devices.
- **Data classes**: Can become Class A depending on text.
- **Signals**: Privacy complaints even when no network activity exists.
- **Mitigations**:
  - Default notification content to non-sensitive text.
  - Treat "notification copy" as part of the privacy surface.

### P-06: Voice / speech recognition may invoke vendor backends

- **Exposure**: Audio or recognized text may be processed remotely depending on platform.
- **Data classes**: Potentially Class A.
- **Signals**: Platform-specific behavior differences; permission prompts vary.
- **Mitigations**:
  - Describe this ambiguity clearly in UX and docs.
  - Provide a non-voice path for every critical action.

### P-07: Logging and error reporting can accidentally become data egress

- **Exposure**: Sensitive content appears in console logs, crash logs, screenshots, or
  shared support bundles.
- **Data classes**: Often Class A.
- **Signals**: `console.log(entry)` type patterns; stack traces with payloads.
- **Mitigations**:
  - Enforce "no Class A in logs" as a rule.
  - Prefer structured, non-reconstructive audit metadata.

### P-08: "Backup" that is incomplete or misleading

- **Exposure**: User believes data is backed up, but canonical store is not included.
- **Data classes**: Class A.
- **Signals**: Restore succeeds but data is missing; partial state appears.
- **Mitigations**:
  - Make backup scope explicit (what is included vs excluded).
  - Treat backup coverage gaps as a privacy risk (false safety).

### P-09: Remote clinical integrations (FHIR, clinic portals, WCB submission)

- **Exposure**: Class A explicitly leaves the device to configured endpoints.
- **Data classes**: Class A.
- **Signals**: Endpoint misconfiguration; unintended production targets.
- **Mitigations**:
  - Require explicit enable flags + visible UI state.
  - Provide clear previews and "what will be sent" summaries.

## Procedural and Human-Error Failure Modes

### H-01: "Quick fix" changes in red zones without review

- **Failure mode**: Late-night edits to crypto, persistence, exports, CSP, SW.
- **Why it happens**: Fatigue + urgency + unclear boundaries.
- **Signals**: Large diffs with minimal tests; "just one more fix" language.
- **Mitigations**:
  - Follow [docs/SAFETY_PLAN.md](docs/SAFETY_PLAN.md) stop conditions.
  - Require human review for red-zone files.

### H-02: Adding a new storage surface unintentionally

- **Failure mode**: A feature writes extra localStorage keys, a new IndexedDB DB, or SW
  cache entries that persist Class A.
- **Signals**: New keys, new DB names, or new caches in diffs.
- **Mitigations**:
  - Update the data-flow map when storage changes.
  - Prefer encryption-at-rest for anything Class A adjacent.

### H-03: Misclassifying data (treating Class A as "just UI")

- **Failure mode**: Developers treat free-text notes or identifiers as non-sensitive.
- **Signals**: Fields added without classification discussion.
- **Mitigations**:
  - Default assumption: new user-entered text is Class A.
  - Require minimization rationale for any new stored field.

### H-04: Analytics introduced through dependencies or build config

- **Failure mode**: A dependency introduces a network call, beacon, or remote script.
- **Signals**: New requests to third-party origins; bundle diffs.
- **Mitigations**:
  - Treat new deps as a privacy review.
  - Keep analytics opt-in and verify gating behavior.

### H-05: Export template drift (clinical/legal wording risk)

- **Failure mode**: Export wording changes without review, creating compliance or
  medico-legal risk.
- **Signals**: Export output diffs; issue reports from clinicians/claims workflows.
- **Mitigations**:
  - Require review for export/report pipeline edits.
  - Maintain sample exports and compare outputs in CI where feasible.

### H-06: Migration mistakes that silently drop or expose data

- **Failure mode**: Migrations partially apply, duplicate, or leave plaintext remnants.
- **Signals**: "Works on my machine" reports; intermittent data loss; legacy keys linger.
- **Mitigations**:
  - Add migration tests and explicit rollback/backup guidance.
  - Prefer idempotent, versioned migrations.

## “Looks Fine Until It Isn’t” Conditions

### L-01: At-rest surface sprawl (IndexedDB + localStorage + CacheStorage)

- **Condition**: Multiple persistence layers accumulate over time.
- **Why its tricky**: Each layer is individually reasonable; combined they expand exposure.
- **Signals**: Unclear "single source of truth"; unexpected persistence after "clear".
- **Mitigations**:
  - Keep a canonical storage boundary and document it.
  - Ensure "clear data" clears all relevant stores/caches.

### L-02: Service worker cache staleness masks privacy regressions

- **Condition**: Old app code stays active, masking fixes or consent changes.
- **Signals**: User reports mismatch between UI and behavior; hard-refresh fixes it.
- **Mitigations**:
  - Test SW update flows.
  - Provide clear "reset/refresh" UX affordances.

### L-03: Silent failures hide misconfiguration

- **Condition**: Subsystems swallow errors (analytics, optional integrations) to keep UX
  smooth, but this can hide "were actually sending data" or "we stopped gating" issues.
- **Signals**: Missing telemetry in dev; no visible error while behavior changes.
- **Mitigations**:
  - Add explicit diagnostics modes for maintainers.
  - Log only non-sensitive, coarse diagnostics where necessary.

### L-04: Background processing and message channels expand exposure

- **Condition**: Workers and SW messaging create extra copies of payloads in memory.
- **Signals**: Large payloads passed via `postMessage`; debug tooling prints payloads.
- **Mitigations**:
  - Keep worker payloads minimal.
  - Avoid passing raw Class A unless required.

### L-05: Feature flags drift between environments

- **Condition**: Flags differ between preview/staging/prod; privacy posture changes.
- **Signals**: "Its off locally but on in prod" behavior.
- **Mitigations**:
  - Document privacy-impacting flags.
  - Gate networked features with both build flags and runtime checks.

## Update Cadence

- Update this register when adding: new egress, new storage, new device APIs, new
  third parties, or any migration/export changes.
- Review before each release and whenever a privacy bug is reported.
