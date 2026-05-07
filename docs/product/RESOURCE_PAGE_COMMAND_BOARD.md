# Resource Page Command Board

## Purpose

Keep one reviewable table for the public resource funnel so search performance,
CTA clicks, first logs, and export behavior can be compared page by page.

This board is operational, not doctrinal.

## Current Data Status

As of 2026-05-06, this repository does not contain a committed Search Console export
or a committed activation/export snapshot for the five priority pages below.

That means the board can define the review surface now, but it cannot truthfully
claim real counts until those external numbers are imported.

Required import inputs:

- Landing-page Search Console export with `Impressions` and `Clicks`
- Approved CTA event rollup for `resource_start_tracking_free_click` and `resource_printable_download_click`
- Approved activation rollup for first `log_pain_entry` after the `/start` handoff
- Approved export rollup for `export_data`, `export_wcb_report`, or `generate_clinical_report`

## Guardrails

- Resource CTA click instrumentation is limited to coarse public-funnel metadata.
- No health-entry content, free text, or record details belong in this table.
- CTA click events remain behind the existing analytics env + consent gate.
- Outbound analytics loading remains disabled by the current no-op loader unless separately reviewed.
- First logs and export clicks should come from existing app events or approved local-only activation review, not new hidden telemetry.

## Metrics Sources

- `Impressions` and `Clicks`: search console or equivalent search-performance tooling.
- `CTA clicks`: `resource_start_tracking_free_click` and `resource_printable_download_click`.
- `First logs`: first `log_pain_entry` after `/start` handoff or approved local-only activation review.
- `Export clicks`: `export_data`, `export_wcb_report`, or `generate_clinical_report` depending on the flow.

## Priority Pages

| Page | Search intent | Impressions | Clicks | CTA clicks | First logs | Export clicks |
| ---- | ------------- | ----------: | -----: | ---------: | ---------: | ------------: |
| Monthly pain tracker printable | Printable monthly tracking for appointments and review | pending import | pending import | pending import | pending import | pending import |
| 7-day pain diary template | Fast one-week tracking before a doctor visit | pending import | pending import | pending import | pending import | pending import |
| WorkSafeBC pain journal template | Workplace injury documentation and claim support | pending import | pending import | pending import | pending import | pending import |
| Pain journal for disability benefits | Benefits-ready documentation for disability workflows | pending import | pending import | pending import | pending import | pending import |
| How to track pain for doctors | Appointment-prep and doctor communication guidance | pending import | pending import | pending import | pending import | pending import |

## Expansion Rows

| Page | Search intent | Impressions | Clicks | CTA clicks | First logs | Export clicks |
| ---- | ------------- | ----------: | -----: | ---------: | ---------: | ------------: |
| Daily pain tracker printable | Fast daily paper tracking | pending import | pending import | pending import | pending import | pending import |
| Symptom tracker printable | Broader symptom tracking before diagnosis or appointments | pending import | pending import | pending import | pending import | pending import |
| Pain diary for specialist appointment | Specialist prep and concise symptom summaries | pending import | pending import | pending import | pending import | pending import |
| Documenting pain for disability claim | Evidence-building guidance for claims | pending import | pending import | pending import | pending import | pending import |
| Resources index | Resource hub / comparison intent | pending import | pending import | pending import | pending import | pending import |

## Import Procedure

1. Export landing-page performance for the target date range from Search Console.
2. Prepare the approved CTA, first-log, and export rollups keyed by resource page slug, path, or URL.
3. Run `npm run resource-board:generate -- --search-console <search-console.csv> --cta <cta-rollup.json> --first-logs <first-logs.csv> --exports <exports.json> --write`.
4. Review the resulting table and note the date range used in the review notes or commit message.

## Review Cadence

1. Review top five pages weekly.
2. Mark which CTA location produced the click lift: hero, utility/download bar, outcome bridge, CTA stack, or bottom callout.
3. Compare CTA clicks to first logs before making more copy changes.
4. Prioritize pages where impressions and clicks are strong but CTA clicks or first logs stay weak.

## Decision Rules

1. High impressions + low clicks: fix title/meta/hero clarity.
2. High clicks + low CTA clicks: fix first-screen promise and CTA placement.
3. High CTA clicks + low first logs: fix `/start` handoff friction.
4. High first logs + low export clicks: improve summary/export bridge before pushing upgrade surfaces.
