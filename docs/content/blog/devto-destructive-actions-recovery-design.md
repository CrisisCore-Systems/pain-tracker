---
title: "Destructive Actions Need Recovery Design, Not Just Confirmation Modals"
description: "A high-trust UX pattern for delete, wipe, reset, and export flows when users may be stressed or interrupted."
tags:
  - ux
  - security
  - design
  - a11y
published: false
---
<!-- pain-tracker:target-link:start -->
> Apply the structural checklist: [best pain tracking app criteria](https://paintracker.ca/resources/best-pain-tracking-app)
<!-- pain-tracker:target-link:end -->
Confirmation modals are often treated as the safety layer.

They are not.

They are a thin pause in front of a consequence.

Sometimes that pause is useful. Sometimes it is theater. If the action is destructive and the user is tired, scared, distracted, coerced, or trying to leave quickly, a modal that says "Are you sure?" does not create recovery. It only moves liability onto the user.

High-trust software needs recovery design.

This is the destructive-action layer beneath [Coercion-Resistant UX](https://dev.to/crisiscoresystems/coercion-resistant-ux-designing-interfaces-that-dont-pressure-users-under-stress-18m9) and [The Friction Prerequisite](https://dev.to/crisiscoresystems/the-friction-prerequisite-why-we-intentionally-slowed-down-the-ui-410h): friction is only protective when it preserves a recovery path.

## Name the consequence

The first rule is basic:

Do not label destructive actions with vague verbs.

Bad labels:

- reset
- clear
- remove
- start over
- clean up
- fix

Better labels:

- delete this draft
- remove this attachment
- clear local diagnostic reports
- wipe all local records on this device
- replace local records with this backup

Scope is part of safety.

If the action affects one record, say one record. If it affects the whole device, say whole device. If it does not affect exports already downloaded, say that. If it cannot be undone, say that before the user commits.

## Confirmation is not enough

A protective destructive flow has four layers:

1. scoped label
2. consequence preview
3. local recovery option when possible
4. post-action receipt

The modal is only one part.

Example:

```ts
type DestructiveActionPlan = {
  action: "delete-entry" | "wipe-local-device" | "replace-from-backup";
  scope: "one-record" | "all-local-records" | "backup-import";
  affectedRecordCount: number;
  reversible: boolean;
  recoveryStep?: "undo" | "export-before-wipe" | "restore-from-backup";
  leavesDownloadedExportsUntouched: boolean;
};
```

The UI should render that plan in plain language.

It should not make the user infer it from a red button.

## Build the undo window before the delete button

If an action can be locally reversible, implement that before polishing the confirmation.

For a single-record delete, that may mean a soft-delete state:

```ts
type EntryRecord = {
  id: string;
  deletedAt: string | null;
  purgeAfter: string | null;
};
```

Then the delete flow becomes:

1. Mark the entry deleted.
2. Hide it from normal views.
3. Show a clear undo path.
4. Purge only after the retention window or explicit final deletion.

This is not always appropriate. Some privacy-sensitive flows need immediate purge. But that should be a deliberate security decision, not an accident caused by implementation convenience.

If immediate purge is required, the interface should say so.

## Export before irreversible mutation

For broad destructive actions, export is often the recovery layer.

Before wiping local records, offer a local export. Before replacing data with a backup, consider creating a pre-restore snapshot. Before changing a passphrase or encryption envelope, protect against stranded data.

Do not make export a hidden advanced option.

Put it where the risk is.

The flow can be simple:

- "Download a local backup first"
- "Continue without backup"
- "Cancel"

That is not friction for its own sake. It is a recovery path.

## Design for interruption

Destructive actions should survive interruption without becoming ambiguous.

What if the tab closes mid-import?

What if the device sleeps after the user clicks wipe?

What if the app reloads between "mark deleted" and "purge"?

If the answer is "we hope it finishes," the design is not done.

Use explicit operation records:

```ts
type LocalOperationReceipt = {
  id: string;
  kind: "delete" | "wipe" | "restore";
  state: "planned" | "running" | "completed" | "failed" | "cancelled";
  startedAt: string;
  finishedAt?: string;
  affectedRecordIds?: string[];
};
```

On reload, the app can inspect the receipt and tell the truth:

- completed
- failed before mutation
- partially completed
- needs review

That is much safer than a spinner that disappears.

## Accessibility is part of the safety boundary

Destructive flows must be accessible because inaccessible confirmation is not valid confirmation.

Use ordinary controls. Preserve focus. Make the action label programmatically clear. Do not rely only on color. The [WCAG 2.2 recommendation](https://www.w3.org/TR/WCAG22/) is not just about compliance; in this context it is part of making irreversible state changes understandable under stress.

If the modal traps focus incorrectly, hides the consequence from screen readers, or makes the cancel path hard to reach, it is a safety defect.

## The review questions

For every delete, wipe, reset, revoke, import, restore, and passphrase flow, ask:

- What exactly changes?
- What remains untouched?
- Can the user reverse it locally?
- Is export offered before broad mutation?
- What happens on reload mid-action?
- Does the user get a receipt?
- Is the copy neutral and specific?
- Can a shared-device user exit without revealing more than necessary?

The answer should be visible in the product and in the code.

A confirmation modal can be useful.

It is not the architecture.

Recovery is the architecture.
