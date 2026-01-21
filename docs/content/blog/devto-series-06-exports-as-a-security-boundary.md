---
title: "Exports are a security boundary: the moment local-first becomes shareable"
description: "In a local-first PWA, exports are where privacy can intentionally break. This post shows how Pain Tracker treats export as an explicit boundary: user-triggered, local download, minimal tracking, and calm UX." 
tags:
  - privacy
  - security
  - pwa
  - export
  - webdev
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---

_Series:_ [Start here](./devto-series-00-start-here.md) · [Part 1](./devto-series-01-offline-first-local-first-architecture.md) · [Part 2](./devto-series-02-three-storage-layers-state-cache-offline-db-encrypted-vault.md) · [Part 3](./devto-series-03-service-workers-that-dont-surprise-you.md) · [Part 4](./devto-series-04-zod-defensive-parsing.md) · [Part 5](./devto-series-05-trauma-informed-ux-accessibility-as-architecture.md) · **Part 6** · [Part 7](./devto-series-07-worksafebc-oriented-workflows-careful-language.md) · [Part 8](./devto-series-08-analytics-without-surveillance-explicit-consent.md) · [Part 9](./devto-series-09-quality-gates-that-earn-trust.md) · [Part 10](./devto-series-10-maintaining-truthful-docs-over-time.md)

This post is Part 6 in a Dev.to series grounded in the open-source **Pain Tracker** repo.

- Not medical advice.
- Not a compliance claim.
- This post is about *trust boundaries*, not “features.”

If you haven’t read Part 5 yet:
- Part 5: [Trauma-informed UX + accessibility as architecture](./devto-series-05-trauma-informed-ux-accessibility-as-architecture.md)

---

## Exports are where the trust model changes

In a local-first app, the default promise is usually:

> your data stays on your device

Exports are the moment that promise becomes conditional.

Because as soon as you create a file:

- it can be emailed
- it can be uploaded to cloud backups
- it can be forwarded
- it can be printed
- it can sit in Downloads forever

That’s not a reason to avoid exports.

It’s a reason to treat export like a deliberate boundary in both code and UX.

---

## Pain Tracker’s export stance: explicit, local, and user-triggered

The core export utilities live here:

- `src/utils/pain-tracker/export.ts`

The UI that invokes them (with filters) is here:

- `src/components/export/DataExportModal.tsx`

The pattern is intentionally boring:

1) user chooses a format (CSV/JSON/PDF)
2) user optionally filters the date range / symptoms / locations
3) app generates a string (or PDF data URI)
4) app downloads it via a normal browser download

No background exporting, no scheduled exports, no “send to provider” button that quietly turns into a network feature.

---

## The real boundary is “create a file”

Pain Tracker downloads data using a small helper:

- `downloadData(data, filename, mimeType)` in `src/utils/pain-tracker/export.ts`

It creates a `Blob`, then triggers a download by clicking an `<a>` element programmatically.

That’s important because it’s a clear, user-observable browser action:

- you can see the file land
- you can delete it
- you can decide where it goes

It’s a simple boundary you can explain to a tired user.

---

## Exports are not “safe” by default (and shouldn’t pretend to be)

The CSV and JSON exports can include notes, and notes are the highest-risk field in most journaling apps.

You can see that directly in the implementation:

- CSV includes a `Notes` column and escapes quotes
- JSON is literally `JSON.stringify(entries, null, 2)`

This is good honesty:

- the export is a faithful copy
- the app isn’t claiming it can “anonymize” your narrative

If you need de-identification, that’s a different feature with a different risk profile.

---

## Treat “tracking exports” as a separate, minimal channel

Even with no backend, teams often want to answer questions like:

- do people use exports?
- which formats matter?

Pain Tracker uses two kinds of tracking around exports:

1) **Local-only usage tracking**

- `trackExport(type, recordCount)` in `src/utils/usage-tracking.ts`
- it stores the last ~100 export events in localStorage
- it stores counts, not content

It also sanitizes metadata so Class A fields aren’t stored in plaintext localStorage.

2) **Optional GA4 events**

- export utilities call `trackDataExported(format, entryCount)`
- those events are gated behind env + explicit consent (covered in Part 8)

The key point is what’s *not* tracked:

- not the file contents
- not notes
- not the “what did you export” payload

---

## UX: don’t make export feel like a trap

In Pain Tracker, export is presented as:

- an explicit action in an export modal
- a user-visible download

Good export UX in sensitive apps is mostly about preventing regret:

- clear format labels (CSV vs JSON vs PDF)
- clear file naming
- an obvious success state
- no surprise side effects

If you add “share” features later, treat them as new boundaries: they turn a local file into network exposure.

---

## Next up

Part 7 covers WorkSafeBC-oriented workflows — and how to keep language careful and grounded in what the repo actually does.

Prev: [Part 5 — Trauma-informed UX + accessibility as architecture](./devto-series-05-trauma-informed-ux-accessibility-as-architecture.md)
Next: [Part 7 — WorkSafeBC-oriented workflows (careful language)](./devto-series-07-worksafebc-oriented-workflows-careful-language.md)
