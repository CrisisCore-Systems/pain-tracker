---
title: "Maintaining truthful docs over time: how to keep security claims honest"
description: "Docs drift. In privacy-first software, drift becomes misinformation. This post is a practical strategy for keeping docs anchored to code, tests, and commands you can run."
tags:
  - documentation
  - security
  - webdev
  - testing
  - privacy
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---

**Series:**
[Start here](https://dev.to/crisiscoresystems/start-here-paintracker-crisiscore-build-log-privacy-first-offline-first-no-surveillance-3h0k)
· [Part 1](https://dev.to/crisiscoresystems/offline-first-without-a-backend-a-local-first-pwa-architecture-you-can-trust-3j15)
· [Part 2](https://dev.to/crisiscoresystems/three-storage-layers-in-an-offline-first-health-pwa-state-cache-vs-indexeddb-vs-encrypted-vault-19b7)
· [Part 3](https://dev.to/crisiscoresystems/service-workers-that-dont-surprise-you-deterministic-caching-for-offline-first-pwas-5480)
· [Part 4](https://dev.to/crisiscoresystems/zod-defensive-parsing-in-a-local-first-app-make-your-offline-data-trustworthy-1016)
· [Part 5](https://dev.to/crisiscoresystems/trauma-informed-ux-accessibility-as-architecture-not-polish-22jg)
· [Part 6](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9)
· [Part 7](https://dev.to/crisiscoresystems/worksafebc-oriented-workflows-without-overclaims-structured-summaries-careful-language-2n3i)
· [Part 8](https://dev.to/crisiscoresystems/analytics-without-surveillance-explicit-consent-layered-gates-and-never-sending-class-a-data-59f1)
· [Part 9](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
· **Part 10**

This post is Part 10 in a Dev.to series grounded in the open-source **Pain Tracker** repo.

For the broader catalog route, start with [Start Here: PainTracker and the CrisisCore Build Log](https://dev.to/crisiscoresystems/start-here-paintracker-crisiscore-build-log-privacy-first-offline-first-no-surveillance-3h0k).

For the trust and release path specifically, read this sequence:

1. [Quality gates that earn trust](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
2. Maintaining truthful docs over time
3. [ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify](https://dev.to/crisiscoresystems/how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb)
4. [Preview Mode First: Agent Plans as PRs (Plan Diff + Invariants)](https://dev.to/crisiscoresystems/preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd)
5. [The Overton Framework is now DOI-backed](https://dev.to/crisiscoresystems/the-overton-framework-is-now-doi-backed-ko7)

This works best as Part 2 of a 2-post trust-and-verifiability pair.
Read first: [Quality gates that earn trust](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)

Together with
[ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify](https://dev.to/crisiscoresystems/how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb)
and
[Preview Mode First](https://dev.to/crisiscoresystems/preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd),
this forms the Documentation Integrity / Verifiable Trust reading path.

- Not medical advice.
- Not a compliance claim.
- This is about preventing doc drift from turning into false security promises.

---

## Docs drift is inevitable — unless you design against it

Every repo accumulates drift:

- features change, docs don’t
- defaults change, READMEs don’t
- “temporary” flags become permanent

In privacy/security contexts, drift is worse than being outdated.

It becomes misinformation.

So the goal isn’t “write perfect docs.”

The goal is:

- keep docs anchored to things you can *verify*

---

## The trick: write docs that point to proof

When you say:

- “offline-first”

Point to:

- service worker scripts
- the offline DB layer
- tests that verify offline behavior

When you say:

- “validated inputs”

Point to:

- schemas
- tests that prove invalid inputs fail

When you say:

- “quality gates exist”

Point to:

- `npm run check`
- `npm run security-full`
- `npm run accessibility:scan`

Pain Tracker’s documentation style leans this way:

- architecture docs under `docs/engineering/`
- explicit indexes like `docs/index/accessibility.md`
- runnable scripts in `package.json`

For a concrete example of this pattern becoming a release artifact instead of a
writing guideline, read
[ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify](https://dev.to/crisiscoresystems/how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb).

---

## Automate doc validation when you can

The repo includes a docs validation script:

- `npm run docs:validate`

That doesn’t “prove the docs are true,” but it does catch classes of breakage:

- missing references
- structure drift
- formatting assumptions

The point is to make “keep docs healthy” an explicit, repeatable action.

---

## Separate claims from guarantees

A good rule for security docs:

- describe what the code does
- avoid implying it solves threats it doesn’t

Examples of safe phrasing:

- “data stays local unless the user exports it” (if exports are explicit)
- “analytics is gated behind an environment flag” (if the gate exists)

Examples of risky phrasing:

- “secure” (without scope)
- “compliant” (without a legal program)
- “protected from attackers” (without a threat model)

Truthful docs don’t undersell the work.

They just don’t overpromise.

---

## Use the repo’s own publishing tools to keep content consistent

Pain Tracker ships scripts to help keep Dev.to content in sync:

- `npm run devto:dry-run`
- `npm run devto:sync-content`
- `npm run devto:sync-titles`

The meta-lesson: publishing should be a process, not a one-time copy/paste.

When that publishing flow includes agents, the same posture applies before
content goes live:
[Preview Mode First: Agent Plans as PRs (Plan Diff + Invariants)](https://dev.to/crisiscoresystems/preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd)
is the matching guardrail on the delivery side.

---

## Wrap-up

If you only take one thing from this series:

> Make your claims testable.

That’s how you build trust without pretending to be perfect.

Prev: [Part 9 — Quality gates that earn trust](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
