# Overton v1.3 — Reversibility Contract (PC-2) — 2026-02-20 (Draft)

Status: **Draft for human sign-off**. This document defines what “reversibility” means in Pain Tracker today, what is intentionally irreversible, and what changes are in-scope/out-of-scope without deeper storage redesign.

## Scope

This contract covers **user-facing destructive actions** and their reversibility behavior.

In-scope:
- UI actions that delete or clear user data (including scheduled reports).
- Temporal buffering / cancel windows before executing destructive operations.

Out-of-scope (requires separate human review and acceptance criteria):
- Tombstones, restore windows, append-only logs, or any design that requires retaining Class A data after a “delete”.
- Crypto/key handling changes (key rotation, stronger crypto-erasure guarantees, vault unlock flows).
- Export template changes (PDF/CSV/JSON formats, claim language).

## Principles

- **No overclaiming**: We describe what the code does, not what we wish it did.
- **Local-first**: Reversibility features must not introduce network calls.
- **Data minimization**: Reversibility should avoid retaining additional Class A backups unless explicitly approved.

## Current reversibility behavior (implemented)

### A) Destructive “Clear All Data” actions

Behavior:
- After user confirmation, data wipe is **scheduled** and does **not execute immediately**.
- A **10-second cancel window** is provided. If canceled, the wipe never executes.
- Once the wipe executes, there is **no in-app undo**.

Rationale:
- Temporal buffering provides reversibility *without* retaining sensitive backups.

Code surfaces:
- src/components/widgets/ModernDashboard.tsx
- src/components/widgets/DashboardOverview.tsx
- src/components/agency/UserAgencyComponents.tsx
- Deletion implementation: src/utils/clear-all-user-data.ts

### B) Scheduled report deletion

Behavior:
- Deleting a scheduled report is **scheduled** with a **10-second undo/cancel window**.
- If user clicks “Undo” within the window, deletion never executes.
- If the timer completes, deletion executes via the store action.

Code surface:
- src/components/reporting/ReportingSystemCore.tsx
- Store deletion action: src/stores/pain-tracker-store.ts (deleteScheduledReport)

## Intentionally irreversible behavior

These behaviors are currently treated as **intentionally irreversible** (or best-effort irreversible) once executed:
- Emergency wipe triggered by vault kill-switch / repeated unlock failure (see src/services/emergency-wipe.ts and vault service).
- After a wipe executes, we do not promise restoration in-app.

Important note:
- “Irreversible” here is **product behavior**, not a cryptographic guarantee. Stronger crypto-erasure guarantees require explicit acceptance criteria and a separate human review gate.

## Acceptance criteria (for Gate A: temporal buffering)

- Confirmation copy clearly states a cancel window (no “cannot be undone” wording when a cancel window exists).
- Cancel/Undo reliably prevents execution (timers cleared; no late execution).
- Timers clean up on unmount/navigation.
- No new persistence of Class A data is introduced to support undo.

## Evidence / verification

Manual verification steps:
- Trigger each destructive action, observe countdown, click Cancel/Undo, verify no deletion occurred.
- Trigger again and allow timer to complete, verify deletion occurs.

Automated evidence (future work):
- Add Playwright coverage for at least one destructive flow verifying the cancel window prevents execution.

## Open decisions (human sign-off)

- Confirm the default buffer duration (currently **10 seconds**).
- Confirm which actions must remain immediate (e.g., emergency wipe) vs buffered.
- Define whether “single-entry delete” needs the same buffer/undo pattern.
- Define acceptance criteria for any future “restore window” designs (tombstones, append-only logs, etc.).
