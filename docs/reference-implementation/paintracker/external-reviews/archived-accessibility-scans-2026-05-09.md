# Archived Accessibility Scan Artifacts (2026-05-09)

Status: Historical artifact index
Scope: Narrow external-review support package for degraded-mode accessibility review.

## Archive Roots

The scan runner writes raw output to local-only paths:

- `accessibility-reports/`
- `test-results/`
- `evidence/`

These paths are intentionally ignored because raw runs can be large, transient, and environment-specific. Check in curated summaries or explicit evidence packets instead of raw generated output.

## Historical Baseline Set

The May 2026 reviewer package referenced these local scan artifacts:

- `accessibility-reports/accessibility-report-dashboard-2026-05-03T00-38-38-487Z.html`
- `accessibility-reports/accessibility-report-dashboard-2026-05-03T00-38-38-508Z.json`
- `accessibility-reports/accessibility-report-calendar-2026-05-03T00-38-38-589Z.html`
- `accessibility-reports/accessibility-report-calendar-2026-05-03T00-38-38-592Z.json`
- `accessibility-reports/accessibility-report-analytics-2026-05-03T00-38-48-266Z.html`
- `accessibility-reports/accessibility-report-analytics-2026-05-03T00-38-48-280Z.json`

Those raw files are not treated as current source material. Re-run `npm run accessibility:scan` in a fresh environment when current evidence is needed.

## Intended Reviewer Use

1. Re-run the accessibility scan in the review environment.
2. Compare new findings against the dated summary or external-review notes.
3. Record deltas in a curated evidence packet.

## Boundaries

- This archive is evidence support material, not a certification claim.
- External reviewer conclusions must be documented separately.
- Missing raw scan files mean the evidence needs to be regenerated, not inferred.
