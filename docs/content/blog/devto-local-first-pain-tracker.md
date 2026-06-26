---
title: "The Architecture of a Local-First Pain Tracker"
description: "How PainTracker.ca uses local-first design, offline support, and user-controlled exports for sensitive pain tracking."
tags:
  - architecture
  - privacy
  - showdev
  - softwareengineering
canonical_url: "https://dev.to/crisiscoresystems/the-architecture-of-a-local-first-pain-tracker-2pe0"
---
<!-- pain-tracker:target-link:start -->
> Review the production local-first app: [download a private pain tracker](https://paintracker.ca/download)
<!-- pain-tracker:target-link:end -->
Local-first architecture is not just a storage choice.

For a health-adjacent app, it is a trust boundary.

<!-- pain-tracker:cta-top -->
> If you want privacy-first, offline health tech to exist *without* surveillance funding it: sponsor the build → https://github.com/sponsors/CrisisCore-Systems

PainTracker.ca is built around a narrow promise: a person should be able to record and organize self-reported pain information without making the core task depend on a server, an account, or a clinic integration.

That sounds simple until you treat the user state honestly.

The user may be offline. They may be in pain. They may be tired. They may be trying to capture a detail before memory fades. They may be on a shared device. They may need the record later for an appointment, but not want it uploaded anywhere right now.

The architecture has to respect that.

## The core constraint

The first architectural constraint is not a framework decision.

It is this:

the write path must not require remote permission.

If the user needs to record pain, the app should not first require a network round trip, account session, analytics consent, or third-party service availability. Those systems may exist around a product, but they should not be the gate in front of the essential local act.

That leads to a basic core loop:

1. The user enters a record.
2. The app validates and normalizes the record locally.
3. The app writes the record to local persistence.
4. The user can return to the record later.
5. Export remains an explicit user action.

This is the part that must survive degraded conditions.

Everything else is secondary.

## Browser app, local authority

PainTracker is a browser-based app, which means it has to work within real browser constraints.

That includes storage eviction risk, private browsing restrictions, service worker edge cases, browser updates, device loss, and the fact that local storage is not a magic vault.

Local-first does not mean risk-free.

It means the product does not silently convert the user's pain history into server-side inventory as a condition of basic use.

The user's device is the first authority. The app should be usable without a backend accepting every record. If data leaves the device, the user should understand the transition.

That is the privacy architecture, not the slogan.

## IndexedDB as durable local persistence

For structured browser persistence, IndexedDB is the practical choice.

It is not glamorous. It is also not optional if the app needs more than tiny preference state.

Pain records need identity, timestamps, fields, notes, and relationships to later summaries. They need to survive reloads. They need to be available when the network is gone. They need validation because local data can outlive the exact version of the app that wrote it.

That means local persistence has to be treated as a real data layer, not as a cache.

A cache can be thrown away.

A pain record cannot.

The protective posture is to design local records as durable user data, then test migrations, parsing, and exports accordingly.

## Offline support is a failure policy

The app shell should load under ordinary offline conditions.

But "the shell loads" is not enough.

An offline-first claim only matters if core actions still work when connectivity disappears. If the UI is visible but the save path collapses, the product is offline-themed, not offline-first.

The service worker and asset strategy matter because they shape what the user sees during degraded conditions. A stale shell, mixed asset versions, or broken cache update can create false confidence.

For vulnerable-state software, false confidence is a safety defect.

The app should avoid implying that a record is safe unless the write actually succeeded. Error states should say what failed, what remains local, and what the user can do next.

## No account for core use

Account systems can be useful.

They can also become coercive gates.

For sensitive personal tools, forcing an account before core use changes the trust equation. It asks the user to identify themselves, accept remote custody assumptions, and deal with authentication friction before they know whether the tool is useful.

PainTracker keeps core tracking accountless.

That is not an anti-account ideology. It is scope control. If the task is local pain logging, the user should be able to start locally.

If future features introduce sync, backup, or sharing, those features must earn their place as explicit optional boundaries. They should not quietly replace the local core.

## Export is where the boundary changes

Export is the point where local-first becomes shareable.

That makes it one of the highest-risk parts of the app.

A report can help a user bring clearer context into an appointment. It can help organize dates, intensity, notes, and patterns. It can help the user review their own history.

But it is still disclosure.

The architecture should treat export as intentional movement across a boundary:

- the user starts it
- the output is visible
- the format is understandable
- the app does not auto-send it
- the user can decide where it goes next

That protects local authority and reduces accidental exposure.

## Optional systems must stay optional

Analytics, AI helpers, sync, cloud backup, push notifications, and provider integrations all add exposure and failure surfaces.

Some may be useful in a future product.

None should be allowed to collapse the core write path.

This is where a lot of "privacy-first" architecture drifts. A team starts with a local-first claim, then adds observability, remote config, AI summaries, cloud sync, and product analytics until the claim becomes rhetorical.

Protective architecture requires isolation:

core local function first, optional systems outside the essential path, explicit consent before sensitive data crosses a boundary.

## What I would test before trusting the claim

For an app like this, happy-path tests are not enough.

I would test:

- reload after a local write
- offline entry creation
- interrupted export
- old local data loaded by a newer app version
- invalid or partial local records
- service worker update behavior
- device clock weirdness in timestamps
- export round trips where supported
- no silent analytics upload of sensitive content
- error copy that tells the user what is still safe

Those are not edge cases.

They are the places where local-first claims become real or fall apart.

## The honest limit

PainTracker is a patient support tool for recording and organizing self-reported pain information.

It does not replace clinical judgment, medical records, or formal documentation. Local-first design reduces routine exposure to remote systems, but it does not protect against every device, browser, coercion, or backup threat.

That is why the architecture has to be specific.

Not "secure".

Not "private".

Not "resilient".

Specific:

what stays local, what can be exported, what depends on the browser, what breaks offline, and what the app refuses to automate.

That is the architecture worth explaining.

- App: [PainTracker.ca](https://paintracker.ca)
- Repo: [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)
- Architecture docs: [docs/engineering](https://github.com/CrisisCore-Systems/pain-tracker/tree/main/docs/engineering)
<!-- pain-tracker:cta-bottom -->
---
## Support this work

- Sponsor the project (primary): https://github.com/sponsors/CrisisCore-Systems
- Star the repo (secondary): https://github.com/CrisisCore-Systems/pain-tracker
