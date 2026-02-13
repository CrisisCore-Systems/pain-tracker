# build-cnet.ps1
# Usage: powershell -ExecutionPolicy Bypass -File .\build-cnet.ps1

param(
  [string]$ScreenshotsDir
)

$ErrorActionPreference = 'Stop'

function Write-PlaceholderPng($path) {
  if (Test-Path $path) { return }

  # 1x1 transparent PNG
  $b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/l2M/4QAAAABJRU5ErkJggg=='
  $bytes = [Convert]::FromBase64String($b64)
  [System.IO.File]::WriteAllBytes($path, $bytes)
}

function Write-HashesFile($paths, $outPath) {
  $lines = foreach ($p in $paths) {
    if (Test-Path $p) {
      $h = Get-FileHash -Algorithm SHA256 -Path $p
      "$($h.Hash)  $([IO.Path]::GetFileName($p))"
    }
  }
  ($lines -join "`r`n") + "`r`n" | Set-Content -Encoding ASCII $outPath
}

function Copy-ScreenshotsOrPlaceholders($destDir, $explicitSourceDir, $defaultSourceDir) {
  $required = @('dashboard.png', 'entry.png', 'trends.png', 'report.png')
  $source = $null

  if ($explicitSourceDir) {
    if (-not (Test-Path $explicitSourceDir)) {
      throw "ScreenshotsDir not found: $explicitSourceDir"
    }
    $source = (Resolve-Path $explicitSourceDir).Path
  } elseif ($defaultSourceDir -and (Test-Path $defaultSourceDir)) {
    $source = (Resolve-Path $defaultSourceDir).Path
  }

  if ($source) {
    foreach ($name in $required) {
      $src = Join-Path $source $name
      $dst = Join-Path $destDir $name
      if (-not (Test-Path $src)) {
        if ($explicitSourceDir) {
          throw "Missing required screenshot in ScreenshotsDir: $src"
        }
        Write-Host "WARN: Missing screenshot '$name' in $source; using placeholder" -ForegroundColor Yellow
        Write-PlaceholderPng $dst
      } else {
        Copy-Item -Force $src $dst
      }
    }

    Write-Host "==> Screenshots sourced from: $source" -ForegroundColor Cyan
    return
  }

  foreach ($name in $required) {
    Write-PlaceholderPng (Join-Path $destDir $name)
  }
  Write-Host '==> Screenshots: using placeholders (no source dir provided/found)' -ForegroundColor Yellow
}

function Get-JsonFile($path) {
  Get-Content -Raw -Path $path | ConvertFrom-Json
}

function Resolve-PwaOutDir($root) {
  $candidates = @(
    (Join-Path $root 'dist'),
    (Join-Path $root 'build'),
    (Join-Path $root 'out'),
    (Join-Path $root '.output\public')
  )

  foreach ($c in $candidates) {
    if (Test-Path $c) { return $c }
  }

  throw "Could not find PWA build output. Checked: $($candidates -join ', ')"
}

$root = Resolve-Path $PSScriptRoot
$desktopDir = Join-Path $root 'desktop'
$appTarget = Join-Path $desktopDir 'app'
$outDir = Join-Path $desktopDir 'dist'

$pkgPath = Join-Path $desktopDir 'package.json'
$pkg = Get-JsonFile $pkgPath
$ver = $pkg.version
$exeName = "PainTracker-Setup-$ver.exe"

Write-Host '==> Installing root deps (npm install)...' -ForegroundColor Cyan
Push-Location $root
npm install

Write-Host '==> Building PWA (npm run build)...' -ForegroundColor Cyan
npm run -s build
Pop-Location

$pwaOut = Resolve-PwaOutDir $root
Write-Host "==> PWA output detected at: $pwaOut" -ForegroundColor Cyan

Write-Host "==> Syncing PWA into: $appTarget" -ForegroundColor Cyan
if (Test-Path $appTarget) { Remove-Item $appTarget -Recurse -Force }
New-Item -ItemType Directory -Path $appTarget | Out-Null

# Robust sync copy (mirrors directory)
robocopy $pwaOut $appTarget /MIR /NFL /NDL /NJH /NJS /NP | Out-Null

Write-Host '==> Building Electron installer...' -ForegroundColor Cyan
Push-Location $desktopDir
npm install
npm run -s dist
Pop-Location

$exePath = Join-Path $outDir $exeName
if (-not (Test-Path $exePath)) {
  throw "Installer not found at expected path: $exePath"
}

Write-Host '==> Creating CNET submission ZIP...' -ForegroundColor Cyan
$subDir = Join-Path $desktopDir 'cnet_submission'
if (Test-Path $subDir) { Remove-Item $subDir -Recurse -Force }
$screensDir = Join-Path $subDir 'screenshots'
New-Item -ItemType Directory -Path $screensDir | Out-Null

# Real screenshots (recommended) or placeholders
$defaultScreens = Join-Path $desktopDir 'screenshots'
Copy-ScreenshotsOrPlaceholders -destDir $screensDir -explicitSourceDir $ScreenshotsDir -defaultSourceDir $defaultScreens

Copy-Item -Force $exePath (Join-Path $subDir $exeName)

@"
PainTracker Desktop $ver

- Offline-first wrapper for PainTracker
- No bundled offers
- No auto-updater
- No telemetry

Install: run the installer, then launch from Start Menu or Desktop.
Uninstall: Settings > Apps > PainTracker

Publisher: CrisisCore-Systems
"@ | Set-Content -Encoding UTF8 (Join-Path $subDir 'README.txt')

@"
INSTALL
1) Run $exeName
2) Accept defaults (one-click)
3) Launch PainTracker

Notes:
- App serves UI locally (127.0.0.1) to support offline behaviors.
- Outbound network requests are blocked by default.
"@ | Set-Content -Encoding UTF8 (Join-Path $subDir 'INSTALL.txt')

"Version: $ver" | Set-Content -Encoding UTF8 (Join-Path $subDir 'VERSION.txt')

# Directory-style names (no extension)
Copy-Item -Force (Join-Path $subDir 'README.txt') (Join-Path $subDir 'README')
Copy-Item -Force (Join-Path $subDir 'INSTALL.txt') (Join-Path $subDir 'INSTALL')
Copy-Item -Force (Join-Path $subDir 'VERSION.txt') (Join-Path $subDir 'VERSION')

$zipName = "PainTracker_CNET_Submission_v$ver.zip"
$zipPath = Join-Path $desktopDir $zipName
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Compress-Archive -Path (Join-Path $subDir '*') -DestinationPath $zipPath

# Attachment pack (many directories cap attachments at ~25MB)
$attachZipName = "PainTracker_CNET_Attachments_v$ver.zip"
$attachZipPath = Join-Path $desktopDir $attachZipName
if (Test-Path $attachZipPath) { Remove-Item $attachZipPath -Force }

$attachDir = Join-Path $desktopDir 'cnet_attachments'
if (Test-Path $attachDir) { Remove-Item $attachDir -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $attachDir 'screenshots') | Out-Null

Copy-Item -Force (Join-Path $subDir 'README') (Join-Path $attachDir 'README')
Copy-Item -Force (Join-Path $subDir 'INSTALL') (Join-Path $attachDir 'INSTALL')
Copy-Item -Force (Join-Path $subDir 'VERSION') (Join-Path $attachDir 'VERSION')
Copy-Item -Force (Join-Path $screensDir '*') (Join-Path $attachDir 'screenshots')

# Hashes help reviewers verify the Download URL payload
Write-HashesFile @($zipPath, $exePath) (Join-Path $attachDir 'SHA256SUMS.txt')

@"
DOWNLOAD

Direct HTTPS download URL (must be a direct file download):
https://paintracker.ca/downloads/$zipName

Notes:
- Attachments often have a ~25MB cap, so this attachment pack omits the installer EXE.
- Use the Download URL above for the full submission ZIP (includes the installer).
"@ | Set-Content -Encoding UTF8 (Join-Path $attachDir 'DOWNLOAD.txt')

Compress-Archive -Path (Join-Path $attachDir '*') -DestinationPath $attachZipPath

Write-Host ''
Write-Host 'DONE.' -ForegroundColor Green
Write-Host "Installer: $exePath" -ForegroundColor Green
Write-Host "Submission ZIP: $zipPath" -ForegroundColor Green
Write-Host "Attachment ZIP (<25MB target): $attachZipPath" -ForegroundColor Green
