---
title: "BlackoutBench: I Built a Tool That Tests Whether Your App Survives the Real Planet"
description: "BlackoutBench is a planetary stress harness for web apps. It tests what remains useful when stability assumptions fail: signal, power, continuity, and human attention."
published: false
tags: webdev, testing, pwa, architecture
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
cover_image:
---

Most Earth Day software asks us to look at the planet.

I wanted to ask what the planet does to our software.

BlackoutBench is a planetary stress harness for web apps. It tests what survives when stability assumptions fail: stable signal, stable power, uninterrupted attention, clean reloads, predictable recovery.

The planet does not care about your happy path.

Real life does not honor those assumptions.

That is the thesis behind BlackoutBench, a small resilience tool I built to test what remains useful when a web app loses the conditions it quietly depends on.

Not what looks polished.
Not what passes in ideal conditions.
What actually survives pressure.

***

## The Stability Fantasy

A lot of software quality work still treats instability like an edge case.

Offline mode is optional.
Slow or unreliable networks are background noise.
Interrupted sessions are user error.
Recovery is something the user is expected to improvise.

But for a lot of people, instability is not rare. It is the environment.

Weak signal.
Old hardware.
Suspended tabs.
Backgrounded sessions.
Partial loads.
Broken continuity.
Reduced battery.
Limited attention.
A task that has to finish now, not after the interface regains composure.

Once you start looking from that angle, a lot of software stops looking robust and starts looking theatrical.

The dashboard is elegant.
The animations are smooth.
The loading states are polite.
And the essential task still collapses the moment the environment stops cooperating.

***

## Why Earth Day Is Also a Software Problem

Earth Day makes it easy to talk about climate, infrastructure, and adaptation at the planetary scale.

Software usually exempts itself from that conversation.

But digital systems are not abstract. They live inside physical conditions:
power, networks, devices, time, stress, and human tolerance for friction.
When software assumes those conditions will stay stable, it quietly
transfers fragility onto the user.

That matters most in the exact moments when people have the least slack to absorb it.

So instead of building another Earth Day visualization, I wanted to build a tool that tests whether software is structurally honest about the world it actually lives in.

BlackoutBench is that tool.

***

## What BlackoutBench Does

BlackoutBench is a planetary stress harness for web apps.

You paste in a URL, run a bench, and it returns a result that is meant to feel more like a failed inspection than a product dashboard.

The output is intentionally direct:

- Survivability Score
- Critical Failures
- Silent Failures
- Essential Utility
- Repair First

The verdict language is sharp on purpose:

- Survives pressure
- Degrades but usable
- Fragile
- Happy-path only

I did not want soft labels that make every result sound manageable. I wanted language that makes fragility legible.

Because when software fails under pressure, the user does not experience that as an interesting engineering nuance. They experience it as lost control.

***

## What It Checks

The MVP is intentionally narrow.

It inspects the moments where continuity usually lies.

BlackoutBench looks at a focused set of resilience conditions:

- offline reload behavior
- essential utility survival
- draft persistence
- failure clarity
- reconnect behavior
- low-bandwidth posture
- local resilience hints
- spinner abuse and ambiguous waiting states

It is not trying to become a full observability platform, a compliance framework, or a giant testing suite.

It is trying to answer one harder question:

**Does this product remain useful once stability assumptions start collapsing?**

***

## The Result That Made It Click

The moment the product became real was not when the audit ran.

It was when the live deployment produced a report honest enough to be useful.

The winning example was a live audit of `https://paintracker.ca`.

**Survivability Score: 65**  
**Verdict: Degrades but usable**

### Critical Failures

- offline reload breaks continuity when the app is forced back into an interrupted state
- essential action survival still collapses when the network drops at the wrong moment

### What Held

- failure clarity passed
- reconnect behavior passed
- low-bandwidth posture passed
- local authority hint passed
- spinner abuse passed

### Why It Worked As Evidence

- it showed real strengths instead of staging total collapse
- it still exposed two critical failures without softening the language
- it made the tool feel like an inspection, not a demo script

That changed the product.

Not because the score was dramatic.
Because the pattern was undeniable.

It revealed something I care about more than visible crashes: **quiet structural lies**.

Paths that look available but are not.
Interfaces that appear intact after the task has already become unsafe.
Recovery states that preserve the appearance of competence while removing the user's real ability to finish, recover, or understand what still works.

That is where software becomes dangerous.

And it gave the project its clearest live lines:

- A failed inspection is better than a silent lie.
- Most apps assume stability. BlackoutBench tests what survives when that assumption fails.
- The planet does not care about your happy path.

***

## Gemini's Role

I integrated Gemini in a narrow role: repair synthesis.

That distinction matters.

BlackoutBench does not ask a model to decide whether an app is resilient.
The verdict comes from the checks. Gemini is there to compress likely next
steps into something human-readable: what to repair first, what the likely
architectural weakness is, and what kind of degraded-mode behavior would be
safer.

In other words, the model helps interpret failure. It does not define it.

In the article and supporting screenshots, that hierarchy should stay visible. The score, the verdict, the failure pattern, and the finding detail carry the emotional weight. Gemini is supporting context, not the voice of the product.

That felt like the only honest use of AI here.

***

## Why This Matters

A lot of software only really works because the environment is doing some of the work for it.

Stable signal hides weak recovery.
Stable power hides fragile continuity.
Stable attention hides unclear failure messaging.
Stable conditions hide the fact that the user has been made responsible for absorbing design debt.

But once those supports start disappearing, the truth comes out.

If your product only behaves under ideal conditions, then those conditions are part of the implementation.

BlackoutBench exists to make that visible.

***

## What Comes Next

The next step is not feature bloat. It is compression and force.

The MVP already has what it needs:

- a focused audit
- a strong result language
- one clear thesis

From here, the work is about making the product impossible to misread:

- one landing page that carries the accusation cleanly
- one README that reads like doctrine, not SaaS filler

That is enough.

Because the core argument is already there:

**Most apps assume stability. BlackoutBench punishes that assumption.**

***

## Proof in Public

The final submission package is built around one live audit and one short capture sequence.

The live proof target is `https://paintracker.ca`.

The final asset set shows:

- the hero and bench control on the live frontend
- the completed result screen with the 65 score, the Degrades but usable verdict, and the failure pattern
- the live audit console showing browser connection and check execution
- the sample report preview block
- one short demo GIF showing paste URL, run bench, and result appears

Where Gemini appears in that package, it should read as reinforcement rather than the centerpiece. The stronger story is already in the finding detail, the critical failures, and the blunt verdict language.

That package matters because it is not speculative anymore. It shows the full chain working in public:

- frontend loads
- audit runs
- browser connects
- checks execute
- result renders
- Gemini guidance appears
- export controls are exposed

***

## Closing

Software does not run in ideal conditions.

It runs in the world.

On weak networks.
On tired devices.
During interruptions.
Under pressure.
Around human limits.

If your product only works when the environment behaves, then the environment is doing more of the product work than your software is.

The planet does not care about your happy path.

BlackoutBench is an attempt to measure what survives after the happy path is gone.
