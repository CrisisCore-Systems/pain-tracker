---
title: "Protective Computing Canon v1.0 is now DOI-backed"
description: "The formal structural paper for Protective Computing is now published with a canonical DOI, with Pain Tracker as a reference implementation."
tags:
  - privacy
  - accessibility
  - security
  - opensource
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: true
---

If you want the trust and release path instead of a single announcement, read this sequence:

1. [Quality gates that earn trust](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
2. [Maintaining truthful docs over time](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)
3. [ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify](https://dev.to/crisiscoresystems/how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb)
4. [Preview Mode First: Agent Plans as PRs (Plan Diff + Invariants)](https://dev.to/crisiscoresystems/preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd)
5. The Overton Framework is now DOI-backed

If you want the doctrine route that this canon supports, start with [Architecting for Vulnerability: Introducing Protective Computing Core v1.0](https://dev.to/crisiscoresystems/architecting-for-vulnerability-introducing-protective-computing-core-v10-91g).

The formal structural paper for the discipline is now published as the Protective Computing Canon v1.0.

That means a stable, versioned citation you can use in papers, docs, and reviews—without link rot or “which PDF did you mean?” ambiguity.

Overton, K. (2026). _Protective Computing Canon v1.0: A Structural Map of the Discipline._  
Protective Computing Community.  
DOI: [10.5281/zenodo.18887610](https://doi.org/10.5281/zenodo.18887610)

## Canonical citation (use this exact line)

> Overton, K. (2026). _Protective Computing Canon v1.0: A Structural Map of the
> Discipline._ Protective Computing Community.
> [https://doi.org/10.5281/zenodo.18887610](https://doi.org/10.5281/zenodo.18887610)

## What the framework is

Most software quietly assumes users have:

- stable connectivity
- stable cognition
- stable safety
- stable institutional trust

The framework names that as the **Stability Assumption** and treats it as a design hazard.

**Protective Computing** is a systems orientation for building software that
stays safe and usable when those assumptions fail: during medical crisis,
coercion, environmental disruption, and socioeconomic precarity.

Boundary notes (because truth matters):

- This is **not medical advice**.
- This is **not a regulatory compliance claim**.
- This is **not a claim of perfect security**.

## What’s inside the canon (high level)

The canon is intentionally written to be checkable, not inspirational:

- A definition of **Stability Bias** and how it shows up in real systems
- A **Vulnerability State Machine** (how user conditions shift, and what systems must do as they shift)
- Five normative design principles written in **RFC-style requirement language** (MUST / SHOULD)
- A provisional composite metric (**PLS**) with explicit caution about **Goodhart’s Law**

## Where to read it

- DOI landing page (Zenodo):
  [doi.org/10.5281/zenodo.18887610](https://doi.org/10.5281/zenodo.18887610)

If you prefer reading in-repo text first:

- Markdown source (repo):
  [github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/overton-framework-protective-computing-v1.3.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/overton-framework-protective-computing-v1.3.md)

## Reference implementation (so it isn’t just theory)

Frameworks don’t matter unless they survive contact with a live codebase.

Pain Tracker is an open-source, local-first pain documentation system that’s
used as a reference implementation target for many Protective Computing
constraints (local-first defaults, careful trust boundaries, trauma-informed
UX, exports treated as a security boundary).

- Repo:
  [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)
- Live app:
  [paintracker.ca](https://paintracker.ca)

Important nuance: some integrations exist (for example correlation services and
clinic/payment workflows), but they require explicit configuration/enabling and
should be treated as separate trust boundaries.

## What feedback I’m asking for

If you build systems that touch high-vulnerability contexts (health, crisis
response, legal aid, shelters, disability tooling, harm reduction), the most
useful feedback is specific:

- Where the principles are **too vague** to be operational
- Where the requirements are **too strict** to be buildable
- What would make “protective” **more testable** without turning it into a gameable score

## Links

- Canon (DOI):
  [doi.org/10.5281/zenodo.18887610](https://doi.org/10.5281/zenodo.18887610)
- Canon (repo Markdown mirror):
  [github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/overton-framework-protective-computing-v1.3.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/overton-framework-protective-computing-v1.3.md)
- Pain Tracker repo:
  [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)
- Quality gates that earn trust:
  [dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
