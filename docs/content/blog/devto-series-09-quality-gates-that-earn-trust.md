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

**Series:** [Start here](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-00-start-here.md) · [Part 1](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-01-offline-first-local-first-architecture.md) · [Part 2](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-02-three-storage-layers-state-cache-offline-db-encrypted-vault.md) · [Part 3](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-03-service-workers-that-dont-surprise-you.md) · [Part 4](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-04-zod-defensive-parsing.md) · [Part 5](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-05-trauma-informed-ux-accessibility-as-architecture.md) · [Part 6](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-06-exports-as-a-security-boundary.md) · [Part 7](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-07-worksafebc-oriented-workflows-careful-language.md) · [Part 8](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-08-analytics-without-surveillance-explicit-consent.md) · **Part 9** · [Part 10](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-10-maintaining-truthful-docs-over-time.md)

This post is Part 9 in a Dev.to series grounded in the open-source **Pain Tracker** repo.

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

---

## Next up

Part 10 is about keeping your docs truthful over time — especially for security and privacy boundaries.

Prev: [Part 8 — Analytics without surveillance](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-08-analytics-without-surveillance-explicit-consent.md)
Next: [Part 10 — Maintaining truthful docs over time](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-10-maintaining-truthful-docs-over-time.md)
