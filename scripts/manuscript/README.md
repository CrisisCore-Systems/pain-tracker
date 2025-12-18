# JMIR manuscript export

This repo stores the manuscript in Markdown and exports a `.docx` for submission.

## Prerequisite

Install Pandoc:

```powershell
winget install --id JohnMacFarlane.Pandoc -e
```

## Export

```powershell
./scripts/manuscript/export-jmir-docx.ps1
```

Output:

- `dist/manuscript/paintracker-jmir-submission.docx`

## Custom paths

```powershell
./scripts/manuscript/export-jmir-docx.ps1 -InputPath "article-privacy-first-trauma-informed-open-source-digital-health.md" -OutputPath "dist/manuscript/custom.docx"
```
