---
title: "Analytics without surveillance: explicit consent, layered gates, and never sending Class A data"
description: "Pain Tracker keeps analytics behind an env flag + explicit consent, avoids sending health data, and prefers local-only tracking where possible. Here’s the concrete pattern, grounded in the repo." 
tags:
  - privacy
  - security
  - analytics
  - ux
  - webdev
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---

_Series:_ [Start here](./devto-series-00-start-here.md) · [Part 1](./devto-series-01-offline-first-local-first-architecture.md) · [Part 2](./devto-series-02-three-storage-layers-state-cache-offline-db-encrypted-vault.md) · [Part 3](./devto-series-03-service-workers-that-dont-surprise-you.md) · [Part 4](./devto-series-04-zod-defensive-parsing.md) · [Part 5](./devto-series-05-trauma-informed-ux-accessibility-as-architecture.md) · [Part 6](./devto-series-06-exports-as-a-security-boundary.md) · [Part 7](./devto-series-07-worksafebc-oriented-workflows-careful-language.md) · **Part 8** · [Part 9](./devto-series-09-quality-gates-that-earn-trust.md) · [Part 10](./devto-series-10-maintaining-truthful-docs-over-time.md)

Analytics in health-adjacent apps has a special failure mode:

- you add “just one metric”
- then you add another
- then a refactor starts sending richer context
- and suddenly you’re collecting things you never intended to collect

Pain Tracker tries to avoid that drift with a few simple rules:

1) analytics is **off by default**
2) analytics requires **explicit consent**
3) analytics is **defense-in-depth gated** (multiple checks)
4) analytics payloads **never include Class A health content** (no notes, no symptoms, no meds)

This post is grounded in the repo’s implementation:

- `src/analytics/analytics-gate.ts`
- `src/analytics/analytics-loader.ts`
- `src/analytics/ga4-events.ts`
- `src/components/AnalyticsConsentPrompt.tsx`
- `src/components/settings/PrivacySettings.tsx`
- `src/utils/usage-tracking.ts`

---

## Rule 1: analytics is a capability, not a background assumption

The first gate is deployment-level: an environment flag.

In this repo, analytics is controlled with a Vite env var (e.g. `VITE_ENABLE_ANALYTICS`). When disabled, the app should behave as if analytics does not exist.

This is a small architectural choice with big impact:

- privacy-friendly deployments can hard-disable analytics
- you avoid “whoops, we accidentally shipped tracking” moments

---

## Rule 2: consent is explicit and revocable

Even if analytics is enabled in a deployment, it still doesn’t run without user opt-in.

Pain Tracker includes a dedicated consent surface (prompt + settings). This is important for trauma-informed UX:

- control is part of safety
- “no” must be respected without nagging
- “change my mind later” must be possible

---

## Rule 3: defense-in-depth gating (flag + consent + runtime reality)

There are multiple ways analytics can accidentally “turn on”:

- a component calls a tracking helper on mount
- a shared hook starts emitting events
- a remote analytics script partially loads

The repo addresses this with layered checks:

- an env-gate and a consent-gate decide if analytics should be enabled
- the loader only injects remote analytics when allowed
- event senders verify the runtime is actually present before sending (no `gtag`, no event)

This is how you keep “disabled means no-op” true.

---

## Rule 4: analytics payloads must be designed to exclude Class A data

If your app stores Class A data (pain entries, symptoms, meds, free-text notes), assume it will leak unless you deliberately design against it.

Pain Tracker’s event helpers aim to only send coarse information:

- counts
- booleans
- category/bucket values

Not:

- free text
- per-entry timestamps
- anything that can reconstruct someone’s log

This isn’t a compliance claim.

It’s a pragmatic engineering rule: analytics should be useful without being invasive.

---

## Prefer local-only tracking when it can do the job

The repo also includes local usage tracking utilities (stored on-device) intended for lightweight UX behavior and product insight without shipping data off-device.

You still need to be careful here:

- sanitize metadata
- don’t store raw notes
- don’t store enough detail to recreate someone’s history

But local-only tracking can cover a surprising amount:

- “has the user seen this onboarding tip?”
- “how often is export used?” (as a count, not content)

---

## Next up

Part 9 is where these rules get teeth: tests and quality gates that keep privacy promises from drifting over time.

Prev: [Part 7 — WorkSafeBC-oriented workflows without overclaims](./devto-series-07-worksafebc-oriented-workflows-careful-language.md)
Next: [Part 9 — Quality gates that earn trust](./devto-series-09-quality-gates-that-earn-trust.md)
