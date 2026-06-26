---
title: "Protective Computing: Software Should Fail Safely Under Stress"
description: "Protective Computing is an engineering approach for building software that reduces exposure and fails safely under stress."
tags:
  - architecture
  - softwareengineering
  - sre
  - ux
canonical_url: "https://dev.to/crisiscoresystems/protective-computing-software-should-fail-safely-under-stress-4egb"
---
<!-- pain-tracker:target-link:start -->
> Apply the structural checklist: [best pain tracking app criteria](https://paintracker.ca/resources/best-pain-tracking-app)
<!-- pain-tracker:target-link:end -->
Good software is usually judged by the happy path.

Can the user sign up?

<!-- pain-tracker:cta-top -->
> If you want privacy-first, offline health tech to exist *without* surveillance funding it: sponsor the build → https://github.com/sponsors/CrisisCore-Systems

Can they complete the flow?

Can the dashboard load?

Can the team ship the feature?

Those questions matter, but they are not enough for software that handles sensitive data or supports people under stress.

The harder question is:

who pays when the system fails?

Protective Computing is my name for an engineering discipline built around that question.

## The happy path is too stable

Most product decisions quietly assume a stable user.

The user has internet. They have time. They are safe. They are focused. They can read carefully. They control the device. They remember the context. They can recover from mistakes. They can wait for the system to come back.

That baseline is false more often than our software admits.

People use software while tired, in pain, frightened, rushed, displaced, surveilled, overloaded, or stuck inside institutional processes they do not control.

When systems ignore that reality, the failure does not stay technical.

It becomes lockout.

Silent data loss.

Forced disclosure.

Confusing recovery.

Irreversible deletion.

Unsupported claims.

The product did not merely hit an edge case. It transferred the cost of instability to the person least able to absorb it.

## The Stability Assumption

Protective Computing starts by naming the Stability Assumption.

The Stability Assumption is the false premise that users have continuous connectivity, reliable hardware, cognitive surplus, safe surroundings, stable institutions, uninterrupted sessions, and enough time to troubleshoot failure.

Its product-level result is Stability Bias:

software optimized for ideal conditions that becomes brittle, extractive, or unsafe when those conditions disappear.

You can see Stability Bias in small decisions:

- a form that loses data after a session timeout
- a backup import that overwrites before previewing
- an app that cannot open without remote config
- a "privacy-first" feature that logs sensitive state
- a delete button that hides scope behind vague language
- an account wall in front of a basic local task
- an AI helper that sends private content away by default

None of those failures require bad intent.

They require only an architecture that treats instability as rare.

## What Protective Computing prioritizes

Protective Computing pushes a different priority order.

It starts with user safety, data integrity, local authority, recoverability, clarity under stress, exposure minimization, degraded functionality, coercion resistance, and truthful claims.

Only after that come convenience, feature breadth, polish, and engagement.

That order matters because lower priorities are often used to rationalize risk.

"It is easier if everything syncs."

"It is smoother if we hide the warning."

"It is better for growth if users create an account first."

"It is more insightful if we collect more analytics."

"It is faster if we skip the export preview."

Sometimes a tradeoff is justified.

But in vulnerable-state software, the tradeoff has to be named. Convenience is not a safety argument.

## The six practical principles

The framework can be summarized as six engineering commitments.

**Local authority.**
The user should retain as much control as possible over their data, device state, storage, export, deletion, and ability to pause or leave.

**Exposure minimization.**
Collect, store, transmit, render, log, and retain the minimum necessary data. Treat every expansion of visibility as a risk that needs justification.

**Reversibility.**
Destructive or high-risk actions should be explicit, scoped, and recoverability-conscious. Do not pretend an action is reversible if it is not.

**Degraded functionality resilience.**
Core utility should survive weak connectivity, interrupted sessions, service failures, stale caches, low permissions, and optional subsystem failures where possible.

**Coercion resistance.**
Interfaces should reduce pressure, forced disclosure, conspicuous exposure, misleading urgency, and manipulative defaults.

**Essential utility over engagement.**
If a decision improves stickiness while reducing safety, clarity, recoverability, or privacy, the decision should lose.

These are not slogans.

They have to show up in defaults, storage, export paths, error messages, tests, and documentation.

## PainTracker as a reference example

PainTracker.ca is a small example of this thinking in practice.

It is not a medical system. It is not a diagnostic tool. It is not a provider portal. It is not endorsed by any clinic, insurer, compensation board, or institution.

It is a patient support tool for recording and organizing self-reported pain information.

That narrower scope makes the protective requirements clearer.

Core pain logging should not require an account.

The write path should not require server availability.

Private records should not become silent analytics.

Reports should be user-triggered exports, not automatic provider submissions.

The app should be honest that local-first browser storage has limits.

The product copy should not claim clinical outcomes, institutional acceptance, or medical validation it does not have.

That is Protective Computing at product scale:

less theater, more boundary.

## How to apply it to one feature

Pick one feature in your own app.

Then ask:

- What happens if internet access disappears?
- What happens if the user is interrupted mid-action?
- What happens if the device is shared or coerced open?
- What data becomes more exposed because of this feature?
- Can the user reverse the consequences locally?
- Does backup or export preserve the meaning of the data?
- Does this introduce silent failure or silent loss?
- Does it increase trust in a third party?
- Is the interface more cognitively demanding under stress?
- What proof supports the safety claim?

If the answers are vague, the feature is not ready to be called safe, private, local-first, resilient, or protective.

It might still ship.

But the claim has not been earned.

## The anti-theater rule

Protective legitimacy is structural.

A system is not protective because the landing page says "privacy-first".

It is protective only if the architecture, defaults, failure behavior, recovery paths, and documentation materially support the claim.

That means:

- do not say offline-first if startup requires a server
- do not say encrypted if backups drop encryption metadata
- do not say recoverable without restore proof
- do not say user-controlled if export quietly sends data elsewhere
- do not say trauma-informed if the workflow punishes exhaustion and interruption

Trust language that outruns system behavior is not marketing.

It is a defect.

## The useful takeaway

The next time you review a feature, do not start with "Does it work?"

Start with:

"How does this fail under vulnerability?"

That question changes the architecture. It changes the copy. It changes what gets logged. It changes which dependencies are acceptable. It changes which failures are tolerable.

That is the point.

Software should not only work for people having stable days.

It should fail with less damage when stability is gone.

- PainTracker reference implementation: [PainTracker.ca](https://paintracker.ca)
- Open repo: [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)
- CrisisCore Systems: [crisiscore-systems.ca](https://crisiscore-systems.ca)
<!-- pain-tracker:cta-bottom -->
---
## Support this work

- Sponsor the project (primary): https://github.com/sponsors/CrisisCore-Systems
- Star the repo (secondary): https://github.com/CrisisCore-Systems/pain-tracker
