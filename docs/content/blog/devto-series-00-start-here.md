---
title: "Start Here: PainTracker and the CrisisCore Build Log"
description: "Start here for PainTracker: privacy-first, offline-first architecture patterns and the CrisisCore build log."
tags:
  - pwa
  - privacy
  - webdev
  - testing
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---

PainTracker is a privacy first, offline first pain tracker built for the moments that matter.
No cloud dependency. No surveillance business model. Client side encryption where it counts.

This page is the front door for the CrisisCore catalog around PainTracker,
Protective Computing, and trustworthy offline-first systems.

If you are living with chronic pain, start with the product and the evidence.
If you are building health software, start with the architectural constraints.
If you are auditing claims, start with the failure modes and the proof.

## Start with the route that matches your goal

### 1. If you want the Protective Computing doctrine

Start here:
[Architecting for Vulnerability: Introducing Protective Computing Core v1.0](https://dev.to/crisiscoresystems/architecting-for-vulnerability-introducing-protective-computing-core-v10-91g)

Then read:
[Protective Computing Is Not Privacy Theater](https://dev.to/crisiscoresystems/protective-computing-is-not-privacy-theater-2job)

Then close with:
[The Stability Assumption: The Hidden Defect Source](https://dev.to/crisiscoresystems/the-stability-assumption-the-hidden-defect-source-5cpd)

Then use the citable canon:
[The Overton Framework is now DOI-backed](https://dev.to/crisiscoresystems/the-overton-framework-is-now-doi-backed-ko7)

### 2. If you want the reference implementation path

Start with the architecture:
[Offline-first without a backend: a local-first PWA architecture you can trust](https://dev.to/crisiscoresystems/offline-first-without-a-backend-a-local-first-pwa-architecture-you-can-trust-3j15)

Then read the boundaries underneath it:
[Three storage layers in an offline-first health PWA: state cache vs IndexedDB vs encrypted vault](https://dev.to/crisiscoresystems/three-storage-layers-in-an-offline-first-health-pwa-state-cache-vs-indexeddb-vs-encrypted-vault-19b7)

[Service workers that don't surprise you: deterministic caching for offline-first PWAs](https://dev.to/crisiscoresystems/service-workers-that-dont-surprise-you-deterministic-caching-for-offline-first-pwas-5480)

[Exports are a security boundary: the moment local-first becomes shareable](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9)

[Maintaining truthful docs over time: how to keep security claims honest](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)

### 3. If you want the failure-mode and testing path

Start with what breaks in the wild:
[Service Worker Failure Modes in Offline-First PWAs](https://dev.to/crisiscoresystems/service-worker-failure-modes-in-offline-first-pwas-3dnp)

Then read the recovery and migration boundaries:
[Rollback Patterns in Offline-First PWAs](https://dev.to/crisiscoresystems/rollback-patterns-in-offline-first-pwas-13f9)

[Testing IndexedDB Schema Migrations in Offline-First PWAs](https://dev.to/crisiscoresystems/testing-indexeddb-schema-migrations-in-offline-first-pwas-26m8)

[Offline Queue Replay and Idempotency in Offline-First PWAs](https://dev.to/crisiscoresystems/offline-queue-replay-and-idempotency-in-offline-first-pwas-3hpg)

If you want the boundary question that sits under those tests, add:
[Trust Boundaries in Client-Side Health Apps](https://dev.to/crisiscoresystems/trust-boundaries-in-client-side-health-apps-2pa9)

### 4. If you want the trust and release path

Start with:
[Quality gates that earn trust: checks you can run, not promises you can't](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)

Then read:
[ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify](https://dev.to/crisiscoresystems/how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb)

[Preview Mode First: Agent Plans as PRs](https://dev.to/crisiscoresystems/preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd)

[The Overton Framework is now DOI-backed](https://dev.to/crisiscoresystems/the-overton-framework-is-now-doi-backed-ko7)

## If you want the raw series pages

CrisisCore Build Log:
[dev.to/crisiscoresystems/series/34363](https://dev.to/crisiscoresystems/series/34363)

Protective Computing in Practice:
[dev.to/crisiscoresystems/series/35109](https://dev.to/crisiscoresystems/series/35109)

## Try it or support it

Try PainTracker
[paintracker.ca](https://paintracker.ca)

Star the repo
[github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

Sponsor
[github.com/sponsors/CrisisCore-Systems](https://github.com/sponsors/CrisisCore-Systems)

## One honest note about scope

This is not medical advice.
This is infrastructure. The goal is to help you track reality without giving away control of your data.

## If you are building something similar

What is the one rule you use to make sure your offline features never surprise the user
