---
title: "Zod + defensive parsing in a local-first app: make your offline data trustworthy"
description: "Offline-first means your inputs aren’t just user forms—they’re also migrations, backups, and stale persisted blobs. This post shows how Pain Tracker uses Zod to keep local data honest."
tags:
  - typescript
  - zod
  - pwa
  - privacy
  - testing
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---

**Series:** [Start here](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-00-start-here.md) · [Part 1](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-01-offline-first-local-first-architecture.md) · [Part 2](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-02-three-storage-layers-state-cache-offline-db-encrypted-vault.md) · [Part 3](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-03-service-workers-that-dont-surprise-you.md) · **Part 4** · [Part 5](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-05-trauma-informed-ux-accessibility-as-architecture.md) · [Part 6](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-06-exports-as-a-security-boundary.md) · [Part 7](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-07-worksafebc-oriented-workflows-careful-language.md) · [Part 8](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-08-analytics-without-surveillance-explicit-consent.md) · [Part 9](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-09-quality-gates-that-earn-trust.md) · [Part 10](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-10-maintaining-truthful-docs-over-time.md)

This post is Part 4 in a Dev.to series grounded in the open-source **Pain Tracker** repo.

- Not medical advice.
- Not a compliance claim.
- The goal is simple: make the app resilient to bad inputs without quietly accepting nonsense.

If you haven’t read Part 3 yet:
- Part 3: [Service workers that don’t surprise you](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-03-service-workers-that-dont-surprise-you.md)

---

## Offline-first changes what “input validation” means

Most apps validate one thing:

- the HTML form you just submitted

A local-first app has *more* input surfaces:

- persisted state blobs (rehydration)
- IndexedDB rows from older versions
- import/restore flows
- test fixtures that accidentally drift

If you treat those as “trusted because they’re local”, you eventually ship a version that:

- crashes on someone’s long-lived data
- or worse: loads, but silently misinterprets fields

That’s why Pain Tracker draws a clear line:

- TypeScript types are compile-time truth
- Zod schemas are runtime truth

The project makes that explicit in `src/types.ts`:

- It re-exports the canonical `PainEntry` interface from `src/types/index.ts`
- It re-exports Zod schemas from `src/types/pain-entry.ts`

(And it calls out that schemas are for runtime validation only.)

---

## The schema is the boundary: `PainEntrySchema`

The schema itself lives here:

- `src/types/pain-entry.ts`

A few choices worth copying:

1) **Backwards-compatible IDs**

`id` is a union of `string | number` so older stored data doesn’t explode.

2) **Timestamp validation that fails closed**

`timestamp` must be a parseable date string. If it isn’t, it’s invalid. No “best effort” guessing.

3) **Defaults for optional sections**

Many nested objects use `.default(...)` so missing sections don’t force every caller to re-build the full shape.

Defaults are not a substitute for validation — they’re a way to make valid-but-incomplete inputs land in a stable, predictable shape.

---

## “Create” validation is stricter than “shape” validation

Pain Tracker separates:

- “is this a valid `PainEntry` shape?”
- “is this a valid *new entry*?”

The create schema is built like this:

- `CreatePainEntrySchema = PainEntrySchema.omit({ id: true, timestamp: true })`
- plus a `superRefine` that enforces at least one selected location

That rule is tested directly in:

- `src/types/pain-entry.test.ts`

This is a good pattern:

- keep the “shape” schema stable for migrations / imports
- use stricter schemas for user-facing creation paths

---

## `safeParse` for UI, `parse` for invariants

In UI code, you almost always want `safeParse`:

- you get `success: false`
- you can show a gentle error message
- you don’t crash the whole form

The Pain Entry form does exactly this:

- it calls `CreatePainEntrySchema.safeParse(formData)`
- it displays the first issue message when invalid

See:

- `src/components/pain-tracker/PainEntryForm.tsx`

On the other hand, `parse()` is still useful:

- when you’re validating a boundary and want to fail fast
- when you’re in a test or a controlled pipeline

Pain Tracker exposes both styles in `src/types/pain-entry.ts`:

- `validatePainEntry(data)` → `parse()`
- `safeParsePainEntry(data)` → `safeParse()`

---

## Keep schemas “boring” (future you will thank you)

A few rules that keep schema-first apps from becoming unmaintainable:

- prefer explicit fields over “catch-all” objects
- use `superRefine` for cross-field logic (like “must include at least one location”)
- add tests when you add a rule
- treat runtime validation as part of your migration strategy, not just form UX

---

## Next up

Part 5 covers why trauma-informed UX and accessibility aren’t “polish” in health-adjacent apps — they’re architecture.

Prev: [Part 3 — Service workers that don’t surprise you](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-03-service-workers-that-dont-surprise-you.md)
Next: [Part 5 — Trauma-informed UX + accessibility as architecture](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-05-trauma-informed-ux-accessibility-as-architecture.md)
