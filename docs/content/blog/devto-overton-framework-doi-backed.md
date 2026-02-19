---
title: "The Overton Framework is now DOI-backed"
description: "A citable canon for Protective Computing (v1.3), archived on Zenodo with a minted DOI—plus a reference implementation in Pain Tracker."
tags:
  - privacy
  - accessibility
  - security
  - opensource
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---

**The Overton Framework** (Protective Computing) is now archived on Zenodo with a minted DOI.

That means a stable, versioned citation you can use in papers, docs, and reviews—without link rot or “which PDF did you mean?” ambiguity.

What’s new: **a DOI-backed v1.3 canon (Zenodo)** plus a repo-hosted Markdown mirror for review and citation.

## Canonical citation (use this exact line)

> Overton, K. (2026). *The Overton Framework: Protective Computing in Conditions of Human Vulnerability* (Version 1.3). Zenodo. [https://doi.org/10.5281/zenodo.18688516](https://doi.org/10.5281/zenodo.18688516)

## What the framework is

Most software quietly assumes users have:

- stable connectivity
- stable cognition
- stable safety
- stable institutional trust

The framework names that as the **Stability Assumption** and treats it as a design hazard.

**Protective Computing** is a systems orientation for building software that stays safe and usable when those assumptions fail: during medical crisis, coercion, environmental disruption, and socioeconomic precarity.

Boundary notes (because truth matters):

- This is **not medical advice**.
- This is **not a regulatory compliance claim**.
- This is **not a claim of perfect security**.

## What’s inside v1.3 (high level)

The canon is intentionally written to be checkable, not inspirational:

- A definition of **Stability Bias** and how it shows up in real systems
- A **Vulnerability State Machine** (how user conditions shift, and what systems must do as they shift)
- Five normative design principles written in **RFC-style requirement language** (MUST / SHOULD)
- A provisional composite metric (**PLS**) with explicit caution about **Goodhart’s Law**

## Where to read it

- DOI landing page (Zenodo): https://doi.org/10.5281/zenodo.18688516

If you prefer reading in-repo text first:

- Markdown source (repo):
  https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/overton-framework-protective-computing-v1.3.md

## Reference implementation (so it isn’t just theory)

Frameworks don’t matter unless they survive contact with a live codebase.

Pain Tracker is an open-source, local-first pain documentation system that’s used as a reference implementation target for many Protective Computing constraints (local-first defaults, careful trust boundaries, trauma-informed UX, exports treated as a security boundary).

- Repo: https://github.com/CrisisCore-Systems/pain-tracker
- Live app: https://paintracker.ca

Important nuance: some integrations exist (for example correlation services and clinic/payment workflows), but they require explicit configuration/enabling and should be treated as separate trust boundaries.

## What feedback I’m asking for

If you build systems that touch high-vulnerability contexts (health, crisis response, legal aid, shelters, disability tooling, harm reduction), the most useful feedback is specific:

- Where the principles are **too vague** to be operational
- Where the requirements are **too strict** to be buildable
- What would make “protective” **more testable** without turning it into a gameable score

## Links

- Canon (DOI): https://doi.org/10.5281/zenodo.18688516
- Canon (repo Markdown mirror): https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/overton-framework-protective-computing-v1.3.md
- Pain Tracker repo: https://github.com/CrisisCore-Systems/pain-tracker
