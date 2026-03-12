# Trust Hardening Roadmap (2026 Q1)

Window: 4-12 weeks
Owner: Trust working group
Mode: verification-first (claims require receipts)

## Phase 1 (Week 1-2): Trust Hardening Review

Goals:
- Formalize threat model for Class A records, key material, export boundaries.
- Lock protective boundary statement and explicit non-guarantees.
- Capture immediate quick wins for minimization and safe-exit boundaries.

Required artifacts:
- `docs/trust/threat-model.md`
- `docs/trust/boundary-statement.md`
- `docs/trust/quick-wins.md`
- `docs/trust/defensibility-packet.md`

Exit criteria:
- Every trust claim maps to code/test/docs evidence.
- Security-critical review boundaries are explicit and enforceable.

Current status (2026-03-12):
- In progress. Core documents created; first execution snapshot captured.

## Phase 2 (Week 2-4): Zero-Knowledge Stack Verification

Goals:
- Verify storage path: device input -> local encryption -> IndexedDB -> user-controlled export.
- Confirm service worker/offline behavior for critical flows.
- Enforce non-reconstructive telemetry/logging.

Required evidence:
- Chokepoint tests: `src/test/security-chokepoints-ci.test.ts`
- Offline queue tests: `src/test/offline-queue.test.ts`
- Security gates: `npm run -s check-security`
- Runtime smoke evidence: `npm run -s e2e:smoke`

Exit criteria:
- No plaintext export/import bypass channel.
- Offline-critical flows remain available in degraded conditions.

Current status (2026-03-12):
- Partial pass. Test suite passes; SW route-level warnings need follow-up.

## Phase 3 (Week 3-6): Vulnerability State Machine

Goals:
- Verify predictable panic/safe controls under fluctuating cognitive capacity.
- Keep safety anchors fixed across UI states.
- Confirm progressive disclosure behavior in assessment flow.

Required evidence:
- Accessibility + panic-related tests.
- Scenario drill runs from `docs/trust/scenario-test-protocol.md`.

Exit criteria:
- Safety controls remain reachable and deterministic across relevant states.

Current status (2026-03-12):
- Partial pass in unit/smoke checks; observer-based coercion drill pending.

## Phase 4 (Week 4-8): Velocity Pressure and Interlocks

Goals:
- Operationalize Pv tracking.
- Enforce hard interlocks when generation outpaces verification.

Required artifacts:
- `docs/trust/pv-metric.md`
- `docs/trust/pv-log-2026-03-12.md`
- PR checklist enforcement in `.github/pull_request_template.md`

Exit criteria:
- Sensitive releases blocked when `Pv > 1`.

Current status (2026-03-12):
- Active. Pv recorded for this run.

## Phase 5 (Week 5-10): Institutional Receipts

Goals:
- Produce build-time and run-time evidence bundles per release.
- Score release candidates with PLS rubric.

Required artifacts:
- `docs/trust/release-evidence-template.md`
- release-scoped evidence files (date/version stamped)
- `docs/trust/pls-rubric.md`
- SBOM artifact: `security/sbom-latest.json`

Exit criteria:
- Release packet complete and reviewer-verifiable.

Current status (2026-03-12):
- Started. SBOM generated; first evidence snapshot captured.

## Phase 6 (Week 8-12): Sustainable Governance

Goals:
- Embed release gating policy in recurring delivery workflow.
- Define recurring trust architect cadence for release/incident readiness.

Required artifacts:
- `docs/trust/release-gating-policy.md`
- dated defensibility packets per release cycle

Exit criteria:
- Trust gates operate as routine release policy rather than ad hoc checks.

Current status (2026-03-12):
- Not complete; policy exists and needs sustained operational use.

## Open blockers from latest execution

1. Baseline quality gate blocked by TypeScript error in `src/components/data-resilience/DataRestore.tsx:71`.
2. Service worker registration warnings observed on resource sub-routes during smoke runs.
3. Recrawl automation evidence limited by HTTP 429 on non-browser probes; manual Search Console path required.
