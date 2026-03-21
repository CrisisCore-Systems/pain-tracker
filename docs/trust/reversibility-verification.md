# Reversibility Verification

Last updated: 2026-03-20
Status: Draft for human review

Purpose: define the minimum test, manual audit, and evidence requirements for any change that touches reversible or irreversible actions described in `docs/trust/reversibility-contract.md`.

## Verification Goals

- Prove that undo paths actually prevent the destructive mutation.
- Prove that restore or preview paths avoid premature writes.
- Prove that crash, reload, offline, or transport failure does not cause silent permanent harm.
- Produce evidence that is reviewable without reconstructing Class A payloads.

## Automated Verification Matrix

### Existing Evidence In Repo

| Area | Current evidence | What it proves | Status |
| --- | --- | --- | --- |
| Export artifact cleanup | `src/utils/pain-tracker/export.test.ts` | Blob URL revocation on TTL expiry, visibility change, and explicit cleanup | Present |
| Export warning gate and close-and-clear behavior | `src/components/export/DataExportModal.integration.test.tsx` | Export remains disabled until acknowledgment; close flow clears artifact references | Present |
| Backup export and import surface | `src/components/settings/__tests__/BackupSettings.test.tsx` | Backup export completes; import preview renders before writes; cancel prevents apply; `IMPORT` token gates writes; safe keys apply | Present |
| Backup import rollback on write failure | `src/test/settings-backup-policy.test.ts`, `src/components/settings/BackupSettings.tsx` | Already-applied settings are restored if a later import write fails in the live import path | Present |
| Alert clear undo | `src/components/__tests__/AlertsActivityLog.test.tsx` | Clear-all alerts can be undone and restored within the window | Present |
| Alert clear expiry | `src/components/__tests__/AlertsActivityLog.test.tsx` | Undo affordance expires and restore is unavailable after the 6-second window | Present |
| Scheduled report delete delay and undo | `src/test/reporting-system.test.tsx` | Deletion is delayed, executes after timer expiry, and `Undo` preserves the report when used in time | Present |
| Bulk clear-all cancel window | `src/components/widgets/__tests__/DashboardOverview.test.tsx` | Cancel inside the 10-second window prevents `clearAllUserData()` from running | Present |
| Vault kill-switch trigger threshold | `src/test/vault-kill-switch.test.ts` | Emergency wipe is gated by repeated unlock failures and settings state | Present |
| Persist clear / reset behavior | `src/test/stores/persist-vault-roundtrip.test.ts`, `src/test/stores/persist-migrate.test.ts` | Store reset and persistence transitions remain functional | Present |

### Required Additions Before Approving Changes In This Area

| Feature touched | Minimum automated proof required |
| --- | --- |
| Any new direct sharing / recipient model | Integration tests for grant, revoke, revoke failure, and user-visible exposure state |
| Any new account-change flow | Tests for cancel, verification failure rollback, and recovery-path continuity |
| Any new session-revocation flow | Tests for pending/offline revoke, confirmed revoke, and preservation of local source data |

## Accepted Irreversibility vs Evidence Gaps

Use this split to prevent missing tests from being misread as promised undo support.

### Accepted Irreversibility

| Behavior | Why it is accepted as irreversible today | Evidence posture |
| --- | --- | --- |
| Emergency wipe after kill-switch trigger | Protective erase path intentionally does not retain recoverable prior state | Code path and threshold tests exist |
| Acknowledge single alert | Current implementation removes the alert without keeping an undo snapshot | Code inspection supports this; absence of undo test is not a gap in a promised feature |
| Reset local usage counters | Reset is destructive to the counters and no restore path is implemented | Code inspection plus service tests |

### Evidence Gaps For Claimed Reversibility

| Claimed behavior | Missing or weak proof |
| --- | --- |
| Crash during backup import apply | Preview safety and write-failure rollback are proven, but interruption from process/tab crash during the write loop is not yet covered by automated evidence |

## Manual Audit Script

Run this script whenever a PR changes delete, clear, export, import, consent, sharing, account, or session-management behavior.

### 1. Clear-All Data

1. Open the dashboard surface that exposes `Clear All Data`.
2. Trigger the action and capture the confirmation copy.
3. Confirm the action and verify a visible countdown appears.
4. Click `Cancel` before expiry.
5. Verify entries still exist after waiting longer than 10 seconds.
6. Repeat the action and allow the timer to finish.
7. Verify local data is cleared and that the app does not claim in-app restore if none exists.

Expected result:
- Cancel prevents any destructive mutation.
- Completion clears the documented storage surfaces.
- No misleading “undo” claim remains after execution.

### 2. Scheduled Report Deletion

1. Create a scheduled report.
2. Trigger delete and confirm the action.
3. Verify countdown plus `Undo` affordance appears.
4. Click `Undo` and confirm the report remains.
5. Repeat and allow timer expiry.
6. Confirm the report is removed only after the countdown completes.

### 3. Alert Log Clear

1. Seed at least two alerts.
2. Clear all alerts and confirm the dialog.
3. Verify the `Undo` banner appears.
4. Click `Undo` and confirm the original alerts return.
5. Repeat and allow the undo window to expire.
6. Confirm the alerts stay cleared afterward.

### 4. Export Flow

1. Open `DataExportModal` with at least one entry.
2. Verify export action is blocked until the unencrypted-risk acknowledgment is checked.
3. Perform an export and capture the success state.
4. Use `Close Export & Clear Memory`.
5. Verify the export modal closes and artifact cleanup runs.
6. Confirm the source entries remain unchanged throughout.

### 5. Settings Backup Import

1. Start a backup import using a valid JSON backup.
2. Verify preview rows show add/overwrite/blocked status before any write occurs.
3. Cancel the import and confirm no settings change was applied.
4. Reopen import, type `IMPORT`, and apply.
5. Verify only safe keys are written.
6. Record whether rollback after apply is supported or not; do not infer support that is not implemented.

### 6. Privacy / Consent Toggles

1. Toggle each privacy-sharing setting that changed in the PR.
2. Verify immediate UI confirmation states what changed.
3. Reload the app and confirm the toggle persists or intentionally resets according to documented behavior.
4. Verify withdrawal stops future collection or sharing behavior prospectively.
5. Verify the app does not imply already-exported copies were revoked if they were not.

### 7. Crash / Reload Drill

1. Start any buffered delete.
2. Reload or close the tab before the countdown ends.
3. Reopen the app.
4. Verify the destructive action did not silently complete unless the product intentionally persists pending deletes and surfaces them clearly.

### 8. Offline / Transport Failure Drill

1. Disconnect network or use browser offline mode.
2. Repeat local tracking, delete, export, and backup preview flows.
3. Confirm those local-first flows still work.
4. If the change touches a remote submission path, force a failed request.
5. Verify local source data remains intact and the UI shows retry or failure, not false success.

## Evidence Outputs

Every review packet for this area must include:

- test report names or command output summary for all relevant unit and integration tests
- at least one screenshot for each changed destructive or sharing surface
- one short reviewer note describing the irreversible point for the changed flow
- explicit note of any unverified rollback behavior or residual risk
- an update to the current release evidence packet or equivalent signoff note

Recommended evidence bundle structure:

- `artifacts/reversibility/<date>/vitest-<scope>.txt`
- `artifacts/reversibility/<date>/manual-audit.md`
- `artifacts/reversibility/<date>/<flow-name>.png`
- `docs/trust/release-evidence-YYYY-MM-DD.md` entry referencing the artifacts

Evidence must avoid raw Class A payloads. Use counts, state labels, timestamps, and UI chrome rather than sensitive notes or full exports.

## Current Verified Live Claims

As of 2026-03-20, the repo has automated proof for these live reversibility claims:

- Clear-all data can be canceled before the 10-second destructive boundary.
- Scheduled report deletion is delayed and can be undone before expiry.
- Alert-log clear can be undone within the window and becomes irreversible after expiry.
- Settings backup import shows preview rows before writes, supports cancel-before-apply, requires `IMPORT`, and applies only safe keys.
- Settings backup import rolls back already-applied keys if a later write fails in the live import path.

These proofs do not upgrade any crash-recovery claim that the product does not already implement.

## Claim-To-Evidence Mapping Rule

For every reversibility claim added or changed in code, docs, or UI copy, reviewers must be able to answer:

- Where is the state transition implemented?
- Is prior state retained long enough to stop or undo the mutation?
- Where is the irreversible boundary?
- Which test or manual artifact proves that claim?

If one of those answers is missing, the change is not yet verification-complete.

## Failure Conditions

Block approval when any of the following is true:

- A destructive action executes even after cancel or undo is used inside the promised window.
- The UI says an action is undoable or revocable but the code only hides the prompt.
- Backup or import writes occur before preview and explicit confirmation.
- Export or share copy implies revocation of copies the app cannot actually control.
- Crash, reload, or offline drills show silent permanent harm that is not already documented and accepted.
- Review evidence is missing for a changed destructive or sharing path.

## Review Note Template

Use this short template in the PR or signoff note:

- Changed flow:
- Irreversible point:
- Reversibility mechanism:
- Automated evidence:
- Manual drill evidence:
- Residual risk:
- Human review required: yes/no and why