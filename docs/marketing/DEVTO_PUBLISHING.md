# DEV.to publishing (API-assisted)

This repo contains a small script to help publish posts to DEV (Forem) automatically.

## Why this exists

Forem's API docs do not list a writable `published_at` in the v1 article create/update schema, but DEV does support scheduled posts.
This repo supports **both** approaches:

1) **Sync scheduled publish dates** for existing DEV scheduled posts (preferred if you already scheduled via DEV)
2) Create drafts now via the API (optional, for editing ahead)
3) Publish them later (when due) via the API

Automation is handled via GitHub Actions.

## GitHub Actions (recommended)

Workflow: `.github/workflows/devto-auto-publish.yml`

Set these in GitHub:

- **Secrets**

  - `DEVTO_API_KEY`
- **Variables** (optional)

  - `DEVTO_SPONSOR_URL`
  - `DEVTO_REPO_URL`
  - `DEVTO_SERIES_START_URL`
  - `DEVTO_SERIES`
  - `DEVTO_ORGANIZATION_ID`

The workflow runs every 10 minutes and publishes any posts whose `publishAt` has passed.

## Setup

1) Create an API key in DEV settings.
2) Put it in your environment:

```powershell
$env:DEVTO_API_KEY = "your_devto_api_key_here"
```

Optional overrides:

```powershell
$env:DEVTO_SPONSOR_URL = "https://paintracker.ca/sponsor"
$env:DEVTO_REPO_URL = "https://github.com/CrisisCore-Systems/pain-tracker"
$env:DEVTO_SERIES_START_URL = "https://dev.to/yourname/your-series"
$env:DEVTO_SERIES = "Your DEV Series Name"
$env:DEVTO_ORGANIZATION_ID = "123"
```

## Configure the schedule

Edit `scripts/devto/schedule.json`.

- `publishAt` is UTC RFC3339
- Set `enabled: false` to skip a post
- After creating drafts, the script can write `articleId`/`devtoUrl` back into the file

## Commands (local)

Verify your API key works (recommended first step):

```powershell
node scripts/devto/devto.mjs auth-check
```

Dry run (no API calls):

```powershell
node scripts/devto/devto.mjs dry-run
```

Create drafts for every enabled post without an `articleId`:

```powershell
node scripts/devto/devto.mjs create-drafts --write
```

Publish any posts whose `publishAt` is in the past:

```powershell
node scripts/devto/devto.mjs publish-due --yes
```

Sync DEV scheduled posts to match `scripts/devto/schedule.json` (dry run by default):

```powershell
node scripts/devto/devto.mjs sync-schedule
```

Apply schedule changes and persist discovered `articleId`/`devtoUrl` back into `schedule.json`:

```powershell
node scripts/devto/devto.mjs sync-schedule --yes --write
```

Notes:

- If the instance rejects `published_at` in the JSON payload, the script falls back to updating the post's front matter in `body_markdown` (`published_at`/`date`).

## Sync titles

If you update titles in `scripts/devto/schedule.json`, you can push those title changes to DEV.

Dry run (recommended):

```powershell
node scripts/devto/devto.mjs sync-titles
```

Apply title changes + persist discovered `articleId`/`devtoUrl` back into `schedule.json`:

```powershell
node scripts/devto/devto.mjs sync-titles --yes --write
```

Notes:

- If the post contains front matter in `body_markdown`, front matter values take precedence over JSON fields. Title sync updates both.
- By default, title sync skips already-published posts. Use `--allow-published` if you want to rename published articles too.

## Sync series + CTAs + chain links

This updates the enabled posts in `scripts/devto/schedule.json` to:

- Put them in the configured DEV series
- Ensure the standard CTA blocks exist (top + bottom)
- Add “Part X of … / Start here” at the top
- Add “Next up” link at the bottom (when a next post URL exists)

Dry run:

```powershell
npm run -s devto:sync-content
```

Apply (scheduled/unpublished posts only):

```powershell
npm run -s devto:sync-content:apply
```

Apply (include already-published posts too):

```powershell
npm run -s devto:sync-content:apply:allow-published
```

## Push local source markdown to DEV

This reads local source markdown files (from `sourceFile` in `schedule.json`) and pushes their full content to the corresponding DEV articles via the API. Use this after editing source files locally (e.g. fixing links) to update the DEV drafts.

- Articles must already exist on DEV (run `create-drafts` first if needed)
- CTA blocks are injected automatically
- Series name and front matter are set from schedule config
- Skips already-published posts by default

Dry run:

```powershell
npm run -s devto:push-source
```

Apply (scheduled/unpublished posts only):

```powershell
npm run -s devto:push-source:apply
```

Apply (include already-published posts too):

```powershell
npm run -s devto:push-source:apply:allow-published
```

## Retrofit already-published posts (funnels + conversion block)

This is a separate pass for **already-published** articles to make them behave like a funnel:

- Assign published posts into one of two series (“Foundations” vs “CrisisCore Build Log”) based on title lists
- Inject a standardized **above-the-fold conversion block** on every published post
- Optionally set cover images + descriptions for older posts (via config overrides)

Config file:

- `scripts/devto/published-retrofit.json`

Required for apply mode:

- Set `DEVTO_START_HERE_URL` (or `defaults.start_here_url` in the config) to your new “Start Here” index post URL.

Notes:

- If `DEVTO_START_HERE_URL` is set to the placeholder `https://dev.to/yourname/...`, the script ignores it and falls back to `scripts/devto/published-retrofit.json`.

Dry run:

```powershell
npm run -s devto:retrofit-published
```

Apply:

```powershell
npm run -s devto:retrofit-published:apply
```

Notes:

- This command does **not** retitle posts (URL/slug redirect behavior is treated as unknown risk).
- For posts with very low views (default `<25`) and missing cover/description, the dry run prints a note so you can fill in overrides.

## Reduce conversion leaks (manual DEV setting)

DEV supports disabling “Nearby External Sponsors” in your settings. This is not reliably controlled via the Forem v1 API.

- Go to DEV settings and disable “Nearby External Sponsors”.

## Publish the “Start Here” gateway post

This creates/publishes a dedicated index post on DEV and can automatically wire its URL into `scripts/devto/published-retrofit.json`.

Dry run (also writes the generated markdown to `scripts/devto/start-here.md`):

```powershell
npm run -s devto:publish-start-here
```

Publish + write the discovered URL into `scripts/devto/published-retrofit.json` (so you don’t have to keep exporting `DEVTO_START_HERE_URL`):

```powershell
npm run -s devto:publish-start-here:apply
```

Optional env overrides:

```powershell
$env:DEVTO_START_HERE_TITLE = "Start Here: PainTracker + CrisisCore Build Log (Privacy-First, Offline-First, No Surveillance)"
$env:DEVTO_START_HERE_DESCRIPTION = "Start here for the privacy-first, offline-first PainTracker series: foundations + build log."
$env:DEVTO_START_HERE_TAGS = "healthtech, privacy, webdev, testing"
$env:DEVTO_TRY_URL = "https://paintracker.ca"
```

## Pinned comments

Forem API v1 does not provide endpoints to create/pin comments.

After creating drafts, the script generates `scripts/devto/pinned-comments.md` with a ready-to-paste pinned comment template for each post.
