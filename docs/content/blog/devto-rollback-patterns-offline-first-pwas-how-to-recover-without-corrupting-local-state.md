---
title: "Rollback Patterns in Offline-First PWAs"
description: "Rollback in an offline-first PWA is not just redeploying old code. It has to survive mixed versions, local history, and queued intent without silent corruption."
tags:
  - pwa
  - webdev
  - architecture
  - databases
published: false
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
---

Rollback sounds simple until the app keeps state locally.

If all you have is a server and stateless clients, rollback usually means
deploy the old version and move on.

That is not what happens in an offline-first system.

In an offline-first app, the old version is still running in someone's
tab. The new version may already be installed in a waiting service
worker. The local database may already have been migrated. A queue of
pending writes may have been created under assumptions the rollback does
not understand.

So when people say "just roll it back," what they often mean is:

put old code back on the server and hope the client does not notice.

That is not a rollback strategy.

That is a prayer circle with version numbers.

## Rollback stops being simple the moment data moves locally

The hard part is not code deployment.

The hard part is state continuity.

Once the app stores drafts, queues, attachments, preferences, IndexedDB
records, background sync state, or cached workflows on the device, the
client has its own history.

That history does not disappear just because you redeployed yesterday's
bundle.

Now the rollback has to answer harder questions.

Can the old code read the records the new code already wrote?
Can the old queue processor safely replay pending mutations?
Can the old UI interpret the local state it is about to render?
Can the old service worker serve assets that still match the current
shell?

If the answer is no, then you did not roll back.

You only changed one side of a split system.

## The real danger is mixed-version reality

Offline-first systems do not roll forward or backward in a single clean
motion.

They overlap.

One user is still on the old app.
One user already activated the new service worker.
One user has the new schema but the old tab still open.
One user went offline during the bad deploy and comes back after the
rollback.

That means both versions can be real at the same time.

And that is the condition your rollback plan actually has to survive.

Not the clean lab scenario.

The overlap.

Because overlap is where silent damage happens.

The app does not necessarily explode.

It just starts reading state with the wrong assumptions.

That is how records get dropped, queues get replayed twice, attachments
lose references, and local history becomes less trustworthy than the
server version you were trying to save.

## The first rule: not every migration is reversible

Teams get into trouble when they treat rollback as if every schema
change can be undone just because the code can be redeployed.

That is false.

Some migrations are additive.

Those are the easy ones.

Add a field.
Add an index.
Introduce metadata the old code can ignore.

Other migrations are destructive.

They rename fields, collapse structures, normalize records into new
tables, rewrite identifiers, or delete legacy forms the old client still
expects.

Those changes may not have a safe reverse path.

And if they do not, the rollback plan has to say that honestly.

You do not get to call a migration reversible just because you wish it
were.

## Good rollback plans start before the deploy

Rollback is designed before the release, not during the outage.

If the only time you ask how to recover is after the migration already
ran in the wild, you are late.

A safer release process asks upfront:

* Is this migration additive or destructive?
* Can old code tolerate the new records for one release window?
* Can new code tolerate old records for one release window?
* Is there a compatibility bridge period?
* Do we need a snapshot or export before mutation?
* What happens to queued writes created during the bad release?
* Can the service worker keep serving a safe shell if activation is
  blocked?

That is what real rollback engineering looks like.

Not confidence.

Preparation.

## Compatibility windows matter more than clever rollbacks

The safest rollback is often the one you barely need because versions
were built to overlap safely.

That means one version should usually tolerate the next version's data
shape for a while.

And the next version should usually tolerate the previous version's data
shape for a while.

That window matters.

Because the world does not update at once.

Tabs stay open. Devices go offline. Queues wake up late. Background sync
replays stale work. Service workers activate at inconvenient times.

If the system requires atomic upgrade across all clients to remain safe,
the system is too brittle for the environment it claims to support.

## Queue safety is part of rollback safety

This part gets missed constantly.

Offline-first apps do not just store data. They store pending intent.

Queued writes, unsent forms, attachment uploads, background sync jobs,
retry tokens, optimistic mutations. Those are all promises the app made
to the user.

If rollback ignores the queue, the app can come back in a state where:

* old mutations replay against the wrong schema,
* the same mutation gets applied twice,
* a retried request becomes destructive,
* records created by the bad version can no longer be reconciled.

That is why rollback-safe systems need idempotent writes, durable queue
metadata, and enough version context to decide whether a pending action
is still safe to replay.

Otherwise rollback becomes replayed corruption.

## Backup is not optional if the migration risk is real

If a release can damage meaningful local data, then backup is part of the
release boundary.

Not an extra.

Not a future improvement.

Part of the boundary.

That does not mean every app needs a dramatic export ritual before every
deploy.

It does mean critical local data should have some recovery path if a bad
migration lands.

That could mean:

* a local snapshot before destructive migration,
* a journal of transformed records,
* an export path that preserves restore fidelity,
* a recovery mode that can rehydrate from last-known-good data.

What matters is not the mechanism.

What matters is that the user's history is not one failed deploy away
from being rewritten into nonsense.

## Rollback UI should tell the truth

When recovery happens, the interface has to be honest about what is
going on.

Not vague.

Not soothing.

Honest.

The user needs to know things like:

This update was not applied safely.
Your local data is intact.
Some pending changes are being held until compatibility is restored.
You may need to refresh.
Here is what was preserved.
Here is what still needs review.

That is the right kind of friction.

Because when the app has already lost certainty, pretending everything
is seamless only turns a deployment issue into a trust issue.

## Service workers need rollback discipline too

Service workers make rollback harder because they extend the release
surface.

Now you are not only thinking about bundles and local data.

You are thinking about:

* whether a bad worker should activate,
* whether a waiting worker should be abandoned,
* whether versioned caches still point at a safe shell,
* whether stale assets keep a broken release alive longer than intended.

A protective system treats the worker as part of rollback design, not a
separate browser detail.

If the worker can keep handing out a poisoned shell after rollback, then
the rollback is incomplete.

## What migration guardrails actually look like

Good migration guardrails are not exotic.

They are disciplined.

They look like:

* explicit schema versions,
* compatibility checks before mutation,
* additive changes before destructive changes,
* reversible steps where possible,
* snapshots before risky rewrites,
* idempotent queue replay,
* version-aware recovery logic,
* refusal to continue when safety cannot be proven.

That last one matters.

Sometimes the most protective thing the app can do is stop.

Not because stopping is elegant.

Because silent corruption is worse than visible interruption.

## The standard is not "Can we revert the deploy?"

That is too shallow.

The real question is:

Can this system recover from a bad release without rewriting the user's
local history into something false?

That is the standard.

Not whether CI is green.
Not whether the old container can still boot.
Not whether the dashboard says rollout complete.

Whether the user's data, pending intent, and local continuity survive the
mistake.

That is what rollback has to protect.

## The deeper rule

Offline-first apps do not get to treat rollback as a server-only event.

They carry state in the wild.

That means recovery has to be designed for mixed versions, delayed
clients, local data history, and queued intent that outlives the deploy.

If your rollback plan only restores the code and leaves the user's local
reality to fend for itself, then it is not really recovery.

It is abandonment with version control.
