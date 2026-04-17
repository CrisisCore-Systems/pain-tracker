---
title: "Quality gates that earn trust: checks you can run, not promises you can’t"
description: "Offline-first + health-adjacent means regressions are harm. Pain Tracker treats quality gates as part of the product: typecheck, lint, tests, build, security checks, and accessibility scans."
tags:
  - testing
  - typescript
  - security
  - accessibility
  - webdev
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
· **Part 9**
· [Part 10](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)

This post is Part 9 in a Dev.to series grounded in the open-source **Pain Tracker** repo.

For the broader catalog route, start with [Start Here: PainTracker and the CrisisCore Build Log](https://dev.to/crisiscoresystems/start-here-paintracker-crisiscore-build-log-privacy-first-offline-first-no-surveillance-3h0k).

For the trust and release path specifically, read this sequence:

1. Quality gates that earn trust
2. [Maintaining truthful docs over time](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)
3. [ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify](https://dev.to/crisiscoresystems/how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb)
4. [Preview Mode First: Agent Plans as PRs (Plan Diff + Invariants)](https://dev.to/crisiscoresystems/preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd)
5. [The Overton Framework is now DOI-backed](https://dev.to/crisiscoresystems/the-overton-framework-is-now-doi-backed-ko7)

This works best as Part 1 of a 2-post trust-and-verifiability pair.
Read next: [Maintaining truthful docs over time](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)

This pair also sits inside a broader Documentation Integrity / Verifiable Trust
reading path with
[ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify](https://dev.to/crisiscoresystems/how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb)
and
[Preview Mode First](https://dev.to/crisiscoresystems/preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd).

- Not medical advice.
- Not a compliance claim.
- This is about repeatable, local checks — not vibes.

---

## In health-adjacent apps, regressions aren’t “bugs”

A broken export is frustrating.
A broken “locked vs unlocked” boundary is dangerous.
A broken keyboard path is exclusion.

So the question isn’t:

- “do you have tests?”

It’s:

- “do you have a *routine* that makes regressions harder to ship?”

Pain Tracker answers that with a set of quality gates that are runnable locally.

---

## The one command gate: `npm run check`

The repo defines a CI-style gate in `package.json`:

- `npm run check`

It runs (in order):

- TypeScript typecheck
- ESLint
- Vitest
- Vite build

There’s also a faster gate:

- `npm run check:quick`

That’s the everyday loop: fail fast, fix small.

---

## A Makefile exists, but Windows folks should use npm scripts

The repo also provides a Makefile with convenient targets:

- `make test`
- `make check`

But if you’re on Windows and not using WSL/Git Bash, the npm scripts are the safest bet.

(That’s not ideology — it’s just avoiding shell portability foot-guns.)

---

## Security checks are a separate lane

“Has tests” is not the same as “doesn’t leak.”

Pain Tracker has explicit security checks in `package.json`:

- `npm run security-full`

And the Makefile wraps a subset as:

- `make check-security`

What matters is the posture:

- security checks are opt-in commands you can run
- they’re not implied by marketing copy

---

## Accessibility checks should be automated, too

Pain Tracker includes an automated accessibility scan command:

- `npm run accessibility:scan`

This runs Playwright against a dedicated a11y spec:

- `e2e/accessibility.spec.ts`

Even if you don’t catch everything automatically, this catches obvious regressions early.

---

## What “good” looks like

A good gate has three properties:

1) **It’s runnable locally**
2) **It’s fast enough to be used**
3) **It fails loudly and early**

If your team only runs checks “before a release,” you’re basically using hope as a tool.

The same idea applies to agent workflows, too:
[Preview Mode First: Agent Plans as PRs (Plan Diff + Invariants)](https://dev.to/crisiscoresystems/preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd)
shows what it looks like when plan review and invariant checks become part of
the gate instead of post-hoc cleanup.

---

## Next up

Part 10 is about keeping your docs truthful over time — especially for security and privacy boundaries.

Prev: [Part 8 — Analytics without surveillance](https://dev.to/crisiscoresystems/analytics-without-surveillance-explicit-consent-layered-gates-and-never-sending-class-a-data-59f1)
Next: [Part 10 — Maintaining truthful docs over time](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)
