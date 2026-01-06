<!-- markdownlint-disable MD013 MD041 -->

[Back to series hub](../SERIES_FROM_IDEA_TO_ACCESSIBLE_HEALTH_PWA.md)

# Part 6 — Offline, Sync, and Failure Modes

Reliable tools don’t require ideal conditions. They work in basements, parking lots, clinic hallways,
and anywhere a person might be trying to get through their day.

Offline-first is a promise: “This tool works when your life is unstable.”

For a health app, that promise is not optional. People log pain in clinics, elevators, basements,
worksites, rural areas, and during crisis moments when connectivity is unreliable.

If the app fails in those moments, many people won’t try again.

This is about building the *behavior* of reliability, not adding a service worker.

## The offline-first mental model: local is primary

If your architecture is local-first, “offline” is not a special state. It’s the default.

That changes how you think about features:

- saving is always local
- reading history is always local
- pattern insights are computed locally
- export is generated locally

If anything depends on the network, treat it as an enhancement and design a fallback.

## What to cache (and what not to cache)

Offline capability depends on two separate things:

1) **App shell availability** (HTML/CSS/JS loads)
2) **Data availability** (user entries are readable/writable)

Cache the app shell so it launches reliably.

Be cautious caching anything that could contain sensitive data. If you cache API responses (even for
“harmless” endpoints), you create additional surfaces that can surprise users and complicate threat
models.

Practical rule: cache *code*, not *Class A content*.

## Updates: reliability includes predictable upgrades

The most common offline-first failure is not “no signal.” It’s “app updated weirdly.”

Examples:

- new UI served with old cached assets
- old schema meets new storage layer
- service worker is installed but not controlling the page you think it is

Design goals:

- updates should be deliberate (avoid invisible version mismatches)
- migrations should be explicit and recoverable
- users should not lose data because you shipped a refactor

Practical UX pattern: when a new version is ready, prompt the user to refresh at a safe moment (and
don’t interrupt an in-progress entry).

## Sync: choose your stance deliberately

For PainTracker-aligned privacy, the default stance is:

- **No background sync of Class A data.**

That doesn’t mean “no multi-device ever.” It means:

- if you add sync later, it must be explicit, user-controlled, and auditable
- until then, export/import is the honest mechanism

If you do implement sync in the future, define:

- what leaves the device
- when it leaves
- where it goes
- how the user can verify it
- how the user can stop it

If you can’t answer those, you’re not shipping sync. You’re shipping risk.

## Failure modes that matter (and how to fail safely)

Offline-first design is mostly designing for failures.

Here are the common ones and the behaviors to implement.

### 1) Network failure (expected)

What to do:

- do not block logging
- do not show scary errors
- keep UI responsive and honest (“Saved on this device”)

### 2) Storage quota exhaustion (inevitable over time)

What to do:

- detect the failure and explain it plainly
- preserve the user’s unsaved entry in memory/on-screen
- offer a recovery path: export old data, delete attachments, reduce note size

### 3) Partial writes / interrupted sessions (common on mobile)

What to do:

- design saves to be atomic where possible
- auto-save drafts when feasible (without creating confusing duplicates)
- on restart, recover drafts with clear wording (“Recovered unsaved entry”)

### 4) Migrations (the silent data killer)

What to do:

- version your storage schema
- test migration paths
- keep a rollback/recovery strategy (even if it’s “export first, then migrate”)

### 5) Service worker mismatch (the “it’s broken but only sometimes” bug)

What to do:

- keep caching strategy simple
- avoid caching responses containing sensitive content
- provide a user-visible “refresh/update” recovery path

### 6) Time drift / timezone changes (subtle but real)

What to do:

- store timestamps consistently
- allow “approximate time” buckets
- present trends with humility (avoid overconfident precision)

## Offline-first quick check

Use this checklist before calling your app offline-first:

1) I can open the app with no network and reach the primary flow
2) I can create an entry offline and see it in history immediately
3) I can refresh the page offline without losing the app shell
4) Update prompts don’t interrupt active logging
5) Storage errors preserve in-progress work and offer recovery
6) Migrations are versioned and tested

## Next: Part 7 — Building the PWA Shell and Install Experience

Next, Part 7 gets specific about the PWA surface: manifest choices, service worker behavior, and
install UX that makes the app feel trustworthy and “native-enough” without dark patterns.

---
