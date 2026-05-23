# blog.paintracker.ca URL Rewrite Map

Version: 1.1  
Date: 2026-03-11  
Scope: Search-surface, information architecture, entity normalization, and implementation sequencing for top-priority URLs.

## 1) Canonical Brand Policy (Apply Everywhere)

Use one primary entity string:

- `Pain Tracker` (primary brand)
- `paintracker.ca` (domain form)
- `Pain Tracker Pro` only when referring to a specific product tier (not sitewide publication/entity naming)

Disallow mixed publication labels across titles/snippets:

- `PainTracker`
- `Pain Tracker Pro` (as site/publication name)
- `Pain Tracker - Free WorkSafeBC Form Generator` (outside dedicated WorkSafeBC landing pages)

## 2) Audience Lanes (IA)

Assign every page to one primary lane:

- `Patients`: chronic pain tracking, privacy-first care journaling, symptom management.
- `Builders`: architecture, engineering, OSS contribution, threat model, testing.
- `WorkSafeBC / Claims`: BC claim documentation workflows and form support.
- `Route Hub`: navigation/routing pages that direct users into one lane (not blended ranking targets).
- `Founder Journal`: personal narrative content, isolated from technical and patient guidance surfaces.

Navigation rule:

- Header: `Start Here`, `For Patients`, `For Builders`, `WorkSafeBC`, `Archive`.
- Keep founder narrative in an explicit section: `Founder Journal`.
- Do not place founder posts adjacent to technical decision pages unless a deliberate bridge section is added.

## 3) URL-by-URL Rewrite Map (Priority URLs)

Notes:

- Title target length: 50-65 chars.
- Meta description target length: 140-160 chars.
- H1 should mirror intent, not template chrome.
- For publication templates, ensure snippet-leading text is not `On this page`, `Contents`, or menu text.

Homepage intent lock (choose one and keep it stable for at least one crawl cycle):

- Option A: `Patients-first homepage` (patient-forward title/meta, route branching handled by `Start Here`).
- Option B: `Route-hub homepage` (title/meta clearly describe routing to lane hubs).

<!-- markdownlint-disable MD060 -->
| Priority | URL | Lane | Proposed Title | Proposed Meta Description | Primary CTA Target | Status | Canonical/IA Notes |
|---|---|---|---|---|---|---|---|
| P0 | `https://blog.paintracker.ca/` | Patients | `Pain Tracker Blog: Private, Offline-First Chronic Pain Tracking` | `Privacy-first chronic pain tracking with no accounts and local-only data. Guides for patients, builders, and WorkSafeBC documentation.` | `https://blog.paintracker.ca/page/start-here` | Keep | Publication home should use `Pain Tracker` consistently. |
| P0 | `https://blog.paintracker.ca/page/start-here` | Route Hub | `Start Here: Choose Your Path with Pain Tracker` | `New to Pain Tracker? Choose a clear path for patients, builders, or WorkSafeBC claim documentation workflows.` | `/for-patients`, `/for-builders`, `/worksafebc` | Keep | Routing page only. Do not optimize this as a blended intent page. |
| P0 | `https://blog.paintracker.ca/archive` | Route Hub | `Pain Tracker Blog Archive` | `Browse all Pain Tracker posts by date and topic, including privacy-first tracking, accessibility, engineering, and WorkSafeBC workflows.` | `https://blog.paintracker.ca/page/start-here` | Keep | Keep archive browsing-neutral; use route CTA only if lane chooser is visibly present. |
| P0 | `https://blog.paintracker.ca/stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free` | WorkSafeBC / Claims | `Generate WorkSafeBC-Ready Documentation with Pain Tracker` | `Generate WorkSafeBC-ready documentation faster with structured pain logs, export-ready records, and privacy-first local data handling.` | `/worksafebc` | Keep | Keep as WorkSafeBC pillar entry; wording avoids overclaim risk. |
| P0 | `https://blog.paintracker.ca/paintracker-privacy-first-trauma-informed-pain-app` | Patients | `Pain Tracker: Privacy-First, Trauma-Informed Pain App` | `Track flares, spot patterns, prepare for appointments, and keep records private. Pain Tracker works offline with no account required.` | `https://paintracker.ca/app` | Keep | Core entity explainer; elevated to P0 to stabilize brand identity. |
| P1 | `https://blog.paintracker.ca/how-pain-tracker-pro-streamlines-worksafebc-claims-a-composite-case-study` | WorkSafeBC / Claims | `WorkSafeBC Claims Case Study: Faster Documentation` | `A practical case study on reducing WorkSafeBC documentation time using structured pain tracking and export-ready records.` | `/worksafebc` | Keep | Consider slug simplification in future migration; keep 301 if changed. |
| P1 | `https://blog.paintracker.ca/paintracker-worksafebc-claims` | WorkSafeBC / Claims | `Pain Tracker for WorkSafeBC Claims` | `Document injury symptoms, prepare claim-ready summaries, and keep records local while reducing manual form workload.` | `https://paintracker.ca/app` | Keep | Hub-supporting article; cross-link to dedicated WorkSafeBC hub page. |
| P1 | `https://blog.paintracker.ca/the-day-i-decided-my-pain-app-didnt-need-a-server-what-i-learned-building-healthcare-software-that-lives-entirely-on-your-device` | Builders | `Why We Built a Local-First Pain App with No Backend` | `Engineering lessons from building a local-first healthcare app: offline resilience, privacy boundaries, and architecture trade-offs.` | `/for-builders` | Keep | Builder lane cornerstone. |
| P1 | `https://blog.paintracker.ca/offline-first-pwas-why-they-matter-for-crisis-responsive-health-tech` | Builders | `Offline-First PWAs for Crisis-Responsive Health Tech` | `How service workers, IndexedDB, and local-first architecture improve reliability for people with variable capacity and unstable conditions.` | `/for-builders` | Keep | Builder lane technical pillar. |
| P1 | `https://blog.paintracker.ca/building-software-that-actually-gives-a-damn-my-journey-with-trauma-informed-design` | Builders | `Trauma-Informed UX in Pain Tracking Software` | `A practical look at trauma-informed interaction patterns for chronic pain tools: low-friction flows, non-shaming language, and safer defaults.` | `/for-builders` | Keep | If partly memoir, add controlled bridge link to `/founder-journal` only. |
| P1 | `https://blog.paintracker.ca/building-a-pain-tracker-that-actually-gets-it-no-market-research-required` | Builders | `Designing a Chronic Pain App for Worst-Moment Usability` | `How lived-experience constraints shaped UX decisions for a privacy-first pain tracker built to work during flares and cognitive fatigue.` | `/for-builders` | Keep | Ensure snippet starts with summary paragraph, not table-of-contents text. |
| P2 | `https://blog.paintracker.ca/coding-through-collapse` | Founder Journal | `Coding Through Collapse: Building Pain Tracker in Crisis` | `Founder journal entry on building privacy-first health software through housing instability and chronic pain, and why those constraints shaped the product.` | `https://paintracker.ca/` | Re-scope | Keep in `Founder Journal`; allow one controlled cross-link to product explainer only. |
| P2 | `https://blog.paintracker.ca/four-months-on-the-floor` | Founder Journal | `Four Months on the Floor: Founder Journal` | `A personal account of collapse and recovery context behind Pain Tracker's protective computing principles.` | `/founder-journal` | Re-scope | Journal lane only; do not interleave in builder nav blocks. |
| P2 | `https://blog.paintracker.ca/understanding-collapse-a-comprehensive-guide` | Founder Journal | `Understanding Collapse: A Practical Framework` | `A framework for understanding functional collapse and why reliability and agency matter in chronic pain tools.` | `/founder-journal` | Re-scope | Choose one lane. Default to `Founder Journal` unless rewritten as technical methods content. |
| P2 | `https://blog.paintracker.ca/getting-started` | Patients | `Getting Started with Pain Tracker: Your First Week` | `Track flares, spot patterns, prepare for appointments, and keep records private in your first week with Pain Tracker.` | `https://paintracker.ca/app` | Keep | Use as key onboarding target from `Start Here`. |
<!-- markdownlint-enable MD060 -->

## 4) New Hub Pages (Needed to Fix Audience Mixing)

Create/strengthen these URLs (or equivalents):

- `https://blog.paintracker.ca/for-patients`
- `https://blog.paintracker.ca/for-builders`
- `https://blog.paintracker.ca/worksafebc`
- `https://blog.paintracker.ca/founder-journal`

Hub page requirements:

- One-sentence lane promise in first paragraph (snippet-safe).
- 5-10 curated links per lane.
- Clear CTA to `https://paintracker.ca` or `https://paintracker.ca/app` where relevant.

Lane guardrails:

- `For Patients` copy should prefer plain-language intent phrases.
- Examples: `track flares`, `spot patterns`, `prepare for appointments`, and `keep records private`.
- `For Builders` copy should stay technical and avoid memoir framing.
- `Founder Journal` copy should not become a primary navigation destination for patient or claims journeys.

## 5) Snippet Control Checklist

For top 10-15 URLs:

- Write explicit title and meta description in publication SEO settings.
- Ensure first visible paragraph is a real summary sentence.
- Move table-of-contents/`Contents` blocks below summary intro.
- Remove generic lead text that can leak into snippets (`On this page`, menu chrome, command palette terms).

## 6) Canonical URL Normalization Rules

For every rewritten or migrated page:

- Use self-referencing canonical tags.
- Keep exactly one indexable URL variant.
- Add 301 redirects for slug changes.
- Verify archive, tag, pagination, and query-parameter duplicates are not competing.
- Confirm canonical targets match final lane structure.
- If lane context changes but slug stays the same, update surrounding internal-link context (hub placement, related posts, nav/breadcrumb context).

## 7) WorkSafeBC Pillar Containment Rules

- Keep WorkSafeBC language concentrated in `/worksafebc` hub and related articles.
- Do not let WorkSafeBC descriptors appear in global site title, archive title, or publication default title.
- Keep disclaimer language in relevant pages only, not sitewide metadata.
- Avoid phrasing that implies official affiliation or government-managed form completion.

## 8) Bot/Fetcher Access Verification (429/403 Risk)

Validate these request classes are not over-blocked:

- Social unfurlers (X/Twitter, LinkedIn, Discord).
- SEO validators and uptime monitors.
- Accessibility testing crawlers.

Minimum test matrix:

- Browser normal session.
- Headless fetch with standard user-agent.
- Search engine-like bot user-agent.
- Burst requests to confirm rate-limit thresholds and response headers.

Expected outcomes:

- 200 for public pages under normal and moderate validation traffic.
- 429 only for abusive burst patterns, with clear retry headers.
- No blanket 403 on key public URLs.

## 9) 30-Day Rollout Order

1. Week 1: lock brand string and publication title defaults.
2. Week 1: record homepage role decision (`Patients-first` or `Route-hub`) in the execution tracker.
3. Week 1: update metadata for P0 URLs.
4. Week 2: publish 3 audience hubs (`for-patients`, `for-builders`, `worksafebc`) and update `Start Here` links immediately.
5. Week 3: move memoir posts into `founder-journal` lane and clean related-post modules.
6. Week 3: update homepage and lane-level internal links after journal separation.
7. Week 4: implement slug canonicalization/301s for any changed URLs.
8. Week 4: verify snippet improvements and crawl behavior in Search Console/logs.

## 10) Implementation Checklist by File/Page

Publication-level settings (Hashnode admin):

- Update publication title and defaults to canonical `Pain Tracker` naming.
- Remove any global default that injects `Free WorkSafeBC Form Generator` into non-WorkSafeBC pages.
- Set explicit SEO title/description for all P0 URLs in this map.

Page-level content updates (Hashnode pages):

- `https://blog.paintracker.ca/page/start-here`: convert to strict route hub format with 3 lane cards and no blended ranking copy.
- `https://blog.paintracker.ca/archive`: ensure neutral archive title and summary lead paragraph.
- `https://blog.paintracker.ca/`: apply chronic-pain-specific homepage title and summary paragraph.

Article-level updates (Hashnode posts):

- Apply rewritten titles/metas from Section 3 for all P0/P1 pages.
- For Founder Journal posts, use one controlled bridge link near the end of the post.
- Avoid repeated product CTAs in Founder Journal body copy.
- Do not place unlabeled technical related-post modules directly under Founder Journal articles.
- For patient pages, enforce plain-language phrase targets in intro and subheads.

Hub creation/update tasks:

- Create `https://blog.paintracker.ca/for-patients`.
- Create `https://blog.paintracker.ca/for-builders`.
- Create or strengthen `https://blog.paintracker.ca/worksafebc`.
- Create `https://blog.paintracker.ca/founder-journal`.

Codebase and redirect hygiene (this repo):

- `vercel.json`: add/adjust 301 redirects if any blog slugs change.
- `scripts/seo/extract-legacy-blog-slugs.mjs`: rerun after slug edits to confirm redirect coverage.
- `pages/start-here.md`, `pages/why-pain-tracker.md`, `pages/contribute.md`: keep draft copy aligned with final lane strategy.

Validation and monitoring:

- Re-check snippets for top URLs after recrawl.
- Validate canonical tags and redirect chains.
- Test non-browser fetch behavior for 403/429 regressions.
- Assign a recrawl/verification owner per changed P0/P1 URL.
- Search snippet and indexing changes may lag content updates; verify after recrawl and allow for normal search refresh delay.

## 11) Success Criteria

- One canonical brand string shown across indexed titles.
- Homepage/archive snippets no longer start with template/furniture text.
- Clear audience pathways from `Start Here` with reduced intent mixing.
- WorkSafeBC traffic lands primarily in WorkSafeBC lane pages.
- No unexplained 403/429 for legitimate non-browser fetchers.
