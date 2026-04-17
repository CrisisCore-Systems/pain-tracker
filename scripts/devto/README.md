# Dev.to Publishing Workflow

This directory contains the Dev.to publishing workflow for Pain Tracker.

The goal is to keep article content, titles, and scheduling reproducible from repo-backed markdown instead of relying on manual web edits.

## Prerequisites

Required environment variables:

- `DEVTO_API_KEY`
- `DEVTO_SPONSOR_URL`
- `DEVTO_REPO_URL`

Optional but commonly used:

- `DEVTO_SERIES`
- `DEVTO_SERIES_START_URL`
- `DEVTO_ORGANIZATION_ID`

`DEVTO_SERIES` is now only a fallback for posts that do not resolve to an explicit per-post or profile-backed series.

PowerShell example:

```powershell
$apiKey = ((Get-Content .env | Where-Object { $_ -like 'DEVTO_API_KEY=*' } | Select-Object -First 1).Split('=', 2))[1]
$sponsorUrl = ((Get-Content .env | Where-Object { $_ -like 'DEVTO_SPONSOR_URL=*' } | Select-Object -First 1).Split('=', 2))[1]
$repoUrl = ((Get-Content .env | Where-Object { $_ -like 'DEVTO_REPO_URL=*' } | Select-Object -First 1).Split('=', 2))[1]
[Environment]::SetEnvironmentVariable('DEVTO_API_KEY', $apiKey, 'Process')
[Environment]::SetEnvironmentVariable('DEVTO_SPONSOR_URL', $sponsorUrl, 'Process')
[Environment]::SetEnvironmentVariable('DEVTO_REPO_URL', $repoUrl, 'Process')
[Environment]::SetEnvironmentVariable('DEVTO_SERIES', 'Protective Computing in Practice', 'Process')
```

Quick auth check:

```powershell
node scripts/devto/devto.mjs auth-check
```

Live series audit:

```powershell
node scripts/devto/devto.mjs series-report
```

## Main commands

Preview scheduled content changes:

```powershell
node scripts/devto/devto.mjs sync-content
```

Apply scheduled content changes:

```powershell
node scripts/devto/devto.mjs sync-content --yes --write
```

Allow updates to already-published articles:

```powershell
node scripts/devto/devto.mjs sync-content --yes --allow-published
```

Target specific posts by schedule key:

```powershell
node scripts/devto/devto.mjs sync-content --allow-published --only=devto-series-07-worksafebc-workflows,article-trauma-informed-hooks
```

The `--only` path works for posts that are intentionally `enabled: false` in
the schedule, as long as they are mapped with a key, source file, article ID,
and URL.

## Schedule rules

The source of truth is [schedule.json](c:/Users/kay/Documents/Projects/pain-tracker/scripts/devto/schedule.json).

Each mapped post may include:

- `key`: unique identifier used by `--only`
- `sourceFile`: repo-backed markdown source
- `articleId`: live Dev.to article ID
- `devtoUrl`: live Dev.to URL
- `published`: current live state
- `series`: per-post Dev.to series value, or `null`
- `seriesProfile`: optional reference to `defaults.series_profiles.*`
- `seriesChain`: optional logical chain name used for injected `Part X` / `Next up` markers

The schedule defaults may also include `series_profiles`, which define reusable series metadata once and let posts inherit it automatically.

Example:

```json
{
  "defaults": {
    "series_profiles": {
      "protective-computing-in-practice": {
        "series": "Protective Computing in Practice",
        "chainKey": "protective-computing-in-practice",
        "startHereKey": "devto-series-start-here",
        "orderedKeys": [
          "devto-series-01-offline-first",
          "devto-series-02-storage-layers"
        ]
      }
    }
  }
}
```

Profile fields:

- `series`: the exact DEV series name to send in API updates
- `chainKey`: local chain identifier for injected `Part X` / `Next up` markers
- `startHereKey`: schedule key whose `devtoUrl` should be used as the start-here link
- `startHereUrl`: explicit URL override when the start page is not schedule-mapped
- `orderedKeys`: explicit series order; if omitted, schedule `publishAt` order is used

Multiple profiles may intentionally share the same `series` string. Use that when
you want finer repo-side grouping and reporting without moving posts into a new
DEV series.

### When to use `series`

Use a string value when the post should remain in a numbered Dev.to series. If a matching `series_profiles.*.series` exists, the publisher will automatically reuse that richer profile metadata.

Examples:

- `devto-series-01-offline-first`
- `devto-series-07-worksafebc-workflows`
- `devto-series-10-truthful-docs`

Use `null` when the post is a standalone mirror or older article that should
sync content but should not be forced into the current numbered series.

Examples:

- `article-encryption-transparency`
- `article-encryption-deep-dive`
- `article-trauma-informed-hooks`
- `devto-worksafebc-case-study`

### When to use `seriesChain`

Use `seriesChain` only for posts that belong to the same numbered sequence and should receive injected:

- `Part X`
- `Start here`
- `Next up`

If a post should keep its content synced but should not receive numbered chain markers, leave `seriesChain` unset.

If the chain can be defined centrally, prefer `defaults.series_profiles.*.chainKey` over repeating `seriesChain` on every post.

## Known constraints

- Existing Dev.to articles may reject canonical URL rewrites with `422` if the canonical is already claimed elsewhere.
- The publisher now preserves an article's current `canonical_url` on update unless an explicit override is provided.
- Dev.to may return transient `429` rate limits. The script retries automatically.
- In this account, `GET /articles/:id` reliably exposes `collection_id`, but the
  live article payloads do not reliably expose a usable `series` field for drift
  checks. The series system therefore treats the repo schedule as the source of
  truth and uses the API to audit live collection membership.

## Recommended workflow

1. Edit the repo-backed markdown source.
2. Dry-run the target sync with `--only`.
3. Apply with `--yes --allow-published` if the preview is correct.
4. If the article is missing from the schedule, add its mapping to `schedule.json` before relying on future syncs.

## Notes

- `sync-content` is the normal content-update path.
- `push-source` is still available, but `sync-content` is preferred when the post is schedule-mapped.
- Keep standalone mirrors mapped in the schedule even if they remain
  `enabled: false`; that preserves article IDs and keeps targeted syncs
  repeatable.
