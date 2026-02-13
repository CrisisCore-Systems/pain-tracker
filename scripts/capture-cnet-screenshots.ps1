param(
  [string]$DesktopScreenshotsDir = (Join-Path $PSScriptRoot '..\desktop\screenshots'),
  [switch]$SkipCapture
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$desktopDir = (Resolve-Path (Join-Path $repoRoot 'desktop')).Path

Write-Host '==> CNET screenshots' -ForegroundColor Cyan
Write-Host ("Repo:    {0}" -f $repoRoot)
Write-Host ("Desktop: {0}" -f $desktopDir)
Write-Host ("OutDir:  {0}" -f $DesktopScreenshotsDir)

if (-not $SkipCapture) {
  Write-Host '==> Capturing CNET screenshot set (Playwright)...' -ForegroundColor Cyan
  Push-Location $repoRoot
  try {
    npm run -s screenshots:portfolio -- --category=cnet
  } finally {
    Pop-Location
  }
}

$sourceDir = Join-Path $repoRoot 'public\screenshots\cnet'
if (-not (Test-Path $sourceDir)) {
  throw "Source screenshot directory not found: $sourceDir"
}

$copyMap = @{
  'dashboard.png' = 'dashboard.png'
  'entry.png'     = 'entry.png'
  'trends.png'    = 'trends.png'
  'report.png'    = 'report.png'
}

New-Item -ItemType Directory -Force -Path $DesktopScreenshotsDir | Out-Null

foreach ($srcName in $copyMap.Keys) {
  $srcPath = Join-Path $sourceDir $srcName
  $dstPath = Join-Path $DesktopScreenshotsDir $copyMap[$srcName]

  if (-not (Test-Path $srcPath)) {
    throw "Missing generated screenshot: $srcPath`nTry running: npm run -s screenshots:portfolio -- --category=cnet"
  }

  Copy-Item -Path $srcPath -Destination $dstPath -Force

  $len = (Get-Item $dstPath).Length
  if ($len -lt 10kb) {
    throw "Screenshot copy succeeded but file looks too small (<10KB): $dstPath ($len bytes)"
  }

  Write-Host (("OK: {0} -> {1}" -f $srcName, $dstPath))
}

Write-Host '==> Done. Current CNET screenshots:' -ForegroundColor Green
Get-ChildItem -Path $DesktopScreenshotsDir -Filter '*.png' |
  Sort-Object Name |
  Select-Object Name, Length, LastWriteTime |
  Format-Table -AutoSize
