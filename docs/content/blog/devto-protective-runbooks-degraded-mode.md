---
title: "Protective Runbooks for Degraded-Mode Product Decisions"
description: "A practical runbook format for deciding what a sensitive app should do when network, storage, auth, or optional services fail."
tags:
  - architecture
  - sre
  - product
  - ux
published: false
---
<!-- pain-tracker:target-link:start -->
> Use a paper-first fallback: [daily pain tracker printable](https://paintracker.ca/resources/daily-pain-tracker-printable)
<!-- pain-tracker:target-link:end -->
Incident runbooks are usually written for operators.

Sensitive software also needs product runbooks.

Not for deploy outages only.

For the moments when a user is still inside the app and something important has degraded.

The network disappears.

Local storage is uncertain.

An auth provider times out.

An export fails.

The service worker serves an old shell.

An optional AI helper is unavailable.

If the product has no runbook for those states, the interface starts improvising.

Improvised failure behavior is where protective claims go to die.

This is the operating layer after [Protective Computing: Software Should Fail Safely Under Stress](https://dev.to/crisiscoresystems/protective-computing-software-should-fail-safely-under-stress-4egb) and [Offline-First Is Not a Feature. It Is a Failure Policy.](https://dev.to/crisiscoresystems/offline-first-is-not-a-feature-it-is-a-failure-policy-2mjj).

## A product runbook is a decision table

The format can be simple.

```md
## Failure: network unavailable during core entry

User state:
- may be in pain
- may have limited time
- may not be able to troubleshoot

Core task:
- create a local record

Allowed behavior:
- save locally
- show offline state
- defer sync

Forbidden behavior:
- block save behind reconnect
- discard draft
- show account error as data-loss error

Recovery:
- keep record local
- retry optional sync later
- offer export

User message:
- "Saved on this device. Sync is unavailable right now."
```

That is not long.

It is enough to stop the team from solving every failure from scratch.

## Separate core from optional

The first job of the runbook is to decide what is core.

Core tasks might include:

- write a local record
- read existing local records
- export user data
- restore a backup
- inspect privacy settings
- leave the screen without losing work

Optional systems might include:

- analytics
- sync
- AI helpers
- cloud backup
- push notifications
- recommendation engines
- external search
- remote configuration

The runbook should say what happens when each optional system fails.

The answer should rarely be "the core task fails too."

## Use failure modes, not component names

Users do not care that `SyncService` rejected a promise.

They care whether their work is safe.

Runbooks should be organized by user-visible failure modes:

- cannot save locally
- saved locally but not synced
- cannot open local records
- export failed before file creation
- export file created but share failed
- restore blocked before mutation
- restore partial
- app shell loaded but data layer failed
- optional assistant unavailable

Each mode needs a message, a recovery path, and a test.

## Write the forbidden behavior

This is the part teams skip.

Allowed behavior is not enough. Under pressure, developers need to know what must not happen.

Examples:

- Do not say data is lost unless loss is verified.
- Do not require login to export local data.
- Do not upload diagnostics automatically after a failure.
- Do not retry destructive actions without an idempotency key.
- Do not hide local records because sync failed.
- Do not replace local records during import without a restore plan.
- Do not show medical or legal certainty that the app cannot provide.

Forbidden behavior turns values into engineering constraints.

## Tie each runbook to a test

A runbook without a test becomes documentation theater.

Each degraded-mode row should point to at least one verification path:

```md
Verification:
- unit: export failure does not clear local draft
- integration: IndexedDB open failure shows blocked local storage message
- browser: offline mode can create and export a record
- manual: reload during restore shows receipt state
```

The [Fetch Standard](https://fetch.spec.whatwg.org/) and [Service Workers specification](https://www.w3.org/TR/service-workers/) define the browser mechanics behind many web failure paths. Your runbook does not need to restate those specs. It needs to decide what the product does when those mechanics produce a real degraded state.

## Keep messages calm and specific

Failure copy should reduce panic.

Bad:

> Something went wrong. Try again.

Better:

> Saved on this device. Online backup is unavailable right now.

Bad:

> Export failed.

Better:

> No export file was created. Your local records were not changed.

Bad:

> Restore failed.

Better:

> Restore stopped before changing local records. The backup file is still available.

These messages are not softer.

They are more precise.

## The runbook template

Use one page per failure class:

```md
# Degraded-mode runbook: export failure

Core task:

User vulnerability state:

Likely triggers:

What remains safe:

Allowed behavior:

Forbidden behavior:

Recovery path:

User-facing message:

Telemetry/logging limits:

Tests:

Open questions:
```

If the team cannot fill in "what remains safe," the system probably does not know.

That is the next engineering task.

Protective software is not software that never fails.

It is software whose failure behavior is designed before the user has to depend on it.
