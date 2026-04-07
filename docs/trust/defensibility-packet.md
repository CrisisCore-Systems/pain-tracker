# Defensibility Packet (Execution Snapshot)

Date: 2026-03-12
Scope: Trust-hardening verification sweep after trust architecture documentation integration.
Owner: Kay + Copilot execution pass

## 1) System Intent

- Primary use case: local-first chronic pain tracking with privacy-preserving records and user-controlled exports.
- Safety-critical use case: predictable access to panic/grounding and crisis-support controls under variable cognitive capacity.
- Audience lanes in scope for this run: engineering verification and operational trust evidence.

## 2) Threat Model Snapshot

Reference: `docs/trust/threat-model.md`

- Assets touched: no Class A runtime data migrations were introduced in this pass; verification focused on existing controls.
- Adversaries considered during checks: XSS-origin compromise assumptions, replay/route widening risks, telemetry leakage risks.
- New attack surface introduced: none in this execution pass.
- Mitigations verified:
  - Privacy gates and analytics consent protections passed via `npm run -s check-security`.
  - Chokepoint CI tests passed (`security-chokepoints`, background sync guardrails).

## 3) Boundary Statement Delta

Reference: `docs/trust/boundary-statement.md`

- New guarantees added: none.
- Guarantees removed/changed: none.
- Explicit non-guarantees reaffirmed: no protection claims added for compromised OS/extensions or unlocked-device seizure scenarios.

## 4) Build-Time Receipts

- Baseline quality command: `npm run -s check:quick`
- Result: passed after remediation.
- Remediation applied:
  - `src/components/data-resilience/DataRestore.tsx`: callback now receives normalized store entries after merge.
  - Removed malformed temporary artifact files that were causing lint parse errors in `artifacts/devto/`.
- Security gate command: `npm run -s check-security`
- Result: passed (privacy gates + analytics gate tests).

## 5) Run-Time Receipts

Reference: `docs/trust/scenario-test-protocol.md`

- Scenario-relevant unit tests (all passed, 42 tests):
  - `src/test/security-chokepoints-ci.test.ts`
  - `src/test/background-sync-guard.test.ts`
  - `src/test/offline-queue.test.ts`
  - `src/test/accessibility.test.tsx`
  - `src/test/monetization-boundary.test.ts`
- SEO consistency tests (all passed, 13 tests):
  - `src/test/seo-breadcrumbs.test.ts`
  - `src/test/seo-host-consistency.test.ts`
  - `src/test/seo-redirect-rules.test.ts`
- Runtime smoke (Playwright): `npm run -s e2e:smoke`
  - Result: 6/6 tests passed.
  - Observation: resources sub-routes log service worker registration warnings
    (`unsupported MIME type 'text/html'` for route-local `sw.js` lookups).

## 6) PLS Scoring (provisional)

Reference: `docs/trust/pls-rubric.md`

- Reversibility: 3 (blocker fixed; gate rerun passed).
- Exposure Minimization: 3 (privacy/security gates passed; no new egress introduced in this pass).
- Local Authority: 2 (offline and chokepoint tests passed; SW warning requires follow-up hardening for route-level behavior clarity).
- Auditability: 3 (commands and results captured with explicit failing path and runtime observations).
- Overall decision: `pass with follow-up`.

## 7) Gate Decision

Reference: `docs/trust/release-gating-policy.md`

- Gate status: `blocked for release` due to failing baseline quality gate.
- Gate status: `pass with follow-up`.
- Required follow-ups before release:
  - Investigate and either suppress or resolve route-local SW registration warnings on resources pages.
  - Run observer-based coercion/no-tell scenario drills per `docs/trust/scenario-test-protocol.md`.
- Verification reruns complete:
  - `npm run -s check:quick` passed.
  - `npm run -s e2e:smoke` passed (6/6).
- Sign-off: pending reviewer confirmation of SW warning disposition and observer drill completion.
