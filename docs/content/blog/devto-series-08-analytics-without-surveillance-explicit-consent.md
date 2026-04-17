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

**Series:**
[Start here](https://dev.to/crisiscoresystems/start-here-paintracker-crisiscore-build-log-privacy-first-offline-first-no-surveillance-3h0k)
· [Part 1](https://dev.to/crisiscoresystems/offline-first-without-a-backend-a-local-first-pwa-architecture-you-can-trust-3j15)
· [Part 2](https://dev.to/crisiscoresystems/three-storage-layers-in-an-offline-first-health-pwa-state-cache-vs-indexeddb-vs-encrypted-vault-19b7)
· [Part 3](https://dev.to/crisiscoresystems/service-workers-that-dont-surprise-you-deterministic-caching-for-offline-first-pwas-5480)
· [Part 4](https://dev.to/crisiscoresystems/zod-defensive-parsing-in-a-local-first-app-make-your-offline-data-trustworthy-1016)
· [Part 5](https://dev.to/crisiscoresystems/trauma-informed-ux-accessibility-as-architecture-not-polish-22jg)
· [Part 6](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9)
· [Part 7](https://dev.to/crisiscoresystems/worksafebc-oriented-workflows-without-overclaims-structured-summaries-careful-language-2n3i)
· **Part 8**
· [Part 9](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
· [Part 10](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)

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

For the broader reading path around this architecture, start here: [Start Here: PainTracker and the CrisisCore Build Log](https://dev.to/crisiscoresystems/start-here-paintracker-crisiscore-build-log-privacy-first-offline-first-no-surveillance-3h0k).

---

## Rule 1: analytics is a capability, not a background assumption

The first gate is deployment-level: an environment flag.

In this repo, analytics is controlled with a Vite env var such as
`VITE_ENABLE_ANALYTICS`. When disabled, the app should behave as if analytics
does not exist.

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

If your app stores Class A data such as pain entries, symptoms, meds, and
free-text notes, assume it will leak unless you deliberately design against it.

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

The repo also includes local usage tracking utilities stored on-device for
lightweight UX behavior and product insight without shipping data off-device.

You still need to be careful here:

- sanitize metadata
- don’t store raw notes
- don’t store enough detail to recreate someone’s history

But local-only tracking can cover a surprising amount:

- “has the user seen this onboarding tip?”
- “how often is export used?” (as a count, not content)

That export example is intentional: Part 6 shows how export telemetry is kept
separate and minimal at the exact point local-first data becomes shareable:
[Exports are a security boundary](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9).

---

## Next up

Part 9 is where these rules get teeth: tests and quality gates that keep privacy promises from drifting over time.

Prev: [Part 7 — WorkSafeBC-oriented workflows without overclaims](https://dev.to/crisiscoresystems/worksafebc-oriented-workflows-without-overclaims-structured-summaries-careful-language-2n3i)
Next: [Part 9 — Quality gates that earn trust](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
