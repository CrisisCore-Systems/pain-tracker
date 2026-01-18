---
title: "Start here: local-first, offline-first Pain Tracker (no backend required)"
description: "A guided index for the Pain Tracker Dev.to series: local-first architecture, deterministic PWAs, accessibility, and truthful security boundaries."
tags:
  - pwa
  - privacy
  - webdev
  - testing
canonical_url: "https://github.com/CrisisCore-Systems/pain-tracker"
published: false
---

This is the index post for a Dev.to series based on the open-source **Pain Tracker**
repo.

- It’s not medical advice.
- It does not claim regulatory compliance.
- It focuses on *what the code does* and the tradeoffs it makes.

## What this series is (and isn’t)

This series is about building PWAs that stay useful offline and treat sensitive data
as a hostile surface.

It is **not**:

- a "perfect security" claim
- a cloud architecture pitch
- a stealth analytics funnel

## Start with Part 1

- Part 1: [Offline-first without a backend: a local-first PWA architecture you can trust](./devto-series-01-offline-first-local-first-architecture.md)

## Proof-first reading list (repo anchors)

If you prefer to verify first and read second:

- Architecture overview: [docs/engineering/ARCHITECTURE.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/ARCHITECTURE.md)
- Local data + migrations: [docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md)
- Service worker (base): [public/sw.js](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/public/sw.js)
- Service worker (GitHub Pages base path): [public/pain-tracker/sw.js](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/public/pain-tracker/sw.js)

## The series map

Each post will link forward/back as it publishes.

1. Offline-first without a backend (local-first architecture)
2. Three storage layers (state cache vs offline DB vs encrypted vault DB)
3. Service workers that don’t surprise you
4. Zod + defensive parsing
5. Trauma-informed UX + accessibility as architecture
6. Exports as a security boundary
7. WorkSafeBC-oriented workflows (careful language)
8. Analytics without surveillance (explicit consent + clear boundaries)
9. Quality gates that earn trust
10. Maintaining truthful docs over time

## Support / links

- Repo: [CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)
- Sponsor: [paintracker.ca/sponsor](https://paintracker.ca/sponsor)

If you’re building something similar, the most useful context to share is your
constraints: offline requirements, threat model, and who you’re designing for.
