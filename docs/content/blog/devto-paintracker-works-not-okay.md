---
title: "I Built a Pain Tracker That Works When the User Is Not Okay"
description: "A practical look at building PainTracker.ca as a free local-first pain tracking app for users who may be in pain, offline, or overwhelmed."
tags:
  - a11y
  - privacy
  - showdev
  - ux
canonical_url: "https://dev.to/crisiscoresystems/i-built-a-pain-tracker-that-works-when-the-user-is-not-okay-34h7"
---
<!-- pain-tracker:target-link:start -->
> Try the local-first app path: [free private pain tracker app](https://paintracker.ca/resources/free-pain-tracker-app)
<!-- pain-tracker:target-link:end -->
Most apps assume the user can come back later and try again.

That assumption breaks down when the data is pain.

<!-- pain-tracker:cta-top -->
> If you want privacy-first, offline health tech to exist *without* surveillance funding it: sponsor the build → https://github.com/sponsors/CrisisCore-Systems

Pain records are often captured at exactly the wrong moment: during a flare, after a bad appointment, while exhausted, while distracted, or after several days of trying to remember what changed. If the app fails then, the user does not just lose a form submission. They lose context they may not be able to reconstruct.

That is the design problem behind [PainTracker.ca](https://paintracker.ca).

It is a free, local-first pain tracking tool built around a deliberately conservative premise:

the user may not be having a stable day.

## The wrong baseline

A lot of software is still designed around a calm, connected, capable user.

The ideal user has stable internet. They remember their password. They have time to read every prompt. They are not in pain. They are not sharing the device. They are not rushing before an appointment. They can troubleshoot a failed save. They can reconstruct the details later.

That user exists sometimes.

They are not the baseline I wanted to build for.

Pain tracking is health-adjacent, personal, and often time-sensitive. It sits close to medical appointments, insurance forms, disability paperwork, injury recovery, and the private reality of living inside a body that is not behaving predictably.

That changes the engineering posture.

The product should not assume the user has spare focus, perfect memory, or a reliable connection. It should assume the record matters most when the user has the least capacity to protect it.

## Pain tracking is a memory preservation problem

The simplest version of a pain tracker is just a form.

Date. Intensity. Location. Notes.

But the real problem is not collecting fields. The real problem is preserving meaning before memory degrades.

Pain blurs detail. Fatigue blurs sequence. Stress changes what people can recall. By the time someone is asked "How has it been since last visit?", the useful context may already be gone.

That is why the core loop has to be boring and durable:

- open the app
- record what happened
- keep the record local
- make it available later
- let the user decide if and when to export it

Nothing in that loop should require an account wall, a remote API, a clinic integration, or a marketing funnel.

Those things may be useful in some products. They are not prerequisites for writing down what happened today.

## Offline-first is not convenience here

Offline support is often sold as polish.

In a sensitive tool, it is a failure policy.

If the user is on weak internet, in a waiting room, on a bus, in a basement suite, near a dead battery, or simply unable to deal with another failed login, the app still needs to preserve the basic record.

For PainTracker, that means core use is local-first. The app is designed so ordinary tracking does not depend on a server accepting the user's pain record.

That does not make the device magical. Local browser storage can still be lost if the browser is wiped, the device is damaged, or the user clears site data. Local-first is not the same as permanent. It is a boundary:

the user's device is the first authority, and remote systems do not get automatic custody of the record.

That boundary is more honest than pretending a cloud account is always safer, easier, or less risky.

## Local data is a trust boundary

Pain data should not become product exhaust.

If a person records pain intensity, medication notes, sleep, mood, triggers, or private context, that information should not quietly become analytics fuel. It should not move through infrastructure just because the product team wants dashboards.

PainTracker's core posture is simple:

keep the sensitive record local by default.

That does not remove all risk. Shared devices, coerced inspection, malware, screenshots, browser backup behavior, and exported files are still real threats. But local-first design reduces one major exposure path: the routine transfer of intimate records into a service operator's systems.

In health-adjacent software, "privacy-first" only means something if the architecture limits what can be seen, stored, logged, or requested later.

## Export belongs to the user

The export button is one of the most important controls in the app.

It is the moment private data becomes portable.

That is why export should be user-triggered, legible, and bounded. The app should not automatically send summaries to providers, insurers, employers, platforms, or analytics systems.

A patient-generated report can be useful without becoming a clinic integration. A person may want to bring clearer context into an appointment. They may want a PDF for their own files. They may want to copy a summary into a message. Those are user-controlled disclosure paths.

The product should not turn that into silent sharing.

## What PainTracker does not claim

This matters.

PainTracker is a patient support tool for recording and organizing self-reported pain information.

It may help users bring clearer context into appointments.

It does not replace clinical judgment or formal medical documentation. It does not diagnose conditions. It does not guarantee better care, better claims outcomes, or provider acceptance. It is independent and does not imply approval, integration, or endorsement by any clinic, insurer, compensation board, or government body.

That limitation is not a weakness.

It is part of the trust boundary.

Health-adjacent software becomes dangerous when it starts borrowing authority it has not earned. A small tool can still be useful without pretending to be a medical system.

## What this taught me about Protective Computing

PainTracker became a practical reference point for a broader idea I call Protective Computing.

Protective Computing is software design for users operating under instability and human vulnerability. It asks different questions than ordinary product design:

- What happens if the internet disappears?
- What happens if the user is interrupted mid-action?
- What happens if the device is shared or coerced open?
- What data becomes more exposed because of this feature?
- Can the user recover locally?
- Is the claim "privacy-first" actually backed by structure?

Those questions are not abstract when the product is a pain tracker.

They shape the architecture.

No account required for core use.

Local writes before remote assumptions.

Exports controlled by the user.

Careful language around clinical and institutional claims.

Optional systems separated from the essential task.

That is the difference between saying "we care about users" and designing as if user instability is real.

## The useful takeaway

If you build software for sensitive personal data, do one small audit:

turn off the internet and try to complete the core task.

Then ask what the user loses.

If the answer is "the record", the failure is not just technical. It is architectural.

PainTracker.ca is live as a free local-first pain tracking tool. Feedback from developers, patients, clinicians, and privacy-minded builders is welcome.

- App: [PainTracker.ca](https://paintracker.ca)
- Repo: [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)
- Builder: [CrisisCore Systems](https://crisiscore-systems.ca)
<!-- pain-tracker:cta-bottom -->
---
## Support this work

- Sponsor the project (primary): https://github.com/sponsors/CrisisCore-Systems
- Star the repo (secondary): https://github.com/CrisisCore-Systems/pain-tracker
