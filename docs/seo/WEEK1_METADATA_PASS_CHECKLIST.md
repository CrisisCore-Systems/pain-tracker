# Week 1 Metadata Pass Checklist

Date: 2026-03-12
Owner: Kay

Purpose: enforce deterministic closure for `rendered-metadata drift` issues.

## Preconditions

- Hashnode token has been rotated in dashboard.
- Old token is removed from shell/session env and local secret stores.
- New token is set only in current shell session.

## Execute Metadata Fixer

PowerShell:

```powershell
$env:HASHNODE_TOKEN="<new-rotated-token>"
node scripts/publishing/hashnode/week1-p0-fix-rendered-metadata.cjs
```

Expected: `[OK] Updated metadata for ...` for both target slugs.

## Browser Verification (Required)

Verify each URL in browser after the fixer run:

- `https://blog.paintracker.ca/paintracker-privacy-first-trauma-informed-pain-app`
- `https://blog.paintracker.ca/stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free`

For each URL, all three must pass:

1. Rendered `<title>` exactly matches Week 1 target.
2. Rendered `<meta name="description">` exactly matches Week 1 target.
3. Canonical remains self-referencing to the expected URL.

## Closure Rule

Do not close `rendered-metadata drift` issues when the script runs.
Close only after browser verification confirms all three conditions above.

If any check fails:

- Keep issue status `Open`.
- Capture the exact rendered value in the issue notes.
- Re-run targeted metadata update and verify again.

## Tracker Updates After Pass

For each URL that passes browser verification:

- Update Validation Issues Log row to `Fix Status = Closed`.
- Keep `Snippet Checked = No` until post-recrawl snippet validation is complete.

For each URL that does not pass:

- Keep issue `Open`.
- Add timestamped note with observed rendered values.
