---
title: "Modeling Pain, Not Just Numbers"
seoTitle: "Modeling Pain, Not Just Numbers"
seoDescription: "How PainTracker models episodes, context, and interventions so chronic pain data stays low‑friction to log and credible in clinician and workplace exports"
datePublished: Mon Jan 12 2026 18:00:48 GMT+0000 (Coordinated Universal Time)
cuid: cmkbgy2is000002jpc12d6x2u
slug: part-03-modeling-pain-not-just-numbers
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1767503976091/35914a3b-931d-47b4-842b-f2b376c3ef2b.png
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1767504111955/243f0aa7-13e2-4a18-aeed-01a26fa1ca34.png
tags: accessibility, pwa, data-modeling, ux-design, healthtech, chronic-pain, trauma-informed-design

---

If you’ve ever looked at a chart and thought, “I know this mattered, but I can’t remember why,” you already understand the problem: numbers alone don’t carry context.

A single 1–10 score can be useful, but if it’s the *only* thing you store, you end up with a database full of ambiguity.

The user remembers “that was a bad day,” but the system can’t distinguish a flare from medication timing, a weather shift, a poor night’s sleep, a stressful appointment, or the cumulative effect of work demands.

Then comes the hard part: someone asks for details. A clinician, an employer, a case manager, a claims workflow—anyone who needs a timeline and specifics. If all you have is a score, you’re stuck.

Modeling pain well is not about collecting more data. It’s about collecting the *right* data, in a shape that supports:

* low-friction logging (especially on bad days)
    
* pattern finding without overclaiming causality
    
* credible exports (clear, consistent, human-readable)
    

## A design rule: separate “what happened” from “what it means”

Your data model should distinguish:

* **Observations**: what the user experienced (pain, symptoms, function impact)
    
* **Context**: what was true around it (sleep, stress, environment, activity)
    
* **Interventions**: what they tried (meds, rest, pacing, PT exercises)
    
* **Outcomes**: what changed (relief level, duration, side effects)
    

Then you build *derived views* (trends, correlations, summaries) on top.

This keeps you honest: the raw data stays factual, and the “interpretation layer” can evolve without rewriting history.

## The core entities (a practical starting point)

You don’t need a perfect ontology. You need a few primitives that scale and still feel easy to use.

### 1) Episode

An **episode** represents a bounded experience in time.

* Has a start time (required)
    
* May have an end time (optional; many episodes don’t have clean endings)
    
* Has one or more observations attached
    

Episodes let you capture “this lasted 3 hours” without forcing exact timestamps in the moment.

### 2) Check-in (snapshot)

A **check-in** is a quick snapshot at a point in time.

* Works for “right now” logging
    
* Can be as small as a single field (e.g., pain interference)
    
* Can be enriched later
    

Check-ins are how you respect fluctuating energy and cognition.

### 3) Intervention

An **intervention** is something the user did in response.

* medication dose (timing + optional amount)
    
* rest / pacing
    
* heat/ice, mobility supports, exercises
    

In practice, users and clinicians often care about what was tried and whether it helped, not just the pain score.

### 4) Context block

A **context block** captures the “conditions” around an episode/check-in.

Keep it small and structured:

* sleep quality (rough bucket)
    
* stress level (rough bucket)
    
* activity category (work, home, errands, travel)
    
* environment signals you can actually defend (e.g., “weather change noticed” rather than exact causes)
    

Context is how you move from diary to useful summary.

## Fields that earn their place (low burden, high value)

If you’re deciding what to store, bias toward fields that help in exports and pattern review.

**Pain (observation):**

* location(s) (selectable; allow multiple)
    
* quality (burning, stabbing, aching, etc.)
    
* intensity (optional; avoid making it the only measure)
    
* interference (function impact: walking, lifting, sitting, sleep)
    

**Function:**

* “What could you do today?” is often more stable than “how bad is it?”
    

**Interventions + response:**

* what was taken/tried
    
* whether it helped (rough bucket)
    
* side effects (optional)
    

**Work/clinical relevance (structured, minimal):**

* missed work / modified duties (yes/no + brief category)
    
* accommodation used (from a small list)
    
* clinician visit (yes/no)
    

This keeps the model useful for real workflows without turning it into paperwork.

## What to be cautious with (the “data minimization” list)

Some fields are tempting but expensive:

* long free-text notes as the primary record (hard to analyze; easy to overshare)
    
* identity-like metadata (names, employer details) stored with episodes
    
* “diagnosis” fields or causality claims (“weather caused flare”) baked into raw data
    

If you allow free text, treat it as optional and never required to log the event.

## Time, timezone, and the trap of fake precision

Health apps often pretend time is simple. It isn’t.

* Store timestamps in a consistent format (ISO) and keep timezone handling explicit.
    
* Allow “approximate” when users can’t remember (e.g., morning/afternoon/evening buckets).
    
* Never force exactness for the sake of the database.
    

The goal is *credible* data, not *perfect* data.

## A model that supports accessibility and low-friction UX

Your data model is a UX decision.

If you require 12 fields to save an entry, the app will fail the moment the user is fatigued. If you support partial entries with clear defaults and safe optionality, the app can succeed on the hardest days.

Design implication: make “minimum viable entry” tiny.

Example: one check-in with “interference” + optional location is enough to be meaningful. Everything else can be enrichment.

## Export readiness: design for the report now

If you know you will generate clinician/workflow exports, design the schema so a report can be built without reconstructing intent from messy text.

Ask:

* Can I generate a timeline with dates and durations?
    
* Can I summarize functional impact without guessing?
    
* Can I show interventions and response in plain language?
    
* Can I keep exports minimal by default and user-controlled?
    

If the answer is “not really,” fix the model before adding more UI.

## Next: Part 4 — Accessibility-First UI Under Real Constraints

Next, Part 4 translates these constraints into UI rules: contrast, typography, spacing, focus, motion, and patterns that stay usable when users are overloaded.

---