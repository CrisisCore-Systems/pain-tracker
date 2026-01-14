param(
  [string]$BaseDir = "public/screenshots",
  [int]$WindowMinutes = 180,
  [string]$RunName = "",
  [switch]$Move
)

$ErrorActionPreference = 'Stop'

function Normalize-Path([string]$Path) {
  return (Resolve-Path -LiteralPath $Path).Path
}

$repoRoot = Normalize-Path (Join-Path $PSScriptRoot "..")
$basePath = Join-Path $repoRoot $BaseDir
if (-not (Test-Path -LiteralPath $basePath)) {
  throw "BaseDir not found: $basePath"
}

$metaPath = Join-Path $basePath "portfolio-metadata.json"
$readmePath = Join-Path $basePath "PORTFOLIO.md"

$referenceTime = Get-Date
if (Test-Path -LiteralPath $metaPath) {
  $referenceTime = (Get-Item -LiteralPath $metaPath).LastWriteTime
}

$startTime = $referenceTime.AddMinutes(-1 * $WindowMinutes)

$runStamp = if ([string]::IsNullOrWhiteSpace($RunName)) {
  $referenceTime.ToString('yyyy-MM-dd_HH-mm-ss')
} else {
  $RunName
}

$runDir = Join-Path $basePath (Join-Path "runs" $runStamp)
New-Item -ItemType Directory -Path $runDir -Force | Out-Null

# Find candidate screenshots (exclude debug + existing runs)
$pngs = Get-ChildItem -LiteralPath $basePath -Recurse -File -Filter *.png |
  Where-Object {
    $_.FullName -notmatch "\\debug\\" -and
    $_.FullName -notmatch "\\runs\\"
  } |
  Where-Object { $_.LastWriteTime -ge $startTime } |
  Sort-Object LastWriteTime, FullName

if ($pngs.Count -eq 0) {
  Write-Host "No PNGs found modified since $startTime (WindowMinutes=$WindowMinutes)." -ForegroundColor Yellow
  Write-Host "Base: $basePath"
  exit 0
}

$manifest = @()
$index = 1
foreach ($file in $pngs) {
  $prefix = $index.ToString('000')
  $destName = "${prefix}_$($file.Name)"
  $destPath = Join-Path $runDir $destName

  if ($Move) {
    Move-Item -LiteralPath $file.FullName -Destination $destPath -Force
  } else {
    Copy-Item -LiteralPath $file.FullName -Destination $destPath -Force
  }

  $manifest += [pscustomobject]@{
    Index = $index
    Source = $file.FullName
    Destination = $destPath
    LastWriteTime = $file.LastWriteTime
    Bytes = $file.Length
  }

  $index++
}

# Copy metadata + portfolio doc for convenience
if (Test-Path -LiteralPath $metaPath) {
  Copy-Item -LiteralPath $metaPath -Destination (Join-Path $runDir "portfolio-metadata.json") -Force
}
if (Test-Path -LiteralPath $readmePath) {
  Copy-Item -LiteralPath $readmePath -Destination (Join-Path $runDir "PORTFOLIO.md") -Force
}

$manifestPath = Join-Path $runDir "manifest.csv"
$manifest | Export-Csv -LiteralPath $manifestPath -NoTypeInformation -Encoding UTF8

Write-Host "Created screenshot run folder:" -ForegroundColor Green
Write-Host "  $runDir"
Write-Host "Copied $($pngs.Count) PNG(s) in chronological order." -ForegroundColor Green
Write-Host "Manifest: $manifestPath"