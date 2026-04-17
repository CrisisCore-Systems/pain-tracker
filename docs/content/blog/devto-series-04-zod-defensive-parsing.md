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

**Series:**
[Start here](https://dev.to/crisiscoresystems/start-here-paintracker-crisiscore-build-log-privacy-first-offline-first-no-surveillance-3h0k)
· [Part 1](https://dev.to/crisiscoresystems/offline-first-without-a-backend-a-local-first-pwa-architecture-you-can-trust-3j15)
· [Part 2](https://dev.to/crisiscoresystems/three-storage-layers-in-an-offline-first-health-pwa-state-cache-vs-indexeddb-vs-encrypted-vault-19b7)
· [Part 3](https://dev.to/crisiscoresystems/service-workers-that-dont-surprise-you-deterministic-caching-for-offline-first-pwas-5480)
· **Part 4**
· [Part 5](https://dev.to/crisiscoresystems/trauma-informed-ux-accessibility-as-architecture-not-polish-22jg)
· [Part 6](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9)
· [Part 7](https://dev.to/crisiscoresystems/worksafebc-oriented-workflows-without-overclaims-structured-summaries-careful-language-2n3i)
· [Part 8](https://dev.to/crisiscoresystems/analytics-without-surveillance-explicit-consent-layered-gates-and-never-sending-class-a-data-59f1)
· [Part 9](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
· [Part 10](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)

This post is Part 4 in a Dev.to series grounded in the open-source **Pain Tracker** repo.

- Not medical advice.
- Not a compliance claim.
- The goal is simple: make the app resilient to bad inputs without quietly accepting nonsense.

If you haven’t read Part 3 yet:

- Part 3: [Service workers that don’t surprise you](https://dev.to/crisiscoresystems/service-workers-that-dont-surprise-you-deterministic-caching-for-offline-first-pwas-5480)

---

## Offline-first changes what “input validation” means

Most apps validate one thing:

- the HTML form you just submitted

A local-first app has *more* input surfaces:

- persisted state blobs (rehydration)
- IndexedDB rows from older versions
- import/restore flows
- test fixtures that accidentally drift

That rehydration path crosses the same three storage layers discussed in Part
2, which is why the schemas have to hold across in-memory state, durable
IndexedDB, and vault-gated encrypted snapshots:

- [Part 2 — Three storage layers (state cache vs offline DB vs encrypted vault)](https://dev.to/crisiscoresystems/three-storage-layers-in-an-offline-first-health-pwa-state-cache-vs-indexeddb-vs-encrypted-vault-19b7)

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

1. **Backwards-compatible IDs**

`id` is a union of `string | number` so older stored data doesn’t explode.

1. **Timestamp validation that fails closed**

`timestamp` must be a parseable date string. If it isn’t, it’s invalid. No “best effort” guessing.

1. **Defaults for optional sections**

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

Prev: [Part 3 — Service workers that don’t surprise you](https://dev.to/crisiscoresystems/service-workers-that-dont-surprise-you-deterministic-caching-for-offline-first-pwas-5480)
Next: [Part 5 — Trauma-informed UX + accessibility as architecture](https://dev.to/crisiscoresystems/trauma-informed-ux-accessibility-as-architecture-not-polish-22jg)
