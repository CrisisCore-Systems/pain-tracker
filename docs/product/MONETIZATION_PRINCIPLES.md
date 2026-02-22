# Monetization Principles (Privacy-Aligned)

This document defines how Pain Tracker monetizes **without** turning health data into a product.

We charge for **functionality**, not for data.

## Non-negotiables (core experience)

- **Core tracking is free and local-first**.
- **No account required** to use core tracking.
- **No background data harvesting** as a monetization strategy.
- **No server dependency** for core tracking (the app must remain usable offline).

## What we charge for (value, not data)

Paid features must provide additional functionality that some users choose to enable:

- **Encrypted multi-device sync / backup (optional)**
  - Must be opt-in.
  - Must be end-to-end encrypted (provider cannot read Class A content).
  - Must be designed so core tracking remains fully usable without it.

- **Structured export packages (optional)**
  - Export bundles and visit-ready packaging that saves time.
  - Any new export templates/formats are part of the export boundary and require review.

- **Specialized report generators (optional)**
  - WorkSafeBC and similar workflows.
  - If a feature submits data off-device, it must be explicitly gated and prefer a same-origin proxy.

- **Advanced analytics overlays (optional)**
  - Must remain **local-only by default**.
  - No telemetry requirement for paid analytics.

## What we do not do

- We do not sell health data.
- We do not require users to “pay with surveillance.”
- We do not make third-party analytics a dependency for paid tiers.

## Technical guardrails

- Treat new network surfaces as threat-surface expansions and document them:
  - Update `docs/security/THREAT_SURFACE_AUDIT.md`.
- Maintain a strict separation between:
  - **payment/entitlement** flows (should never ingest Class A content), and
  - **health-data** flows (Class A).
- Keep optional networked features behind explicit UI gating and feature flags.

## Entitlement models (design options)

These are implementation options; choose the one that best matches the product constraints:

- **Device-local license key** (no account; user enters key)
- **Receipt-based unlock** (payment provider receipt verifies entitlement)
- **Optional account for sync only** (core remains accountless; sync may require identity)
- **User-provided storage target** (e.g., WebDAV/S3 they control; reduces provider trust)

Any entitlement approach that introduces new identifiers, new persistence of secrets, or changes to encryption/key handling is a **red-zone change** and requires human review.

## Evidence expectations

- Maintain automated evidence that core flows produce **no third-party requests**.
- For each paid feature, add an explicit e2e “egress map” assertion covering:
  - what endpoints are contacted,
  - what data classes are involved,
  - and what is blocked by CSP/service worker policies.
