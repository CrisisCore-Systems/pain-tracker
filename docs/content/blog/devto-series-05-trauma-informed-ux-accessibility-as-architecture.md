---
title: "Trauma-informed UX + accessibility as architecture (not polish)"
description: "In health-adjacent PWAs, accessibility and trauma-informed patterns aren’t optional UI niceties—they’re core reliability features. Here’s how Pain Tracker structures those concerns."
tags:
  - accessibility
  - webdev
  - react
  - ux
  - pwa
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---

_Series:_ [Start here](./devto-series-00-start-here.md) · [Part 1](./devto-series-01-offline-first-local-first-architecture.md) · [Part 2](./devto-series-02-three-storage-layers-state-cache-offline-db-encrypted-vault.md) · [Part 3](./devto-series-03-service-workers-that-dont-surprise-you.md) · [Part 4](./devto-series-04-zod-defensive-parsing.md) · **Part 5** · [Part 6](./devto-series-06-exports-as-a-security-boundary.md) · [Part 7](./devto-series-07-worksafebc-oriented-workflows-careful-language.md) · [Part 8](./devto-series-08-analytics-without-surveillance-explicit-consent.md) · [Part 9](./devto-series-09-quality-gates-that-earn-trust.md) · [Part 10](./devto-series-10-maintaining-truthful-docs-over-time.md)

This post is Part 5 in a Dev.to series grounded in the open-source **Pain Tracker** repo.

- Not medical advice.
- Not a compliance claim.
- This is about building for bad days: pain flares, brain fog, tremor, and overload.

If you haven’t read Part 4 yet:
- Part 4: [Zod + defensive parsing](./devto-series-04-zod-defensive-parsing.md)

---

## “Accessible” is a reliability property

If your PWA only works when someone is having a good day:

- it fails exactly when it matters

For pain tracking, accessibility overlaps with basic product correctness:

- large touch targets reduce accidental inputs
- calm error states reduce abandonment
- progressive disclosure reduces cognitive load
- keyboard reachability makes the app usable for more bodies

Pain Tracker treats these as *system-level* requirements, not a checklist you bolt on later.

---

## The repo makes trauma-informed UX a first-class system

There’s an explicit implementation doc here:

- `docs/product/TRAUMA_INFORMED_UX.md`

And the implementation lives in a dedicated component set under:

- `src/components/accessibility/…`

The core pattern is “global preferences + consistent application.”

A single provider manages preferences, and the rest of the UI reads from that context.

You can see the provider here:

- `src/components/accessibility/TraumaInformedContext.tsx`

The important architectural move is not any single toggle.

It’s that:

- preferences are centralized
- application of preferences is consistent
- the system is testable

That’s what turns “nice UX ideas” into a maintained capability.

---

## Patterns that scale beyond one screen

Pain Tracker’s trauma-informed feature set (documented and implemented) covers patterns like:

- progressive disclosure
- simplified mode
- gentle language
- adjustable text size
- contrast modes
- reduced motion
- touch target sizing

The details matter, but the higher-level lesson is this:

> Don’t hardcode “comfort” decisions into a single form. Make them composable.

This keeps the app coherent as it grows.

---

## Accessibility has its own index (and verification aids)

The repo keeps accessibility documentation organized under:

- `docs/index/accessibility.md`

That index links to the core specs/checklists, and also to screenshot/verification aids.

This is a very practical strategy:

- it makes “what does accessible mean here?” answerable
- it gives future contributors a concrete bar to hit
- it reduces the risk of regressions when UI changes happen fast

---

## Tests are part of accessibility, too

Pain Tracker includes an automated accessibility scan entrypoint:

- `npm run accessibility:scan`

This runs a Playwright-based scan (`e2e/accessibility.spec.ts`) as a repeatable check.

The key point isn’t “we ran it once.”

It’s that the repo has a command you can run any time to catch obvious regressions.

---

## Next up (requires human review)

The next posts in the series touch **explicit trust boundaries** (exports, WorkSafeBC workflows, and analytics). Those drafts are best treated as “reviewed writing,” not autopilot content.

Prev: [Part 4 — Zod + defensive parsing](./devto-series-04-zod-defensive-parsing.md)
Next: [Part 6 — Exports as a security boundary](./devto-series-06-exports-as-a-security-boundary.md)
