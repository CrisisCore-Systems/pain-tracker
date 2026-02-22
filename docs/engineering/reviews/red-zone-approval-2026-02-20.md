# Red-Zone Changes — Human Approval Record — 2026-02-20

This file records explicit human approval for security-critical ("red-zone") changes made during the threat-surface audit hardening work.

## Approval

Approved red-zone changes:
- CSP/network
- analytics disablement
- deletion buffering
- protective-mode suppression

Approval statement (verbatim):
> Approved red-zone changes: CSP/network, analytics disablement, deletion buffering, protective-mode suppression.

Date recorded: 2026-02-20

## Scope (what this approval covers)

This approval is intended to cover the following categories of changes:

### 1) CSP / network boundaries
- Production CSP headers tightened to self-only.
- Removal of in-document meta CSP to avoid drift.

Representative files:
- `vercel.json`
- `index.html`
- `packages/blog/next.config.js`

### 2) Analytics disablement (defense-in-depth)
- Third-party analytics script loading disabled even if the module is imported.
- App wiring removed.

Representative files:
- `src/analytics/analytics-loader.ts`
- `src/App.tsx`
- `src/main.tsx`
- `scripts/privacy-gates.js`

### 3) Deletion buffering (10s cancel/undo window)
- Scheduled report deletion delayed with an undo window.
- “Clear all data” UI actions delayed with a cancel window.

Representative files:
- `src/components/reporting/ReportingSystemCore.tsx`
- `src/components/widgets/DashboardOverview.tsx`
- `src/components/widgets/ModernDashboard.tsx`
- `src/components/agency/UserAgencyComponents.tsx`

### 4) Protective-mode suppression (crisis UX)
- During Panic Mode, nonessential prompts marked with `data-nonessential-prompt="true"` are suppressed.
- Temporary zoom multiplier applied during Panic Mode.

Representative files:
- `src/components/accessibility/PanicMode.tsx`
- `src/styles/utilities/accessibility.css`
- `src/components/pwa/PWAInstallPrompt.tsx`
- `src/components/pwa/PWAStatusIndicator.tsx`
- `src/components/NotificationConsentPrompt.tsx`

## Notes / constraints

- This approval does not imply any cryptographic guarantee beyond implemented behavior.
- Any future expansion of third-party origins in CSP, changes to exports/templates, or changes to encryption/key handling require new explicit review.
