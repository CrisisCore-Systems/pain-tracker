---
title: How to Handle Sync Conflicts Without Lying to the User
published: false
tags: webdev,pwa,offlinefirst,distributed
series: Honest Offline First Systems
canonical_url: https://github.com/CrisisCore-Systems/pain-tracker
description: Offline first sync is not just a data problem. It is a trust problem. Here is how to handle conflicts without silently erasing user intent.
---

Offline first apps make a promise that sounds simple until you actually have to keep it:

keep working when the network dies.

That is the elegant part.

The harder part begins when the network comes back and the world has changed in the meantime.

Because once people can create, edit, delete, and move data while offline, you are no longer dealing with one clean timeline. You are dealing with delayed writes, multiple devices, replayed actions, stale reads, and competing versions of reality.

That is the moment sync conflict handling stops being a background implementation detail and becomes a trust problem.

The real question is not just:

How do we merge data?

It is:

How do we merge data without lying to the person who made it?

## The myth of one true version

A lot of systems quietly treat the server like the sacred source of truth and the client like a temporary reflection of it.

That model works right up until the client goes offline and keeps functioning anyway.

Now the phone is making decisions.  
The laptop is making decisions.  
The tablet is making decisions.  
The user is still living their life and expecting the app to remember what they meant.

At that point, the system has to stop pretending that there is always one final correct answer waiting in the cloud.

Sometimes there are two valid versions.  
Sometimes there are three.  
Sometimes the system genuinely cannot determine which outcome is right without user context.

That is not weakness. That is reality.

A trustworthy system does not fake certainty just to look smooth.

## The kinds of conflicts you actually have to handle

Not every conflict is the same, and treating them all with one generic merge rule is how systems start losing data while calling it resolution.

### Field level conflicts

These are the simplest cases.

One device changes a task title.  
Another changes the due date.

One edits a profile bio.  
Another updates the avatar.

These changes affect separate fields and can usually be merged safely, assuming your model is granular enough to see the difference.

### Same field conflicts

This is where the easy logic stops working.

One device renames a note from "Vendor follow up" to "Urgent invoice."  
Another renames that same note to "Tax stuff."

Now the system has a real conflict. It cannot just combine both values and pretend the result makes sense.

This is where last write wins starts acting like judgment when it is really just timing.

### Structural conflicts

These are more dangerous.

One device deletes a task while another continues editing it.  
One device moves a card into a board that another device has already archived.  
One user removes a section while another adds new items inside it.

Now the system is not just choosing between values. It is reconciling incompatible versions of reality.

### Ordering conflicts

These show up anywhere sequence matters.

Lists.  
Boards.  
Timelines.  
Playlists.  
Drag and drop interfaces.

If two devices reorder the same items differently while offline, timestamps alone do not solve the problem. The issue is not only when something changed. It is where that thing is supposed to live.

### Semantic conflicts

This is the subtle one, and often the most dangerous.

Two changes can both be technically valid and still produce a broken result together.

One device changes shipping to express.  
Another changes the address to a region that express delivery does not support.

One device marks a work order as complete.  
Another adds a missing dependency that makes completion impossible.

Nothing looks broken at the field level, but the final state fails the real world.

That is how you end up with systems that pass validation and still betray the user.

## Why last write wins keeps disappointing people

Last write wins remains popular because it is cheap to implement and easy to explain.

Pick the latest timestamp.  
Keep that version.  
Move on.

The problem is that timestamps are not truth. They are just timing.

A later write is not automatically a better one. It may only mean that:

one device synced later  
one client had a bad clock  
one stale action was replayed late  
one request was delayed in transit  
one user changed something unrelated and still got overwritten  

That is the part many systems get wrong.

A user updates their address on one device.  
Later, on another device, they change their display name.

If your sync model is too coarse and treats the whole object as one blob, the second update can wipe out the first even though the changes had nothing to do with each other.

The system may report success.

The user sees missing data.

That is not conflict resolution.  
That is silent loss with better branding.

## Better ways to merge

There is no universal merge strategy that works for every kind of data.

The structure of the data matters.  
The meaning of the data matters.  
The cost of being wrong matters.

### Merge at the field level when fields are truly independent

If one field changed and another did not, do not drag the entire object into the blast radius.

This works well for profile data, settings, metadata, and other records where fields can safely evolve separately.

### Sync operations, not just snapshots

In many systems, the better model is not "here is the object now."

It is "here is what the user did."

Rename note.  
Add tag.  
Move card.  
Increase quantity.  
Delete item.  

Operations preserve intent in a way snapshots often do not.

That matters because users do not think in payloads. They think in actions.

If your sync system can preserve the action, it has a better chance of preserving the user's meaning.

### Use revisions so stale writes are visible

Every record should carry a version marker, revision number, or equivalent concurrency token.

That way, when a client tries to update revision 12 while the server is already on revision 14, the system knows it is handling stale data instead of blindly accepting whatever arrived last.

That small piece of structure prevents a surprising amount of corruption.

### Use CRDTs or OT where concurrency is part of the product

For shared editing surfaces, you will eventually need CRDTs or operational transform.

These are not decorative patterns for architecture discussions. They are practical tools for helping multiple writers converge without shredding each other's work.

### Treat deletes as first class decisions

A delete is not just the absence of data.

It is an action with consequences.

If another device still holds stale references, you need tombstones or equivalent deletion markers so the deleted object does not crawl back into existence during sync.

Few things damage trust faster than ghost data reappearing after a user thought it was gone.

Not every surface deserves CRDT level complexity, but every surface deserves an explicit conflict policy.

## A simple conflict policy matrix

If your system cannot explain its conflict rules in a few lines, it does not have them.

A minimal conflict policy might look like this:

**Profile fields**  
Auto merge by field. Independent fields should not overwrite each other.

**Note titles and text fields**  
Preserve both versions and require review. Do not pretend the system knows which one is right.

**Deletes**  
Use tombstones plus a user visible recovery window. A delete should not be silently reversible or silently final.

**List ordering**  
Use sequence aware merge logic. Position is meaning, not decoration.

**Money, permissions, and access control**  
Hard conflict. No automatic resolution. Require explicit confirmation.

This is not about perfection.

It is about making sure each kind of data has a merge rule that matches its actual risk.

## The UI has to tell the truth too

If sync is in progress, say so.

If there is a conflict, say so.

If the system merged something automatically, show that.

If one version was discarded, make that visible.

If something can still be recovered, surface it.

What breaks trust is usually not the conflict itself.

What breaks trust is silence.

### Good behavior

Show syncing state.  
Show conflict detected.  
Show what was merged automatically.  
Show what requires review.  
Show what can still be recovered.  

### Bad behavior

Hide failures.  
Pretend everything saved cleanly.  
Overwrite data without explanation.  
Use loading indicators to cover uncertainty.  
Call a destructive overwrite success just because the request returned 200.  

The user should never feel like the app rewrote their reality behind a curtain.

## What truth actually means in offline first systems

In a disconnected system, truth is not a single static object.

It is the result of multiple timelines being reconciled.

A trustworthy system keeps three things visible and coherent:

the last confirmed server state  
the user's local pending changes  
the result of any conflicts between them  

If something changed during reconciliation, the system should be able to explain it plainly:

this was saved locally  
this conflicted with another version  
this is what was kept  
this is what can be recovered  

The goal is not to eliminate conflict.

The goal is to make sure nothing disappears without a trace.

## A real conflict policy needs categories

A good offline first system should not improvise its way through every disagreement.

It should already know which kinds of data can be merged automatically, which should surface a review state, and which are too risky to resolve without explicit user input.

### Safe to auto merge

Use this when changes are independent, additive, or low risk.

A name change and an avatar update can usually coexist without drama.

### Soft conflict

Use this when the system can preserve both sides, but the result still deserves user review.

Two conflicting note titles are a good example. The app can keep both versions, but it should not pretend it found the one true answer.

### Hard conflict

Use this when guessing would be dangerous, destructive, or difficult to reverse.

Deletes.  
Permissions.  
Financial values.  
Access control.  
Legal or compliance sensitive records.  

When the wrong answer causes real harm, the system should stop being clever and ask for confirmation.

## Build conflict handling into the model from the start

Conflict handling is not something you bolt on at the end after the sync layer already exists.

It begins in the schema and the write model.

A sync capable system usually needs:

stable IDs  
revision tracking  
timestamps  
operation logs  
mutation queues  
conflict metadata  
replay safe endpoints  
undo or recovery paths  
writes must be idempotent and safe to replay without side effects  

If the backend cannot survive delayed, repeated, or reordered writes, offline first behavior will eventually expose that weakness.

The architecture has to be designed for friction, not just ideal connectivity.

## The rule that matters most

Do not optimize for no conflicts.

Optimize for no silent loss.

Conflict means the system noticed that reality split.

That is a good thing.

What destroys trust is when the system hides that split, picks a winner, and acts like nothing happened.

A good offline first system should always be able to say:

this was saved  
this was merged  
this was overwritten  
this was rejected  
this is what you can recover  

If it cannot say that, it is not really resolving conflict.

It is erasing evidence that conflict happened at all.

That may look smooth in the interface.

To the user, it feels like disappearance.

Once a system makes work disappear, trust does not come back.
