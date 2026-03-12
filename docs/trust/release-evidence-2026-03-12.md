# Release Evidence - 2026-03-12

Release: trust-hardening execution sweep
Date: 2026-03-12
Owner: Kay

## Build-Time Evidence

- Commit hash: pending (working tree has uncommitted changes).
- SBOM path: `security/sbom-latest.json`
- SBOM generation command:
  - `npx --yes @cyclonedx/cyclonedx-npm --output-format JSON --output-file security/sbom-latest.json --validate`
- SBOM artifact check:
  - path exists: yes
  - size: 2,235,664 bytes
  - timestamp: 2026-03-12 02:53:08
- Dependency/security gate command:
  - `npm run -s check-security`
- Dependency/security gate result: pass
- Baseline quality gate command:
  - `npm run -s check:quick`
- Baseline quality gate result: pass (rerun after remediation)
- Remediation summary:
  - Updated `src/components/data-resilience/DataRestore.tsx` to call `onDataRestore` with normalized store entries after vault merge.
  - Cleared lint-blocking malformed temporary artifacts under `artifacts/devto/`.

## Verification Evidence

- Sensitive chokepoint + resilience tests:
  - `src/test/security-chokepoints-ci.test.ts`
  - `src/test/background-sync-guard.test.ts`
  - `src/test/offline-queue.test.ts`
  - `src/test/accessibility.test.tsx`
  - `src/test/monetization-boundary.test.ts`
- Focused test run result: pass (42 tests)
- SEO consistency run:
  - task: `Run SEO consistency tests`
  - result: pass (13 tests)
- Runtime smoke run:
  - command: `npm run -s e2e:smoke`
  - result: pass (6 tests) on rerun after quality-gate remediation
- Runtime observation:
  - SW registration warnings for route-local `sw.js` on resource sub-routes (MIME `text/html`).
- Interlock status: `None` for this execution pass (`Pv=0.00` in `docs/trust/pv-log-2026-03-12.md`).

## Runtime Drill Evidence

- Offline loss scenario result:
  - indirect evidence: offline queue + chokepoint tests passed; smoke run completed.
  - full observer protocol run: pending manual scenario session.
- Coercion/panic walkthrough result:
  - unit-level panic/accessibility checks passed.
  - independent-observer walkthrough: pending.
- No-tell neutral mode check result:
  - pending manual observer session.

## PLS Decision

- Reversibility: 2
- Exposure Minimization: 3
- Local Authority: 2
- Auditability: 3
- Final decision: `conditional` (release blocked until quality gate blocker is fixed).
- Final decision: `pass with follow-up`.

## Exceptions

- Accepted constraints:
  - non-browser recrawl verification probes currently receive `429` from blog surfaces; recrawl submissions require manual Search Console flow.
- Residual risks:
  - unresolved SW route-level warning behavior on resource pages.
- Follow-up due dates:
  - SW warning triage: next frontend/PWA pass.
  - Observer-based coercion/no-tell drill: before next trust gate sign-off.
