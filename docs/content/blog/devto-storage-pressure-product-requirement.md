---
title: "Storage Pressure Is a Product Requirement, Not a Browser Quirk"
description: "Quota, eviction, private browsing, and low-storage states need explicit product behavior in offline-capable apps."
tags:
  - pwa
  - webdev
  - architecture
  - testing
published: false
---
<!-- pain-tracker:target-link:start -->
> Install the private offline-capable app: [download PainTracker](https://paintracker.ca/download)
<!-- pain-tracker:target-link:end -->
Offline-capable apps usually talk about the happy version of offline.

The train tunnel.

The cafe Wi-Fi outage.

The user opens the app, records something, and everything syncs later.

That is useful. It is also incomplete.

The harder offline question is storage pressure.

What happens when the browser cannot keep what the app promised to keep?

This sits after [Three storage layers in an offline-first health PWA](https://dev.to/crisiscoresystems/three-storage-layers-in-an-offline-first-health-pwa-state-cache-vs-indexeddb-vs-encrypted-vault-19b7) and [Service Worker Failure Modes in Offline-First PWAs](https://dev.to/crisiscoresystems/service-worker-failure-modes-in-offline-first-pwas-3dnp): once the architecture exists, the product still needs a low-storage policy.

## Local does not mean permanent

Browser storage has rules. It has quota. It has origin boundaries. It has best-effort and persistent modes. The [WHATWG Storage Standard](https://storage.spec.whatwg.org/) defines the platform model, including storage buckets, persistence, quota estimates, and storage pressure.

That is the part product teams often ignore.

They say "local-first" as if the word local eliminates failure.

It does not.

Local-first means the user's device is the first authority for core work. It does not mean the device has infinite space, that private browsing behaves like normal browsing, or that the browser will preserve every byte forever under pressure.

So storage pressure needs product behavior, not just error handling.

## Define the failure states

A useful app should be able to distinguish at least these states:

```ts
type LocalStorageHealth =
  | { state: "available"; persisted: boolean | null; quota: "ok" | "low" | "unknown" }
  | { state: "limited"; reason: "private-mode" | "permission" | "quota-low" | "unknown" }
  | { state: "blocked"; reason: "indexeddb-open-failed" | "storage-disabled" | "unknown" }
  | { state: "corrupt"; recoverable: boolean };
```

Those states should not collapse into one message:

> Something went wrong.

That message makes the user do the diagnostic work.

Instead, the interface should say what is still safe:

- "You can keep using the current screen, but this browser may not keep new entries after reload."
- "Local storage could not be opened. Existing export files are not affected."
- "Storage is low. Export before adding large attachments."
- "This import was blocked before changing local records."

Clarity is part of the storage layer.

## Ask for persistence with context

The Storage Standard exposes `navigator.storage.persist()` and `navigator.storage.estimate()`. Those APIs do not remove every risk, but they let the app ask for stronger local persistence and estimate available quota.

The protective mistake is calling persistence prompts at random.

The user should not see a browser permission dialog with no explanation while trying to record something important.

A better flow:

1. Check current persistence state.
2. If persistence is already granted, continue silently.
3. If persistence is available but not granted, explain why it matters.
4. Let the user choose when to ask the browser.
5. If denied, keep the core flow usable and recommend export.

That gives the user context without making storage permission a wall in front of the write path.

## Do not make cache and records compete silently

Service workers can make an app load offline. They can also fill storage with assets that are less important than user records.

The [Service Workers specification](https://www.w3.org/TR/service-workers/) includes Cache API behavior because offline applications often need local response stores. That does not mean every cached response deserves equal priority.

For sensitive local-first tools, treat storage as ranked:

1. user-created records
2. metadata required to read those records
3. restore receipts and migration records
4. minimal app shell needed to reopen the tool
5. optional assets
6. previews, thumbnails, and convenience caches

If storage gets tight, optional caches should lose before user records do.

That should be explicit in code:

```ts
async function reduceStoragePressure() {
  await deletePreviewCache();
  await deleteOldDiagnosticPackets();
  await trimNonessentialAssetCaches();
  return await readStorageHealth();
}
```

Do not wait until IndexedDB writes fail and then discover the only eviction policy was "whatever the browser did."

## Test low-storage behavior as a workflow

Testing storage pressure is awkward, so teams skip it.

That is exactly why it matters.

At minimum, test these cases:

- IndexedDB open failure
- quota estimate unavailable
- quota estimate below your warning threshold
- persistence denied
- private browsing or ephemeral storage behavior
- service worker cache cleanup
- reload after a local write
- export when storage is limited
- import blocked before mutation when there is not enough space

The test does not have to simulate every browser perfectly. It has to prove that the app does not lie.

If a write may not survive reload, say that.

If a record is safe locally, say why.

If the app does not know, say that too.

## The product requirement

A storage-pressure requirement should look like this:

> The app must preserve the user's ability to create, inspect, and export core records under normal local storage conditions. When local persistence is limited, blocked, or uncertain, the app must surface the state, avoid destructive mutation, and offer a local export or copy path before asking the user to do anything risky.

That is not a browser quirk.

That is the difference between offline as a demo and offline as a trust boundary.
