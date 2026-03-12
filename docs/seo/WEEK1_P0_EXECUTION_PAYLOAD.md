# Week 1 P0 Execution Payload

Date: 2026-03-11  
Owner: Kay  
Source tracker: `docs/seo/BLOG_EXECUTION_TRACKER.md`

Decision locked for Week 1:

- Homepage role: `Patients-first`
- Rationale: keep intent clean on `/` and use `/page/start-here` as the route hub.

Platform constraint override (confirmed in live publication):

- Homepage structure is not editable from current control plane.
- Archive page is not an editable static page surface for this publication.
- Week 1 replacement targets: `https://blog.paintracker.ca/page/why-pain-tracker` and `https://blog.paintracker.ca/page/contribute`.

## 1) `https://blog.paintracker.ca/` (Homepage)

- SEO Title: `Pain Tracker Blog: Private, Offline-First Chronic Pain Tracking`
- Meta Description: `Privacy-first chronic pain tracking with no accounts and local-only data. Learn how to track flares, spot patterns, and prepare for appointments.`

If homepage structure is locked, treat this as metadata-only plus route-path verification:

- Confirm visible link/path to `https://blog.paintracker.ca/page/start-here`.

Post-change tracker updates:

- `Content Updated` -> `Yes`
- `Metadata Updated` -> `Yes`
- `CTA Target Verified` -> `Yes`
- `Lane Confirmed` -> `Yes`
- `Overall Status` -> `In progress` (or `Done` if internal links also complete)

## 2) `https://blog.paintracker.ca/page/start-here` (Route Hub)

- SEO Title: `Start Here: Choose Your Path with Pain Tracker`
- Meta Description: `New to Pain Tracker? Choose a clear path for patients, builders, or WorkSafeBC claim documentation workflows.`
- H1: `Start Here`
- Intro paragraph (snippet-safe):
  `Choose the path that matches your goal: track pain privately, explore the technical architecture, or follow WorkSafeBC documentation workflows.`
- Required route cards:
  - `For Patients` -> `https://blog.paintracker.ca/for-patients`
  - `For Builders` -> `https://blog.paintracker.ca/for-builders`
  - `WorkSafeBC` -> `https://blog.paintracker.ca/worksafebc`

Dependency guard:

- Do not set `Internal Links Updated` to `Yes` until all three lane destinations are live and reachable.

Post-change tracker updates:

- `Content Updated` -> `Yes`
- `Metadata Updated` -> `Yes`
- `Internal Links Updated` -> `Yes` (once all three lane links are live)
- `CTA Target Verified` -> `Yes`
- `Lane Confirmed` -> `Yes`

## 3) `https://blog.paintracker.ca/page/why-pain-tracker` (Why Page Replacement)

- SEO Title: `Why Pain Tracker: Privacy-First, Offline-First by Design`
- Meta Description: `Why Pain Tracker was built: private, offline-first pain tracking with no accounts, local-first storage, and practical support for real-world care workflows.`
- H1: `Why Pain Tracker`
- Intro paragraph (snippet-safe):
  `Pain Tracker was built to keep pain records private, reliable offline, and useful in real care workflows without requiring accounts or centralized data collection.`
- CTA behavior:
  - Keep one clear path to `https://blog.paintracker.ca/page/start-here` or `https://paintracker.ca/app`.
  - Avoid overclaim language and affiliation implications.

Post-change tracker updates:

- `Content Updated` -> `Yes`
- `Metadata Updated` -> `Yes`
- `Lane Confirmed` -> `Yes`

## 3b) `https://blog.paintracker.ca/page/contribute` (Support Surface)

- SEO Title: `Contribute to Pain Tracker`
- Meta Description: `Contribute to Pain Tracker through code, testing, docs, accessibility feedback, or lived-experience-informed improvements.`
- H1: `Contribute`
- Intro paragraph (snippet-safe):
  `Help improve Pain Tracker with code, docs, testing, and accessibility feedback while preserving privacy-first and offline-first principles.`

Post-change tracker updates:

- `Content Updated` -> `Yes`
- `Metadata Updated` -> `Yes`
- `Lane Confirmed` -> `Yes`

## 4) `https://blog.paintracker.ca/stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free`

- SEO Title: `Generate WorkSafeBC-Ready Documentation with Pain Tracker`
- Meta Description: `Generate WorkSafeBC-ready documentation faster with structured pain logs, export-ready records, and privacy-first local data handling.`
- H1: `Generate WorkSafeBC-Ready Documentation with Pain Tracker`
- Intro paragraph (snippet-safe):
  `This guide explains how to produce WorkSafeBC-ready documentation from structured pain records while keeping health data local on your device.`
- Primary CTA:
  - Label: `View WorkSafeBC Guide`
  - Target: `https://blog.paintracker.ca/worksafebc`

Language guardrail:

- Avoid implying official affiliation or government-managed form completion.

Post-change tracker updates:

- `Content Updated` -> `Yes`
- `Metadata Updated` -> `Yes`
- `CTA Target Verified` -> `Yes`
- `Lane Confirmed` -> `Yes`

## 5) `https://blog.paintracker.ca/paintracker-privacy-first-trauma-informed-pain-app`

- SEO Title: `Pain Tracker: Privacy-First, Trauma-Informed Pain App`
- Meta Description: `Track flares, spot patterns, prepare for appointments, and keep records private. Pain Tracker works offline with no account required.`
- H1: `Pain Tracker: Privacy-First, Trauma-Informed Pain App`
- Intro paragraph (snippet-safe):
  `Pain Tracker helps you track chronic pain privately, identify patterns over time, and prepare for appointments without creating an account.`
- Primary CTA:
  - Label: `Open the App`
  - Target: `https://paintracker.ca/app`

Post-change tracker updates:

- `Content Updated` -> `Yes`
- `Metadata Updated` -> `Yes`
- `CTA Target Verified` -> `Yes`
- `Lane Confirmed` -> `Yes`

## Week 1 Verification Pass (after publish)

For each updated P0 URL:

- Submit URL for recrawl in Search Console.
- Confirm canonical is self-referencing.
- Confirm indexability (no accidental noindex/blocking).
- Check search snippet lead text once recrawled.
- Update tracker fields truthfully:
  - `Submitted for Recrawl`
  - `Canonical Verified`
  - `Indexability Verified`
  - `Snippet Checked`

If anything fails, log it in `Validation Issues Log` immediately with `Date Found`.

## Recommended Week 1 Publish Order

1. `https://blog.paintracker.ca/` (homepage)
2. `https://blog.paintracker.ca/paintracker-privacy-first-trauma-informed-pain-app`
3. `https://blog.paintracker.ca/stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free`
4. `https://blog.paintracker.ca/page/why-pain-tracker`
5. `https://blog.paintracker.ca/page/contribute`
6. `https://blog.paintracker.ca/page/start-here` (last unless all three hub URLs are already live)

Tracker integrity note:

- Week 1 homepage internal-link completion criteria:
  - Minimum required: primary `Start Here` CTA is live and points to `https://blog.paintracker.ca/page/start-here`.
  - Optional (does not block Week 1 `Done`): additional footer/nav links to patient paths.
- Homepage `Overall Status` stays `In progress` until the minimum required internal-link criterion is satisfied.
- Set homepage `Overall Status` to `Done` only when all Week 1 homepage criteria are satisfied.
