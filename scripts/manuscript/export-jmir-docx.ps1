[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$InputPath = "article-privacy-first-trauma-informed-open-source-digital-health.md",

  [Parameter(Mandatory = $false)]
  [string]$OutputPath = "dist\\manuscript\\paintracker-jmir-submission.docx"
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path -LiteralPath (Get-Location)).Path
$inputFull = (Resolve-Path -LiteralPath $InputPath).Path

$outDir = Split-Path -Parent $OutputPath
if ($outDir) {
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$pandocCmd = Get-Command pandoc -ErrorAction SilentlyContinue
$pandocExe = if ($pandocCmd) { $pandocCmd.Source } else { $null }

if (-not $pandocExe) {
  $candidates = @(
    (Join-Path $env:LOCALAPPDATA 'Pandoc\pandoc.exe'),
    (Join-Path $env:LOCALAPPDATA 'Programs\Pandoc\pandoc.exe'),
    (Join-Path $env:ProgramFiles 'Pandoc\pandoc.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'Pandoc\pandoc.exe')
  ) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

  $pandocExe = $candidates | Select-Object -First 1
}

if (-not $pandocExe) {
  Write-Error "pandoc not found. Install it, then re-run this script. Suggested: 'winget install --id JohnMacFarlane.Pandoc -e'"
}

# JMIR: keep tables inline, portrait default; avoid URLs in body (this manuscript already keeps URLs in references).
# Convert GitHub-flavored Markdown to DOCX.
$pandocArgs = @(
  '--from=gfm',
  '--to=docx',
  "--output=$OutputPath",
  '--wrap=none',
  "--metadata=title:JMIR Submission",
  $inputFull
)

& $pandocExe @pandocArgs

Write-Host "Wrote DOCX: $OutputPath"