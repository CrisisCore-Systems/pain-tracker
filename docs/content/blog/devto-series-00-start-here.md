---
title: "Start Here: PainTracker and the CrisisCore Build Log"
description: "A protocol-first table of contents for Protective Computing, PainTracker, and the CrisisCore implementation stack."
tags:
  - pwa
  - privacy
  - webdev
  - testing
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---
<!-- pain-tracker:target-link:start -->
> Start from the resource hub: [pain tracking resources](https://paintracker.ca/resources)
<!-- pain-tracker:target-link:end -->
PainTracker is a privacy-first, offline-first pain tracker built for moments where stability has already failed.
No cloud dependency for the core workflow. No surveillance business model. Client-side protection where the data boundary demands it.

This page is no longer just a list of posts.
It is the front-door protocol map for the CrisisCore catalog around Protective Computing, PainTracker, and the implementation evidence behind both.

If you are here to understand the doctrine, start at Layer 0.
If you are here to audit the engineering, walk the stack from Layer 1 through Layer 4.
If you are here to decide whether these claims are earned, follow the artifact and release path, not just the rhetoric.

## The protocol stack

| Layer | Component | Function | Start here |
| --- | --- | --- | --- |
| 0 | The Protocol | The doctrine, threat model, and legitimacy test. | [Architecting for Vulnerability: Introducing Protective Computing Core v1.0](https://dev.to/crisiscoresystems/architecting-for-vulnerability-introducing-protective-computing-core-v10-91g) |
| 1 | The Cryptography | Local authority, subpoena resistance, and explainable client-side protection. | [Client-Side Encryption for Healthcare Apps](https://dev.to/crisiscoresystems/client-side-encryption-for-healthcare-apps-dhm) |
| 2 | The Resilience | Offline-first storage, deterministic caching, and degraded-mode behavior. | [Offline-first without a backend: a local-first PWA architecture you can trust](https://dev.to/crisiscoresystems/offline-first-without-a-backend-a-local-first-pwa-architecture-you-can-trust-3j15) |
| 3 | The Human UX | Trauma-informed interaction, coercion resistance, and protective friction. | [Trauma-Informed React Hooks](https://dev.to/crisiscoresystems/trauma-informed-react-hooks-483n) |
| 4 | The Artifacts | Export boundaries, release proofs, and evidence users can carry out of the app. | [ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify](https://dev.to/crisiscoresystems/how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb) |

## Layer 0: The Protocol

This is the doctrine layer. Read this path first if you want the argument underneath the rest of the system.

1. [Architecting for Vulnerability: Introducing Protective Computing Core v1.0](https://dev.to/crisiscoresystems/architecting-for-vulnerability-introducing-protective-computing-core-v10-91g)
2. [Protective Computing Is Not Privacy Theater](https://dev.to/crisiscoresystems/protective-computing-is-not-privacy-theater-2job)
3. [The Stability Assumption: The Hidden Defect Source](https://dev.to/crisiscoresystems/the-stability-assumption-the-hidden-defect-source-5cpd)
4. [Protective Computing Canon v1.0 is now DOI-backed](https://dev.to/crisiscoresystems/the-overton-framework-is-now-doi-backed-ko7)

## Layer 1: The Cryptography

This layer answers the hard question: what makes the system harder to seize, subpoena, or casually over-collect?

1. [Client-Side Encryption for Healthcare Apps](https://dev.to/crisiscoresystems/client-side-encryption-for-healthcare-apps-dhm)
2. [If Your Health App Can't Explain Its Encryption, It Doesn't Have Any](https://dev.to/crisiscoresystems/if-your-health-app-cant-explain-its-encryption-it-doesnt-have-any-57pf)
3. [No Backend, No Excuses: Building a Pain Tracker That Doesn't Sell You Out](https://dev.to/crisiscoresystems/no-backend-no-excuses-building-a-pain-tracker-that-doesnt-sell-you-out-118j)
4. [Keeping Your Health Data Out of Court](https://dev.to/crisiscoresystems/keeping-your-health-data-out-of-court-359i)

## Layer 2: The Resilience

This layer covers degraded-mode behavior. It is where the system proves it still works when signal, battery, or continuity starts collapsing.

1. [Offline-first without a backend: a local-first PWA architecture you can trust](https://dev.to/crisiscoresystems/offline-first-without-a-backend-a-local-first-pwa-architecture-you-can-trust-3j15)
2. [Three storage layers in an offline-first health PWA: state cache vs IndexedDB vs encrypted vault](https://dev.to/crisiscoresystems/three-storage-layers-in-an-offline-first-health-pwa-state-cache-vs-indexeddb-vs-encrypted-vault-19b7)
3. [Service workers that don't surprise you: deterministic caching for offline-first PWAs](https://dev.to/crisiscoresystems/service-workers-that-dont-surprise-you-deterministic-caching-for-offline-first-pwas-5480)
4. [Service Worker Failure Modes in Offline-First PWAs](https://dev.to/crisiscoresystems/service-worker-failure-modes-in-offline-first-pwas-3dnp)
5. [Rollback Patterns in Offline-First PWAs](https://dev.to/crisiscoresystems/rollback-patterns-in-offline-first-pwas-13f9)

## Layer 3: The Human UX

This layer explains why the interface is allowed to resist speed, reduce pressure, and adapt to instability instead of optimizing for throughput.

1. [Trauma-Informed React Hooks](https://dev.to/crisiscoresystems/trauma-informed-react-hooks-483n)
2. [Trauma-informed UX + accessibility as architecture (not polish)](https://dev.to/crisiscoresystems/trauma-informed-ux-accessibility-as-architecture-not-polish-22jg)
3. [The Micro-Coercion of Speed: Why Friction Is an Engineering Prerequisite](https://dev.to/crisiscoresystems/the-micro-coercion-of-speed-why-friction-is-an-engineering-prerequisite-g4j)
4. [Coercion-Resistant UX: Designing Interfaces That Don't Pressure Users Under Stress](https://dev.to/crisiscoresystems/coercion-resistant-ux-designing-interfaces-that-dont-pressure-users-under-stress-18m9)

## Layer 4: The Artifacts

This layer is where claims become evidence. If you want to know whether the system can produce legible proof without leaking everything else, read here.

1. [Exports are a security boundary: the moment local-first becomes shareable](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9)
2. [WorkSafeBC-oriented workflows without overclaims: structured summaries, careful language](https://dev.to/crisiscoresystems/worksafebc-oriented-workflows-without-overclaims-structured-summaries-careful-language-2n3i)
3. [Quality gates that earn trust: checks you can run, not promises you can't](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
4. [ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify](https://dev.to/crisiscoresystems/how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb)
5. [Maintaining truthful docs over time: how to keep security claims honest](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)

## Two series, two jobs

Use the series pages as operating modes, not just categories.

- [Protective Computing in Practice](https://dev.to/crisiscoresystems/series/35109) is the theory and doctrine path.
- [CrisisCore Build Log](https://dev.to/crisiscoresystems/series/34363) is the implementation and verification path.

If you want context first before the protocol map, start with
[Two People, Same Body](https://dev.to/crisiscoresystems/two-people-same-body-a-developers-crisis-architecture-25ko),
the origin story behind why Pain Tracker was built.

## What this front door is doing now

This index is meant to move the catalog away from a chronological feed and toward a structured engineering protocol.
The point is not to explain taste. The point is to show which layer a post belongs to, what threat model it addresses, and what kind of proof it contributes.

The next gaps to close are two bridge posts that turn the protocol map into a cleaner sequence.
The Layer 1 bridge belongs immediately after the cryptography posts above.
The working title is: Subpoena-Proofing by Design: Why Real Zero-Knowledge Has No Back Door.

The Layer 4 bridge belongs immediately after the artifact and WorkSafeBC workflow posts above.
The working title is: Bureaucratic Combat: Turning Pain Into a WorkSafeBC-Ready Audit.

## Route into the proof network

Start with CrisisCore Systems
[crisiscore-systems.ca](https://crisiscore-systems.ca)

Read the Protective Computing library
[protective-computing.github.io](https://protective-computing.github.io)

View PainTracker
[paintracker.ca](https://paintracker.ca)

Star the repo
[github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

Sponsor
[github.com/sponsors/CrisisCore-Systems](https://github.com/sponsors/CrisisCore-Systems)

## One honest note about scope

This is not medical advice.
This is not a claim of perfect security.
This is infrastructure intended to help people track reality without surrendering unnecessary control.

## If you are building something similar

Which layer is still weakest in your system: doctrine, cryptography, resilience, human UX, or artifacts?
