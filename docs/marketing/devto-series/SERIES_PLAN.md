# Dev.to series plan — Pain Tracker (privacy-first, offline-first)

This series is designed to be *repo-grounded*: every technical claim should map to a concrete module, test, or doc in this repository.

## Working series name

"Local-first Pain Tracker: Offline-first patterns for sensitive PWAs"

## Series goals

- Explain how to build a local-first PWA that remains useful offline.
- Show how to treat sensitive health data as a hostile surface (minimize, audit, encrypt at rest).
- Share practical patterns: state, migrations, service workers, testing, accessibility, and safe documentation.

## Audience

- Senior-ish web devs who want to build offline-capable apps without a backend.
- Health-tech adjacent builders who want privacy-first architecture without surveillance defaults.
- OSS maintainers interested in quality gates, audits, and “truthful README” hygiene.

## House rules (for accuracy)

- Avoid absolute claims (“secure”, “HIPAA compliant”, “never leaks”) — describe what the code does.
- Treat optional network integrations as separate trust boundaries.
- Never include sensitive sample data in screenshots.

## Canonical URL policy

- If a post also exists on your primary blog, set `canonical_url` to that blog.
- If it’s Dev-only, point `canonical_url` to the GitHub repo or a stable docs page.

## Proposed series structure (10 parts)

### Part 1 — Offline-first without a backend: a local-first architecture that holds up

- Outcome: readers can explain "offline-first" vs "offline-capable" and design a local-first loop
- Proof anchors: [ARCHITECTURE.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/ARCHITECTURE.md)
  and [LOCAL_DATA_AND_MIGRATIONS.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md)
- Suggested assets: architecture overview diagram + trust-boundaries diagram

### Part 2 — Three storage layers: state cache vs offline DB vs encrypted vault DB

- Outcome: readers can design storage layers + migrations without silent data loss
- Proof anchors: [LOCAL_DATA_AND_MIGRATIONS.md](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md)
- Suggested assets: storage layer diagram + migration checklist snippet

### Part 3 — Service workers that don’t surprise you: network-first navigations + versioned caches

- Outcome: readers can implement a deterministic SW with understandable failure modes
- Proof anchors: [public/sw.js](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/public/sw.js)
  and [public/pain-tracker/sw.js](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/public/pain-tracker/sw.js)
- Suggested assets: DevTools screenshot (SW + cache storage)

### Part 4 — Zod + defensive parsing: keep integrity without punishing users

- Outcome: readers can validate untrusted local data safely and gently
- Suggested assets: "bad input" UX screenshot (no sensitive data)

### Part 5 — Trauma-informed UX + accessibility as architecture, not frosting

- Outcome: readers can build a preference-driven UX that remains usable under stress
- Suggested assets: keyboard focus state screenshot + "gentle vs clinical" toggle screenshot

### Part 6 — Exports as a security boundary: clinical-grade outputs without over-collection

- Outcome: readers can design exports that are useful but minimize reconstructive risk
- Suggested assets: export modal screenshot using synthetic data

### Part 7 — WorkSafeBC-oriented workflows (careful language, careful defaults)

- Outcome: readers can build claim-oriented summaries without over-promising legal parity
- Suggested assets: composite example (explicitly labeled) + export preview screenshot

### Part 8 — Analytics without surveillance: explicit consent + local-only correlation

- Outcome: readers can ship analytics with explicit consent and clear boundaries
- Suggested assets: consent UI screenshot + CSP snippet excerpt (deployment-dependent)

### Part 9 — Quality gates that earn trust: lint + typecheck + tests + build + security scans

- Outcome: readers can build a quality gate that prevents "greenwashing" badges
- Suggested assets: terminal screenshot of checks passing (no secrets)

### Part 10 — Maintaining truthful docs: how to keep README claims defensible over time

- Outcome: readers can maintain docs that stay true as the code evolves
- Suggested assets: "claim → evidence" table screenshot

## Suggested publishing cadence

- Weekly (10 weeks) is realistic and sustainable.
- Alternate “deep technical” and “UX / product boundary” posts to avoid monotony.

## Asset checklist (reusable across posts)

- Architecture diagram (high-level) + a “trust boundaries” diagram.
- A service-worker Application panel screenshot (no sensitive data).
- A migration table screenshot (sanitized).
- A “vault locked vs unlocked” state screenshot (no entries shown).

## Tags (baseline)

- `pwa`, `typescript`, `react`, `privacy`, `healthtech`, `accessibility`, `testing`
