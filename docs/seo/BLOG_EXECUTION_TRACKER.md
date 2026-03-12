# blog.paintracker.ca Execution Tracker

Version: 1.0  
Date: 2026-03-11  
Source spec: `docs/seo/BLOG_URL_REWRITE_MAP.md`

Use this tracker to prevent rollout drift. Update row status after each change.

Default owner: `Kay` (override per row when delegated).

## Status Legend

- `Not started`: all core fields are `No`.
- `In progress`: any of `Content Updated`, `Metadata Updated`, `Internal Links Updated`, or `CTA Target Verified` is `Yes`.
- `Done`: `Content Updated`, `Metadata Updated`, `Internal Links Updated`, `CTA Target Verified`, and `Lane Confirmed` are all `Yes`.
- `Verified`: `Done` plus `Canonical Verified`, `Indexability Verified`, `Submitted for Recrawl`, and `Snippet Checked` are all `Yes`.

Staged vs live rule:

- `Content Updated` and `Metadata Updated` can be `Yes` when staged in repo-controlled drafts.
- `Live Published` must be `Yes` before recrawl/canonical/indexability/snippet verification fields can be marked complete.

Platform-constraint rule:

- `Metadata Updated` may be `Yes` when metadata fields were applied in UI/API but the template renders constrained output (for example title parity not fully honored).
- When this happens, keep a corresponding `Validation Issues Log` entry open and describe the rendered-vs-target delta.

## Trust Receipt Cross-Links

Use these trust artifacts as the verification layer for SEO/content rollout changes:

- Defensibility packet: `docs/trust/defensibility-packet.md`
- Dated release evidence: `docs/trust/release-evidence-2026-03-12.md`
- Pv execution log: `docs/trust/pv-log-2026-03-12.md`
- Scenario protocol: `docs/trust/scenario-test-protocol.md`
- Gating policy: `docs/trust/release-gating-policy.md`

Cross-link rules:

- When recrawl submission status changes for any row, update the dated trust evidence file with URL list, submission timestamps, and verification method (manual GSC vs scripted).
- Any SEO blocker marked `Accepted Constraint` must also be reflected under trust `Exceptions` with mitigation language.

## P0 and P1 URL Tracker

| Priority | URL | Lane | Owner | Target Week | Live Published | Content Updated | Metadata Updated | Internal Links Updated | CTA Target Verified | Lane Confirmed | Canonical Verified | Redirect Verified | Submitted for Recrawl | Snippet Checked | Indexability Verified | Overall Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P0 | `https://blog.paintracker.ca/` | Patients | `Kay` | `Week 1` | `No` | `Yes` | `Yes` | `No` | `Yes` | `Yes` | `No` | `N/A` | `No` | `No` | `No` | `In progress` | UI publish still pending for publication-level homepage settings. Browser checks (`?verify=20260311a`, `?verify=20260311-h1`) show legacy rendered title/description, canonical `https://blog.paintracker.ca`, visible `Start Here` path, and no rendered `<h1>` in homepage template output. |
| P0 | `https://blog.paintracker.ca/page/start-here` | Route Hub | `Kay` | `Week 1` | `Yes` | `Yes` | `Yes` | `No` | `Yes` | `Yes` | `Yes` | `N/A` | `No` | `No` | `Yes` | `In progress` | Static page update is live. Browser check (`?verify=20260311c`) shows updated route-hub intro and description, canonical `https://blog.paintracker.ca/page/start-here`, and no robots noindex detected. Remaining gaps: rendered title is `Start Here` (not target SEO title string) and links do not point to `/for-patients`, `/for-builders`, `/worksafebc`. |
| P0 | `https://blog.paintracker.ca/archive` | Route Hub | `Kay` | `Week 1` | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` | `N/A` | `Deferred` | Publication constraint: archive is not an editable static page/control surface in current setup. Removed from Week 1 blocking scope due to unavailable control surface. Keep observed baseline only. |
| P0 | `https://blog.paintracker.ca/page/why-pain-tracker` | Patients | `Kay` | `Week 1` | `Yes` | `Yes` | `Yes` | `No` | `No` | `Yes` | `Yes` | `N/A` | `No` | `No` | `Yes` | `In progress` | Replacement target for unavailable archive control plane is now live with updated intro and description. Browser check (`?verify=20260311c`) confirms canonical `https://blog.paintracker.ca/page/why-pain-tracker` and no robots noindex detected. Metadata was applied in UI; remaining metadata gap is title parity (`Why Pain Tracker` vs longer target SEO title). |
| P0 | `https://blog.paintracker.ca/page/contribute` | Builders | `Kay` | `Week 1` | `Yes` | `Yes` | `Yes` | `No` | `No` | `Yes` | `Yes` | `N/A` | `No` | `No` | `Yes` | `In progress` | Replacement support surface is now live with updated intro and description. Browser check (`?verify=20260311c`) confirms canonical `https://blog.paintracker.ca/page/contribute` and no robots noindex detected. Metadata was applied in UI; remaining metadata gap is title parity (`Contribute` vs `Contribute to Pain Tracker`). |
| P0 | `https://blog.paintracker.ca/stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free` | WorkSafeBC / Claims | `Kay` | `Week 1` | `Yes` | `Yes` | `Yes` | `No` | `Yes` | `Yes` | `Yes` | `N/A` | `No` | `No` | `Yes` | `In progress` | Published by Hashnode API on 2026-03-12. H1/body update is live, canonical is self-referencing, and no robots noindex detected. Rendered metadata drift was repaired via `week1-p0-fix-rendered-metadata.cjs`; browser verification passed. |
| P0 | `https://blog.paintracker.ca/paintracker-privacy-first-trauma-informed-pain-app` | Patients | `Kay` | `Week 1` | `Yes` | `Yes` | `Yes` | `No` | `Yes` | `Yes` | `Yes` | `N/A` | `No` | `No` | `Yes` | `In progress` | Published by Hashnode API on 2026-03-12. H1/body update is live, canonical is self-referencing, and no robots noindex detected. Rendered metadata drift was repaired via `week1-p0-fix-rendered-metadata.cjs`; browser verification passed. |
| P1 | `https://blog.paintracker.ca/how-pain-tracker-pro-streamlines-worksafebc-claims-a-composite-case-study` | WorkSafeBC / Claims | `Kay` | `Week 2` | `No` | `No` | `No` | `No` | `No` | `No` | `No` | `No` | `No` | `No` | `No` | `Not started` | If slug changes, verify 301 chain. |
| P1 | `https://blog.paintracker.ca/paintracker-worksafebc-claims` | WorkSafeBC / Claims | `Kay` | `Week 2` | `No` | `No` | `No` | `No` | `No` | `No` | `No` | `N/A` | `No` | `No` | `No` | `Not started` | Ensure CTA alignment with WorkSafeBC hub and app. |
| P1 | `https://blog.paintracker.ca/the-day-i-decided-my-pain-app-didnt-need-a-server-what-i-learned-building-healthcare-software-that-lives-entirely-on-your-device` | Builders | `Kay` | `Week 2` | `No` | `No` | `No` | `No` | `No` | `No` | `No` | `N/A` | `No` | `No` | `No` | `Not started` | Keep technical lane context. |
| P1 | `https://blog.paintracker.ca/offline-first-pwas-why-they-matter-for-crisis-responsive-health-tech` | Builders | `Kay` | `Week 2` | `No` | `No` | `No` | `No` | `No` | `No` | `No` | `N/A` | `No` | `No` | `No` | `Not started` | Keep technical lane context. |
| P1 | `https://blog.paintracker.ca/building-software-that-actually-gives-a-damn-my-journey-with-trauma-informed-design` | Builders | `Kay` | `Week 3` | `No` | `No` | `No` | `No` | `No` | `No` | `No` | `N/A` | `No` | `No` | `No` | `Not started` | If memoir overlap exists, use one labeled bridge to Founder Journal. |
| P1 | `https://blog.paintracker.ca/building-a-pain-tracker-that-actually-gets-it-no-market-research-required` | Builders | `Kay` | `Week 3` | `No` | `No` | `No` | `No` | `No` | `No` | `No` | `N/A` | `No` | `No` | `No` | `Not started` | Lead paragraph must be snippet-safe summary. |

## Founder Journal Re-scope Tracker

Status rule for this tracker:

- `Not started`: all action fields are `No`.
- `In progress`: any action field is `Yes`.
- `Done`: `Lane Placement Updated`, `One End Bridge Link Applied`, `Repeated Product CTAs Removed`, and `Related Module Labeled/Removed` are all `Yes`.

| URL | Owner | Target Week | Lane Placement Updated | One End Bridge Link Applied | Repeated Product CTAs Removed | Related Module Labeled/Removed | Overall Status | Notes |
|---|---|---|---|---|---|---|---|---|
| `https://blog.paintracker.ca/coding-through-collapse` | `Kay` | `Week 3` | `No` | `No` | `No` | `No` | `Not started` | Keep one controlled bridge link near end. |
| `https://blog.paintracker.ca/four-months-on-the-floor` | `Kay` | `Week 3` | `No` | `No` | `No` | `No` | `Not started` | Journal-only context. |
| `https://blog.paintracker.ca/understanding-collapse-a-comprehensive-guide` | `Kay` | `Week 3` | `No` | `No` | `No` | `No` | `Not started` | Choose one final lane. |

## Hub and Routing Tracker

Status rule for this tracker:

- `Not started`: all action fields are `No`.
- `In progress`: `Draft Complete` or `Published` is `Yes`.
- `Done`: `Published`, `Linked from Start Here`, `Linked from Homepage`, `Snippet-Safe Intro Confirmed`, and `Canonical Checked` are all `Yes`.

| Item | Target URL | Owner | Target Week | Draft Complete | Published | Linked from Start Here | Linked from Homepage | Snippet-Safe Intro Confirmed | Canonical Checked | Overall Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Patients hub | `https://blog.paintracker.ca/for-patients` | `Kay` | `Week 2` | `No` | `No` | `No` | `No` | `No` | `No` | `Not started` | Patient phrases: track flares, spot patterns, prepare for appointments, keep records private. |
| Builders hub | `https://blog.paintracker.ca/for-builders` | `Kay` | `Week 2` | `No` | `No` | `No` | `No` | `No` | `No` | `Not started` | Technical focus only. |
| WorkSafeBC hub | `https://blog.paintracker.ca/worksafebc` | `Kay` | `Week 2` | `No` | `No` | `No` | `No` | `No` | `No` | `Not started` | WorkSafeBC-ready phrasing only. |
| Founder Journal hub | `https://blog.paintracker.ca/founder-journal` | `Kay` | `Week 3` | `No` | `No` | `No` | `No` | `No` | `No` | `Not started` | Keep separate from patient/builders nav paths. |

## Weekly Checkpoint Log

| Date | Week | Owner | Completed Items | Blockers | Next Actions | Observed Search/Traffic Changes |
|---|---|---|---|---|---|---|
| `2026-03-11` | `Week 1` | `Kay` | `Staged Start Here, WorkSafeBC, homepage, archive, and privacy-explainer copy in source-controlled drafts/CMS blocks. Captured live pre-publish baseline in docs/seo/WEEK1_P0_PREPUBLISH_BASELINE.md. Added scripts/publishing/hashnode/week1-p0-api-checklist.cjs, scripts/publishing/hashnode/week1-p0-update-posts.cjs, and scripts/publishing/hashnode/week1-p0-fix-rendered-metadata.cjs. Published privacy + WorkSafeBC post-level updates via Hashnode API and verified live H1/body shifts. Repaired rendered metadata drift and re-verified rendered title/description/canonical for both live post URLs in browser. Re-scoped remaining UI work to controllable surfaces and verified live updates on `/page/start-here`, `/page/why-pain-tracker`, and `/page/contribute` (description + intro + canonical/indexability checks passed).` | `Homepage metadata still renders legacy title/description. Start Here title string and route-card destination URLs do not match strict Week 1 target set. Why/Contribute title strings do not reflect target SEO-title variants.` | `Update homepage publication SEO title/description if available; otherwise mark as platform-limited. Resolve remaining static-page title behavior or accept title-as-page-name constraint and record exception. Submit recrawl for updated static pages once final title decisions are locked. Record recrawl submission receipts in docs/trust/release-evidence-2026-03-12.md.` | `None yet` |
| `YYYY-MM-DD` | `Week 2` | `Kay` | `TBD` | `TBD` | `TBD` | `None yet` |
| `YYYY-MM-DD` | `Week 3` | `Kay` | `TBD` | `TBD` | `TBD` | `None yet` |
| `YYYY-MM-DD` | `Week 4` | `Kay` | `TBD` | `TBD` | `TBD` | `None yet` |

## Validation Issues Log

Use this to track anomalies discovered during verification instead of burying them in weekly notes.

Fix Status values:

- `Open`: identified and not yet worked.
- `In progress`: being actively worked.
- `Closed`: verified resolved in rendered output.
- `Accepted Constraint`: attempted via available UI/API surface, verified as platform-limited, intentionally non-blocking for rollout.

| Date Found | URL | Issue Found | Type | Severity | Owner | Fix Status | Notes |
|---|---|---|---|---|---|---|---|
| `2026-03-12` | `https://blog.paintracker.ca/page/start-here` | `Page route still shows legacy "Welcome to Pain Tracker Blog" content after API update of slug start-here post.` | `route/entity mismatch` | `High` | `Kay` | `Closed` | `Resolved via static page UI update. Browser verification on 2026-03-12 (`?verify=20260311c`) confirms legacy content removed, updated intro and description visible, and canonical self-referencing.` |
| `2026-03-12` | `https://blog.paintracker.ca/page/why-pain-tracker` | `Rendered HTML has no meta description.` | `metadata gap` | `Medium` | `Kay` | `Closed` | `Resolved via static page UI update. Browser verification on 2026-03-12 (`?verify=20260311c`) confirms description present and canonical self-referencing.` |
| `2026-03-12` | `https://blog.paintracker.ca/page/contribute` | `Rendered HTML has no meta description.` | `metadata gap` | `Medium` | `Kay` | `Closed` | `Resolved via static page UI update. Browser verification on 2026-03-12 (`?verify=20260311c`) confirms description present and canonical self-referencing.` |
| `2026-03-12` | `https://blog.paintracker.ca/page/start-here` | `Rendered title does not match target SEO title string.` | `title parity gap` | `Low` | `Kay` | `Accepted Constraint` | `Attempted via current Hashnode static-page UI. Rendered title remains page-name-only (`Start Here`). Keeping description/canonical/introduction improvements; no longer blocking rollout.` |
| `2026-03-12` | `https://blog.paintracker.ca/page/start-here` | `Route cards do not point to /for-patients, /for-builders, /worksafebc.` | `routing parity gap` | `Medium` | `Kay` | `Open` | `Still actionable and expected to resolve in Week 2 when lane hubs are published and linked.` |
| `2026-03-12` | `https://blog.paintracker.ca/page/why-pain-tracker` | `Rendered title does not match target SEO title string.` | `title parity gap` | `Low` | `Kay` | `Accepted Constraint` | `Attempted via current Hashnode static-page UI. Rendered title remains page-name-only (`Why Pain Tracker`). Keeping description/canonical/introduction improvements; no longer blocking rollout.` |
| `2026-03-12` | `https://blog.paintracker.ca/page/contribute` | `Rendered title does not match target SEO title string.` | `title parity gap` | `Low` | `Kay` | `Accepted Constraint` | `Attempted via current Hashnode static-page UI. Rendered title remains page-name-only (`Contribute`). Keeping description/canonical/introduction improvements; no longer blocking rollout.` |
| `2026-03-12` | `https://blog.paintracker.ca/` | `Homepage renders without an <h1> in page body (Bing SEO high-severity flag).` | `template heading gap` | `High` | `Kay` | `Accepted Constraint` | `Attempted via available publication controls; homepage structure is locked in current Hashnode control plane and does not expose body heading insertion. Verification shows 0 h1 on homepage (`?verify=20260311-h1`) while static pages include h1 tags. Mitigation: keep prominent crawlable route to `/page/start-here` (which has rendered h1) and treat as non-blocking unless homepage template controls become available.` |
| `2026-03-12` | `https://blog.paintracker.ca/` | `Homepage rendered title/description still on legacy publication values.` | `publication metadata gap` | `Medium` | `Kay` | `Open` | `Browser verification on 2026-03-12 (`?verify=20260311c`) shows title `PainTracker - Privacy First Chronic Pain Tracking` and legacy description; canonical and Start Here path are present.` |
| `2026-03-12` | `https://blog.paintracker.ca/paintracker-privacy-first-trauma-informed-pain-app` | `Rendered HTML metadata still shows legacy values despite updated H1/body.` | `rendered-metadata drift` | `Medium` | `Kay` | `Closed` | `Repaired via scripts/publishing/hashnode/week1-p0-fix-rendered-metadata.cjs. Browser verification passed: rendered <title>, <meta name="description">, and canonical all match Week 1 targets (checked with cache-bust query on 2026-03-12).` |
| `2026-03-12` | `https://blog.paintracker.ca/stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free` | `Rendered HTML metadata still shows legacy values despite updated H1/body.` | `rendered-metadata drift` | `Medium` | `Kay` | `Closed` | `Repaired via scripts/publishing/hashnode/week1-p0-fix-rendered-metadata.cjs. Browser verification passed: rendered <title>, <meta name="description">, and canonical all match Week 1 targets (checked with cache-bust query on 2026-03-12).` |
