---
title: "Testing IndexedDB Schema Migrations in Offline-First PWAs"
description: "Schema migration safety in an offline-first PWA means proving that old local data survives upgrades, partial failures, and delayed clients without losing meaning."
tags:
  - pwa
  - javascript
  - testing
  - databases
published: false
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
---

This is the migration-safety stop in the failure-mode and testing path.

Read first:
[Service Worker Failure Modes in Offline-First PWAs](https://dev.to/crisiscoresystems/service-worker-failure-modes-in-offline-first-pwas-3dnp)
and
[Rollback Patterns in Offline-First PWAs](https://dev.to/crisiscoresystems/rollback-patterns-in-offline-first-pwas-13f9)

Then continue to:
[Offline Queue Replay and Idempotency in Offline-First PWAs](https://dev.to/crisiscoresystems/offline-queue-replay-and-idempotency-in-offline-first-pwas-3hpg)

If you want the privacy boundary that makes migration fidelity matter, add:
[Trust Boundaries in Client-Side Health Apps](https://dev.to/crisiscoresystems/trust-boundaries-in-client-side-health-apps-2pa9)

IndexedDB migrations look straightforward right up until real users keep
their data for months.

In a fresh test database, everything feels clean.

The new schema opens.
The upgrade callback runs.
The happy path passes.

That is the easy part.

The hard part is what happens when the app updates on a device carrying
old drafts, stale references, interrupted writes, half-finished queues,
or records created by code you already forgot you shipped.

That is where migration testing stops being a storage detail and starts
becoming a trust boundary.

Because once an offline-first app stores real user history locally, a
bad migration does not just break a test.

It rewrites memory.

## The real risk is not schema change

The real risk is silent damage.

If the app crashes loudly during an upgrade, at least you know something
went wrong.

If the app opens successfully but drops a field, misreads a record,
or detaches related data from its references, that is worse.

Now the system looks functional while carrying false history forward.

That is why migration testing has to check more than "did the database
open?"

It has to check whether meaning survived.

## Fresh databases prove almost nothing

One of the easiest ways to lie to yourself is to test only against a
brand-new database.

That tells you the latest schema can initialize.

It does not tell you whether upgrades are safe.

Real migration testing needs historical fixtures.

Version 1 data.
Version 2 data.
Malformed edge cases you know used to exist.
Partially populated records.
Unexpected nulls.
Old optional fields that later became required.

If you do not test against old shapes, then you are not really testing
migration behavior.

You are testing installation.

Those are not the same thing.

## Test the shape and the meaning

A migration test should not stop at structural validity.

Sure, you should verify that records match the new schema.

But that is only the first layer.

You also need to verify that the record still means what it meant before
the upgrade.

Did drafts stay attached to the right entity?
Did timestamps remain interpretable?
Did queued actions still point to the correct records?
Did attachments keep their references?
Did flags and defaults preserve prior user intent rather than rewriting
it?

Schema correctness is not enough if the migration preserved bytes but
lost the user's history.

## Partial failure is where real migrations are judged

This is the part teams skip because it is awkward.

What happens if the upgrade starts and does not finish cleanly?

What happens if one object store changes and the next one fails?

What happens if the browser is closed mid-upgrade?

What happens if the app throws after rewriting records but before
finalizing related references?

If your tests never model partial failure, then your migration story is
too optimistic for offline-first software.

Real devices lose power.
Tabs get killed.
Users close the app.
Storage operations throw.

The migration path has to survive ugly timing, not just ideal timing.

## Long-delayed clients are not edge cases

One of the hardest realities in offline-first systems is the user who
skips several versions.

They do not upgrade from version 5 to version 6.

They upgrade from version 5 to version 11.

That means migration testing cannot assume every intermediate release ran
in order on the device.

You need to know whether:

* the upgrade path can move across multiple versions safely,
* the app can still interpret very old local records,
* old feature data can be preserved or explicitly retired without
  ambiguity,
* queued work created under older assumptions still degrades safely.

If your migration tests only cover the immediately previous version, you
are testing the release train, not the real world.

## Test against bad data on purpose

A protective migration suite should include ugly fixtures intentionally.

Not because the app should accept every corrupted record forever.

Because real local data is messy.

Browsers crash.
Old bugs leave strange shapes behind.
Optional fields become required later.
Manual imports create awkward combinations.

Migration tests should include:

* missing fields,
* extra fields,
* invalid enum values,
* orphaned references,
* stale queue entries,
* duplicate identifiers,
* records that are valid enough to exist but not clean enough to trust.

That is where you learn whether the migration fails soft or silently
corrupts the state model.

## Rollback safety belongs in migration testing too

Migration testing is not only about moving forward.

It is also about understanding what happens if the release needs to be
pulled back.

Can the previous version tolerate the newly written records for one
release window?

If not, is that explicit in the rollout plan?

Do you snapshot before destructive rewrites?

Do you retain enough metadata to restore meaning if the migration proves
wrong in the wild?

If those answers are unknown, the migration is not well tested enough to
ship confidently.

## A good migration test suite usually covers five things

### 1. Fresh install

Prove the newest schema initializes correctly.

### 2. Upgrade from every supported historical version

Prove old local states land in the new shape without losing meaning.

### 3. Partial failure and interruption

Prove the app fails safely when upgrade steps do not complete.

### 4. Compatibility of related state

Prove queues, drafts, references, and attachments still line up after the
migration.

### 5. Recovery behavior

Prove the app can explain what happened, preserve what is safe, and avoid
continuing with corrupted assumptions.

That is a much higher bar than a single upgrade callback test.

It is also much closer to reality.

## The user never sees the migration directly

That is what makes this dangerous.

Users do not watch the upgrade transaction happen.

They only see the aftermath.

Their notes are there or not.

Their queue resumes cleanly or not.

Their saved state still makes sense or not.

So the migration test suite is one of the few places where you can catch
history loss before it becomes part of the product.

That is why this is not just a database concern.

It is product integrity work.

## The deeper rule

Offline-first apps have to carry old local reality forward without
falsifying it.

That means schema migrations need more than correctness on a clean
machine.

They need proof under messy data, delayed upgrades, partial failure, and
mixed-version history.

If the migration test suite cannot demonstrate that, then the app is not
really proving upgrade safety.

It is just hoping the user's device is kinder than production usually is.

Next in the failure-mode path:
[Offline Queue Replay and Idempotency in Offline-First PWAs](https://dev.to/crisiscoresystems/offline-queue-replay-and-idempotency-in-offline-first-pwas-3hpg)
