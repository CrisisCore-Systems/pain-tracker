# Week 1 UI Control-Plane Finish Checklist

Date: 2026-03-12
Owner: Kay
Source payload: `docs/seo/WEEK1_P0_EXECUTION_PAYLOAD.md`

Purpose: finish the three remaining Week 1 surfaces that are not covered by post API automation.

## Platform Constraints (Confirmed)

- Homepage structure/layout is not editable in current Hashnode plan/control surface.
- `https://blog.paintracker.ca/archive` is not an editable static page in this publication.
- Editable substitutes in this publication are static pages such as:
  - `https://blog.paintracker.ca/page/why-pain-tracker`
  - `https://blog.paintracker.ca/page/contribute`

Execution rule under constraints:

- Treat homepage as `metadata-only` for Week 1.
- Replace archive slot with `Why Pain Tracker` static page optimization.

## Security Gate

- Rotate the recently exposed Hashnode token before any further API/UI operations.
- Clear old token from terminal session(s):

```powershell
$env:HASHNODE_TOKEN=""
```

## 1) StaticPage: `/page/start-here`

Target URL: `https://blog.paintracker.ca/page/start-here`

Apply in Hashnode Static Page editor:

- Title: `Start Here`
- SEO Title: `Start Here: Choose Your Path with Pain Tracker`
- Meta Description: `New to Pain Tracker? Choose a clear path for patients, builders, or WorkSafeBC claim documentation workflows.`
- H1: `Start Here`
- Intro paragraph:
  `Choose the path that matches your goal: track pain privately, explore the technical architecture, or follow WorkSafeBC documentation workflows.`
- Route cards:
  - `For Patients` -> `https://blog.paintracker.ca/for-patients`
  - `For Builders` -> `https://blog.paintracker.ca/for-builders`
  - `WorkSafeBC` -> `https://blog.paintracker.ca/worksafebc`

Verification required before tracker flip:

- Rendered page content reflects route-hub copy (legacy "Welcome to Pain Tracker Blog" removed).
- Rendered `<title>` matches target SEO title.
- Rendered description meta matches target description.
- Canonical is self-referencing.

## 2) Publication Settings: Homepage

Target URL: `https://blog.paintracker.ca/`

Apply in publication settings/UI:

- SEO Title: `Pain Tracker Blog: Private, Offline-First Chronic Pain Tracking`
- Meta Description: `Privacy-first chronic pain tracking with no accounts and local-only data. Learn how to track flares, spot patterns, and prepare for appointments.`

If structure controls are unavailable, do not block Week 1 on H1/intro edits.
Only enforce metadata plus visible `Start Here` path.

Verification:

- Rendered homepage title/description match targets.
- Homepage `Start Here` path is visible and points to `https://blog.paintracker.ca/page/start-here`.
- Canonical is self-referencing.

## 3) StaticPage: `/page/why-pain-tracker` (Archive Replacement)

Target URL: `https://blog.paintracker.ca/page/why-pain-tracker`

Apply in Hashnode Static Page editor:

- Title: `Why Pain Tracker`
- SEO Title: `Why Pain Tracker: Privacy-First, Offline-First by Design`
- Meta Description: `Why Pain Tracker was built: private, offline-first pain tracking with no accounts, local-first storage, and practical support for real-world care workflows.`
- H1: `Why Pain Tracker`
- Intro paragraph:
  `Pain Tracker was built to keep pain records private, reliable offline, and useful in real care workflows without requiring accounts or centralized data collection.`

Guardrail:

- Keep messaging plain and claim-safe; avoid overclaim language.

Verification:

- Rendered title/description match targets.
- Intro copy is visible and matches intent.
- Canonical is self-referencing.

## 4) StaticPage: `/page/contribute` (Support Surface)

Target URL: `https://blog.paintracker.ca/page/contribute`

Apply in Hashnode Static Page editor:

- Title: `Contribute`
- SEO Title: `Contribute to Pain Tracker`
- Meta Description: `Contribute to Pain Tracker through code, testing, docs, accessibility feedback, or lived-experience-informed improvements.`
- H1: `Contribute`
- Intro paragraph:
  `Help improve Pain Tracker with code, docs, testing, and accessibility feedback while preserving privacy-first and offline-first principles.`

Verification:

- Rendered title/description match targets.
- Intro copy is visible and matches contribution intent.
- Canonical is self-referencing.

## Tracker Update Rules (After Each Surface)

When each surface is visibly live:

- Set `Live Published = Yes` for that row.
- Set `Canonical Verified = Yes` and `Indexability Verified = Yes` only after checks pass.
- Set `Submitted for Recrawl = Yes` after submission.
- Keep `Snippet Checked = No` until search results reflect updated snippet/title.
