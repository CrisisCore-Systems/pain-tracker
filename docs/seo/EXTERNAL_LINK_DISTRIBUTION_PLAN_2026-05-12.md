# External Link Distribution Plan (2026-05-12)

## Objective

Shift external-link authority from a homepage-heavy pattern to a multi-page pattern that better supports search intent for:

- private offline pain tracking
- free pain journal templates
- appointment prep summaries
- WorkSafeBC documentation workflows
- pricing intent

## Current risk

The backlink footprint is real, but target-page authority is concentrated.

- Multiple channels link repeatedly to one page.
- This weakens page-level topical ownership for resources, download, and pricing.
- Discovery signals exist, but category ownership signals remain under-distributed.

## Target shape (next milestone)

- 150 to 200 total external links
- 20 to 25 linking domains
- 8 to 12 distinct target pages
- Homepage share at or below 50 percent of external target links
- Direct external links growing for:
  - /resources
  - /download
  - /pricing
  - key resources subpages

## Priority target pages

Use these as the first deep-link set across owned and partner channels:

1. https://paintracker.ca/resources
2. https://paintracker.ca/download
3. https://paintracker.ca/pricing
4. https://paintracker.ca/resources/daily-pain-tracker-printable
5. https://paintracker.ca/resources/what-to-include-in-pain-journal
6. https://paintracker.ca/resources/doctor-visit-pain-summary-template
7. https://paintracker.ca/resources/worksafebc-pain-journal-template

## Anchor text pool (approved rotation)

Use varied but plain-language anchors. Avoid repeating one exact phrase at high frequency.

- private offline pain tracker
- download the free pain tracker
- chronic pain tracking resources
- free pain journal templates
- what to include in a pain journal
- pain journal for appointments
- WorkSafeBC pain documentation tool
- PainTracker pricing and upgrades

## Channel-by-channel action plan

### 1) CrisisCore owned properties (highest leverage first)

Add explicit deep links from CrisisCore pages to all priority target pages above.

Minimum deliverable:

- one link to homepage
- one link to download
- one link to resources
- one link to pricing
- one link to WorkSafeBC resource page

### 2) Dev.to (existing volume, currently concentrated)

Distribute page targets by article intent.

Mapping pattern:

- privacy architecture posts -> homepage or download
- IndexedDB/PWA implementation posts -> download + repo
- trauma-informed UX posts -> resources
- appointment workflow posts -> doctor-visit summary resource
- WorkSafeBC workflow posts -> WorkSafeBC resource page
- pricing/sustainability posts -> pricing page

Execution note:

- Use scripts/devto/link-distribution-report.mjs before and after sync-content updates.
- Keep homepage share trending down over time.

### 3) Hashnode

Mirror the same target-intent mapping as Dev.to.

- Update existing posts first.
- Then add deep links in new posts.

### 4) LinkedIn and Product Hunt

Use these as entity validators and intent routers.

- profile-level copy can still point to homepage
- post-level links should route to resources/download/pricing based on context

### 5) GitHub

Maintain a visible deep-link cluster in repository-facing surfaces.

- README should include direct links to resources, download, pricing, and key resource guides.
- Keep link text clear and intent-specific.

## KPIs and review cadence

Weekly checks:

1. Target-path distribution in Dev.to markdown sources.
2. Homepage share trend line.
3. Count of external links landing on deep resource pages.
4. Count of linking domains that point to non-homepage URLs.

Monthly checkpoint:

- verify no single domain dominates with one-page-only linking
- identify top two channels still over-concentrated and rebalance next month

## Operational checklist

1. Update owned-channel links first (CrisisCore).
2. Update Dev.to mapped links in existing high-traffic posts.
3. Update Hashnode mapped links in matching posts.
4. Update LinkedIn profile + two post-level deep links.
5. Verify README deep-link cluster remains current.
6. Record distribution snapshot in artifacts/devto/link-distribution-report.json.

## Guardrails

- Keep links context-relevant; do not force repetitive anchors.
- Preserve truthful claims and privacy boundary language.
- Do not describe legal or compliance guarantees beyond current documented scope.
- Prefer fewer high-context links over high-volume repetitive links.
