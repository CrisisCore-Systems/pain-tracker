# Clinician Portal - Scoping & Security Checklist

**Status**: Draft — Requires explicit human review before any implementation that introduces network calls or provider notifications.

## Goals
- Allow users to optionally share selected, consented data with a clinician or employer in a privacy-preserving, auditable way.
- Portal must be optional, opt-in, and must support revocation and audit trails.

## High-level requirements
- Data minimization: only share what the user explicitly consents to (date ranges, selected entries, de-identified summaries).
- Consent flow: explicit multi-step consent stored locally and auditable; revocation must be straightforward.
- Security: end-to-end encrypted transport, authenticated clinician accounts, role-based access, access revocation.
- Audit logging: HIPAA-grade audit trail created on share and access (no free-text notes in logs), use `hipaaComplianceService.logAuditEvent`.

## Implementation constraints (HARD STOPS)
- Any networked transfer of Class A data (entries, notes, attachments) is a hard stop until legal/product sign-off.
- No default auto-uploads; all sharing must be user-initiated and reversible.
- All endpoint and credential management flows must be reviewed for key handling and rotation.

## Minimal prototype (for review only)
- Local-export & share link generation with explicit passphrase (manual copy/paste) — non-network demo.
- Clinician portal UI mockups, export templates, and role-based access docs.

## Tests & Audit Requirements
- Unit tests for consent flows, revocation, and audit trail creation.
- Threat modelling and documentation of risk vectors.
- Security review and penetration testing before enabling any networked features.

---

Please review and approve before proceeding to an implementation that involves networking or storage of provider credentials.
