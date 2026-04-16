# DEV pinned comments (copy/paste)

> Note: Forem API v1 does not expose endpoints to create/pin comments. This file is generated to make manual pinning fast.

## Sync Conflict Handling in Offline-First PWAs: How to Merge Without Lying to the User

```md
TL;DR
- Sync conflicts are not just merge problems. They are trust problems.
- Last-write-wins often destroys valid user intent while pretending the system resolved it.
- Safer sync starts by distinguishing field, structural, ordering, and semantic conflicts.

Why this matters
- If offline work can be silently flattened on reconnect, the app is lying about what it saved.

Sponsor the build → https://paintracker.ca/sponsor
```

## Coercion-Resistant UX: Designing Interfaces That Don't Pressure Users Under Stress

```md
TL;DR
- Interfaces can reduce pressure or amplify it. They are not neutral.
- Defaults, timers, hidden exits, and guilt-driven nudges can turn UX into manipulation.
- Recovery paths, reversible actions, and calm language are part of user dignity.

Why this matters
- Under stress, people need legible choices and survivable mistakes, not rounded-corner coercion.

Sponsor the build → https://paintracker.ca/sponsor
```

## Service Worker Failure Modes in Offline-First PWAs

```md
TL;DR
- Service worker failures are usually mismatch failures, not simple cache misses.
- Mixed-version sessions can pair old tabs, new workers, and stale assets in the same user flow.
- Broken local migrations are worse than visible crashes because they can quietly corrupt trust.

Why this matters
- Offline-first updates have to survive overlap in the wild, not just clean installs in test.

Sponsor the build → https://paintracker.ca/sponsor
```

## Rollback Patterns in Offline-First PWAs

```md
TL;DR
- Rollback in offline-first systems is about state continuity, not just redeploying old code.
- Old clients, new schemas, queued writes, and waiting service workers create mixed-version reality.
- Some migrations are not reversible, and pretending otherwise turns rollback into silent damage.

Why this matters
- A rollback plan that ignores local state is not recovery. It is hope with version numbers.

Sponsor the build → https://paintracker.ca/sponsor
```

## Testing IndexedDB Schema Migrations in Offline-First PWAs

```md
TL;DR
- Fresh databases only prove installability. They do not prove upgrade safety.
- Migration tests need historical fixtures, partial failures, and long-delayed clients.
- The real question is whether meaning survived, not whether the database opened.

Why this matters
- A migration that quietly rewrites user history is worse than a migration that fails loudly.

Sponsor the build → https://paintracker.ca/sponsor
```

## Trust Boundaries in Client-Side Health Apps

```md
TL;DR
- In health apps, privacy lives in the architecture, not in the marketing copy.
- The device should be the first boundary for pain logs, notes, symptoms, and recovery history.
- Export, observation, and remote movement all need explicit user-owned boundaries.

Why this matters
- If sensitive health data becomes product exhaust by default, the product has already crossed the line.

Sponsor the build → https://paintracker.ca/sponsor
```

## Offline Queue Replay and Idempotency in Offline-First PWAs

```md
TL;DR
- Offline queues store deferred user intent, not just payloads waiting for the network.
- Retry is easy. Safe retry requires idempotency, replay identity, and stale-world checks.
- Without those safeguards, replay can duplicate writes, revive deleted records, or overwrite newer truth.

Why this matters
- If queued work replays blindly, the app can corrupt history while claiming sync succeeded.

Sponsor the build → https://paintracker.ca/sponsor
```
