# WCAG 2.2 Manual Validation Evidence - 2026-05-09

Purpose: Option B claim support packet for public WCAG 2.2 AA language.

Scope: Manual accessibility validation of critical user-facing routes and workflows.

Status: pending reviewer sign-off.

## Claim Boundary

- Claim target: WCAG 2.2 AA (manual + automated evidence required)
- Evidence date: 2026-05-09
- Expiration policy: claim evidence must be refreshed on material UI changes affecting navigation, forms, or crisis/safety controls

## Test Ownership

- Tester:
- Observer:
- Independent reviewer:
- Product sign-off owner:

## Route Matrix (Manual Walkthrough)

- `/` (landing)
- `/app` (main tracker workflow)
- `/resources`
- `/privacy`
- `/terms`

## Assistive Technology Matrix

- NVDA (latest stable) + Chrome (latest stable): pending
- VoiceOver + Safari (latest stable): pending
- Keyboard-only (no pointing device): pending

## Device/Browser Matrix

- Windows 11 + Chrome desktop: pending
- Windows 11 + Firefox desktop: pending
- iOS Safari (mobile): pending
- Android Chrome (mobile): pending

## Required Checkpoints

Record pass/fail and evidence link per checkpoint.

1. Keyboard-only traversal and visible focus indicators on all interactive elements in route matrix.
2. Skip/landmark navigation behavior is predictable and does not trap focus.
3. Form labels, error messaging, and recovery path are understandable and non-shaming.
4. Modal/overlay behavior (including panic/safe-exit affordances) preserves focus order and exit path.
5. Zoom/reflow at 200% does not hide critical controls or clip essential text.
6. Contrast and reduced-motion preference behavior remains functional and readable.
7. Screen reader announcements for key headings, controls, and state changes are coherent.

## Evidence Attachments

- Automated accessibility run command: `npm run accessibility:scan`
- Automated run result on 2026-05-09: failed (3/3) due local host timeout at `http://localhost:3000`
- Failure artifacts:
  - `test-results/accessibility-Accessibilit-4ae52-omprehensive-scan-dashboard-chromium/trace.zip`
  - `test-results/accessibility-Accessibilit-ac762-omprehensive-scan-analytics-chromium/trace.zip`
  - `test-results/accessibility-Accessibilit-506fa-comprehensive-scan-calendar-chromium/trace.zip`

Manual evidence links (fill before claim sign-off):

- Keyboard traversal recording(s):
- Screen reader transcript(s):
- Zoom/reflow screenshots:
- Contrast/reduced-motion screenshots:
- Form error/recovery screenshots:

## Findings Log

| ID | Checkpoint | Severity | Finding | Status | Owner |
| --- | --- | --- | --- | --- | --- |
| A11Y-001 | Automated scan runtime boot | High | Playwright could not reach local app host in this capture run; manual evidence and a successful automated rerun are still required. | Open | |

## Sign-Off

- Tester sign-off:
- Reviewer sign-off:
- Date:
- Decision: `pass` | `conditional` | `fail`

## Truthfulness Note

Do not publish or retain unconditional WCAG 2.2 AA claim language unless this document has completed checkpoints and named sign-off.