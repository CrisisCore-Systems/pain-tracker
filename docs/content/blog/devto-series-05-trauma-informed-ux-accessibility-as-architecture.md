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

**Series:**
[Start here](https://dev.to/crisiscoresystems/start-here-paintracker-crisiscore-build-log-privacy-first-offline-first-no-surveillance-3h0k)
· [Part 1](https://dev.to/crisiscoresystems/offline-first-without-a-backend-a-local-first-pwa-architecture-you-can-trust-3j15)
· [Part 2](https://dev.to/crisiscoresystems/three-storage-layers-in-an-offline-first-health-pwa-state-cache-vs-indexeddb-vs-encrypted-vault-19b7)
· [Part 3](https://dev.to/crisiscoresystems/service-workers-that-dont-surprise-you-deterministic-caching-for-offline-first-pwas-5480)
· [Part 4](https://dev.to/crisiscoresystems/zod-defensive-parsing-in-a-local-first-app-make-your-offline-data-trustworthy-1016)
· **Part 5**
· [Part 6](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9)
· [Part 7](https://dev.to/crisiscoresystems/worksafebc-oriented-workflows-without-overclaims-structured-summaries-careful-language-2n3i)
· [Part 8](https://dev.to/crisiscoresystems/analytics-without-surveillance-explicit-consent-layered-gates-and-never-sending-class-a-data-59f1)
· [Part 9](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
· [Part 10](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)

This post is Part 5 in a Dev.to series grounded in the open-source **Pain Tracker** repo.

For the full reading path around this design layer, start with [Trauma-Informed Design: Start Here](https://blog.paintracker.ca/trauma-informed-design-start-here).

It also serves as the architecture anchor for the broader Trauma-Informed
Design reading path alongside
[Two People, Same Body](https://dev.to/crisiscoresystems/two-people-same-body-a-developers-crisis-architecture-25ko),
[Trauma-Informed React Hooks](https://dev.to/crisiscoresystems/trauma-informed-react-hooks-483n),
and
[Building Software That Actually Gives a Damn](https://dev.to/crisiscoresystems/building-software-that-actually-gives-a-damn-my-journey-with-trauma-informed-design-12h3).

- Not medical advice.
- Not a compliance claim.
- This is about building for bad days: pain flares, brain fog, tremor, and overload.

If you haven’t read Part 4 yet:

- Part 4: [Zod + defensive parsing](https://dev.to/crisiscoresystems/zod-defensive-parsing-in-a-local-first-app-make-your-offline-data-trustworthy-1016)

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

If you want the hook-level implementation behind that provider boundary, read [Trauma-Informed React Hooks](https://dev.to/crisiscoresystems/trauma-informed-react-hooks-483n).

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

And if you want the visual contract that verifies crisis mode actually looks
different once those preferences are applied, read
[Visual Regression for Adaptive Interfaces: Testing That Crisis Mode Actually Looks Different](/blog/visual-regression-adaptive-interfaces).

---

## Next up (requires human review)

The next posts in the series touch **explicit trust boundaries**: exports,
WorkSafeBC workflows, and analytics. Those drafts are best treated as
“reviewed writing,” not autopilot content.

Prev: [Part 4 — Zod + defensive parsing](https://dev.to/crisiscoresystems/zod-defensive-parsing-in-a-local-first-app-make-your-offline-data-trustworthy-1016)
Next: [Part 6 — Exports as a security boundary](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9)
