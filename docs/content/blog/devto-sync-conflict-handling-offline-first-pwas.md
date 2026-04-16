---
title: Sync Conflict Handling in Offline-First PWAs: How to Merge Without Lying to the User
published: false
tags: webdev,pwa,offlinefirst,distributed
series: Honest Offline First Systems
canonical_url: https://github.com/CrisisCore-Systems/pain-tracker
description: Offline first sync is not just a data problem. It is a trust problem. Here is how to handle conflicts without silently erasing user intent.
---

Offline-first apps make a promise that sounds simple until you actually have to keep it:

keep working even when the network dies.

That is the beautiful part.

The brutal part is what happens when the network comes back and the world has changed underneath you.

Because once you let people create, edit, delete, and move things while offline, you are no longer dealing with one clean version of reality. You are dealing with fragments. Multiple devices. Delayed writes. Cached intent. Competing truths.

And that is where sync conflict handling stops being a technical detail and starts becoming a trust issue.

The real question is not, "How do I merge data?"

It is, "How do I merge data without lying to the person who made it?"

## The myth of one true version

A lot of sync systems quietly act like the server is the sacred source of truth and the client is just a temporary mirror.

That story falls apart the second someone goes offline.

Now the phone is making decisions. The laptop is making decisions. The tablet is making decisions. The user is still living their life, still creating value, still expecting the app to remember what they meant.

So the system has to stop pretending there is always one correct answer sitting somewhere in the cloud.

Sometimes there are two valid versions.

Sometimes there are three.

Sometimes the app has to admit it does not know which one is "right" without context.

That honesty matters more than looking smooth.

## The kinds of conflicts you actually need to deal with

Not every conflict deserves the same treatment. That is where a lot of sync logic gets lazy and starts smashing everything through the same pipe.

That is how you lose trust.

### Field-level conflicts

This is the easy one.

One device changes the task title. Another changes the due date. One edits the bio. Another updates the avatar. These are separate wounds. They can usually heal separately.

If your data model is good, these can be merged cleanly without drama.

### Same-field conflicts

This is where things start to get real.

Two devices edit the same value in two different ways. One user renames a note on their phone from "Vendor follow-up" to "Urgent invoice." Another renames it on the laptop to "Tax stuff." Now the system has to choose, blend, or ask.

This is where "last write wins" starts pretending it has wisdom.

It usually does not.

### Structural conflicts

These are nastier.

One device deletes a task while another keeps editing it. One device moves a card into a board that another device already archived. One user removes a section while another adds items into that section.

Now you are not just merging values. You are reconciling reality.

### Ordering conflicts

These matter when sequence has meaning.

Lists. Boards. Timelines. Playlists. Drag-and-drop layouts.

If two devices reorder the same list differently while offline, a timestamp alone will not save you. The problem is not just when something happened. It is where it belongs.

### Semantic conflicts

This is the quiet killer.

Two changes are both technically valid, but together they make no sense.

One device switches shipping to express. Another changes the address to a region that express shipping cannot reach. One edits a work order to "complete" while another adds a missing part that makes completion impossible.

Nothing looks broken at the field level, but the final state is nonsense.

That is the kind of bug that passes validation and still fails reality.

## Why last-write-wins keeps disappointing people

Last-write-wins is popular because it is cheap.

It gives you a rule, a timestamp, and the comforting illusion that the machine has resolved the problem.

But timestamps are not truth. They are just timing.

A later write does not automatically mean a better one. It might just mean:

one device synced later,
one clock was wrong,
one client replayed an old action,
one update was delayed in transit,
one user changed a different field and got punished for it.

A user updates their address on one device and then changes their display name on another. If your sync logic is coarse enough, the second update can overwrite the first even though the edits had nothing to do with each other.

The app may call that "resolved."

The user will call it missing data.

## Better ways to merge

There is no magic merge rule that works for every kind of data. The data type decides the strategy. The meaning decides the rules.

### Merge at the field level when the fields are independent

This is the cleanest approach for profile data, preferences, metadata, and other objects where each piece can survive on its own.

If one field changed and the other did not, do not drag the whole object into the blast radius.

### Sync operations, not just final states

This is often the better mental model.

Instead of saying, "here is the whole object now," say, "here is what the user did."

Rename note.
Add tag.
Move card.
Increase quantity.
Delete item.

Operations carry intent. Snapshots often lose it.

That matters because intent is what users care about. They do not remember the exact payload shape. They remember the action they took.

### Use revisions so stale writes can be detected

Every record needs a version marker of some kind.

That way, when a client tries to update revision 12 and the server is already on revision 14, the system knows there is a conflict instead of blindly accepting whatever arrived last.

That tiny bit of structure prevents a lot of silent corruption.

### Use CRDTs or OT where the surface is collaborative

For shared text, live editing, shared cursors, or highly concurrent content, basic timestamp logic is not enough.

Sometimes you need conflict-free replicated data types. Sometimes you need operational transform.

These are not fancy extras. They are the tools that let multiple writers converge without shredding each other's work.

### Treat deletes carefully

A delete is not just absence.

It is a decision.

If another device still has stale references, you need tombstones or equivalent logic so the deleted object does not crawl back from the dead during sync.

That ghost data is exactly how apps start feeling unreliable.

## The UI has to tell the truth too

The user should never feel like the app secretly rewrote their reality behind a curtain.

If sync is happening, say so.

If there is a conflict, say so.

If the app kept one version and discarded another, say so.

If the user needs to choose, show them the choice.

If the system merged safely, show what happened.

What breaks trust is not conflict itself.

What breaks trust is silence.

### Good behavior

Show "syncing."
Show "conflict detected."
Show which version was kept.
Show what was merged automatically.
Show what can still be recovered.

### Bad behavior

Hide failures.
Pretend everything saved cleanly.
Replace data without explanation.
Use a spinner to cover up uncertainty.
Call a destructive overwrite "success."

That is not good UX. That is institutional gaslighting with a pretty interface.

## What truth actually means in offline-first systems

In a disconnected system, truth is not one static object.

Truth is the current state of a negotiation.

A truthful app keeps track of three things at once:

the latest confirmed server state,
the user's local pending intent,
the history that explains how the conflict was resolved.

That third part is huge.

Because people do not just want the outcome. They want to know why the outcome exists.

If a user edits something offline and the server later rejects or reshapes it, the app should not just snap the UI back like nothing happened. That feels fake.

It should explain the sequence.

This was saved locally.
Another device had a different version.
These values conflicted.
This is what was kept.
This is what can be restored.

That is honesty. That is how you keep trust alive.

## A real conflict policy needs categories

A good offline-first app should not improvise every conflict.

It should already know how different data behaves.

### Safe to auto-merge

Use this when fields are independent, changes are additive, and nothing important gets lost by combining them.

A name change and an avatar change can usually coexist.

### Soft conflict

Use this when the system can merge, but the result should still be visible to the user for review.

Example: two people edit the same note title. The system can preserve both versions, but it should not pretend it picked the "right" one without telling anyone.

### Hard conflict

Use this when guessing would be dangerous, destructive, or irreversible.

That includes deletions, permission changes, financial data, and anything where the wrong answer causes real damage.

If a user's invoice amount, access level, or saved payment details are involved, the app should not get creative.

## Build the model for conflict from the start

Conflict handling is not something you bolt on at the end.

It starts in the schema.

A sync-friendly system usually needs:

stable IDs,
revision tracking,
timestamps,
operation logs,
mutation queues,
conflict metadata,
undo paths,
and endpoints that can survive replay.

If the backend cannot handle delayed, repeated, or reordered writes, offline-first behavior will eventually bend it into something untrustworthy.

The architecture has to be built for friction.

## The rule that matters most

Do not optimize for "no conflicts."

Optimize for "no silent loss."

Conflict is not failure.

Conflict is evidence that the system respected reality enough to notice it was split.

That is the job.

Not to erase disagreement.

Not to fake certainty.

Not to make the interface look smooth while the user's work disappears in the background.

The job is to preserve intent, expose uncertainty, and keep the user oriented when the world forks.

A good offline-first app should be able to say:

This was saved.
This was merged.
This was overwritten.
This was rejected.
This is what happened.
This is what you can still recover.

That is what truth looks like when devices disagree.
