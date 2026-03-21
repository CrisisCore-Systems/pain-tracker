# Release Evidence - 2026-03-20

Release: reversibility verification evidence update
Date: 2026-03-20
Owner: Kay + Copilot execution pass

## Scope

- Objective: record the automated evidence added for live reversible and irreversible boundary claims in the local-first app.
- Evidence source: focused Vitest coverage added for clear-all cancel, scheduled-report undo retention, alert undo expiry, settings-backup import gating, and settings-backup rollback on write failure.
- Related trust docs:
  - `docs/trust/reversibility-contract.md`
  - `docs/trust/reversibility-verification.md`

## Build-Time Evidence

- Commit hash: not captured in this note
- SBOM path: not part of this evidence pass
- Dependency audit result: not part of this evidence pass
- Security checklist used: `docs/security/SECURITY_CHANGE_CHECKLIST.md`
- Chokepoint review reference: `SECURITY_INVARIANTS.md`

## Verification Evidence

- Focused test scope:
  - `src/components/widgets/__tests__/DashboardOverview.test.tsx`
  - `src/test/reporting-system.test.tsx`
  - `src/components/__tests__/AlertsActivityLog.test.tsx`
  - `src/components/settings/__tests__/BackupSettings.test.tsx`
- Focused test result: 19 passed, 0 failed
- New claim coverage added:
  - clear-all cancel within the 10-second window prevents `clearAllUserData()` from running
  - scheduled-report deletion is undoable within the 10-second window
  - alert-log clear becomes irreversible only after the 6-second undo window expires
  - settings-backup import remains preview-first, cancelable before apply, gated by `IMPORT`, and restricted to safe keys
  - settings-backup import restores already-applied keys if a later storage write fails in the live import path
- Accessibility checks run: none in this pass
- Sensitive-path human review links: not added in this pass
- Interlock status: Soft
- Pv snapshot reference: not captured in this pass

## Runtime Drill Evidence

- Offline loss scenario result: not exercised in this pass
- Coercion/panic-mode walkthrough result: not exercised in this pass
- No-tell neutral mode check result: not exercised in this pass

## PLS Decision

- Reversibility: improved for the live flows above because the contract now has direct automated evidence instead of inferred behavior
- Exposure Minimization: unchanged
- Local Authority: unchanged, but the clear-all and backup-import boundaries are now better evidenced
- Auditability: improved because the trust docs now map claims to concrete test coverage and a dated evidence note
- Final decision: evidence pass accepted for the targeted live reversibility claims only

## Residual Risks

- Clear-all data remains non-restorable in-app after execution; this pass proves cancel-before-commit, not post-commit recovery.
- Settings-backup import still lacks proof of crash/interruption-safe recovery if the process or tab dies during the write loop.
- This note does not add new runtime or manual evidence for offline, crash, or reload drills.

## Truthfulness Notes

- This note supports narrower live-product claims about cancel, undo-window expiry, and preview-before-write behavior.
- This note does not justify stronger claims about post-commit restore for unrelated destructive flows or interruption-safe backup-import recovery after a true crash.
- Any release language should preserve the distinction between pre-commit reversibility and post-commit recoverability.