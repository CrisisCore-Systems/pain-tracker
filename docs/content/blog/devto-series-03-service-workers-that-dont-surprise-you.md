---
title: "Service workers that don’t surprise you: deterministic caching for offline-first PWAs"
description: "A repo-grounded guide to service worker strategies that avoid stale HTML, confusing updates, and accidental caching of sensitive data—using Pain Tracker’s minimal SW as the example."
tags:
  - pwa
  - serviceworker
  - webdev
  - privacy
  - performance
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---

**Series:**
[Start here](https://dev.to/crisiscoresystems/start-here-paintracker-crisiscore-build-log-privacy-first-offline-first-no-surveillance-3h0k)
· [Part 1](https://dev.to/crisiscoresystems/offline-first-without-a-backend-a-local-first-pwa-architecture-you-can-trust-3j15)
· [Part 2](https://dev.to/crisiscoresystems/three-storage-layers-in-an-offline-first-health-pwa-state-cache-vs-indexeddb-vs-encrypted-vault-19b7)
· **Part 3**
· [Part 4](https://dev.to/crisiscoresystems/zod-defensive-parsing-in-a-local-first-app-make-your-offline-data-trustworthy-1016)
· [Part 5](https://dev.to/crisiscoresystems/trauma-informed-ux-accessibility-as-architecture-not-polish-22jg)
· [Part 6](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9)
· [Part 7](https://dev.to/crisiscoresystems/worksafebc-oriented-workflows-without-overclaims-structured-summaries-careful-language-2n3i)
· [Part 8](https://dev.to/crisiscoresystems/analytics-without-surveillance-explicit-consent-layered-gates-and-never-sending-class-a-data-59f1)
· [Part 9](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
· [Part 10](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)

This post is Part 3 in a Dev.to series grounded in the open-source **Pain Tracker** repo.

- Not medical advice.
- Not a compliance claim.
- It’s about *deterministic behavior* and truthful boundaries.

If you haven’t read Part 2 yet:

- Part 2: [Three storage layers (state cache vs offline DB vs encrypted vault)](https://dev.to/crisiscoresystems/three-storage-layers-in-an-offline-first-health-pwa-state-cache-vs-indexeddb-vs-encrypted-vault-19b7)

If you want the full local-first architecture this service worker is serving, step back to Part 1:

- Part 1: [Offline-first without a backend: a local-first PWA architecture you can trust](https://dev.to/crisiscoresystems/offline-first-without-a-backend-a-local-first-pwa-architecture-you-can-trust-3j15)

---

## What “surprising” service workers do

If you’ve been burned by service workers, it’s usually one of these:

(And if you haven’t been burned yet: congrats. Your day is coming.)

1. **Stale HTML** breaks your app after deploy

- the browser keeps serving an old `index.html`
- the module graph changes
- suddenly you’re getting chunk 404s or a blank screen

1. **Base paths** don’t match reality

- it works on `/`
- it breaks on GitHub Pages under `/pain-tracker/`
- you register the wrong scope and nothing behaves the way you think it does

1. **Caching becomes accidental data retention**

- you didn’t intend to cache responses
- you cache “everything” because it’s easy
- you end up with user-specific payloads in caches (which is a problem for sensitive apps)

1. **Updates are confusing**

- new worker installs but doesn’t activate
- users don’t refresh
- you can’t tell what version is running

The theme: the browser is doing exactly what you asked… but you didn’t ask carefully.

---

## The repo’s stance: boring on purpose

Pain Tracker’s service worker is intentionally minimal:

- **Network-first for navigations** (avoid stale HTML)
- **Cache static assets only** (scripts, styles, images, fonts)
- **Versioned caches** with cleanup on activation
- **A small precache** for `offline.html` and the manifest

There’s no “offline magic,” no runtime caching of arbitrary API responses, and no attempt to make the SW a data layer.

Two service worker scripts exist:

- Root scope (normal deploy):
  - [github.com/CrisisCore-Systems/pain-tracker/blob/main/public/sw.js](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/public/sw.js)
- GitHub Pages base path (`/pain-tracker/`):
  - [github.com/CrisisCore-Systems/pain-tracker/blob/main/public/pain-tracker/sw.js](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/public/pain-tracker/sw.js)

---

## The deterministic core: never cache navigations

The most important line in both service workers is conceptually this:

> navigations are **network-first**.

In `public/sw.js`, a navigation request is detected using `request.mode === 'navigate'` or `Accept: text/html`.

Then it does:

- try `fetch(request)`
- if that fails, serve `offline.html`

That’s it.

Why this matters:

- If you cache navigations with cache-first, you will eventually ship a new build whose HTML points to new chunk filenames.
- The cached HTML keeps pointing at old filenames.
- You get chunk 404s and the app feels “randomly broken.”

For a health-adjacent PWA, that kind of failure is worse than a clean offline message.

---

## Cache static assets (but be explicit)

Pain Tracker only caches **same-origin** requests, **GET** requests, and only if they look like static assets.

In `public/sw.js`, that’s done with two mechanisms:

- allowlisted path prefixes like `/assets/`, `/icons/`, `/logos/`, `/screenshots/`
- a conservative extension allowlist (`.js`, `.css`, `.png`, `.svg`, `.woff2`, …)

The flow for cacheable static assets is:

- if it’s in cache → return it
- else fetch → cache successful 200 responses → return

This is the “least surprising” offline strategy:

- The shell loads quickly after first visit
- Deploys don’t get stuck behind cached HTML
- You don’t accidentally cache sensitive runtime responses

---

## Versioned caches (so you can delete what you meant)

Both service workers have a version string and build the cache name from it:

- `CACHE_NAME = pain-tracker-static-v<version>`

On activation, the SW deletes older caches with the `pain-tracker-` prefix.

That gives you a clean invariant:

- if you bump the SW version, old caches get removed

No guessing. No “maybe it’ll update.” It either updates or it doesn’t.

---

## GitHub Pages is the classic base-path foot-gun

The repo includes a second service worker at `public/pain-tracker/sw.js` for a GitHub Pages-style base path.

If you want the broader healthcare-PWA context for why this base-path and
caching discipline matters, read
[Building a Healthcare PWA That Actually Works When It Matters](https://dev.to/crisiscoresystems/building-a-healthcare-pwa-that-actually-works-when-it-matters-md4).

What changes:

- The precache URL for the manifest becomes `/pain-tracker/manifest.json`
- Static prefixes include `/pain-tracker/assets/`
- Offline fallback includes `'/pain-tracker/'`

This is the kind of boring duplication that prevents hours of “why is it offline on one environment but not the other?”

---

## Registration: compute the base, then register

The app registers the SW in the PWA manager:

- [github.com/CrisisCore-Systems/pain-tracker/blob/main/src/utils/pwa-utils.ts](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/utils/pwa-utils.ts)

Key behaviors:

- It computes a `baseUrl` from `VITE_BASE` when set, or Vite’s `BASE_URL`, and
  falls back to `location.pathname` when Vite gives a relative base.
- It registers `${baseUrl}sw.js` with `scope: baseUrl`.
- It sets `updateViaCache: 'none'` to force update checks.

It also wires an `updatefound` listener so the app can notify users when new content is available.

### A small readiness handshake (tests love this)

The service worker posts a `SW_READY` message on activation, and responds to `PING` with `PONG`.

The PWA manager listens for that and sets `window.__pwa_sw_ready = true`.

That’s a practical trick:

- it avoids flaky “is the SW ready yet?” tests
- it gives you a simple debug signal in DevTools

---

## What this SW does *not* do (and why)

It does not:

- cache arbitrary fetches
- cache API responses
- cache navigations
- implement a “sync your health data to the cloud” system

Those aren’t missing features. They’re deliberate boundaries.

If you add more SW features later (background sync, offline processing, etc.), treat them as **new trust boundaries**:

- decide what data is allowed in caches
- avoid storing Class A payloads in Cache Storage
- be explicit about what can happen while “locked” vs “unlocked”

---

## Verify it yourself (no trust required)

1. Inspect the service worker script:

- [github.com/CrisisCore-Systems/pain-tracker/blob/main/public/sw.js](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/public/sw.js)

1. In DevTools:

- Application → Service Workers (confirm scope + script URL)
- Application → Cache Storage (look for `pain-tracker-static-v…`)

1. Test offline behavior:

- DevTools → Network → Offline
- Refresh a route
- You should get the offline fallback instead of a broken shell

---

## Next up

Part 4 will cover defensive parsing (Zod + schema-first inputs) and how to keep “offline-first” from becoming “silently accepts garbage.”

Prev: [Part 2 — Three storage layers](https://dev.to/crisiscoresystems/three-storage-layers-in-an-offline-first-health-pwa-state-cache-vs-indexeddb-vs-encrypted-vault-19b7)
Next: [Part 4 — Zod + defensive parsing](https://dev.to/crisiscoresystems/zod-defensive-parsing-in-a-local-first-app-make-your-offline-data-trustworthy-1016)
