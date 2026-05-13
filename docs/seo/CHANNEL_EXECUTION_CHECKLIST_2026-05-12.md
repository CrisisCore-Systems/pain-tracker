# Channel Execution Checklist (2026-05-12)

## Purpose

Convert the target-link map and authority-distribution strategy into weekly execution tasks across owned and external channels.

Primary objective:

- increase deep-page external links
- keep homepage share from drifting upward
- align links to intent-specific pages

## Target pages (active set)

1. https://paintracker.ca/resources
2. https://paintracker.ca/download
3. https://paintracker.ca/pricing
4. https://paintracker.ca/resources/daily-pain-tracker-printable
5. https://paintracker.ca/resources/what-to-include-in-pain-journal
6. https://paintracker.ca/resources/doctor-visit-pain-summary-template
7. https://paintracker.ca/resources/worksafebc-pain-journal-template

## Week 1 checklist

### A) CrisisCore (owned authority first)

- [ ] Publish one compact PainTracker deep-link block from [docs/seo/CRISISCORE_DEEP_LINK_BLOCK_2026-05-12.md](docs/seo/CRISISCORE_DEEP_LINK_BLOCK_2026-05-12.md) on core profile/about pages.
- [ ] Add one in-body contextual deep link on each of 3 high-traffic CrisisCore pages:
  - resources intent -> /resources
  - installation intent -> /download
  - sustainability intent -> /pricing
- [ ] Add one WorkSafeBC-context link to /resources/worksafebc-pain-journal-template.

Weekly minimum output:

- 5 fresh deep links from CrisisCore to non-homepage PainTracker URLs.

### B) Dev.to (mapped link distribution)

- [x] Run dry-run verification:
  - `node scripts/devto/devto.mjs sync-content --allow-published`
- [x] Apply mapped content sync for enabled posts:
  - `node scripts/devto/devto.mjs sync-content --yes --write --allow-published`
- [x] Confirm no missing mapping entries in `defaults.target_link_map` before sync.
- [x] Run distribution report after sync:
  - `npm run -s devto:link-distribution-report:write`

Weekly minimum output:

- 1 mapped target link block present in each enabled, synced post.

### C) Hashnode (mirror Dev intent routing)

- [x] Prepare publish-ready copy pack for 5 context-matched deep-link insertions.
- [x] Update source-backed Hashnode payloads for the 3 live P0 post slugs:
  - `paintracker-privacy-first-trauma-informed-pain-app`
  - `stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free`
  - `start-here`
- [ ] Update 5 existing posts with context-matched deep links using the same route logic as Dev.to.
- [ ] Ensure at least one post links to each of:
  - /resources
  - /download
  - /pricing
  - /resources/doctor-visit-pain-summary-template
  - /resources/worksafebc-pain-journal-template

Execution note:

- `scripts/publishing/hashnode/week1-p0-update-posts.cjs` and `scripts/publishing/hashnode/week1-p0-fix-rendered-metadata.cjs` now support:
  - official GraphQL endpoint: `https://gql.hashnode.com`
  - `HASHNODE_GRAPHQL_URL` for an alternate reachable GraphQL gateway
  - `HASHNODE_TRANSPORT=node|powershell`
  - `HASHNODE_INSECURE_TLS=true` only for a trusted internal proxy

Weekly minimum output:

- 5 deep links in existing Hashnode posts, all non-homepage targets.

### D) LinkedIn (entity + intent validation)

- [x] Prepare 2 publish-ready LinkedIn post drafts mapped to deep targets.
- [ ] Update profile headline/summary to include private offline positioning language.
- [ ] Publish 2 posts with deep links:
  - post 1 -> /resources or /resources/daily-pain-tracker-printable
  - post 2 -> /download or /pricing
- [ ] Keep one concise contextual link per post, not multiple stacked links.

Weekly minimum output:

- 2 LinkedIn deep links to non-homepage targets.

### E) Product Hunt (profile-level reinforcement)

- [x] Prepare one profile/update copy block mapped to non-homepage targets.
- [ ] Update maker/product profile copy with intent-specific descriptor.
- [ ] Add one update/comment that points to /resources or /download (not homepage-only).

Weekly minimum output:

- 1 Product Hunt deep link to a non-homepage target.

## Week 2 checklist

### A) Expand distribution depth

- [ ] Add 5 new deep links total across Hashnode + LinkedIn + CrisisCore.
- [ ] Ensure at least 4 distinct deep target pages receive links this week.

### B) Tighten Dev.to concentration control

- [ ] Snapshot report:
  - `npm run -s devto:link-distribution:snapshot`
- [ ] Run trend gate:
  - `npm run -s devto:link-distribution:trend-check`
- [ ] If trend-check fails, rebalance by updating two posts toward /resources and one toward /download or /pricing.

### C) Add one GitHub-side reinforcement touch

- [ ] Keep [README.md](README.md) key resource path cluster current if route priorities change.

## Weekly KPI gate

Pass conditions:

1. Homepage share in Dev.to source-distribution report is stable or lower week over week.
2. At least 5 fresh external deep links to non-homepage target pages are added each week.
3. At least 4 distinct deep targets receive links in the week.
4. WorkSafeBC page receives at least one fresh contextual external link every 2 weeks.

## Failure playbook

If homepage share rises:

1. Update 3 high-traffic Dev.to posts to point to non-homepage targets.
2. Add 2 new owned-channel deep links on CrisisCore.
3. Re-run report and trend-check after changes.

## Execution log

### 2026-05-12 / 2026-05-13 UTC - Dev.to lane started

- Dry run completed and captured: `docs/seo/DEVTO_SYNC_CONTENT_DRY_RUN_2026-05-12.txt`
  - 30 posts flagged for `body` updates.
- Apply run completed and captured: `docs/seo/DEVTO_SYNC_CONTENT_APPLY_2026-05-12.txt`
  - 30 posts synced, 0 linked, 0 skipped.
  - Observed transient 429 responses with successful automatic retries.
- Post-sync report written: `artifacts/devto/link-distribution-report.json`
  - Homepage share: 45.45%
  - Distinct target paths in mapped source set: 4
- Snapshot created: `artifacts/devto/history/link-distribution-report-20260513T032420Z.json`
- Trend gate run: PASS
  - `npm run -s devto:link-distribution:trend-check`

### 2026-05-12 / 2026-05-13 UTC - Non-automated channel pack prepared

- Publish-ready copy pack created: `docs/seo/WEEK1_CHANNEL_COPY_PACK_2026-05-12.md`
  - CrisisCore insertion matrix
  - Hashnode 5-post update queue with anchor+URL mapping
  - 2 LinkedIn post drafts
  - Product Hunt update/comment draft

### 2026-05-12 UTC - Hashnode API path adapted, workspace still network-blocked

- Updated source-backed Hashnode bodies for the 3 live P0 post slugs:
  - `cmlk6l1ir000102lc9zbefrwd.md`
  - `docs/notes/cmhy7nymw000202ic4ecv4d7k.md`
  - `docs/notes/cmjlc4plw000402lde3202avk.md`
- Added shared request helper: `scripts/publishing/hashnode/graphql-request.cjs`
- Updated Hashnode week-1 scripts to support `HASHNODE_GRAPHQL_URL`, `HASHNODE_TRANSPORT`, and clearer gateway/TLS diagnostics.
- Validation result in this workspace:
  - default Node transport fails on TLS interception for `https://gql.hashnode.com`
  - PowerShell transport reaches an HTML `405 Method Not Allowed` gateway instead of GraphQL JSON
  - `https://api.hashnode.com` is reachable but not a valid replacement endpoint for these queries (`Stellate service "api.hashnode.com" not found`)
- Current blocker:
  - live Hashnode apply is still blocked in this network until a reachable GraphQL endpoint/gateway is available.

## Execution notes

- Keep anchor text varied and context-specific.
- Prefer one strong contextual link over repeated homepage CTAs.
- Keep claims truthful and aligned with current product boundaries.
