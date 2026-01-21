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

_Series:_ [Start here](./devto-series-00-start-here.md) · [Part 1](./devto-series-01-offline-first-local-first-architecture.md) · [Part 2](./devto-series-02-three-storage-layers-state-cache-offline-db-encrypted-vault.md) · [Part 3](./devto-series-03-service-workers-that-dont-surprise-you.md) · [Part 4](./devto-series-04-zod-defensive-parsing.md) · [Part 5](./devto-series-05-trauma-informed-ux-accessibility-as-architecture.md) · [Part 6](./devto-series-06-exports-as-a-security-boundary.md) · **Part 7** · [Part 8](./devto-series-08-analytics-without-surveillance-explicit-consent.md) · [Part 9](./devto-series-09-quality-gates-that-earn-trust.md) · [Part 10](./devto-series-10-maintaining-truthful-docs-over-time.md)

This post is Part 7 in a Dev.to series grounded in the open-source **Pain Tracker** repo.

- Not medical advice.
- Not a compliance claim.
- This is about building *useful documentation outputs* without drifting into unsafe promises.

If you haven’t read Part 6 yet:
- Part 6: [Exports are a security boundary](./devto-series-06-exports-as-a-security-boundary.md)

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

The report includes an explicit disclaimer section (verbatim from the generator):

> This report is a structured summary of self-reported pain data for WorkSafe BC reference only. It does not constitute medical advice, diagnosis, or treatment. This document should be reviewed with a qualified healthcare provider. Pain Tracker Pro is not affiliated with WorkSafe BC.

That disclaimer is not “marketing.”

It’s a boundary:

- what the report is
- what it is not
- who should interpret it

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

Part 8 covers analytics without surveillance: how the repo gates outbound analytics behind *both* an env flag and explicit consent, and how it avoids Class A fields in GA4 event params.

Prev: [Part 6 — Exports as a security boundary](./devto-series-06-exports-as-a-security-boundary.md)
Next: [Part 8 — Analytics without surveillance](./devto-series-08-analytics-without-surveillance-explicit-consent.md)
