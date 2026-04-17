---
title: Protective Computing Is Not Privacy Theater
published: true
tags: protectivecomputing, architecture, privacy, webdev
cover_image:
---

> Companion reading: if you want the fuller Core v1.0 pattern definitions,
> conformance framing, and PLS links, read
> [Architecting for Vulnerability: Introducing Protective Computing Core v1.0](https://dev.to/crisiscoresystems/architecting-for-vulnerability-introducing-protective-computing-core-v10-91g)
>
> If you want the AI / agentic systems reading path that grows out of this
> doctrine, start with
> [AI Agents Under Protective Computing: Start Here](https://blog.paintracker.ca/ai-agents-protective-computing-start-here)

Privacy features are easy to ship. A toggle. A consent modal. An export button.
Protective Computing asks a different question: does this system stay legible
and non coercive when the person using it can no longer advocate for
themselves? Those are not the same problem. One is a compliance posture. The
other is a structural property.

***

## The Difference Is Structural

A consent modal is privacy theater when the system behind it transmits sensitive state regardless of what the user clicked.

An export button is privacy theater when the exported file silently drops the encryption metadata needed to restore the data.

An "offline first" badge is privacy theater when startup requires a remote configuration call.

Privacy theater is often sincere work implemented at the wrong layer. A team
ships a GDPR consent flow, checks the box, and ships. The data modeling
underneath remains unchanged. The feature is real. The protection is not.

Protective Computing starts from a different premise: not what does the UI say,
but what does the architecture actually do?

That distinction between rhetorical protection and structural protection is the entire discipline.

***

## What Protective Computing Is

Protective Computing is a systems engineering discipline for software intended
to remain safe, legible, and useful under conditions of instability and human
vulnerability. The [Overton Framework](https://zenodo.org/records/18688516)
formalizes this as a structural engineering constraint with testable
properties, not a design philosophy or a values statement. If you want the
normative layer beneath that framing, read
[Architecting for Vulnerability: Introducing Protective Computing Core v1.0](https://dev.to/crisiscoresystems/architecting-for-vulnerability-introducing-protective-computing-core-v10-91g)
for the Core v1.0 spec and conformance model.

A protective system must preserve five things:

- Local authority — the user retains control over their data, device state,
  export paths, and ability to leave
- Exposure minimization — collect, store, transmit, and render the minimum
  data necessary, by default, not as an option
- Reversibility — users can recover from mistakes, panic, interruption, or
  incomplete actions without disproportionate harm
- Degraded functionality resilience — core tasks survive degraded conditions:
  no internet, low battery, broken service workers, interrupted sessions
- Coercion resistance — the system does not become a tool of surveillance,
  forced disclosure, or manipulation, even passively

None of those are features. They are architectural properties. They are either
true of the whole system at the structural level, or not true regardless of
what the UI labels say.

***

## The Stability Assumption Is the Hidden Adversary

Most software is designed for someone who is rested, online, cognitively
available, and in a safe environment with reliable hardware. The Overton
Framework names this the Stability Assumption and formalizes what it produces
as Stability Bias: an architectural distortion caused by dependency
accumulation, vulnerability amplification, and irreversible system design. The
[Overton Framework is now DOI-backed](https://dev.to/crisiscoresystems/the-overton-framework-is-now-doi-backed-ko7),
which makes that doctrine citable and stable enough to audit against over time.

Stability Bias is not a bug report. It is a defect class. It needs to be hunted, not just patched.

The actual use conditions for software that holds health records, legal
evidence, housing documents, or communication logs include pain, illness,
trauma, grief, fatigue, executive dysfunction, displacement, weak or
intermittent connectivity, low battery, degraded hardware, unsafe surroundings,
legal vulnerability, coercive relationships, cognitive overload, interrupted
sessions, device sharing, and loss of trusted access.

That is not an edge case inventory. It is a description of any person in
crisis. Software optimized for the Stability Assumption is implicitly optimized
for the people who need protection least.

***

## Why "Privacy First" Is Not Enough

Privacy first is a claim. Protective legitimacy is structural, not rhetorical.

A system is not protective because it says offline first, privacy first,
encrypted, trauma informed, or resilient. It is protective only if the
architecture, defaults, failure behavior, and recovery paths materially
support those claims. The
[Protective Legitimacy Score rubric](https://zenodo.org/records/18783432)
makes this precise: claims do not generate score. Verifiable system behavior
generates score. A conventional cloud dependent architecture scores 15.25 out
of 100. A protective local first implementation scores 87.75. The gap is not
branding. It is architecture.

Here is what the structural version looks like in practice.

**Specimen one: background sync.**

The [pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)
codebase keeps a document called `SECURITY_INVARIANTS.md`, a registry of the
eight chokepoints where a small change quietly turns the system into a
different kind of system. The first chokepoint is background sync. The
invariant: no wildcard `/api/*` permissions. Same origin only. Drop and delete
disallowed queue items. No "skip but keep."

The threat it defends against: when the app goes offline, pending requests are
serialized to IndexedDB for later replay. Without strict origin validation at
both enqueue time and replay time, a malicious queue item could redirect
sensitive health data to an attacker controlled domain when connectivity
restores.

Privacy theater would have put "we never transmit your data" in the README.
The structural answer is two separate enforcement points with a regression test
that fails if the allowlist ever becomes a wildcard.

**Specimen two: backup import.**

The second chokepoint covers `BackupSettings.tsx`. The invariant: no writes
until the user explicitly types the confirm token `IMPORT`. Not a checkbox. Not
a button. The literal word.

That friction is not a UX oversight. It is a coercion barrier. It prevents an
automated process, a shoulder surfing attacker, or a panicked accidental action
from writing arbitrary data into application state without a deliberate,
eyes-open confirmation step. The friction is load bearing. Removing it would
not improve the user experience. It would remove a structural protection and
replace it with nothing. I unpack that design rule further in
[The Micro-Coercion of Speed: Why Friction Is an Engineering Prerequisite](https://dev.to/crisiscoresystems/the-micro-coercion-of-speed-why-friction-is-an-engineering-prerequisite-g4j).

Two specimens. Same pattern in both: the claimed protection is enforced at the
architecture level, testable, and documented as a chokepoint rather than
trusted as a policy.

***

## What the Structural Version Looks Like

Privacy theater versus structural protection, paired:

### "We Never Sell Your Data"

The structural version: the app has no server side storage of health records.
All writes go to local IndexedDB. The CSP enforces `connect-src 'self'`. Any
external egress routes through a same origin chokepoint. The policy is the
minimum possible claim because the architecture leaves nothing else to claim.

### "Export Your Data Anytime"

The structural version: the export preserves the full backup envelope with an
allowlist applied on both export and import. Denied keys never leave. Denied
keys never enter. Invalid schema versions are rejected. The restore round trip
is tested, not assumed.

### "Offline First"

The structural version: core writes succeed locally before any sync attempt.
Sync is secondary. The app does not call a remote configuration endpoint on
startup. Essential function survives with the network fully cut.

### "Encrypted"

The structural version: defines exactly what is encrypted, where the key
lifecycle lives, and what happens when the passphrase is lost. Lock state,
unlocked state, absent state, error state, and corrupted state are explicit and
tested. Encryption metadata is preserved through export and restore. The backup
does not silently drop the material needed to decrypt it. For the audit
questions that expose whether those claims are real, read
[If Your Health App Can't Explain Its Encryption, It Doesn't Have Any](https://dev.to/crisiscoresystems/if-your-health-app-cant-explain-its-encryption-it-doesnt-have-any-57pf).

### "Trauma Informed"

The structural version: destructive actions are explicit, correctly scoped, and
legible. Error states tell users what is still safe, not just what failed. No
manipulative urgency. No irreversible reveals. Safe exit is always available.
The interface does not become cognitively punishing under stress.

In every case the structural answer makes the claimed property auditable. It is
not a statement of intent. It is a behavior the architecture either exhibits or
does not.

***

## What This Doctrine Path Is

This reading path exists to turn protective claims into auditable design rules.

Three pieces. One question repeated across all of them:

> What design rules make software stay usable, legible, and non coercive when human stability breaks down?

The material is not theoretical. The
[pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker) app is the
reference implementation of the Protective Computing canon, built to
demonstrate that these constraints are implementable in production software
under real conditions. The series is grounded in that implementation, not
doctrine invented to fill posts.

- Entry point — [Architecting for Vulnerability: Introducing Protective Computing Core v1.0](https://dev.to/crisiscoresystems/architecting-for-vulnerability-introducing-protective-computing-core-v10-91g)
- This piece — translating doctrine into product and architecture boundaries
- Closing argument — [The Stability Assumption: The Hidden Defect Source](https://dev.to/crisiscoresystems/the-stability-assumption-the-hidden-defect-source-5cpd)

Adjacent essays like [The Micro-Coercion of Speed](https://dev.to/crisiscoresystems/the-micro-coercion-of-speed-why-friction-is-an-engineering-prerequisite-g4j)
and [Coercion-Resistant UX](https://dev.to/crisiscoresystems/coercion-resistant-ux-designing-interfaces-that-dont-pressure-users-under-stress-18m9)
extend the same discipline into engineering process and interface design.

No manifestos. Patterns, failure modes, and implementation level evidence.

***

## The Blunt Version

Privacy theater is what happens when a team solves the audit problem instead of the user problem.

Protective Computing is what happens when you ask what a system does to a
scared, exhausted, offline person at 2am and you take the answer seriously at
the architectural level instead of the marketing level.

One of those is a posture. The other is a discipline.

***

*This is the bridge between the doctrine entry point and the closing argument in the Protective Computing reading path.*

*Read first: [Architecting for Vulnerability: Introducing Protective Computing Core v1.0](https://dev.to/crisiscoresystems/architecting-for-vulnerability-introducing-protective-computing-core-v10-91g). Then finish with [The Stability Assumption: The Hidden Defect Source](https://dev.to/crisiscoresystems/the-stability-assumption-the-hidden-defect-source-5cpd).*

***

> **About Protective Computing:** A formally published systems engineering
> discipline. Full canon at the
> [Protective Computing Zenodo community](https://zenodo.org/communities/protective-computing).
> Living specification at
> [protective-computing.github.io](https://protective-computing.github.io).
> PainTracker is the reference implementation.
