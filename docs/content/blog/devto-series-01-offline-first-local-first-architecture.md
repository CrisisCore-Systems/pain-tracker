---
title: "Offline-first without a backend: a local-first PWA architecture you can trust"
description: "A practical walkthrough: deterministic offline behavior, local-first storage layering, and honest trust boundaries (using the Pain Tracker repo as a real example)."
tags:
  - pwa
  - typescript
  - react
  - privacy
  - accessibility
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---

This post uses the open-source **Pain Tracker** repo as a concrete example.
It’s not medical advice, and it does not claim regulatory compliance.

If you want to follow along in code, these docs are the fastest entry points:

- Architecture overview: [docs/engineering/ARCHITECTURE.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/ARCHITECTURE.md)
- Local data + migrations: [docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md)

Most “offline-capable” apps really mean:

> The UI loads without internet, but your work is one network glitch away from
> disappearing.

For pain tracking (and other sensitive journaling), that’s not just annoying. It
changes behavior. People stop recording what matters *when it matters*.

## What we’re building (in plain English)

- **Useful offline by default** (even with bad connectivity)
- **Local-first data handling** (data stays on-device unless the user exports)
- **Truthful trust boundaries** (optional integrations are separate and explicit)

### Definitions (so we don’t talk past each other)

- **Offline-capable**: the app shell loads; core workflows might still fail.
- **Offline-first**: core workflows keep working offline; sync is a bonus.
- **Local-first**: local storage is the source of truth; sharing is explicit.

## 1) Start with the constraints, not the framework

When your data is health-adjacent, your threat model isn’t theoretical.

- Lost/stolen devices are plausible.
- Shoulder surfing is plausible.
- “Accidental oversharing” via exports is plausible.
- A compromised OS is possible, but you can’t honestly claim to solve it.

So the architecture has to be clear about what it *does* protect and what it *doesn’t*.

That’s also why I like repo-grounded writing: you can point at the exact boundary.

## 2) The core pattern: a local-first loop

Pain Tracker is built around a loop that does not depend on a backend:

1. User input
2. State update
3. Persist locally
4. Derive analytics locally
5. Export only when the user chooses

This design shows up repeatedly in the repo docs and persistence code.

If you take only one idea from this post, take this:

> Your offline story is only as strong as your local “source of truth”.

### Offline-first needs more than `localStorage`

If your offline story is “we save some state to localStorage,” you’ll hit limits:

- size limits
- lack of indexing/querying
- hard-to-migrate schemas
- higher risk of accidental plaintext exposure

A more durable approach is a layered model:

- local state cache for UI responsiveness
- IndexedDB for durable, queryable offline storage
- an encryption boundary for sensitive at-rest protection

Pain Tracker documents these layers explicitly:

- Zustand persisted store (app state)
- Offline IndexedDB storage (durability + sync queue)
- Vault-backed encrypted IndexedDB (encrypted at rest)

See: [docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md)

That “layers + migrations” framing matters because it lets you evolve the app without
silently dropping user data.

## 3) Service workers: deterministic beats clever

Service workers can make a PWA feel magical, or unreliable.

A surprisingly sane default for a health-ish PWA is:

- **Network-first for navigations** (so deploys update cleanly)
- **Cache static assets** (so the app shell loads and remains fast)
- **Versioned caches** (so old assets are garbage collected predictably)

Pain Tracker’s service workers are intentionally minimal and versioned.
That makes failure modes understandable and debuggable.

The intent is spelled out right in the service worker source:

- Base scope: [public/sw.js](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/public/sw.js)
- GitHub Pages base path: [public/pain-tracker/sw.js](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/public/pain-tracker/sw.js)

Here’s the key behavior (short excerpt from the fetch handler):

```js
// Network-first for navigations to avoid stale HTML.
if (isNavigationRequest(event.request)) {
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      return (
        (await cache.match('/offline.html')) ||
        (await cache.match('/')) ||
        new Response(null, { status: 504 })
      );
    })
  );
  return;
}
```

If you’re building your own, aim for behavior you can explain in one paragraph.

## 4) Exports are a trust boundary

In local-first apps, exports are where privacy breaks *by user choice*.
That’s good, but it’s also where mistakes happen.

Practical patterns:

- Make exports explicit and deliberate (no background export).
- Prefer structured exports that minimize reconstructive free text.
- Keep a minimal audit trail that proves *an export happened* without logging the content.

Even if your app never sends data to a server, exports can still leak data if you
don’t treat them as a boundary.

## 5) Accessibility and trauma-informed UX are architecture

For pain tracking, you’re often designing for:

- cognitive load
- motor impairment
- fatigue
- “I need this to work right now” moments

That means:

- keyboard reachability
- visible focus
- gentle error states
- progressive disclosure

If the UX only works when someone is having a good day, it’s not really a health tool.

## 6) How to verify the claims (quick checks)

You can sanity-check the offline/PWA behavior without reading the whole codebase.

### Run locally

```powershell
npm install
npm run dev
```

### Confirm the service worker registers

- Open DevTools → Application → Service Workers
- Look for the app service worker, and a cache named like `pain-tracker-static-v...`

### Confirm offline fallback works

- In DevTools → Network, enable Offline
- Refresh a route and confirm you get the offline fallback page

### Confirm there are automated checks

There’s an E2E test suite that exercises PWA expectations:

- [e2e/tests/pwa-background-sync.spec.ts](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/e2e/tests/pwa-background-sync.spec.ts)

## What’s next

In Part 2, we’ll go deeper into the storage layers and why “vault locked vs
unlocked” state matters for avoiding accidental restoration of sensitive state.

---

If you’re building something similar, I’d love to hear the constraints you’re working
under (offline? regulated? multi-device?) — those shape the architecture more than
any framework choice.
