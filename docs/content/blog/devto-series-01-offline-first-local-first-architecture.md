---
title: "Offline-first without a backend: building a local-first PWA you can actually trust"
description: "A practical walkthrough of deterministic offline behavior, layered local storage, and honest trust boundaries—using the Pain Tracker repo as a real, opinionated example."
tags:
  - pwa
  - typescript
  - react
  - privacy
  - accessibility
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---

_Series:_ [Start here](./devto-series-00-start-here.md) · **Part 1** · [Part 2](./devto-series-02-three-storage-layers-state-cache-offline-db-encrypted-vault.md) · [Part 3](./devto-series-03-service-workers-that-dont-surprise-you.md) · [Part 4](./devto-series-04-zod-defensive-parsing.md) · [Part 5](./devto-series-05-trauma-informed-ux-accessibility-as-architecture.md) · [Part 6](./devto-series-06-exports-as-a-security-boundary.md) · [Part 7](./devto-series-07-worksafebc-oriented-workflows-careful-language.md) · [Part 8](./devto-series-08-analytics-without-surveillance-explicit-consent.md) · [Part 9](./devto-series-09-quality-gates-that-earn-trust.md) · [Part 10](./devto-series-10-maintaining-truthful-docs-over-time.md)

This post uses the open-source Pain Tracker repo as a concrete reference point.
It’s not medical advice, and it doesn’t pretend to be compliant with any specific regulation.

I’m deliberately grounding this in real code, because “offline-first” means very little unless you can point to exactly where things break… and where they don’t.

If you want to follow along, these two docs will get you oriented fast:

Architecture overview:
https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/ARCHITECTURE.md

Local data + migrations:
https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md

Most apps that claim to be “offline-capable” are really saying this:

The UI loads without internet, but your data is still one bad request away from disappearing.

For casual apps, that’s annoying.
For pain tracking—or any kind of sensitive journaling—it changes how people behave.
They stop writing things down when they’re tired, foggy, or already overwhelmed. Which is usually when the data matters most.

## What this architecture is actually trying to do

In plain terms:

- Be useful offline by default, even with flaky or nonexistent connectivity

- Keep data local-first, meaning it stays on the device unless the user explicitly exports it

- Draw honest trust boundaries, instead of quietly pretending integrations don’t change the risk profile

## Terms (so we’re aligned)

These get used interchangeably a lot, and they really shouldn’t be:

- **Offline-capable:** the app loads, but core workflows may silently fail

- **Offline-first:** the core workflows work offline; syncing is optional

- **Local-first:** local storage is authoritative; sharing is a conscious act

If those distinctions don’t show up in the architecture, they’re just marketing.

1) Start with constraints, not frameworks

When your data is even adjacent to health, your threat model stops being theoretical.

You don’t have to be paranoid to acknowledge that:

Devices get lost or stolen

People look over shoulders

Exports get emailed, uploaded, forwarded

OS compromise is possible—and pretending otherwise is dishonest

The goal isn’t to “solve everything.”
It’s to be clear about what you do protect, what you don’t, and where the boundary lives.

That’s why I like repo-grounded writing. It forces you to stop hand-waving and say:
this line, this file, this decision—this is the boundary.

2) The core loop: local-first, end to end

Pain Tracker is built around a loop that never requires a backend to function:

User input

State update

Persist locally

Derive insights locally

Export only when the user decides to

That pattern shows up everywhere—in the docs, in the persistence layer, and in how features are added.

If there’s one thing worth taking from this post, it’s this:

Your offline story lives or dies on what you treat as authoritative locally.

Why localStorage isn’t enough

A lot of “offline” apps quietly mean:
“We dump some JSON into localStorage and hope nothing goes wrong.”

That breaks down quickly:

tight size limits

no meaningful querying

painful schema changes

accidental plaintext exposure

A more resilient approach is layered on purpose:

a local state cache for UI responsiveness

IndexedDB for durable, queryable storage

a clear encryption boundary for sensitive data at rest

Pain Tracker documents those layers explicitly:

Zustand persisted store (UI state)

Offline IndexedDB (durability, ordering, sync queue)

Vault-backed encrypted IndexedDB (at-rest protection)

See:
https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md

The migrations piece matters more than people think. It’s the difference between evolving an app and silently corrupting someone’s history.

3) Service workers: boring is a feature

Service workers are one of those tools that can feel magical—or quietly betray you.

For a health-adjacent PWA, I’ve found a boring setup is usually the most honest:

Network-first for navigations, so deploys don’t get stuck

Cached static assets, so the shell loads reliably

Versioned caches, so you know exactly what gets invalidated

Pain Tracker’s service workers are intentionally minimal.
That’s not a lack of ambition—it’s risk management.

You can see the intent directly in the source:

Base scope:
https://github.com/CrisisCore-Systems/pain-tracker/blob/main/public/sw.js

GitHub Pages pathing:
https://github.com/CrisisCore-Systems/pain-tracker/blob/main/public/pain-tracker/sw.js

Key behavior (trimmed):

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


If you can’t explain your service worker behavior to a tired user in a few sentences, it’s probably too clever.

4) Exports are where trust changes

In a local-first app, exports are the moment privacy intentionally breaks.

That’s not a flaw. It’s a boundary.

Some patterns that help avoid regret later:

No background or automatic exports

Structured formats over free-form dumps

A minimal audit signal that an export happened—without storing the content

Even apps with zero backends can leak data if exports aren’t treated with care.

5) Accessibility and trauma-aware UX aren’t “polish”

For pain tracking, you’re often designing for people who are:

exhausted

cognitively overloaded

dealing with motor limitations

trying to log something right now before they forget

That pushes requirements upstream:

keyboard reachability isn’t optional

focus states need to be obvious

error states should be calm, not scolding

disclosure should be progressive

If your app only works on someone’s good days, it’s not a health tool. It’s a demo with better branding.

6) Verifying the claims (without trusting me)

You don’t have to take any of this on faith.

Run it locally
npm install
npm run dev

Check the service worker

DevTools → Application → Service Workers

Look for a cache like pain-tracker-static-v...

Test offline behavior

DevTools → Network → Offline

Refresh a route and confirm the offline fallback loads

Look for automated coverage

There’s an E2E suite exercising PWA expectations:

https://github.com/CrisisCore-Systems/pain-tracker/blob/main/e2e/tests/pwa-background-sync.spec.ts

What’s next

Part 2 goes deeper into the storage layers—specifically why vault locked vs unlocked state matters if you want to avoid accidentally restoring sensitive data into memory.

If you’re building something in this space, I’m genuinely curious what constraints you’re dealing with—offline-only, regulated environments, multi-device sync, or something messier. Those constraints end up shaping architecture far more than any framework decision ever does.

---

Next: [Part 2 — Three storage layers (state cache vs offline DB vs encrypted vault)](./devto-series-02-three-storage-layers-state-cache-offline-db-encrypted-vault.md)