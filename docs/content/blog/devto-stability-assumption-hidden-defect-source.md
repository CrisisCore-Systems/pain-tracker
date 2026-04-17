---
title: The Stability Assumption: The Hidden Defect Source
description: Most software does not fail at the bug layer first. It fails at the assumption layer.
published: false
tags: architecture, privacy, offlinefirst, security
cover_image:
---

If you have already read
[Architecting for Vulnerability: Introducing Protective Computing Core v1.0](https://dev.to/crisiscoresystems/architecting-for-vulnerability-introducing-protective-computing-core-v10-91g)
and
[Protective Computing Is Not Privacy Theater](https://dev.to/crisiscoresystems/protective-computing-is-not-privacy-theater-2job),
read this next.

This is the closing argument in that doctrine path. It names the hidden defect
source underneath the rest of the work: the assumption that the user is
operating under stable conditions when the system most needs to survive
instability.

Most software bugs are not random.

A lot of them start much earlier than people think. Not in a broken function.
Not in a missed test. Not in some weird edge case nobody could have seen
coming.

They start in the premise layer.

They start when a product is built around the assumption that the user is operating under normal conditions.

Online. Rested. Safe. Focused. On a working device. With time to think. With
stable access to their accounts. With enough margin to recover cleanly when
something goes wrong.

That assumption is everywhere, which is exactly why it hides so well.

Protective Computing names it directly: the Stability Assumption.

It is the false premise that the user has reliable connectivity, intact
attention, safe surroundings, stable institutions, and enough breathing room to
deal with failure properly. Its companion failure mode is Stability Bias:
treating instability like a weird exception instead of a normal operating
condition.

That may sound abstract until you start tracing real product decisions back to it.

A login flow that assumes immediate access to email is built on it.

A dashboard that becomes useless without a network round-trip is built on it.

A backup import flow that writes to state before preview or validation is built on it.

A sync queue that quietly expands what it can replay over time is built on it.

A so-called privacy-first app that still assumes the user has time, safety, and clarity to understand every failure state is built on it.

That is why this matters.

This is not just a philosophy issue. It is not one more soft conversation about empathy in product design. It is a hidden defect source.

Because when stability drops out, those assumptions do not stay theoretical.
They turn into lockout. Forced disclosure. Fragile recovery. Silent scope
expansion. Irreversible mistakes.

The system starts behaving exactly the way it was designed to behave.

The problem is that it was designed for the wrong human condition.

***

## The Fake Baseline Most Teams Still Build Around

A lot of software is built around a user who is basically fine.

Maybe slightly busy. Maybe a little distracted. But still functional enough to
re-authenticate, read the warning, interpret the prompt, troubleshoot the
failure, and make the right choice in time.

That baseline is fake.

Real users are dealing with pain, fatigue, grief, executive dysfunction, weak
connectivity, low battery, degraded hardware, unsafe environments, unstable
housing, shared devices, legal pressure, interrupted sessions, and broken
institutional support.

Not once in a while.

Regularly.

That changes the question.

You stop asking, "Does this feature work?"

You start asking, "What does this become when the person using it is tired, scared, offline, rushed, watched, or cognitively maxed out?"

That is the question a lot of products quietly avoid.

It is also the question that exposes whether the system is actually trustworthy or just polished under ideal conditions.

***

## Stability Bias Is Convenience Mistaken for Truth

This is where teams get themselves into trouble.

They remove friction because it feels cleaner.

They widen a sync scope because it is easier than maintaining a hard boundary.

They centralize more state because it makes analytics simpler.

They require sign-in because it makes the system feel more unified.

They add telemetry because "we need visibility."

Under stable conditions, all of that can sound reasonable.

That is the trap.

Once the Stability Assumption is baked in, convenience starts masquerading as
correctness. The cleaner path starts looking like the right path. The easier
architecture starts looking like the more mature architecture.

Then real life shows up and exposes what those decisions actually were.

Not harmless optimizations.

Defect multipliers.

That is Stability Bias.

It is what happens when a team optimizes for the user they imagine instead of the user who actually exists.

***

## What This Looks Like In Practice

This gets real fast when you stop talking about principles and start looking at boundaries.

In PainTracker, background sync is not treated like some innocent convenience
layer. It is treated like a place where a small change can quietly turn the
product into something else.

That is why the boundary is strict.

Exact method-and-path allowlisting at enqueue and replay. Same-origin only. No wildcard drift. Disallowed queue items dropped and deleted.

That is not paranoia.

That is what it looks like when you understand that a sync queue is one of the fastest ways a local-first app can slowly become a replay surface.

Same with backup import.

The goal is not "make restore easy no matter what." The goal is controlled recovery under imperfect conditions.

So the flow stays narrow: settings-only backup, strict envelope, explicit
allowlist, hard deny on risky keys, preview before write, typed confirmation
token, bounded size, bounded key count.

That is not decorative friction.

That is the system refusing to pretend the user is always calm, clearheaded, and operating in a safe environment.

The privacy posture follows the same logic.

No account required. Local-first by default. Health data stays local by
default. No health-data analytics sent to a server. Optional network behavior
is bounded and does not quietly turn into broader extraction.

That is what privacy looks like when it is structural.

Not branding. Not vibes. Not theater.

Architecture.

***

## The Hidden Bug Is Not That The App Crashed

The hidden bug is that the software was built for the wrong version of reality.

A system can be fast, polished, encrypted, compliant, and still be fundamentally wrong about the conditions it has to survive.

It can pass QA and still fail the user the moment life stops behaving nicely.

That is the deeper point.

The Stability Assumption sits upstream of whole clusters of downstream failure:

- lockout bugs
- sync overreach
- forced disclosure paths
- brittle recovery
- irreversible user mistakes
- cloud dependence disguised as convenience
- core flows that only work when the user has spare attention and time
- products that collapse the second the real world gets involved

These are not weird edge cases.

They are what happens when software meets life.

Protective Computing does not treat that as incidental. It treats it as a design condition.

As it should.

***

## A Better Audit Question

The old question is simple:

Does this work under normal conditions?

The better question is harsher:

What assumption about stability is this feature making, and what happens when that assumption fails?

That question should sit over every auth flow, every import path, every sync
mechanism, every destructive action, every dependency, every telemetry
decision, every recovery path.

Because once you start looking for stability assumptions, you see them everywhere.

And once you see them, you start realizing how many "bugs" were never really bugs in the narrow sense.

They were consequences.

The code was doing exactly what the premise told it to do.

Not bad code.

Bad premises.

***

## The Blunt Version

Most software is not broken because engineers are sloppy.

A lot of it is broken because it was designed for a fictional user in a fictional world.

A user with stable internet, stable attention, stable access, stable safety, stable time, and stable systems behind them.

A lot of real users do not have that.

So if your architecture depends on them behaving like they do, the defect was there long before the first ticket got filed.

It was there in the assumption layer.

That is the Stability Assumption.

And teams should start hunting it like the defect source it is.

***

*Closing argument in the Protective Computing doctrine reading path.*

*Read first: [Architecting for Vulnerability: Introducing Protective Computing Core v1.0](https://dev.to/crisiscoresystems/architecting-for-vulnerability-introducing-protective-computing-core-v10-91g)
and [Protective Computing Is Not Privacy Theater](https://dev.to/crisiscoresystems/protective-computing-is-not-privacy-theater-2job).*
