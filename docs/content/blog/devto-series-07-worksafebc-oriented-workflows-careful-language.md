---
title: "WorkSafeBC-oriented workflows without overclaims: structured summaries, careful language"
description: "Pain Tracker includes WorkSafeBC-oriented export/report tooling — but the bigger lesson is how to design ‘forms + clinicians’ workflows without turning into surveillance or making legal/medical promises." 
tags:
  - ux
  - documentation
  - privacy
  - export
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
· **Part 7**
· [Part 8](https://dev.to/crisiscoresystems/analytics-without-surveillance-explicit-consent-layered-gates-and-never-sending-class-a-data-59f1)
· [Part 9](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
· [Part 10](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)

This post is Part 7 in a Dev.to series grounded in the open-source **Pain Tracker** repo.

For the short reading path around this specific workflow cluster, start with [WorkSafeBC Documentation Workflows: Start Here](https://blog.paintracker.ca/worksafebc-documentation-workflows-start-here).

If you want the worked example after the philosophy, read the companion case study next:

- [How Pain Tracker Pro Streamlines WorkSafeBC Claims: A Composite Case Study](https://blog.paintracker.ca/how-pain-tracker-pro-streamlines-worksafebc-claims-a-composite-case-study)

- Not medical advice.
- Not a compliance claim.
- This is about building *useful documentation outputs* without drifting into unsafe promises.

If you haven’t read Part 6 yet:

- Part 6: [Exports are a security boundary](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9)

---

## The goal: help people share *structured context*, not “prove” anything

In work-related injury workflows, people often need something that’s both:

- consistent enough for a clinician or case manager to scan
- grounded enough that it doesn’t feel like a re-write of their experience

The temptation (especially in startups) is to over-promise:

- “clinically validated”
- “compliant”
- “fills the official form”

If the code doesn’t do that, don’t say it.

Pain Tracker’s approach is more defensible:

- generate a structured summary of self-reported data
- include explicit disclaimers
- keep the workflow local-first and user-controlled

---

## The repo’s WorkSafeBC export is a local PDF generator

The implementation lives here:

- `src/utils/pain-tracker/wcb-export.ts`

And it’s backed by a large test suite here:

- `src/utils/pain-tracker/wcb-export.test.ts`

It uses jsPDF (via dynamic import) to produce a PDF as a `data:` URI string, then triggers a download.

So the boundary stays consistent with Part 6:

- export = create a file locally
- sharing is the user’s choice

---

## “Careful language” is implemented in the report itself

This is the kind of thing that’s easy to forget when you’re writing product copy.

Pain Tracker bakes the non-claims into the PDF output.

The report includes an explicit disclaimer section (verbatim from the
generator):

> This report is a structured summary of self-reported pain data for WorkSafe
> BC reference only. It does not constitute medical advice, diagnosis, or
> treatment. This document should be reviewed with a qualified healthcare
> provider. Pain Tracker Pro is not affiliated with WorkSafe BC.
> This report is a structured summary of self-reported pain data for WorkSafe BC
> reference only. It does not constitute medical advice, diagnosis, or
> treatment. This document should be reviewed with a qualified healthcare
> provider. Pain Tracker Pro is not affiliated with WorkSafe BC.

That disclaimer is not “marketing.”

It’s a boundary:

- what the report is
- what it is not
- who should interpret it

That same “say only what the code earns” posture is the broader theme of [Maintaining truthful docs over time: how to keep security claims honest](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778).

---

## What the report actually does (grounded in code)

The generator takes:

- a list of `PainEntry` records
- a date range (`startDate`, `endDate`)
- optional identifying fields (patient name, claim number, provider)

And it produces:

- summary metrics (min/max/average, variability)
- lists of common locations/symptoms
- work impact and treatment summaries
- optional “detailed entries” (notes included when present)

This is why careful language matters:

- you’re exporting *self-reported notes*
- you’re shaping them into a “professional looking” document

So you need to keep the output positioned as:

- a structured summary
- not a diagnosis
- not a legal determination

---

## Workflow framing that respects people

The healthiest framing I’ve found for these workflows is:

1) capture (small, repeatable entries)
2) summarize (aggregate in a way humans can read)
3) export (user-controlled boundary)

Anything beyond that (auto-submission, background sharing, “send to insurer”) is a totally different trust boundary.

If you build it, treat it as a new feature with new risks:

- network exposure
- account/identity
- consent UX
- audit trails

Pain Tracker’s local-first stance is intentionally narrower.

---

## Next up

Part 8 covers analytics without surveillance: how the repo gates outbound
analytics behind *both* an env flag and explicit consent, and how it avoids
Class A fields in GA4 event params.

Prev: [Part 6 — Exports as a security boundary](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9)
Next: [Part 8 — Analytics without surveillance](https://dev.to/crisiscoresystems/analytics-without-surveillance-explicit-consent-layered-gates-and-never-sending-class-a-data-59f1)
