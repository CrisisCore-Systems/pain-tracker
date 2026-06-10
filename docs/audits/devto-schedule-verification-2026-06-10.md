# DEV.to Schedule Verification — 2026-06-10

## Verification Summary

On 2026-06-10, 10 DEV.to (Forem) articles were future-scheduled via the DEV API. Each article was set to `published: true` with a `published_at` timestamp in the future. Post-action verification confirmed that DEV's remote state matches the intended schedule.

## Remote Verification Method

- Endpoint: `GET /api/articles/me/all`
- No secrets, API keys, request headers, or raw tokens are included in this note.
- Verification was read-only; no mutations were made during the verification pass.

## Articles Verified

| ID | Title | Scheduled Timestamp (UTC) | Published | Future Schedule |
|---|---|---|---|---|
| 3845442 | What I Learned Building a Free Tool Before Anyone Asked for It | 2026-06-17T16:00:00Z | true | yes |
| 3845441 | Patient-Generated Reports Without Provider Integration | 2026-06-18T16:00:00Z | true | yes |
| 3845440 | Building Health-Adjacent Software Without Overclaiming | 2026-06-19T16:00:00Z | true | yes |
| 3845439 | A Small Checklist for Apps That Handle Vulnerable User Data | 2026-06-20T16:00:00Z | true | yes |
| 3845438 | The Export Button Is a Consent Boundary | 2026-06-21T16:00:00Z | true | yes |
| 3845437 | Why Accountless Core Use Matters in Sensitive Apps | 2026-06-22T16:00:00Z | true | yes |
| 3845436 | Offline-First Is Not a Feature. It Is a Failure Policy. | 2026-06-23T16:00:00Z | true | yes |
| 3845375 | Protective Computing: Software Should Fail Safely Under Stress | 2026-06-24T16:00:00Z | true | yes |
| 3845374 | The Architecture of a Local-First Pain Tracker | 2026-06-25T16:00:00Z | true | yes |
| 3845373 | I Built a Pain Tracker That Works When the User Is Not Okay | 2026-06-26T16:00:00Z | true | yes |

## Confirmation

- All 10 articles have `published: true`, `published_at` in the future, and matching `published_timestamp` values on DEV's servers.
- None are publicly visible yet; they will auto-publish at their scheduled timestamps.
- The schedule confirms a one-post-per-day cadence at 16:00 UTC (9:00 AM Pacific), suitable for BC morning publishing.

## Secrets and Git Status

- `.env` is gitignored and not tracked by git.
- `git ls-files .env` returns nothing.
- No secrets, API keys, tokens, request headers, or raw `.env` contents are present in this note or the accompanying commit.

## Local Ledger

- `scripts/devto/schedule.json` was updated to record the article IDs, keys, titles, and scheduled timestamps for these 10 articles.
- `schedule.json` is a local scheduling ledger only; it does not drive DEV state. The remote schedule was set via direct API mutation and verified independently.
