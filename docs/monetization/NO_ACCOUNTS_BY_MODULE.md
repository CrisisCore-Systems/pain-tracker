# No Accounts — Module Policy

Date: 2026-02-21

This document defines what “no accounts” means per paid module.

Product baseline:
- Core tracking remains **free**, **local-first**, and **accountless**.
- Entitlements must be checkable **offline**.

## No account required

These modules should remain unlockable without requiring a user account or external identity:

- `reports_clinical_pdf`
- `reports_wcb_forms`
- `analytics_advanced`

Unlock mechanisms that fit this promise:
- device-local signed license file import
- one-time purchase keys

## External identity allowed (optional)

These modules may optionally use an external identity because they can imply ongoing costs or multi-device coordination:

- `sync_encrypted`

Notes:
- If `sync_encrypted` is offered, UX copy must always make clear:
  - sync is optional
  - core tracking works without sync
  - sync may require separate setup/subscription
