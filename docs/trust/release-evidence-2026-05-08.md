# Release Evidence - 2026-05-08

Release: trust evidence refresh for current workspace state
Date: 2026-05-08
Owner: Kay + Copilot execution pass

## Scope

- Objective: capture a dated, repo-local execution snapshot for the current workspace so the public trust surface reflects present verification status rather than only March 2026 evidence.
- Scope boundary: trust evidence refresh plus targeted runtime/test remediations needed to clear observed runtime blockers.
- Commit hash: `169c9fd0dca1ae6c582a8ed753a281a4346616e8`
- Working tree status at capture start: dirty due to trust-document updates in progress.

## Build-Time Evidence

- Typecheck command: `npm run -s typecheck:ci`
- Typecheck result: passed after remediation.
- Remediation completed in this pass:
  - `src/stores/pain-tracker-store.ts`: `captureEntryContext()` now returns the declared `EntryCaptureContext` type, clearing the pain-entry revision typing error from the previous run.
- Additional remediation completed in this pass:
  - `src/utils/pain-tracker/wcb-export.ts`: palette colors are now typed as explicit RGB tuples, clearing the `TS2556` tuple-spread failures without changing report output.
- Lint command inside the full gate: `npm run -s lint`
- Lint result: passed with warnings only (no errors).
- Claims baseline command: `npm run -s claims:validate`
- Claims baseline result: passed.
- Direct build command: `npm run -s build`
- Direct build result: passed.
- Build receipts:
  - `vite` production build completed successfully
  - sitemap generation completed successfully
  - prerender completed successfully for 118 route HTML entrypoints
- Full quality gate command: `npm run -s check`
- Full quality gate result: not captured end-to-end within tool timeout, but all individually observed blocking build-time stages in this pass were green.
- Security/privacy gate command: `npm run -s check-security`
- Security/privacy gate result: passed.
- Security/privacy gate details:
  - privacy gates passed
  - analytics/privacy Vitest suite passed: 43 tests

## Verification Evidence

- SEO consistency command: `npm run -s test:seo`
- SEO consistency result: passed.
- SEO suite totals in this pass: 7 files, 26 tests passed.
- Accessibility checks run: none in this pass.
- Accessibility checks run:
  - Automated attempt on 2026-05-09: `npm run accessibility:scan`
  - Result: failed (3/3) because `page.goto('http://localhost:3000')` timed out in Playwright (`Timeout 30000ms exceeded`)
  - Evidence artifacts captured under `test-results/accessibility-*` (screenshot/video/trace attachments per failed test)
- WCAG 2.2 manual validation evidence:
  - Required for public WCAG claim under Option B.
  - Dated packet: `docs/trust/wcag-manual-validation-2026-05-09.md`
  - Current status: pending named reviewer sign-off.
- Sensitive-path human review links: none added in this pass.
- Interlock status (`Soft`/`Hard`/`None`): not computed in this pass.
- Pv snapshot reference: not captured in this pass.

## Runtime Drill Evidence

- Smoke runtime command (release-gate path):
  - `npm run -s e2e:smoke`
- Smoke runtime result (release-gate path):
  - 6 passed, 0 failed
  - `landing -> app loads without runtime errors` passed in Chromium, mobile Chrome, and mobile Safari after adding `data-testid="hero-cta-start"` to the live `/` page CTA in `src/pages/LandingPage.tsx`
  - `resources page loads and is not blank` passed in Chromium, mobile Chrome, and mobile Safari
- Smoke runtime command (direct slice rerun):
  - `npx playwright test e2e/tests/smoke-navigation.spec.ts --project=chromium --project=mobile-chrome --project=mobile-safari --config=e2e/playwright.config.ts --workers=1`
- Smoke runtime result (direct slice rerun):
  - 6 passed, 0 failed
- Focused runtime evidence command:
  - `npx playwright test e2e/tests/overton-level-a-evidence.spec.ts --project=chromium --config=e2e/playwright.config.ts --workers=1`
- Focused runtime evidence result:
  - 4 passed, 0 failed
- Offline loss scenario result:
  - `PC-1 offline cache load (evidence)` passed.
  - Browser went offline, cache-backed reload still retained a title, and evidence captured disconnect errors plus service-worker-backed continuity.
- Coercion/panic-mode walkthrough result:
  - `PC-4 crisis UX: Panic overlay reachable + closable (evidence)` passed.
  - Panic overlay opened and closed successfully in the exercised browser path.
- No-tell neutral mode check result:
  - no dedicated observer-based neutral-mode drill was run in this pass.
  - adjacent automated evidence improved via `PC-3 no external egress during essential flows (evidence)`, which passed with no external requests recorded during panic overlay interaction and CSV export.
- Export-path runtime evidence:
  - `PC-5 offline export (CSV/JSON/PDF/WCB) (evidence)` passed.
  - Deterministic evidence setup now grants local `reports_wcb_forms` entitlement for the test path in `e2e/tests/overton-level-a-evidence.spec.ts` so the WorkSafe BC report workflow is exercised instead of the clipped Free-tier upsell path.
  - `src/utils/pain-tracker/wcb-export.ts` now uses delayed blob-URL revocation for WCB PDF/manifest downloads to match shared export lifecycle behavior.
- Additional runtime observation:
  - no landing-entry selector regressions were reproduced in the focused smoke rerun.

## PLS Decision

- Reversibility: 2
  - Runtime blockers observed in this pass were addressed with narrow, easily reversible changes (CTA test-id alignment, WCB export URL lifecycle alignment, and deterministic evidence entitlement setup).
- Exposure Minimization: 2
  - Privacy/security gates passed in this pass, and no new egress path was introduced by the targeted runtime/test remediations.
- Local Authority: 2
  - This evidence pass found no new remote dependency or boundary expansion, and the no-external-egress evidence passed in the refreshed runtime drill set.
- Auditability: 2
  - The commands and outcomes are dated and explicit, focused runtime evidence was refreshed to green, but Pv capture and human review receipts were not refreshed in this pass.
- Final decision: `pass with follow-up`
  - This workspace snapshot satisfies the exercised automated gates in this pass, with remaining follow-up limited to broader release-signoff artifacts not re-captured here.

## Exceptions

- Accepted constraints:
  - this is a truthful current-state evidence refresh, not a release-candidate signoff packet
- Residual risks:
  - the WCB runtime evidence path now depends on a test-local entitlement seed to exercise the unlocked workflow, which is correct for feature-path verification but not representative of Free-tier UX
  - observer-based neutral-mode and human-reviewed crisis-flow evidence remain stale relative to the current date
  - WCAG 2.2 claim evidence is incomplete until manual AT validation is signed off in `docs/trust/wcag-manual-validation-2026-05-09.md`
- Follow-up due dates:
  - rerun full runtime drills (`npm run -s e2e:smoke`) and capture fresh Pv/interlock receipts before any broad release-facing trust claim is updated to unconditional `pass`
  - complete manual WCAG validation packet and reviewer sign-off before publishing/retaining an unconditional WCAG 2.2 AA claim

## Truthfulness Notes

- This note supports a narrow claim that current privacy/security and SEO verification passed on 2026-05-08.
- This note also supports a narrow claim that the exercised smoke slice and focused Overton Level A runtime evidence slice were green in this pass.
- Public references should treat this file as the latest dated execution snapshot until a newer evidence pass supersedes it.
- Public WCAG 2.2 AA language must remain conditioned on completed manual validation evidence until the dated packet above is fully signed.
