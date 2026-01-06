# Hashnode automation (local scripts)

These scripts help create a Hashnode series and import markdown as drafts.

## One-time: set your token (PowerShell)

```powershell
$env:HASHNODE_TOKEN="<paste your Hashnode Personal Access Token here>"
```

Alternative env var name also supported:

```powershell
$env:HASHNODE_API_KEY="<paste your Hashnode Personal Access Token here>"
```

## Verify auth + list publications

```powershell
node .\scripts\hashnode\whoami.mjs
```

## Create the series + drafts (dry run)

```powershell
node .\scripts\hashnode\create-series-from-markdown.mjs
```

This dry run is local-only; it does not call Hashnode.

## Execute (creates on Hashnode)

```powershell
$env:HASHNODE_TOKEN="<paste your Hashnode Personal Access Token here>"
node .\scripts\hashnode\create-series-from-markdown.mjs --execute
```

Optional (skip publication selection prompt):

```powershell
$env:HASHNODE_PUBLICATION_ID="<publication id>"
```

Notes:
- If your account has multiple publications, the script will prompt you to pick one.
- Draft titles are taken from the first H1 in each file.
- The file's H1, the `markdownlint` disable comment, and the "Back to series hub" link are removed from the content body before upload.
