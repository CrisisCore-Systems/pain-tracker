---
title: "Restore Receipts: The Missing Half of Export in Local-First Apps"
description: "A practical pattern for proving what an import restored, skipped, upgraded, and left untouched."
tags:
  - database
  - privacy
  - testing
  - webdev
published: false
---
<!-- pain-tracker:target-link:start -->
> Review the local data boundary: [privacy architecture](https://paintracker.ca/privacy-architecture)
<!-- pain-tracker:target-link:end -->
Export gets the attention.

Restore is where the trust claim is proven.

A local-first app can have a polished export button, a neat JSON file, and a reassuring privacy page. None of that proves the user can recover after a device loss, migration bug, browser storage eviction, or panic-driven reset.

The real question is narrower:

When the user imports their backup, can the app truthfully explain what happened?

Not "success."

Not "done."

What happened.

That is the job of a restore receipt.

Read this as the missing return path after [Exports are a security boundary](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9) and the operational sibling of [Testing IndexedDB Schema Migrations in Offline-First PWAs](https://dev.to/crisiscoresystems/testing-indexeddb-schema-migrations-in-offline-first-pwas-26m8).

## A restore receipt is not a toast

A toast says the operation finished.

A restore receipt records the outcome.

It should be structured, local, exportable, and specific enough that the user does not have to remember what the app did under stress.

Example:

```json
{
  "receiptVersion": 1,
  "startedAt": "2026-06-30T15:15:00.000Z",
  "finishedAt": "2026-06-30T15:15:02.418Z",
  "source": {
    "format": "paintracker-export",
    "formatVersion": 3,
    "encrypted": true
  },
  "result": "partial",
  "counts": {
    "recordsSeen": 128,
    "recordsRestored": 124,
    "recordsSkipped": 3,
    "recordsFailed": 1
  },
  "schema": {
    "fromVersion": 2,
    "toVersion": 3,
    "migrationApplied": true
  },
  "encryption": {
    "metadataPreserved": true,
    "contentDecryptedLocally": true
  },
  "skips": [
    {
      "recordId": "entry_2026_04_12",
      "reason": "duplicate-newer-local-copy"
    }
  ],
  "failures": [
    {
      "recordId": "entry_2025_12_01",
      "reason": "invalid-date"
    }
  ],
  "localDataBeforeImport": "preserved"
}
```

That receipt does not need to expose sensitive content. It needs to preserve meaning.

The user should know whether the import was complete, partial, skipped, upgraded, or blocked. They should know whether existing local data was preserved. They should know whether encryption metadata survived the round trip.

## Treat import as a migration, not a paste

Browser storage is not a single flat box. IndexedDB, Cache API, local storage, and service worker registrations live in the browser's storage model, which is described by the [WHATWG Storage Standard](https://storage.spec.whatwg.org/). IndexedDB itself has explicit database versions and upgrade behavior in the [IndexedDB specification](https://www.w3.org/TR/IndexedDB-3/).

That matters because import is not just parsing.

Import can touch:

- schema versions
- record identifiers
- timestamps
- encrypted payload envelopes
- derived indexes
- attachment references
- duplicate records
- local records created after the backup
- partially written previous restore attempts

If the import path treats all of that as "read JSON, write rows," it will eventually corrupt meaning.

The safer model is:

1. Parse the backup into a temporary import model.
2. Validate version and required metadata.
3. Build a restore plan.
4. Show the plan when the operation is risky.
5. Apply changes in scoped batches.
6. Record a restore receipt.
7. Leave the original backup untouched.

The receipt is the user's memory of that plan and outcome.

## Make partial restore explicit

Partial restore is not always a failure.

It may be the safest possible result.

If one record is invalid, restoring the other 124 records may protect the user better than blocking everything. But the interface must not flatten that into success. A partial restore should say:

- what restored
- what did not restore
- why it did not restore
- whether the skipped data is still present in the source file
- whether local data was changed
- what the user can do next

This is especially important for people who are restoring under pressure. A vague success message can cause false confidence. A vague failure message can cause panic.

Both are avoidable.

## Test the receipt, not only the parser

The restore receipt should be part of the test contract.

A useful test does not only assert that records exist after import. It asserts that the app can truthfully account for the operation.

```ts
it("records a partial restore receipt without deleting existing records", async () => {
  await seedLocalRecords([{ id: "local-1", note: "kept" }]);

  const receipt = await restoreBackup({
    formatVersion: 2,
    records: [
      { id: "backup-1", value: "valid" },
      { id: "backup-bad", value: null }
    ]
  });

  expect(receipt.result).toBe("partial");
  expect(receipt.counts.recordsRestored).toBe(1);
  expect(receipt.counts.recordsFailed).toBe(1);
  expect(receipt.localDataBeforeImport).toBe("preserved");
  expect(await recordExists("local-1")).toBe(true);
});
```

That test protects the product claim.

It also protects the user from an interface that says "done" while quietly dropping context.

## The minimum viable receipt

If you are adding this to an existing local-first app, start small:

- receipt version
- backup format version
- started and finished timestamps
- complete, partial, failed, or cancelled result
- restored, skipped, failed counts
- schema migration status
- encryption metadata status
- whether existing local records were preserved
- next safe action

Do not put raw user content in the receipt.

The receipt is not a second backup. It is an accountability record.

Export says, "You can leave."

Restore receipt says, "Here is what happened when you came back."

Both are safety features.
