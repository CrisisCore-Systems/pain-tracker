---
title: The Protective Legitimacy Score: How to Tell Whether a Trust Claim Is Structural
description: The Protective Legitimacy Score is a structural test for trust claims. It asks whether privacy, offline-first, and safety language is backed by architecture, defaults, and failure behavior.
published: false
tags: architecture, privacy, security, webdev
cover_image:
---
<!-- pain-tracker:target-link:start -->
> Structural evaluation checklist: [best pain tracking app criteria](https://paintracker.ca/resources/best-pain-tracking-app)
<!-- pain-tracker:target-link:end -->
If a product says it is privacy first, offline first, trauma informed, or resilient, the hard question is not whether the copy sounds good.

The hard question is whether the system earns the claim.

That is what the Protective Legitimacy Score is for.

PLS is not a badge, not a certification, and not a compliance shortcut. It is a structural scoring method for checking whether a system's trust language is supported by architecture, defaults, failure behavior, and recovery paths.

The short version:

- claims do not generate score
- structure generates score
- defaults matter more than marketing
- graceful failure matters more than polished happy paths

If you want the doctrine underneath the score, start with the [Protective Computing canon](https://doi.org/10.5281/zenodo.18887610), then the [live Protective Computing library](https://protective-computing.github.io/).

## Why this score exists

Modern software is full of protective language that collapses on inspection.

You see apps described as:

- encrypted
- offline first
- privacy first
- local first
- trauma informed
- secure by design

Sometimes the individual feature behind the phrase is real.

But the system still fails the user where it matters most.

Startup still requires a network call.

Backup export silently drops the metadata needed for restore.

Sensitive state still goes to third-party analytics.

Destructive actions remain ambiguous under stress.

Recovery paths assume the user is calm, rested, online, and thinking clearly.

That gap between rhetoric and structure is exactly what PLS is meant to expose.

## What PLS measures

PLS comes out of Protective Computing, which treats vulnerable-state software as a systems problem rather than a branding problem.

A protective system must preserve five things:

1. Local authority
2. Exposure minimization
3. Reversibility
4. Degraded functionality resilience
5. Coercion resistance

PLS asks whether those properties are materially supported.

Not in the abstract.

In the actual product.

That means checking questions like:

- Does the core task still work when the internet disappears?
- Can the user recover from a mistake locally?
- Does export preserve meaning, not just raw bytes?
- Does optional subsystem failure collapse the main workflow?
- Does the interface reduce or increase pressure under stress?
- Is the trust claim backed by a reproducible verification path?

The score is useful because it forces maintainers to answer those questions at the architecture layer.

## What PLS is not

This matters because scoring systems are easy to misuse.

PLS is not:

- a product certification
- a substitute for threat modeling
- a legal or compliance determination
- a guarantee of safety
- a way to claim perfect protection

It is also not meant to reward theater.

If a team adds a consent modal, a privacy badge, or a polished security page without changing the underlying system behavior, that should not meaningfully improve legitimacy.

PLS only becomes useful if it stays hostile to hollow improvements.

That is why the score is paired with explicit caution about Goodhart's Law: once a metric becomes a target, people start optimizing the appearance of the number instead of the thing the number was supposed to measure.

## The easiest way to spot a low-legitimacy system

You usually do not need the full rubric to detect the problem class.

Start with these red flags:

- core workflow depends on cloud services that are described as optional
- export or backup paths are underdocumented and untested
- destructive actions are faster than recovery actions
- analytics or telemetry are broader than the product copy suggests
- lock states or trust boundaries are ambiguous
- docs use strong protection language without concrete artifacts
- a failure in an auxiliary feature breaks the main job of the product

If several of those show up together, the trust claim is probably rhetorical before you ever compute a formal score.

## What a higher-legitimacy system tends to look like

A stronger score does not come from sounding careful. It comes from structuring the system to survive instability.

That usually means:

- local writes before remote sync
- explicit export and restore paths
- bounded optional integrations
- reviewable destructive actions
- truthful documentation about scope and non-guarantees
- evidence tied to real tests, release gates, or artifact receipts

That is why PLS is best used alongside a proof path rather than a marketing page.

The number alone is not enough. The verification surface matters.

## A concrete reference point

PainTracker is useful here because it gives the doctrine a live reference implementation instead of leaving it at the manifesto layer.

The public proof path is here:

- [Case study](https://paintracker.ca/case-study)
- [Proof materials](https://paintracker.ca/proof)
- [GitHub org](https://github.com/CrisisCore-Systems)

That does not make the system perfect.

It does make the trust story inspectable.

That is the point.

Protective legitimacy is structural, not rhetorical.

If someone cannot inspect what you checked, what you excluded, and what still remains risky, then the trust claim is incomplete no matter how polished the copy sounds.

## How to use PLS without turning it into theater

Use it as a forcing function:

1. Score the system honestly.
2. Record why the score is what it is.
3. Link the claim to artifacts, tests, or boundary documents.
4. Re-score after structural changes, not after copy changes.

If your score improves because the product became more local, more reversible, less extractive, or more truthful under failure, good.

If it improves because the landing page sounds more serious, you are using it wrong.

## The deeper point

PLS exists because software teams are very good at describing their intentions and much worse at proving their behavior.

Protective Computing tries to close that gap.

The score is one part of that.

Not the destination. The forcing function.

## Links

- [CrisisCore Systems](https://crisiscore-systems.ca)
- [Protective Computing library](https://protective-computing.github.io/)
- [Protective Computing canon DOI](https://doi.org/10.5281/zenodo.18887610)
- [PLS rubric mirror](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/trust/pls-rubric.md)
- [PainTracker proof route](https://paintracker.ca/proof)

If you want the doctrinal entry point before the score, read [Architecting for Vulnerability: Introducing Protective Computing Core v1.0](https://dev.to/crisiscoresystems/architecting-for-vulnerability-introducing-protective-computing-core-v10-91g).