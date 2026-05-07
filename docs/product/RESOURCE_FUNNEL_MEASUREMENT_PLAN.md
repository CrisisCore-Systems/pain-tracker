# Resource Funnel Measurement Plan

## Purpose

Define a reviewable measurement plan for the public resource funnel without weakening the repo's privacy, local-first, and exposure-minimization commitments.

This document is intentionally a plan, not an approval to ship new telemetry.

## Problem Statement

The highest-leverage public path is:

`resource landing page -> CTA click -> app open -> first useful record -> return -> summary/export -> upgrade consideration`

The product currently has strong acquisition surfaces, but growth decisions
should not be driven by guesswork. The project still needs a measurement
approach that does not collect health content, does not silently expand
exposure, and does not move essential workflows into remote dependence.

## Protective Boundary

The following constraints are mandatory:

- No health-entry content, symptom text, medications, notes, attachments, export contents, or claim details may enter measurement systems.
- No remote measurement inside core logging flows unless explicitly reviewed and approved.
- No hidden telemetry in the app's essential local workflows.
- Any future public-site measurement must remain coarse, non-reconstructive, and easy to disable.
- Any in-product activation tracking should default to local-only state first.

## Measurement Questions

These are the questions worth answering first:

1. Which resource pages bring people into the app?
2. Which CTA type works better on each intent page: `start free`, `download printable`, or `prepare records`?
3. After arriving from a resource page, do people create a first pain entry?
4. Do they return within 3 days?
5. Do they reach a meaningful outcome such as pattern review, summary view, or export?
6. Do they view upgrade surfaces only after a meaningful outcome?

## Allowed Event Shape

If measurement is approved, the initial public-site event schema should be limited to coarse acquisition metadata only.

Allowed fields:

- `event_name`
- `page_slug`
- `page_intent` (`printable`, `doctor`, `claims`, `general`)
- `cta_kind` (`start-free`, `download-printable`, `prepare-records`)
- `route_target` (`/start`, `/resources/...`, `/share-pain-records...`)
- `timestamp_bucket` (rounded, not exact interaction timelines)
- `referrer_class` (`search`, `direct`, `internal`, `campaign`, if available at coarse level)

Forbidden fields:

- free-text queries entered by the user
- symptoms, notes, medications, pain scores, body regions, or any entry-derived state
- IP retention beyond hosting/platform defaults
- user identity, email, account state, or stable cross-session identifiers
- export filenames or report content
- claim numbers or clinician names

## Measurement Phases

### Phase 0: No New Telemetry

Use only what already exists or is platform-provided outside the health record flow:

- search console impressions and clicks by landing page
- aggregate server or CDN page traffic if already available
- manual CTA audits and page-by-page conversion reviews
- qualitative review of which pages lead users into `/start`

This phase should answer whether the new landing-page copy and workflow visuals improve route clarity before any new event collection is proposed.

### Phase 1: Public Resource Funnel Only

If stronger evidence is required, limit measurement to the public website surface and only for acquisition handoff events:

- resource landing page viewed
- CTA clicked
- app shell opened from a resource page handoff

Requirements:

- no health data
- no persistent user profiling
- no hidden expansion into entry creation details
- explicit documentation update in the FAQ and privacy docs if enabled

### Phase 2: Local-Only Activation Signals

If product activation needs deeper understanding, keep the next layer on-device first:

- first entry created
- second entry created
- first summary or review surface opened
- first export initiated
- upgrade page viewed

Requirements:

- stored locally only
- surfaced to the user if possible as part of progress or continuity UX
- never sent remotely without a separate review and approval step

This phase is the safer route for answering activation and retention questions without widening exposure.

## Recommended Initial Funnel Definitions

These are the first funnel checkpoints worth reviewing:

1. `resource_visit`
2. `cta_click`
3. `app_open_from_resource`
4. `first_entry_local`
5. `second_entry_local`
6. `summary_or_pattern_view_local`
7. `export_start_local`
8. `upgrade_view_local`
9. `checkout_start_local`

Only `resource_visit`, `cta_click`, and `app_open_from_resource` should even be candidates for public-site measurement. The rest should remain local unless a stronger case is made.

## Review Checklist Before Any Implementation

Before implementing any part of this plan, answer:

1. What user benefit justifies this measurement?
2. Can the question be answered with search-console or aggregate page data instead?
3. Does the proposal collect anything reconstructive or health-adjacent?
4. Is the measurement limited to the public acquisition surface?
5. Does the app still work fully if the measurement code is disabled or blocked?
6. Are the docs truthful about what is and is not measured?

## Recommended Build Order

1. Improve landing-page conversion paths and workflow clarity first.
2. Review search-console and coarse traffic movement after those changes.
3. Only if evidence remains insufficient, propose Phase 1 public-site events for review.
4. Prefer Phase 2 local-only activation counters over remote in-product telemetry.

## Current Recommendation

Do not add new telemetry yet.

The repo should first use the strengthened resource pages, clearer CTA paths,
and the new workflow visuals to reduce ambiguity. Then review whether
search-console and public-page aggregates are enough to identify which resource
pages actually drive app starts.

## Implementation Status

The shared resource CTA surfaces now have coarse click instrumentation paths for:

- `resource_start_tracking_free_click`
- `resource_printable_download_click`

These events are limited to:

- `resource_page_slug`
- `resource_page_type`
- `resource_cta_location`
- `route_target`

This does not change the current network posture by itself.

- The analytics env flag must still be enabled.
- Explicit analytics consent must still be granted.
- The current analytics loader remains a no-op, so outbound third-party analytics is still disabled unless separately reviewed.

Operational review should use the command board in `docs/product/RESOURCE_PAGE_COMMAND_BOARD.md` together with search-console data and approved activation/export metrics.
