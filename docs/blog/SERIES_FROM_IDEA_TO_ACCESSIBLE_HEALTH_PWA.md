<!-- markdownlint-disable MD013 MD025 MD041 -->

# Series: From Idea to Accessible Health PWA

A practical series roadmap, tuned to PainTracker’s local-first, trauma-informed, accessibility-first, systems-thinking constraints.

This file is both:

- a public-facing series overview (what readers can expect)
- a private authoring checklist (what each part must cover to stay coherent)

## What this series is (and isn’t)

This series is for people building health-adjacent tools without a large team: solo devs, small startups,
accessibility advocates, and engineers who want to ship something useful without turning it into surveillance.

It is not medical advice, and it does not assume you can “solve” chronic pain with an app. The goal is
practical: reduce friction, preserve autonomy, and produce exports that clinicians and workplaces can
actually use.

## Non-negotiable constraints (PainTracker-aligned)

- Local-first by default (works offline; data stays on-device unless the user exports)
- Accessibility-first (aim for WCAG 2.2 AA patterns, not “we’ll fix it later”)
- Data minimization (collect what you need, not what you can)
- No surprise network calls or hidden telemetry (trust is a feature, not a slogan)
- Trauma-informed UX (reduce cognitive load; avoid shame language; keep user control)

## Series: roadmap

| Part | Title | One-line outcome |
| ---: | --- | --- |
| 1 | Why Chronic Pain Needs Different Apps | Readers understand why generic symptom trackers fail chronic pain users and what real-world constraints a health PWA must respect (energy, cognition, environment). |
| 2 | Architecture of a Privacy-First Health PWA | Readers can sketch a high-level architecture for a privacy-first, offline-capable health PWA, including data flows, sync strategy, and threat surfaces. |
| 3 | Modeling Pain, Not Just Numbers | Readers learn how to design a data model that captures pain episodes, triggers, context, and work/clinical requirements instead of a single 1–10 score. |
| 4 | Accessibility-First UI Under Real Constraints | Readers can apply concrete accessibility patterns (contrast, spacing, typography, motion, focus) tuned for fatigued, medicated, or cognitively overloaded users. |
| 5 | Interaction Patterns That Don’t Hurt | Readers design low-friction flows (logging episodes, reviewing history, exporting for clinicians) that minimize taps, typing, and memory load while staying accessible. |
| 6 | Offline, Sync, and Failure Modes | Readers implement a mental model and checklist for offline-first design, background sync, and graceful degradation when networks, storage, or APIs fail. |
| 7 | Building the PWA Shell and Install Experience | Readers configure the manifest, service worker, and install prompts so the app behaves like a trustworthy “native-enough” health tool on mobile. |
| 8 | Protecting Data: Threat Modeling for Small Teams | Readers can run a lightweight threat-modeling exercise for health data, identify realistic risks for a solo/indie project, and define pragmatic controls. |
| 9 | Testing Accessibility with Free Tools and Real Users | Readers learn a repeatable workflow combining automated checks, keyboard testing, screen readers, and targeted user observation for accessibility. |
| 10 | Shipping, Observability, and Incident Handling | Readers set up minimal observability (logs, analytics boundaries, error tracking) and use incidents as feedback to harden both UX and architecture over time. |
| 11 | From PWA to Native: When and How to Branch | Readers understand when a PWA is enough for health use cases and how to structure repos and code sharing if they later ship Android/iOS versions. |
| 12 | Lessons Learned from PainTracker | Readers see an honest retrospective (what worked, what broke, what changed in v2) and get a distilled checklist for their own health or accessibility-critical apps. |

## Publishable drafts (one file per part)

These are standalone drafts, split out for publication:

- [Part 1 — Why Chronic Pain Needs Different Apps](series-from-idea-to-accessible-health-pwa/part-01-why-chronic-pain-needs-different-apps.md)
- [Part 2 — Architecture of a Privacy-First Health PWA](series-from-idea-to-accessible-health-pwa/part-02-architecture-of-a-privacy-first-health-pwa.md)
- [Part 3 — Modeling Pain, Not Just Numbers](series-from-idea-to-accessible-health-pwa/part-03-modeling-pain-not-just-numbers.md)
- [Part 4 — Accessibility-First UI Under Real Constraints](series-from-idea-to-accessible-health-pwa/part-04-accessibility-first-ui-under-real-constraints.md)
- [Part 5 — Interaction Patterns That Don’t Hurt](series-from-idea-to-accessible-health-pwa/part-05-interaction-patterns-that-dont-hurt.md)
- [Part 6 — Offline, Sync, and Failure Modes](series-from-idea-to-accessible-health-pwa/part-06-offline-sync-and-failure-modes.md)
- [Part 7 — Building the PWA Shell and Install Experience](series-from-idea-to-accessible-health-pwa/part-07-building-the-pwa-shell-and-install-experience.md)
- [Part 8 — Protecting Data: Threat Modeling for Small Teams](series-from-idea-to-accessible-health-pwa/part-08-protecting-data-threat-modeling-for-small-teams.md)
- [Part 9 — Testing Accessibility with Free Tools and Real Users](series-from-idea-to-accessible-health-pwa/part-09-testing-accessibility-with-free-tools-and-real-users.md)
- [Part 10 — Shipping, Observability, and Incident Handling](series-from-idea-to-accessible-health-pwa/part-10-shipping-observability-and-incident-handling.md)
- [Part 11 — From PWA to Native: When and How to Branch](series-from-idea-to-accessible-health-pwa/part-11-from-pwa-to-native-when-and-how-to-branch.md)
- [Part 12 — Lessons Learned from PainTracker](series-from-idea-to-accessible-health-pwa/part-12-lessons-learned-from-paintracker.md)

---

## Part 1 — Why Chronic Pain Needs Different Apps

Generic symptom trackers are often built around a quiet assumption: the user will reliably log data every
day, interpret charts, and steadily “optimize” themselves.

Chronic pain breaks that assumption.

Pain is not a neat, single-variable metric. It is an experience that fluctuates with context (sleep,
stress, weather, workload, medication timing, mobility limits, sensory overload) and is constrained by
energy, attention, and safety. If your app demands too much—too many taps, too much typing, too much
remembering—it becomes one more thing the user has to endure.

This is the core premise of PainTracker’s approach: if logging feels like a small tax on a good day, it
can feel impossible on a bad day. So the product must work best when the user has the least to give.

### The three constraints most apps ignore

#### 1) Energy is variable (and precious)

“Just log daily” is not a neutral instruction. It’s a design commitment.

For chronic pain users, energy can swing dramatically between morning and evening, between weekdays and
weekends, and between flare and non-flare periods. A health app that requires a full “session” to log
anything will cause drop-off precisely when the data would be most valuable.

Design implication: the app must support meaningful partial entries. A quick capture that can be
enriched later is better than perfect data that never gets recorded.

#### 2) Cognition is a first-class dependency

Brain fog, medication effects, sleep debt, and stress all reduce working memory and executive function. That shows up as:

- difficulty comparing “today vs last week”
- difficulty remembering what happened earlier in the day
- difficulty translating experience into numbers under time pressure

Design implication: reduce recall. Prefer “recognition” UI (pickers, presets, recent selections,
gentle prompts) over blank text fields. Make the next action obvious. Keep state visible.

#### 3) Environment is messy

People log health data on the couch, in a car, in a clinic waiting room, or during a break at work.
They may have intermittent connectivity, one hand free, glare on the screen, or a strong need for
privacy.

Design implication: offline-first isn’t a nice-to-have. It’s reliability. The app must behave like a
local utility, not a web page that sometimes works.

### What “success” looks like for a chronic pain tracker

Success is not maximum engagement. Success is:

- the user can capture what matters in under 30 seconds
- the history view helps them notice patterns without demanding interpretation
- exports are clean enough to reduce appointment friction
- the app never surprises them with data leaving the device

### A simple checklist to keep you honest

If you’re building a health PWA, run your design through these questions:

1. Can I log something meaningful with one thumb?
2. Can I log when I’m offline and trust it won’t vanish?
3. Can I use the app with keyboard-only and a screen reader?
4. Does the UI still work when I’m tired, medicated, or overwhelmed?
5. Do I understand exactly where my data lives and when it moves?

If any answer is “no,” that’s not a future enhancement. It’s part of the product’s definition.

### Next: Part 2 — Architecture of a Privacy-First Health PWA

In Part 2, we’ll map an offline-first, privacy-first architecture: data flow, local storage boundaries,
failure modes, and the threat surfaces you inherit the moment you store health data.

---

## Part 2 — Architecture of a Privacy-First Health PWA

When you build a health app, you’re not just choosing a stack.

You’re choosing where sensitive data lives, how long it lives there, who can access it, and what kinds
of failures you’re willing to tolerate. A privacy-first architecture is less about “having encryption”
and more about having clear boundaries: where data is created, where it is persisted, when it moves,
and how you prove (to yourself and to users) that it doesn’t leak.

This part gives you a high-level architecture that matches PainTracker’s constraints:

- offline-first as a reliability guarantee
- local-first as a privacy default
- accessibility as a product requirement, not a QA step

### The simplest mental model: four boundaries

You can describe most privacy-first health PWAs with four boundaries:

**Input boundary (UI).** The place where users enter Class A data (pain, symptoms, meds, notes).
Design goal: minimize effort and prevent accidental disclosure on-screen.

**Validation boundary (schemas).** Defensive parsing and normalization (e.g., Zod) so bad/partial input
doesn’t corrupt storage.
Design goal: accept partial, safe entries; reject unsafe shape changes.

**Persistence boundary (local storage).** IndexedDB (or similar) with versioned schema and migrations.
Design goal: resilient writes, predictable upgrades, and recoverable failure modes.

**Export boundary (user-controlled leaving-the-device).** PDF/CSV/JSON exports, or clinician-friendly
summaries.
Design goal: explicit user intent, clear content previews, and minimal surprise.

If you can draw these boundaries, you can reason about nearly every feature request.

### Data classification (why it matters in architecture)

You don’t need a compliance department to benefit from classification.

- **Class A**: health data (entries, notes, attachments, exports)
- **Class B**: operational/security events (audit events, error traces, feature flags)
- **Class C**: preferences (theme, layout, a11y settings)

Architecture implication: treat Class A as “never network by default.” Class B should be structured
and non-reconstructive. Class C can be persisted freely but still deserves respect.

### A reference data flow (local-first)

Here’s a practical, implementation-agnostic flow that matches PainTracker’s approach:

1. **User action** (log pain episode, update symptoms, add context)
2. **Validation + normalization** (schema-based, tolerant of partial entries)
3. **State update** (predictable store: Zustand/Immer or equivalent)
4. **Persistence** (write to IndexedDB; migrations are explicit)
5. **Derived views** (trends, patterns, summaries computed locally)
6. **Export** (user initiates; app generates clinician/workflow artifacts)

In diagram form:

```text
UI input
-> validate/normalize
-> in-memory state
-> local persistence (IndexedDB)
-> local analytics (derived, non-network)
-> export (user-controlled)
```

The key property: everything works without the network.

### Sync strategy: default “no sync,” optional “explicit sync”

Many apps treat sync as the default because it makes analytics and multi-device access easy.
Privacy-first health PWAs treat sync as a privilege that must be earned.

For PainTracker-aligned architecture:

- **Default:** no cloud sync. Your app is complete without accounts.
- **If you add sync later:** make it explicit, user-controlled, and auditable.
- **Prefer export/import as an intermediate step:** users can move data without a background service.

If you can’t describe exactly what data leaves the device, when, and why, you’re not ready for sync.

### Threat surfaces you inherit (even without a backend)

“No backend” reduces risk, but it does not eliminate risk. You still have:

- **Device loss / shared devices**: someone else can access the browser profile
- **XSS within your origin**: any script injection can read on-screen data
- **Malicious browser extensions**: can scrape DOM and intercept interactions
- **Shoulder-surfing**: especially in clinics, workplaces, or shared homes
- **Accidental oversharing**: exports are a common leak vector

Architecture responses tend to fall into two categories:

1) Reduce plaintext exposure (minimize what is displayed and for how long)
2) Strengthen at-rest protection (encryption boundary + lock/unlock patterns)

Important note: be careful with claims. A privacy-first architecture should avoid implying it can
protect users from a compromised OS or spyware.

### Failure modes (offline-first means you must design for them)

Offline-first is not “works when offline.” It’s “fails safely when everything is weird.”

Plan for:

- **IndexedDB quota exhaustion** (large notes, attachments, long history)
- **Partial writes** (crash mid-save, tab killed, mobile OS reclaiming memory)
- **Migrations** (old schema meets new app version)
- **Service worker update mismatch** (new UI with old cached assets)
- **Clock/timezone drift** (timestamp-based trends can be misleading)
- **Export generation failures** (PDF render fails, file permissions, mobile share sheet quirks)

Each failure mode needs:

- a user-facing message that is non-shaming
- a recovery path (retry, reduce payload, export backup, rollback cache)
- logs/audit events that never contain reconstructive Class A content

### A checklist you can implement without guessing

Use this as your architecture “definition of done” for Part 2:

1) Draw the four boundaries (input, validation, persistence, export)
2) List your data classes (A/B/C) and where each is stored
3) Write down your sync stance (none by default; what would trigger change)
4) Enumerate top threat surfaces (XSS, extensions, device loss, exports)
5) Enumerate top failure modes (storage, migration, caching, exports)
6) Decide what you will *not* claim (no false security guarantees)

### Next: Part 3 — Modeling Pain, Not Just Numbers

In Part 3, we’ll turn architecture into a data model: episodes, context, triggers, work/clinical
constraints, and how to avoid the “one score to rule them all” trap.

---

## Part 3 — Modeling Pain, Not Just Numbers

If you only store a 1–10 number, you get a database full of ambiguity.

The user remembers “that was a bad day,” but the system can’t distinguish a flare from a medication
rebound, a weather shift, a poor night’s sleep, a stressful appointment, or the cumulative effect of
work demands. Worse: when a clinician or claims workflow asks for specifics, you have nothing that
survives cross-examination.

Modeling pain well is not about collecting more data. It’s about collecting the *right* data, in a
shape that supports:

- low-friction logging (especially on bad days)
- pattern finding without overclaiming causality
- credible exports (clear, consistent, human-readable)

### A design rule: separate “what happened” from “what it means”

Your data model should distinguish:

- **Observations**: what the user experienced (pain, symptoms, function impact)
- **Context**: what was true around it (sleep, stress, environment, activity)
- **Interventions**: what they tried (meds, rest, pacing, PT exercises)
- **Outcomes**: what changed (relief level, duration, side effects)

Then you build *derived views* (trends, correlations, summaries) on top.

This keeps you honest: the raw data stays factual, and the “interpretation layer” can evolve without
rewriting history.

### The core entities (a practical starting point)

You don’t need a perfect ontology. You need a few primitives that scale.

#### 1) Episode

An **episode** represents a bounded experience in time.

- Has a start time (required)
- May have an end time (optional; many episodes don’t have clean endings)
- Has one or more observations attached

Why it matters: episodes support “this lasted 3 hours” without forcing the user to remember exact
timestamps in the moment.

#### 2) Check-in (snapshot)

A **check-in** is a quick snapshot at a point in time.

- Works for “right now” logging
- Can be as small as a single field (e.g., pain interference)
- Can be enriched later

Why it matters: check-ins handle the reality of fluctuating energy and cognition.

#### 3) Intervention

An **intervention** is something the user did in response.

- medication dose (timing + optional amount)
- rest / pacing
- heat/ice, mobility supports, exercises

Why it matters: users and clinicians often care about what was tried and whether it helped, not just
the pain score.

#### 4) Context block

A **context block** captures the “conditions” around an episode/check-in.

Keep it small and structured:

- sleep quality (rough bucket)
- stress level (rough bucket)
- activity category (work, home, errands, travel)
- environment signals you can actually defend (e.g., “weather change noticed” rather than exact causes)

Why it matters: context is how you move from diary to useful summary.

### Fields that earn their place (low burden, high value)

If you’re deciding what to store, bias toward fields that help in exports and pattern review.

**Pain (observation):**

- location(s) (selectable; allow multiple)
- quality (burning, stabbing, aching, etc.)
- intensity (optional; avoid making it the only measure)
- interference (function impact: walking, lifting, sitting, sleep)

**Function:**

- “What could you do today?” is often more stable than “how bad is it?”

**Interventions + response:**

- what was taken/tried
- whether it helped (rough bucket)
- side effects (optional)

**Work/clinical relevance (structured, minimal):**

- missed work / modified duties (yes/no + brief category)
- accommodation used (from a small list)
- clinician visit (yes/no)

This keeps the model useful for real workflows without turning it into paperwork.

### What to be cautious with (the “data minimization” list)

Some fields are tempting but expensive:

- long free-text notes as the primary record (hard to analyze; easy to overshare)
- identity-like metadata (names, employer details) stored with episodes
- “diagnosis” fields or causality claims (“weather caused flare”) baked into raw data

If you allow free text, treat it as optional and never required to log the event.

### Time, timezone, and the trap of fake precision

Health apps often pretend time is simple. It isn’t.

- Store timestamps in a consistent format (ISO) and keep timezone handling explicit.
- Allow “approximate” when users can’t remember (e.g., morning/afternoon/evening buckets).
- Never force exactness for the sake of the database.

The goal is *credible* data, not *perfect* data.

### A model that supports accessibility and low-friction UX

Your data model is a UX decision.

If you require 12 fields to save an entry, the app will fail the moment the user is fatigued.
If you support partial entries with clear defaults and safe optionality, the app can succeed on the
hardest days.

Design implication: make “minimum viable entry” tiny.

Example: one check-in with “interference” + optional location is enough to be meaningful.
Everything else can be enrichment.

### Export readiness: design for the report now

If you know you will generate clinician/workflow exports, design the schema so a report can be built
without reconstructing intent from messy text.

Ask:

- Can I generate a timeline with dates and durations?
- Can I summarize functional impact without guessing?
- Can I show interventions and response in plain language?
- Can I keep exports minimal by default and user-controlled?

If the answer is “not really,” fix the model before adding more UI.

### Next: Part 4 — Accessibility-First UI Under Real Constraints

In Part 4, we’ll translate these constraints into UI rules: contrast, typography, spacing, focus,
motion, and patterns that stay usable when users are overloaded.

---

## Part 4 — Accessibility-First UI Under Real Constraints

Accessibility isn’t a layer you add at the end. In chronic pain contexts, accessibility *is* the
product.

People use pain tools when they’re tired, medicated, stressed, and often on a small screen. That
means the “edge cases” (glare, tremor, one-handed use, brain fog, low patience for complexity) are not
rare. They’re normal.

This part is intentionally practical. It’s not a tour of guidelines; it’s a set of UI rules you can
apply while you build.

### The accessibility bar: keyboard, screen reader, and low-friction

If the user can’t:

- navigate by keyboard
- understand the UI via a screen reader
- complete the primary flow quickly with minimal typing

…then the app will fail for many chronic pain users even if it “looks fine.”

### 1) Contrast and color: don’t make the user decode your UI

Color is a fragile channel. People use devices in dim rooms, bright sun, and with visual fatigue.

Rules that hold up:

- Never rely on color alone to communicate state (error/success/selected)
- Provide clear text labels for status and actions
- Use large hit targets and strong focus states so the user can re-locate themselves

Practical test: convert your UI to grayscale. If meaning disappears, you’re using color as a crutch.

### 2) Typography: readability over aesthetics

In pain contexts, readability is a form of respect.

- Prefer shorter line lengths in dense views
- Use consistent heading hierarchy so users can scan
- Avoid tiny helper text for critical instructions

Practical test: zoom to 200%. Nothing should overlap or become unusable.

### 3) Spacing and layout: build for tremor and one-handed use

Small tap targets and tight layouts are hostile when hands shake, joints hurt, or only one hand is
available.

- Make primary actions easy to hit with a thumb
- Keep destructive actions separated and clearly labeled
- Avoid placing important controls at the extreme screen edges where accidental taps happen

Practical test: use the app with one thumb for 60 seconds. If it feels fiddly, it’s too tight.

### 4) Focus, navigation, and “where am I?”

Keyboard access is not just for desktop users. Many mobile assistive technologies and switch inputs
depend on predictable focus behavior.

Rules:

- Every interactive element must be reachable and show a visible focus state
- Tab order must match visual order
- Focus should land somewhere sensible after an action (save, cancel, close)
- Avoid focus traps (modals must be escapable; drawers must restore focus)

Practical test:

1) Start at the top of your main page
2) Press Tab until you can complete the primary logging flow
3) If you get lost, your users will get lost

### 5) Motion and feedback: never punish the user’s nervous system

Animation can be delightful, but it can also be nauseating, distracting, or cognitively expensive.

- Respect reduced-motion preferences
- Prefer subtle transitions over attention-grabbing motion
- Keep spinners minimal and always pair them with text (“Saving…”) so screen readers aren’t guessing

Practical test: enable “Reduce motion” at OS level and verify your UI still communicates state.

### 6) Forms: design for brain fog

Forms are where most health apps accidentally shame users.

Pain users often can’t remember details on demand. They often can’t tolerate long typing sessions.
They may also be worried about privacy (who might see the screen).

Rules:

- Default to *recognition* over recall (pickers, presets, recent selections)
- Support partial entries (save with one or two fields)
- Clearly mark optional vs required
- Avoid multi-step flows unless each step saves progress
- Use plain-language validation messages (“We couldn’t save yet—please add a date”) not blame language

Practical pattern: “minimum viable entry”

- a single check-in field (e.g., interference)
- optional location
- optional note

Everything else is an enhancement, not a barrier.

### 7) Error states: calm, specific, recoverable

Health apps often fail at the worst moment: low battery, offline, storage quota, tab killed.

An accessible error is:

- specific about what happened (without exposing sensitive data)
- clear about what the user can do next
- non-shaming

Examples:

- “Couldn’t save right now. Your entry is still on this screen—try again.”
- “Storage is full. Export your data to free space, then try saving again.”

### 8) Privacy on the screen is part of accessibility

Accessibility is not only about disability—it’s also about safety in real environments.

Consider:

- using neutral labels in notifications and install prompts
- reducing the amount of sensitive data shown by default in public contexts
- providing quick ways to hide/blur sensitive content when needed

This is not paranoia. It’s designing for real life.

### A checklist you can run on every screen

Use this checklist as a “stop the line” tool:

1) Can I complete the primary task with keyboard only?
2) Does a screen reader announce every control with a meaningful label?
3) Are tap targets large enough for tremor/one-handed use?
4) Can I understand errors and recover without re-entering everything?
5) Does the screen still work at 200% zoom and with reduced motion?
6) Do I avoid relying on color-only meaning?
7) Is there a clear focus state and a predictable tab order?

If a screen fails this checklist, it’s not “polish.” It’s a functional defect.

### Next: Part 5 — Interaction Patterns That Don’t Hurt

In Part 5, we’ll design the core flows—logging, reviewing history, and exporting—so they minimize
typing, taps, and memory load while staying accessible.

---

## Part 5 — Interaction Patterns That Don’t Hurt

The best features in a chronic pain app are often not “new screens.” They’re the small interaction
decisions that reduce effort, prevent mistakes, and preserve dignity.

This part focuses on three flows that define whether a pain tracker is usable in real life:

1) logging (capture)
2) reviewing history (sensemaking)
3) exporting (advocacy and clinical/workflow utility)

### Principle 1: design for the worst day, not the best day

On a good day, almost any UI works.

On a bad day, the user has less energy, less tolerance for ambiguity, and less ability to recover from
errors. So your UI should be optimized for:

- partial completion
- fast success
- safe failure

### Flow A: logging (capture) without friction

#### Pattern A1: “minimum viable entry” as the default path

The fastest path should always be available and always be meaningful.

Example minimum:

- one field that reflects function impact (interference)
- optional location
- optional “what happened?” preset (work, travel, sleep, stress)

Everything else is additive.

This is how you respect variable energy: the app accepts the user’s best effort *today*.

#### Pattern A2: recognition UI (presets, recent choices, quick picks)

Typing is expensive.

Use:

- recent selections (“last used locations”)
- common presets (“heat helped,” “work shift,” “poor sleep”)
- small controlled vocabularies (quality: aching/burning/stabbing)

The goal is not to constrain the user—it’s to reduce cognitive load.

#### Pattern A3: safe defaults and reversible actions

If you guess, make the guess safe.

- default timestamps to “now,” but allow correction
- default fields to empty/unknown rather than fabricated values
- allow undo when feasible (especially for deletions)

Reversibility is accessibility.

#### Pattern A4: progressive disclosure for advanced fields

Advanced fields should exist, but they shouldn’t block the primary task.

Keep them behind an explicit “Add details” step that never feels mandatory.

### Flow B: history review without demanding interpretation

History views often fail because they ask users to do math with their pain.

Your goal is not to “prove” anything. Your goal is to help the user notice patterns and prepare for a
conversation with a clinician, employer, or support person.

#### Pattern B1: show summaries first, details on demand

Start with:

- simple timelines (days/weeks)
- counts and durations (episodes per day, flare duration)
- functional impact highlights

Then allow drill-down to the full entry.

This supports brain fog: users can orient first, then explore.

#### Pattern B2: avoid false precision and causal language

If your UI implies causality (“weather caused flare”), you will harm trust.

Prefer language like:

- “Often occurs after…”
- “Seems to co-occur with…”
- “Noticed around the same time as…”

This is more clinically honest and less emotionally loaded.

#### Pattern B3: allow “today vs typical” without complex charts

Charts are optional. Comparisons are useful.

Provide:

- “Today compared to your last 14 days” in plain language
- “Most common locations this week” as a short list
- “Most helpful interventions” as a ranked summary

If you do show charts later, make them readable, labeled, and keyboard/screen-reader compatible.

### Flow C: exports that help, not harm

Exports are where a pain tracker becomes an advocacy tool.

They’re also a major privacy risk because exports are designed to leave the device.

#### Pattern C1: explicit intent and clear boundary messaging

Treat export as a boundary crossing.

- the user initiates export
- the UI clearly states what will be included
- the UI previews the result (or a representative sample)

Avoid hidden background exports, autosync, or “share to cloud” defaults.

#### Pattern C2: minimal by default, detailed by choice

Start with:

- date range
- high-level summaries
- functional impact

Then allow opt-in detail:

- notes
- intervention details
- episode-by-episode timeline

This reduces accidental oversharing while still supporting clinical needs.

#### Pattern C3: clinician/workflow readability over aesthetic design

Exports should be:

- consistent
- plain-language
- defensible (“this is what was reported,” not a diagnosis)

If a report reads like a marketing brochure, it won’t be trusted.

#### Pattern C4: accessibility in export generation UX

Export UI must be accessible too:

- keyboard reachable
- clear focus management
- progress states that are announced
- a failure path that preserves user choices (don’t make them reconfigure the export)

### Putting it together: the interaction “definition of done”

For each primary flow (log, review, export), verify:

1) Fast path exists (under 30 seconds)
2) Partial completion is supported
3) Keyboard + screen reader works end-to-end
4) Errors are recoverable and non-shaming
5) No surprises at the export boundary

### Next: Part 6 — Offline, Sync, and Failure Modes

In Part 6, we’ll turn the offline-first promise into a practical checklist: what to cache, how to
think about background sync (if any), and how to fail safely when storage, network, or updates go
sideways.

---

## Part 6 — Offline, Sync, and Failure Modes

Offline-first is a promise: “This tool works when your life is unstable.”

For a health app, that promise is not optional. People log pain in clinics, elevators, basements,
worksites, rural areas, and during crisis moments when connectivity is unreliable.

This part is about building the *behavior* of reliability, not just adding a service worker.

### The offline-first mental model: local is primary

If your architecture is local-first, “offline” is not a special state. It’s the default.

That changes how you think about features:

- saving is always local
- reading history is always local
- pattern insights are computed locally
- export is generated locally

If anything depends on the network, treat it as an enhancement and design a fallback.

### What to cache (and what not to cache)

Offline capability depends on two separate things:

1) **App shell availability** (HTML/CSS/JS loads)
2) **Data availability** (user entries are readable/writable)

Cache the app shell so it launches reliably.

Be cautious caching anything that could contain sensitive data. If you cache API responses (even for
“harmless” endpoints), you create additional surfaces that can surprise users and complicate threat
models.

Practical rule: cache *code*, not *Class A content*.

### Updates: reliability includes predictable upgrades

The most common offline-first failure is not “no signal.” It’s “app updated weirdly.”

Examples:

- new UI served with old cached assets
- old schema meets new storage layer
- service worker is installed but not controlling the page you think it is

Design goals:

- updates should be deliberate (avoid invisible version mismatches)
- migrations should be explicit and recoverable
- users should not lose data because you shipped a refactor

Practical UX pattern: when a new version is ready, prompt the user to refresh at a safe moment (and
don’t interrupt an in-progress entry).

### Sync: choose your stance deliberately

For PainTracker-aligned privacy, the default stance is:

- **No background sync of Class A data.**

That doesn’t mean “no multi-device ever.” It means:

- if you add sync later, it must be explicit, user-controlled, and auditable
- until then, export/import is the honest mechanism

If you do implement sync in the future, define:

- what leaves the device
- when it leaves
- where it goes
- how the user can verify it
- how the user can stop it

If you can’t answer those, you’re not shipping sync. You’re shipping risk.

### Failure modes that matter (and how to fail safely)

Offline-first design is mostly designing for failures.

Here are the common ones and the behaviors to implement.

#### 1) Network failure (expected)

What to do:

- do not block logging
- do not show scary errors
- keep UI responsive and honest (“Saved on this device”)

#### 2) Storage quota exhaustion (inevitable over time)

What to do:

- detect the failure and explain it plainly
- preserve the user’s unsaved entry in memory/on-screen
- offer a recovery path: export old data, delete attachments, reduce note size

#### 3) Partial writes / interrupted sessions (common on mobile)

What to do:

- design saves to be atomic where possible
- auto-save drafts when feasible (without creating confusing duplicates)
- on restart, recover drafts with clear wording (“Recovered unsaved entry”)

#### 4) Migrations (the silent data killer)

What to do:

- version your storage schema
- test migration paths
- keep a rollback/recovery strategy (even if it’s “export first, then migrate”)

#### 5) Service worker mismatch (the “it’s broken but only sometimes” bug)

What to do:

- keep caching strategy simple
- avoid caching responses containing sensitive content
- provide a user-visible “refresh/update” recovery path

#### 6) Time drift / timezone changes (subtle but real)

What to do:

- store timestamps consistently
- allow “approximate time” buckets
- present trends with humility (avoid overconfident precision)

### Offline-first “definition of done”

Use this checklist before calling your app offline-first:

1) I can open the app with no network and reach the primary flow
2) I can create an entry offline and see it in history immediately
3) I can refresh the page offline without losing the app shell
4) Update prompts don’t interrupt active logging
5) Storage errors preserve in-progress work and offer recovery
6) Migrations are versioned and tested

### Next: Part 7 — Building the PWA Shell and Install Experience

In Part 7, we’ll get specific about the PWA surface: manifest choices, service worker behavior, and
install UX that makes the app feel trustworthy and “native-enough” without dark patterns.

---

## Part 7 — Building the PWA Shell and Install Experience

If Parts 1–6 are about *trust*, Part 7 is about *trust signals*.

People don’t evaluate a health tool the way they evaluate a news site. They notice:

- does it open reliably?
- does it feel stable?
- does it behave like a tool, not a funnel?

Your PWA shell is the first place those questions get answered.

### The PWA shell is a promise

The “shell” is what loads before data is even visible:

- HTML/CSS/JS bundle
- routing
- offline handling
- update handling

For a privacy-first health app, the shell should feel like a local utility: immediate, predictable,
and quiet.

### Manifest choices that matter

Treat the web app manifest as user-facing configuration.

Decisions to be explicit about:

- **Name and short name**: clear, non-stigmatizing, not overly clinical
- **Icons**: crisp at multiple sizes (install credibility)
- **Display mode**: choose what best matches “tool” expectations
- **Start URL + scope**: avoid confusing launches into the wrong route

If a user installs your app and it opens to an error or a weird deep link, you lose trust instantly.

### Install UX: never pressure, always explain

Install prompts are often used as growth hacks. Don’t.

For a health tool:

- ask at a moment of success (after the user has logged something)
- explain the benefit in plain language (“Faster access, works offline”)
- allow dismissal without nagging

If users feel coerced, they will assume surveillance.

### Service worker behavior: keep it boring

Your service worker should be boring.

Good boring looks like:

- the app opens offline
- updates don’t break the current session
- cache strategy is simple and explainable

Avoid clever caching that increases uncertainty. Reliability beats optimization.

### Update strategy: protect in-progress work

The biggest PWA trust break is an update that interrupts a user mid-entry.

Rules:

- never force reload while the user is editing
- present “Update available” as a choice
- offer “Refresh when ready”

In a health context, “later” is a valid answer.

### Offline UX: honest and calm

Offline UX should not be dramatic.

- prefer subtle indicators (“Offline”)
- keep the primary flow working
- avoid big blocking banners

When the user is offline, they already know life is complicated. Your job is to be steady.

### PWA shell “definition of done”

1) App launches reliably with no network
2) Install prompt is optional and non-pushy
3) Updates never interrupt in-progress logging
4) Cache strategy is explainable and consistent
5) Offline state is communicated calmly

### Next: Part 8 — Protecting Data: Threat Modeling for Small Teams

In Part 8, we’ll run a lightweight threat-modeling exercise that fits a solo/indie team: realistic
risks, pragmatic controls, and clear boundaries on what you can and can’t promise.

---

## Part 8 — Protecting Data: Threat Modeling for Small Teams

Threat modeling doesn’t require a security team. It requires honesty.

For small teams, the goal is not “perfect security.” The goal is:

- identify the most likely risks
- implement controls that actually reduce harm
- avoid false reassurance

### Step 1: define the assets (what you are protecting)

Start by naming the assets:

- Class A data (entries, notes, attachments, exports)
- export artifacts (PDF/CSV/JSON) once generated
- any secrets or keys used for at-rest protection (if applicable)

Your architecture decisions should flow from the assets, not from trends.

### Step 2: define the adversaries (be realistic)

For a privacy-first health PWA, realistic adversaries include:

- someone with access to the unlocked device
- a malicious browser extension
- accidental oversharing via exports
- XSS within your origin (a bug becomes a data leak)

Be careful with adversaries you can’t solve:

- compromised OS / spyware
- physical coercion beyond app controls

You can mitigate, but you can’t guarantee.

### Step 3: map entry points

List how data enters and leaves:

- UI input fields
- local persistence layer
- export boundary
- (optional) any network calls you might add later

Threat modeling becomes simpler when the map is explicit.

### Step 4: choose controls that match your constraints

Controls that usually pay off for small teams:

- strict content security posture (reduce XSS risk)
- aggressive redaction in logs (never include Class A)
- minimal on-screen exposure (privacy in public spaces)
- explicit export UX with preview and opt-in details
- secure-by-default feature flags (no hidden telemetry)

### Step 5: define your “truthful claims”

Write the claims you can defend:

- “Works offline.”
- “Data stays on this device unless you export.”
- “No default telemetry.”

Avoid claims you can’t:

- “Unhackable.”
- “Protects against spyware.”
- “Guaranteed privacy.”

### Threat model “definition of done”

1) Assets, adversaries, and entry points are written down
2) Top 5 risks have concrete mitigations
3) Logs and analytics do not contain Class A content
4) Export is treated as a boundary crossing
5) Claims are honest and scoped

### Next: Part 9 — Testing Accessibility with Free Tools and Real Users

In Part 9, we’ll build a repeatable accessibility testing workflow that doesn’t require a lab:
automated checks, keyboard tests, screen readers, and targeted observation.

---

## Part 9 — Testing Accessibility with Free Tools and Real Users

Accessibility isn’t a checklist you complete once.

It’s a feedback loop: you test, you learn where users struggle, and you adjust the UI so it works
under real constraints.

This part focuses on a workflow that is realistic for small teams.

### Layer 1: automated checks (fast feedback, not full coverage)

Automated tools catch:

- missing labels
- low contrast
- obvious ARIA misuse
- keyboard traps (sometimes)

But they do not catch:

- confusing wording
- cognitive overload
- bad focus flow
- “it technically works but feels awful”

Use automation to prevent regressions, not to declare victory.

### Layer 2: keyboard-only test (the fastest reality check)

Run this test on every primary flow:

1) Start at the top
2) Tab through the page
3) Confirm you can activate controls and complete the flow
4) Confirm focus returns somewhere sensible after actions

If you can’t do the task by keyboard, many assistive tech users can’t either.

### Layer 3: screen reader smoke tests (NVDA/VoiceOver)

You don’t need to be an expert screen reader user to catch the big problems.

Smoke-test questions:

- Does each control announce a meaningful label?
- Are errors announced when they appear?
- Do headings make sense as a page outline?
- Do dialogs announce themselves and trap focus correctly?

### Layer 4: real-user observation (small, targeted, respectful)

Even 2–3 sessions can reveal patterns.

Keep it simple and trauma-informed:

- ask users to complete one task (log an entry, find last week’s pattern, export)
- avoid making them “perform” their disability or pain
- watch where they hesitate, not just where they fail
- treat frustration as signal, not user error

### Accessibility testing “definition of done”

1) Automated checks run in CI or before release
2) Keyboard-only test passes for primary flows
3) Screen reader smoke tests run on key screens
4) At least occasional real-user observation informs changes
5) Fixes are regression-tested (a11y bugs don’t come back)

### Next: Part 10 — Shipping, Observability, and Incident Handling

In Part 10, we’ll cover shipping discipline for a privacy-first health tool: error handling,
minimal observability, redaction boundaries, and a lightweight incident process.

---

## Part 10 — Shipping, Observability, and Incident Handling

Shipping a health-adjacent tool is different from shipping a hobby app.

Reliability is part of care.

But “observability” in a privacy-first app must be handled carefully. The fastest way to betray trust
is to quietly collect sensitive information in logs or analytics.

### What you can observe without surveillance

A safe observability posture focuses on:

- app health (crashes, failed writes, migration failures)
- performance (slow screens, long operations)
- security-relevant events (without sensitive payloads)

And avoids:

- capturing raw notes
- capturing export content
- capturing entry payloads

### Errors: make them useful, not revealing

Error handling should:

- show non-shaming messages
- preserve user work
- log only what you need to debug (operation name, error type, coarse counts)

If a log line could reconstruct a user’s health entry, it’s too detailed.

### Analytics boundaries (if you ever add them)

In a privacy-first health context:

- default is no telemetry
- any analytics must be explicit opt-in
- analytics must be content-free (no Class A)

If you can’t describe the boundary clearly, don’t ship analytics.

### Incidents: treat them as learning, not blame

An incident can be:

- data loss risk (migration bug)
- privacy risk (export confusion, unintended disclosure)
- reliability risk (save failures)

Small-team incident loop:

1) Triage: what happened and who is affected?
2) Contain: stop the bleeding (disable feature, add guardrails)
3) Recover: provide user-facing steps
4) Learn: add tests and update the checklist

### Shipping “definition of done”

1) Primary flows have explicit error states and recovery paths
2) Logs are redacted and non-reconstructive
3) No default telemetry; any analytics is opt-in and documented
4) A basic incident playbook exists
5) Releases are tested on at least one real device form factor

### Next: Part 11 — From PWA to Native: When and How to Branch

In Part 11, we’ll define when a PWA is enough and when native becomes worth it, plus how to structure
code so you can branch without rewriting your product.

---

## Part 11 — From PWA to Native: When and How to Branch

PWAs can be “native-enough” for many health tools, especially when local-first and offline-first are
the priority.

But there are legitimate reasons to go native later.

### When a PWA is enough

PWAs often win when:

- offline reliability is good
- your UI is simple and fast
- you don’t need deep OS integrations
- you prioritize easy updates and broad device reach

### When native starts to matter

Native becomes attractive when you need:

- deeper background execution (reliability requirements beyond the browser)
- tighter integration with platform storage and security
- platform-specific assistive tech edge cases
- distribution constraints (some orgs prefer app stores)

The key is to avoid switching platforms as a panic response to avoid fixing UX.

### How to structure code so you can branch later

Even if you stay PWA-only for years, you can architect for optional native:

- keep domain logic separate from UI (model, validation, trends)
- keep storage behind an interface (so implementations can change)
- keep exports behind a boundary (so output generation is consistent)
- keep a11y patterns as shared components and rules

This makes “native later” a packaging decision, not a rewrite.

### Native migration “definition of done” (decision checklist)

1) You can name the specific limitation the PWA cannot meet
2) You can measure the user harm caused by that limitation
3) You have a plan to share core logic across platforms
4) You can preserve privacy-first defaults in the new platform

### Next: Part 12 — Lessons Learned from PainTracker

In Part 12, we’ll close with an honest retrospective and a distilled checklist you can reuse for
your own accessibility-critical, privacy-first health tools.

---

## Part 12 — Lessons Learned from PainTracker

A retrospective is only useful if it names the tradeoffs.

PainTracker’s guiding lessons (the ones that generalize):

### 1) Trust is an architecture decision

Privacy-first isn’t a policy page. It’s local-first defaults, explicit boundaries, and honest claims.

If users suspect surveillance, they will self-censor. The tool becomes less useful and more harmful.

### 2) Accessibility is what makes the data real

If the UI isn’t usable on bad days, you won’t get the data that matters.

The “best” model and “best” analytics are irrelevant if the user can’t log quickly, recover from
errors, and understand the system state.

### 3) Exports are the bridge to real-world outcomes

For many users, the value of tracking is not self-optimization. It’s communication:

- with clinicians
- with employers
- with claims systems

Designing for clean, user-controlled exports is how the app helps beyond the screen.

### 4) The app must fail gently

Offline, quota limits, crashes, and updates will happen.

The difference between a trustworthy tool and a harmful one is whether failure:

- preserves work
- explains what happened
- offers a recovery path

### A distilled checklist (carry this to any project)

1) Local-first by default (offline is normal)
2) Minimal data collection (only what earns its place)
3) A11y is continuous (keyboard, screen reader, low-friction)
4) Export is explicit and user-controlled
5) Logs are non-reconstructive (no sensitive content)
6) Failure modes have gentle recoveries
7) Claims are honest and scoped

If you build around this checklist, you’ll ship something that respects users under real constraints.
