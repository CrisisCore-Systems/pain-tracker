---
title: "Building Health-Adjacent Software Without Overclaiming"
description: "Responsible patient-context framing: how doctors use pain diaries     One of the fastest ways to..."
tags:
  - discuss
  - privacy
  - sideprojects
  - softwaredevelopment
canonical_url: "https://dev.to/crisiscoresystems/building-health-adjacent-software-without-overclaiming-2c7d"
cover_image: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fg60iauorwwvsrqkxi8yv.png"
---
<!-- pain-tracker:target-link:start -->
> Responsible patient-context framing: [how doctors use pain diaries](https://paintracker.ca/resources/how-doctors-use-pain-diaries)
<!-- pain-tracker:target-link:end -->
One of the fastest ways to make a health-adjacent tool untrustworthy is to overclaim.

Useful does not mean diagnostic.

<!-- pain-tracker:cta-top -->
> If you want privacy-first, offline health tech to exist *without* surveillance funding it: sponsor the build → https://github.com/sponsors/CrisisCore-Systems

Helpful does not mean clinically validated.

Relevant does not mean endorsed.

Indie developers building health-adjacent tools walk a narrow line. On one side, there is real usefulness. On the other, there is irresponsible positioning.

PainTracker.ca is intentionally framed as:

a patient support tool for organizing self-reported pain information.

Not a diagnostic tool.

Not a treatment tool.

Not a medical record replacement.

## The overclaim trap

Health language is tempting because it sounds authoritative.

That is exactly why it needs restraint.

Avoid language like:

- clinically proven
- improves outcomes
- provider approved
- official
- certified
- guaranteed
- medical-grade
- replaces appointments
- helps win claims

Those claims require evidence, authority, or institutional status most small tools do not have.

Borrowing that authority without proof is not growth. It is a trust failure.

## Better language

There is still plenty of truthful language available.

Use wording like:

```text
May help users organize self-reported information.
```

```text
Can support appointment preparation.
```

```text
Designed to improve recall and documentation clarity.
```

```text
Does not replace clinical judgment.
```

This language is less flashy.

It is also more defensible.

The goal is not to make the product sound smaller than it is. The goal is to describe the actual boundary.

## Health-adjacent categories are not the same

Not every health-related tool does the same job.

| Category | Example |
| --- | --- |
| Diagnostic | Identifies disease or condition |
| Clinical management | Used by clinicians to guide care |
| Patient support | Helps user record, organize, or remember information |
| Administrative support | Helps prepare forms or summaries |
| Education | Explains concepts or options |

PainTracker belongs in patient support.

That category can still matter. It can help someone organize their notes, remember patterns, and bring clearer context into an appointment.

But it should not pretend to be a clinical system.

## Why restraint builds trust

Responsible limits make a tool more credible.

A clinician, administrator, privacy reviewer, or skeptical developer is more likely to take the product seriously if it does not pretend to be more than it is.

The same is true for users.

People dealing with pain, injury, illness, or paperwork do not need inflated promises. They need clear boundaries.

What can this tool do?

What can it not do?

What remains my responsibility?

What remains a clinician's responsibility?

What happens to my data?

Those questions are part of the product.

## PainTracker's claim boundary

PainTracker can truthfully say it is:

- free for core use
- browser-based
- offline-capable after load
- local-first by default
- patient-controlled
- useful for tracking pain, symptoms, triggers, medication notes, sleep impact, and functional impact
- potentially useful for appointment preparation

PainTracker should not say it:

- improves medical outcomes
- is accepted by clinics
- is approved by WorkSafeBC or any compensation board
- helps win claims
- replaces medical documentation
- diagnoses conditions

That boundary is protective.

It keeps the product useful without converting usefulness into unsupported authority.

## Responsible launch checklist

Before publishing a health-adjacent feature, ask:

```text
[ ] Is every claim true?
[ ] Is every limitation visible?
[ ] Are endorsements implied anywhere?
[ ] Is clinical language used carefully?
[ ] Does the product explain what it is not?
[ ] Is user consent clear?
[ ] Is privacy explained plainly?
[ ] Could a clinician read this without rolling their eyes?
```

The last question is informal, but useful.

If the copy sounds like it is trying to sneak past scrutiny, rewrite it.

## The useful takeaway

Health-adjacent software can be valuable without pretending to be clinical.

That is the responsible lane for many small tools.

PainTracker.ca is intentionally built and described as a patient support tool.

If you build health-adjacent software, audit your claims before you audit your conversion funnel.
<!-- pain-tracker:cta-bottom -->
---
## Support this work

- Sponsor the project (primary): https://github.com/sponsors/CrisisCore-Systems
- Star the repo (secondary): https://github.com/CrisisCore-Systems/pain-tracker
