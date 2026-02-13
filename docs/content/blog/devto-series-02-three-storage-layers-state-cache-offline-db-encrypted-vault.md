---
title: "Three storage layers in an offline-first health PWA: state cache vs IndexedDB vs encrypted vault"
description: "How Pain Tracker separates fast UI state, durable offline IndexedDB storage, and a vault-gated encrypted-at-rest layer—so “local-first” doesn’t quietly become “local-leak.”"
tags:
  - pwa
  - privacy
  - typescript
  - indexeddb
  - security
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---

**Series:** [Start here](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-00-start-here.md) · [Part 1](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-01-offline-first-local-first-architecture.md) · **Part 2** · [Part 3](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-03-service-workers-that-dont-surprise-you.md) · [Part 4](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-04-zod-defensive-parsing.md) · [Part 5](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-05-trauma-informed-ux-accessibility-as-architecture.md) · [Part 6](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-06-exports-as-a-security-boundary.md) · [Part 7](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-07-worksafebc-oriented-workflows-careful-language.md) · [Part 8](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-08-analytics-without-surveillance-explicit-consent.md) · [Part 9](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-09-quality-gates-that-earn-trust.md) · [Part 10](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-10-maintaining-truthful-docs-over-time.md)

This is Part 2 of a Dev.to series grounded in the open-source **Pain Tracker** repo.

- Not medical advice.
- Not a compliance claim.
- This is about real boundaries: what the code protects, what it doesn’t, and what can still go sideways.

If you haven’t read Part 1, start here:

* Part 1: [Offline-first without a backend: a local-first PWA architecture you can trust](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-01-offline-first-local-first-architecture.md)

---

## Why three layers (the short version)

Trying to make *one* storage system do everything is how you end up with at least one of these:

- a UI that feels like it’s dragging a fridge up stairs
- schema changes that feel like defusing a bomb
- sensitive data living somewhere it shouldn’t, “just temporarily”
- offline behavior that becomes non-deterministic (which is the polite way of saying: you’ll never reproduce the bug again)

And yeah, I’ve done that. More than once.

In Pain Tracker, storage is split into three layers on purpose:

1. **State cache**: fast in-memory app state (Zustand)
2. **Offline DB**: durable IndexedDB for offline-first workflows (queues, caches, settings)
3. **Encrypted vault DB**: vault-gated encrypted-at-rest IndexedDB for sensitive payloads

Here’s the line that matters:

**Local-first ≠ secure.**
Local storage is still readable by anyone with access to the browser profile (or DevTools). Encryption-at-rest is a separate boundary. If you blur those, you’re lying to yourself—and to users.

---

## The mental model (one diagram)

```text
User input
  ↓
Zustand store (in-memory, fast)
  ↓ (persist snapshot, best-effort)
Offline IndexedDB (durable)
  ↓ (sensitive payloads only)
Vault-gated encrypted IndexedDB records
```

If you want the authoritative map of where data lives and how it migrates, this is the source of truth:

* [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md)

(Yes, I just used “source of truth.” I hate the phrase too. But it fits here.)

---

## Layer 1: State cache (Zustand) — “make the UI feel instant”

This is the layer your UI is basically married to. Timeline rendering, “draft edits,” validation, derived state—this stuff needs to be fast and predictable.

Store file:

* [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/stores/pain-tracker-store.ts](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/stores/pain-tracker-store.ts)

Why keep it in-memory?

Because IndexedDB is not a fun “every keystroke” API.
And because async boundaries in your render loop will make you hate your life.

Also: state-level testing is way easier than storage-level testing. If you can keep logic in the store and *let persistence be plumbing*, you’ll move faster.

### Persistence should not become “the API”

This is one of those mistakes you only need to learn once… and then you still have to fight the impulse forever.

If persistence becomes your main interface, suddenly every feature is a storage feature. Everything slows down. Everything gets brittle.

Pain Tracker keeps store actions as the primary write path, and persistence happens underneath via `zustand/persist`.

But there’s an extra constraint here: **persisted snapshots are vault-gated.**

The store uses a custom adapter:

* `createEncryptedOfflinePersistStorage(...)`
* [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/stores/encrypted-idb-persist.ts](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/stores/encrypted-idb-persist.ts)

That adapter:

* stores the snapshot in the offline DB (settings rows)
* encrypts/decrypts that blob via the vault
* **refuses to hydrate while the vault is locked** (returns `null`)

Why be that strict?

Because I’ve seen “helpful restore” logic casually rehydrate sensitive state after a reload… while the app is supposedly “locked.”
That’s not a bug, that’s a betrayal.

The test that proves the intended behavior:

* [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/test/stores/persist-vault-roundtrip.test.ts](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/test/stores/persist-vault-roundtrip.test.ts)

Goal:

> Don’t pull sensitive state back into memory while the vault is locked. Ever.

---

## Layer 2: Offline DB (IndexedDB) — durability, queues, boring reliability

The durable offline store lives here:

* [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/lib/offline-storage.ts](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/lib/offline-storage.ts)

DB name: `pain-tracker-offline`

This is where you put things that should survive refresh/restart and benefit from indexing/querying:

* queue items (priority, retries, “synced” flags)
* cached data / metadata
* non-sensitive settings
* encrypted blobs (as blobs—still not plaintext)

And yes, this exists because `localStorage` isn’t a serious “offline-first PWA storage” strategy. It’s a convenience drawer.

### A boundary people keep skipping: IndexedDB is not “secure”

Let’s say it plain: IndexedDB is durable and queryable, but it’s not confidential. By default, it’s just *stuff on disk in your browser profile.*

So in this repo, the approach is basically:

* non-sensitive? sure, offline DB is fine
* sensitive/reconstructive? cross the vault boundary
* unsure? store less, or store later, or store coarse metadata only

The migration doc calls this out:

* [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md)

### Why bother with the offline DB if you have a vault?

Because not everything should depend on unlock state.

Sometimes you need the app to load and behave coherently even while locked.
Sometimes you want offline queues to exist even if a user doesn’t unlock right away.
Sometimes you want “app remembers it is locked” without keeping sensitive payloads in memory.

So the offline DB remains valuable even if the vault exists.

---

## Layer 3: Encrypted vault DB — encrypted-at-rest, unlock required

This is implemented here:

* [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/lib/storage/encryptedIndexedDB.ts](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/lib/storage/encryptedIndexedDB.ts)

It stores records as an envelope:

* `v` (version marker)
* `n` (nonce)
* `c` (ciphertext)
* plus metadata like timestamps and vault key versioning

Here’s the behavioral rule that keeps the promise honest:

* `encryptAndStore(...)` throws if the vault is locked
* `retrieveAndDecrypt(...)` returns `null` if the vault is locked

That’s intentional. Locked means locked.

Vault service boundary:

* [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/services/VaultService.ts](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/services/VaultService.ts)

I’m not going to turn this into a crypto blog post. That’s where “security theater” happens fast.
For app architecture, what matters is:

**Sensitive writes require unlock.**
No unlock, no pretend saves.

### Legacy record support (upgrade on read)

`encryptedIndexedDB.ts` supports a legacy `{ iv, data }` shape and upgrades to the current envelope on successful read.

I like upgrade-on-read because it fails gently. If a user’s storage is partially broken (it happens), you don’t want a big migration step to wipe things out.

---

## Where should data go? (quick gut-check)

Ask yourself:

Does it need to survive restart?
Does it need querying?
Could it reconstruct someone’s health narrative?
Should it be available while locked?

Then map it:

* **Zustand (in-memory)**: drafts, derived UI state, “what I’m editing right now”
* **Offline IndexedDB**: queues/caches/non-sensitive prefs/encrypted blobs
* **Vault DB**: health entries and reconstructive payloads that must be encrypted at rest

If you’re unsure: store less. Seriously.

---

## Failure modes (because you will hit them)

### Vault locked

Expected:

* app loads
* user sees locked affordances
* persisted sensitive state does **not** silently hydrate

The persist adapter enforces this by returning `null` when locked.

### IndexedDB flaky (private mode, storage pressure, test environments)

The persist code is defensive:

* serialized operations to avoid races
* decrypt failures don’t trigger “helpful cleanup” deletes

Because “delete on decrypt failure” is a foot-gun. And it’s permanent.

### Legacy plaintext keys exist

There’s migration logic from older keys like `pain_tracker_entries`, but legacy keys only get cleared after:

* a successful encrypted write, and
* vault unlocked

That’s the right order.

> Don’t erase the recoverable copy before the encrypted copy exists.

### Clean reset needed

Offline-first apps need a reliable purge path.

* [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/utils/clear-all-user-data.ts](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/utils/clear-all-user-data.ts)

If you store locally, you owe users a clean “burn it down” button.

---

## Verify it yourself (no trust required)

Storage map:

* [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md)

Persistence flow:

* [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/stores/pain-tracker-store.ts](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/stores/pain-tracker-store.ts)
* [https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/stores/encrypted-idb-persist.ts](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/stores/encrypted-idb-persist.ts)

Run the vault-gated hydration roundtrip test:

```powershell
npm run -s test -- --run src/test/stores/persist-vault-roundtrip.test.ts
```

---

## FAQ (because people ask the same things every time)

**Isn’t “local-first PWA” automatically private?**
No. It’s local. Privacy depends on threat model, device access, and whether sensitive payloads are encrypted at rest.

**Why not just encrypt everything in one DB and call it a day?**
Because you end up coupling your entire app to unlock state. That creates weird UX and weird bugs. Separate layers let you keep the app usable without lying.

**Does encrypted-at-rest protect against a compromised OS?**
No. It’s not a magic shield. It’s protection against opportunistic access and casual inspection of the profile/data at rest.

**What about multi-device sync?**
Not by default here. If you add sync later, the offline DB’s queue patterns are already a foothold—but sync becomes a new trust boundary and needs to be explicit.

---

## Next up

Part 3 will cover service workers that don’t surprise you (and how to keep offline behavior deterministic without “magic caching”):

[Part 3 — Service workers that don’t surprise you](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-03-service-workers-that-dont-surprise-you.md)

Prev: [Part 1 — Offline-first without a backend](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/content/blog/devto-series-01-offline-first-local-first-architecture.md)

---

If you want, I can also produce a **more SEO-tilted variant** (same content, slightly different headings + long-tail phrasing) *without* making it read like a keyword farm.
