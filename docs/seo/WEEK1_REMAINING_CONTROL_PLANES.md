# Week 1 Remaining Control Planes

Date: 2026-03-12
Owner: Kay

Purpose: Execute remaining Week 1 P0 changes on non-post surfaces.

## Confirmed Control Planes

- Post updates: API path works (`updatePost`) and is already used for privacy + WorkSafeBC.
- Page-route updates: `/page/start-here` is a static page entity, not the post slug entity.
- Publication settings: homepage + archive behavior remains publication-level settings work.

## A) Static Page Entity: `/page/start-here`

Entity evidence:

- Route: `https://blog.paintracker.ca/page/start-here`
- Static page slug: `start-here`
- Static page id: `694d16d30f4d10c02c35296b`
- Current first markdown line: `# Welcome to Pain Tracker Blog`
- Current SEO fields: empty

Apply this payload to the static page entity:

- Title: `Start Here`
- SEO Title: `Start Here: Choose Your Path with Pain Tracker`
- Meta Description: `New to Pain Tracker? Choose a clear path for patients, builders, or WorkSafeBC claim documentation workflows.`
- Intro paragraph:
  `Choose the path that matches your goal: track pain privately, explore the technical architecture, or follow WorkSafeBC documentation workflows.`
- Required route cards:
  - `For Patients` -> `https://blog.paintracker.ca/for-patients`
  - `For Builders` -> `https://blog.paintracker.ca/for-builders`
  - `WorkSafeBC` -> `https://blog.paintracker.ca/worksafebc`

Tracker rule:

- Keep `Live Published = No` until the public route reflects the above payload.

## B) Publication Settings: Homepage

Route: `https://blog.paintracker.ca/`

Apply:

- SEO Title: `Pain Tracker Blog: Private, Offline-First Chronic Pain Tracking`
- Meta Description: `Privacy-first chronic pain tracking with no accounts and local-only data. Learn how to track flares, spot patterns, and prepare for appointments.`
- H1/lead intent: `Pain Tracker Blog`
- Intro paragraph:
  `Pain Tracker is a privacy-first, offline-first chronic pain tracking app that helps you keep reliable records without surveillance.`
- Primary CTA:
  - Label: `Start Here`
  - Target: `https://blog.paintracker.ca/page/start-here`

## C) Publication Settings: Archive

Route: `https://blog.paintracker.ca/archive`

Apply:

- SEO Title: `Pain Tracker Blog Archive`
- Meta Description: `Browse all Pain Tracker posts by topic and date, including privacy-first tracking, accessibility, engineering, and WorkSafeBC workflows.`
- H1: `Archive`
- Intro paragraph:
  `Browse every article by date and topic, from patient guidance to technical architecture and WorkSafeBC-focused documentation resources.`

Guardrail:

- Keep archive browsing-neutral.

## Verification Sequence (Only For Truly Live Surfaces)

1. Confirm public render reflects new title + intro.
2. Confirm canonical is self-referencing.
3. Confirm indexability (no `noindex`, no accidental blocking).
4. Submit recrawl for changed URLs.
5. Update tracker fields truthfully per URL.

Live-first rule:

- Do not mark verification fields for `page/start-here` until the static page route visibly changes.

## D) Post-Level Rendered Metadata Second Pass

Newly confirmed API capability:

- `updatePost` supports `metaTags` with `title` and `description`.

Use this when H1/body is live but rendered `<title>` is still stale:

- Script: `scripts/publishing/hashnode/week1-p0-fix-rendered-metadata.cjs`
- Targets:
  - `paintracker-privacy-first-trauma-informed-pain-app`
  - `stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free`

Run sequence:

1. Rotate token in Hashnode dashboard.
2. Set new token in shell.
3. Dry run metadata fixer.
4. Execute metadata fixer.
5. Verify rendered metadata in browser for each target URL:
  - `document.title` matches Week 1 SEO title.
  - `<meta name="description">` matches Week 1 meta description.
  - canonical remains self-referencing.
6. Close `rendered-metadata drift` issues only after both fields match.
