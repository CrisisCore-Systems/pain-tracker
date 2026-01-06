<!-- markdownlint-disable MD013 MD041 -->

[Back to series hub](../SERIES_FROM_IDEA_TO_ACCESSIBLE_HEALTH_PWA.md)

# Part 7 — Building the PWA Shell and Install Experience

Before someone trusts you with a log entry, they need to trust something simpler: that the app will
open, behave predictably, and not get in their way.

If Parts 1–6 are about *trust*, Part 7 is about *trust signals*.

People don’t evaluate a health tool the way they evaluate a news site. They notice:

- does it open reliably?
- does it feel stable?
- does it behave like a tool, not a funnel?

Your PWA shell is the first place those questions get answered.

Before anyone believes your tracking features, they have to believe the app will be there when they
need it.

## The PWA shell is a promise

The “shell” is what loads before data is even visible:

- HTML/CSS/JS bundle
- routing
- offline handling
- update handling

For a privacy-first health app, the shell should feel like a local utility: immediate, predictable,
and quiet.

## Manifest choices that matter

Treat the web app manifest as user-facing configuration.

Decisions to be explicit about:

- **Name and short name**: clear, non-stigmatizing, not overly clinical
- **Icons**: crisp at multiple sizes (install credibility)
- **Display mode**: choose what best matches “tool” expectations
- **Start URL + scope**: avoid confusing launches into the wrong route

If a user installs your app and it opens to an error or a weird deep link, you lose trust instantly.

## Install UX: never pressure, always explain

Install prompts are often used as growth hacks. Don’t.

For a health tool:

- ask at a moment of success (after the user has logged something)
- explain the benefit in plain language (“Faster access, works offline”)
- allow dismissal without nagging

If users feel coerced, they will assume surveillance.

## Service worker behavior: keep it boring

Your service worker should be boring.

Good boring looks like:

- the app opens offline
- updates don’t break the current session
- cache strategy is simple and explainable

Avoid clever caching that increases uncertainty. Reliability beats optimization.

## Update strategy: protect in-progress work

The biggest PWA trust break is an update that interrupts a user mid-entry.

Rules:

- never force reload while the user is editing
- present “Update available” as a choice
- offer “Refresh when ready”

In a health context, “later” is a valid answer.

## Offline UX: honest and calm

Offline UX should not be dramatic.

- prefer subtle indicators (“Offline”)
- keep the primary flow working
- avoid big blocking banners

When the user is offline, they already know life is complicated. Your job is to be steady.

## PWA shell quick check

1) App launches reliably with no network
2) Install prompt is optional and non-pushy
3) Updates never interrupt in-progress logging
4) Cache strategy is explainable and consistent
5) Offline state is communicated calmly

## Next: Part 8 — Protecting Data: Threat Modeling for Small Teams

Next, Part 8 runs a lightweight threat-modeling exercise that fits a solo/indie team: realistic
risks, pragmatic controls, and clear boundaries on what you can and can’t promise.

---
