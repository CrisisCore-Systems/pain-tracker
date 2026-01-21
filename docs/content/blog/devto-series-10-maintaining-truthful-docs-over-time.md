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

_Series:_ [Start here](./devto-series-00-start-here.md) · [Part 1](./devto-series-01-offline-first-local-first-architecture.md) · [Part 2](./devto-series-02-three-storage-layers-state-cache-offline-db-encrypted-vault.md) · [Part 3](./devto-series-03-service-workers-that-dont-surprise-you.md) · [Part 4](./devto-series-04-zod-defensive-parsing.md) · [Part 5](./devto-series-05-trauma-informed-ux-accessibility-as-architecture.md) · [Part 6](./devto-series-06-exports-as-a-security-boundary.md) · [Part 7](./devto-series-07-worksafebc-oriented-workflows-careful-language.md) · [Part 8](./devto-series-08-analytics-without-surveillance-explicit-consent.md) · [Part 9](./devto-series-09-quality-gates-that-earn-trust.md) · **Part 10**

This post is Part 10 in a Dev.to series grounded in the open-source **Pain Tracker** repo.

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

---

## Wrap-up

If you only take one thing from this series:

> Make your claims testable.

That’s how you build trust without pretending to be perfect.

Prev: [Part 9 — Quality gates that earn trust](./devto-series-09-quality-gates-that-earn-trust.md)
