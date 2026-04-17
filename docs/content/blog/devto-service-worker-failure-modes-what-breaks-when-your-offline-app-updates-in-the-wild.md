---
title: "Service Worker Failure Modes in Offline-First PWAs"
description: "Offline-first PWAs do not update in one clean motion. Service workers, stale assets, and mixed-version sessions can break trust long before the UI crashes."
tags:
  - pwa
  - serviceworker
  - webdev
  - architecture
published: false
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
---

If you want the failure-mode and testing path through the catalog, start here.

Recommended route:

1. Service Worker Failure Modes in Offline-First PWAs
2. [Rollback Patterns in Offline-First PWAs](https://dev.to/crisiscoresystems/rollback-patterns-in-offline-first-pwas-13f9)
3. [Testing IndexedDB Schema Migrations in Offline-First PWAs](https://dev.to/crisiscoresystems/testing-indexeddb-schema-migrations-in-offline-first-pwas-26m8)
4. [Offline Queue Replay and Idempotency in Offline-First PWAs](https://dev.to/crisiscoresystems/offline-queue-replay-and-idempotency-in-offline-first-pwas-3hpg)

If you want the privacy boundary underneath those failures, add:
[Trust Boundaries in Client-Side Health Apps](https://dev.to/crisiscoresystems/trust-boundaries-in-client-side-health-apps-2pa9)

Service workers look elegant on paper.

They make offline apps feel solid. They cache the shell, keep the
interface alive, and let the app keep moving when the network starts
falling apart. In diagrams, they look like resilience.

In real life, they can behave more like a trapdoor.

Because once an offline-first app starts updating in the wild, you are
no longer dealing with a clean release path. You are dealing with
timing. Old tabs. Partial installs. Stale assets. Broken migrations.
Users who are still living inside a version you no longer control.

That is the ugly sibling of deterministic caching.

Not the clean version from the whiteboard.

The version that actually has to survive contact with the world.

## The real problem is not caching

Most people think the main danger is whether the cache is stale.

That is only the beginning.

The deeper problem is mismatch.

Mismatch between the HTML shell and the JavaScript bundle.
Mismatch between old local data and new migration logic.
Mismatch between a tab that has been open for three days and a deploy
that happened ten minutes ago.
Mismatch between what the service worker thinks is installed and what
the page thinks it can safely execute.

That is when the app starts behaving like it is possessed.

A user refreshes and half the UI is on the new version while the other
half is still running old assumptions. Buttons appear, but their
handlers no longer match. Assets load, but the code paths they point to
have changed. Cached data gets read by newer logic that expects a shape
it has never seen before.

The app does not always crash loudly.

Sometimes it just becomes subtly wrong.

And subtle wrongness is often worse, because it looks like success while
quietly breaking trust.

## Update races are the first crack

Service workers do not update in one clean instant.

They register.
They install.
They wait.
They activate.
They take control.

That sounds neat until you remember the current page may still be
running the old version while the new worker is already half installed
and waiting for the moment it can take over.

Now imagine that happening while the user is online, then offline, then
back online, then navigating without a full reload.

What you get is not one clean version of the app.

You get multiple versions of the app trying to exist in the same
session.

That is an update race.

The browser may have a new worker ready, but the open tab still has old
code in memory. The new worker may be serving different cached assets
than the page expects. The user may be interacting with forms or state
that were created before the update but submitted after it.

If your deployment assumes the update is atomic, your deployment is
lying.

## Stale assets are not just annoying

People talk about stale assets like they are a minor inconvenience.

They are not.

A stale asset can break the app at the structural level.

A page shell cached from version 12 can try to load bundle chunks that
no longer exist in version 13.
A JavaScript file can reference a CSS class that was renamed.
An icon can disappear because the manifest changed.
A route can still exist in the client shell even though the server no
longer serves the same logic behind it.

At that point, the cache is not preserving stability.

It is preserving confusion.

This gets especially dangerous in apps that split code aggressively or
lean on lazy loaded routes. The service worker may hand out a shell that
looks valid, but underneath it there are dead paths and broken
assumptions.

So the interface loads.

And then it decays.

That is the kind of failure people do not always catch in testing,
because it does not always look like a failure at first.

## Broken migrations are the silent disaster

This is the failure mode that actually hurts people.

Not the refresh.
Not the spinner.
Not the stale icon.

The migration.

Offline apps live and die on local data shape. IndexedDB, local files,
cached blobs, serialized forms, background sync queues, drafts,
attachments, settings, metadata. All of it has to survive version
changes.

If a deploy changes the schema and the migration logic is wrong,
incomplete, or too eager, the app can corrupt its own memory.

A good migration does not just transform data.

It preserves intent.

A bad migration does one of the following:

* assumes data is always present when it is not,
* assumes old records were shaped exactly the way the new code expects,
* rewrites records destructively without a rollback path,
* silently drops fields the old version still needed,
* upgrades part of the data but not the related references.

That is how offline apps lose trust.

Not because the user did anything wrong.

Because the app forgot how to carry its own history forward.

## The hardest case is the user who never closed the tab

This is the one that gets underestimated over and over again.

You deploy a fix.

It works in dev.

It works in staging.

It even works for fresh users.

Then a real user comes back to a tab they opened two days ago, before
the deploy, with old state still alive in memory and old UI assumptions
still attached to it.

Now that user clicks into a screen you redesigned.

Maybe they were offline for half of yesterday.
Maybe they had pending actions in a queue.
Maybe the app was backgrounded and resumed later.
Maybe the service worker updated quietly in the background but the page
never reloaded.

That user is not on the same timeline as your deployment.

And that matters.

The system has to survive overlap. Old code and new code may both be
real for a while. If the app cannot handle that, then it is not really
offline-first.

It is just online-first with better branding.

## Bad deploy recovery is part of the architecture

This is the part teams hate planning for, because it means failure is
not some rare edge case. It is part of the job.

Any real deployment system needs a rollback story.

Not a hope.

A story.

What happens when the new worker is bad?
What happens when a migration corrupts local state?
What happens when the new bundle is missing a critical asset?
What happens when only some users update before the rollback?
What happens when the old and new versions are both in the wild at the
same time?

If you do not have answers, you do not have release engineering.

You have confident gambling.

## Recovery needs to exist at several levels

A mature offline-first system should think in layers.

If the new bundle is broken, the user should still be able to load a
safe fallback shell or at least recover into a known good version.

If a migration breaks local state, there should be a backup or
restoration path for critical data.

If the user was in the middle of something when the update hit, the app
should preserve the pending task or queue.

If a service worker update is corrupt, the system should be able to stop
activating it, revert to the prior worker, or degrade safely.

If the app cannot safely continue, it should tell the user plainly what
happened and what was preserved.

Not a blank screen.

Not a mysterious refresh loop.

Not a smug "something went wrong" message.

Actual information.

Because the user does not need elegance at that point.

They need clarity.

## The update process itself needs guardrails

A service worker update should not be treated like an invisible
background event.

It is a potentially disruptive change to the app's behavior, cache, and
state model.

That means the update flow should ask:

* Is the new version compatible with the current stored data?
* Can the old version still interpret the new records?
* Can the new version safely read old records?
* Is there a staged handoff or is everything switching at once?
* What happens if the page is open during the update?
* What happens if the user is offline during the update?
* Can the user continue safely if the new worker fails?

If you cannot answer those questions, then the update path is not
deterministic enough to trust.

And if it is not deterministic enough to trust, it should not be
pretending to be seamless.

## The user should not have to think about deployment state

This part matters.

The user is not your release manager.

They should not need to understand service worker lifecycle state, cache
busting, manifest invalidation, or bundle compatibility matrices just to
use the app.

They only need a few truths:

This version is safe.
This version is syncing.
This version needs a refresh.
This change could not be applied safely.
Your data is intact.
Here is what happened.

That is it.

The machinery can be complex.

The experience cannot be.

## What a protective approach looks like

A protective offline app does not pretend updates are harmless.

It treats them as controlled risk.

That means:

versioned caches, not mysterious blobs;
schema-aware migrations, not blind rewrites;
explicit compatibility checks;
safe activation timing;
rollback paths;
visible recovery states;
and a hard refusal to silently corrupt user data just to keep the
interface looking smooth.

The goal is not to make updates invisible.

The goal is to make them honest.

## The deepest rule

An offline-first app is not just a website with a cache.

It is a living system that has to survive its own updates.

That is the test.

Not whether it looks polished when everything is fresh.
Not whether the first load is fast.
Not whether the demo is clean.

Whether it can update in the wild without lying to the user, breaking
their session, or destroying the data they trusted it to hold.

That is the field guide version.

Pretty architecture is easy in calm weather.

The real work is what holds when the storm hits.

Next in the failure-mode path:
[Rollback Patterns in Offline-First PWAs](https://dev.to/crisiscoresystems/rollback-patterns-in-offline-first-pwas-13f9)
