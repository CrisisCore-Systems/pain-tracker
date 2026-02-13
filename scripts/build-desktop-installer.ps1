param(
  [switch]$SkipWebBuild,
  [switch]$SkipSubmissionZip,
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

    Write-Host "✓ Screenshots sourced from: $source" -ForegroundColor Green
    return
  }

  foreach ($name in $required) {
    Write-PlaceholderPng (Join-Path $destDir $name)
  }
  Write-Host 'WARN: Screenshots using placeholders (no source dir provided/found)' -ForegroundColor Yellow
}

function Get-JsonFile($path) {
  Get-Content -Raw -Path $path | ConvertFrom-Json
}

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$desktopDir = Join-Path $root 'desktop'
$appDir = Join-Path $desktopDir 'app'

Push-Location $root

try {
  if (-not $SkipWebBuild) {
    Write-Host '→ Building PWA (Vite) into .\dist\' -ForegroundColor Cyan
    npm run -s build
  }

  if (Test-Path $appDir) {
    Remove-Item -Recurse -Force $appDir
  }
  New-Item -ItemType Directory -Path $appDir | Out-Null

  Write-Host '→ Copying PWA build output into desktop\app\' -ForegroundColor Cyan
  Copy-Item -Recurse -Force (Join-Path $root 'dist\*') $appDir

  Write-Host '→ Installing desktop wrapper deps' -ForegroundColor Cyan
  npm --prefix $desktopDir install

  Write-Host '→ Building NSIS installer' -ForegroundColor Cyan
  npm --prefix $desktopDir run -s dist

  $desktopPkg = Get-JsonFile (Join-Path $desktopDir 'package.json')
  $version = $desktopPkg.version
  $setupExe = Join-Path $desktopDir ("dist\PainTracker-Setup-$version.exe")

  if (-not (Test-Path $setupExe)) {
    throw "Expected installer not found: $setupExe"
  }

  Write-Host "✓ Built: $setupExe" -ForegroundColor Green

  if (-not $SkipSubmissionZip) {
    $submissionDir = Join-Path $desktopDir 'submission'
    if (Test-Path $submissionDir) {
      Remove-Item -Recurse -Force $submissionDir
    }

    $screensDir = Join-Path $submissionDir 'screenshots'
    New-Item -ItemType Directory -Path $screensDir | Out-Null

    # Real screenshots (recommended) or placeholders
    $defaultScreens = Join-Path $desktopDir 'screenshots'
    Copy-ScreenshotsOrPlaceholders -destDir $screensDir -explicitSourceDir $ScreenshotsDir -defaultSourceDir $defaultScreens

    $readme = @(
      'PainTracker Desktop (Offline-capable wrapper)',
      '',
      'This installer bundles the PainTracker web app for local-first use.',
      'No bundled offers, no download managers, no auto-update framework.',
      '',
      'Install: Run the Setup EXE and follow the prompts.',
      'Uninstall: Use Windows "Apps and features" / "Add or remove programs".',
      '',
      'Network behavior:',
      '- By default, the desktop wrapper blocks all outbound http/https requests.',
      '- The UI is served from a local-only 127.0.0.1 server inside the app.'
    ) -join "`r`n"

    $install = @(
      'INSTALL',
      '',
      '1) Run the Setup EXE',
      '2) Launch PainTracker from the Start Menu shortcut',
      '',
      'Notes:',
      '- This build is local-first. Your data stays on your device unless you export it.'
    ) -join "`r`n"

    $versionTxt = "VERSION: $version`r`n"

    Set-Content -Path (Join-Path $submissionDir 'README.txt') -Value $readme -Encoding UTF8
    Set-Content -Path (Join-Path $submissionDir 'INSTALL.txt') -Value $install -Encoding UTF8
    Set-Content -Path (Join-Path $submissionDir 'VERSION.txt') -Value $versionTxt -Encoding UTF8

    # Directory-style names (no extension)
    Copy-Item -Force (Join-Path $submissionDir 'README.txt') (Join-Path $submissionDir 'README')
    Copy-Item -Force (Join-Path $submissionDir 'INSTALL.txt') (Join-Path $submissionDir 'INSTALL')
    Copy-Item -Force (Join-Path $submissionDir 'VERSION.txt') (Join-Path $submissionDir 'VERSION')

    Copy-Item -Force $setupExe (Join-Path $submissionDir (Split-Path $setupExe -Leaf))

    $zipPath = Join-Path $desktopDir ("PainTracker_CNET_Submission_v$version.zip")
    if (Test-Path $zipPath) {
      Remove-Item -Force $zipPath
    }

    Write-Host '→ Creating CNET submission ZIP' -ForegroundColor Cyan
    Compress-Archive -Path (Join-Path $submissionDir '*') -DestinationPath $zipPath

    Write-Host "✓ Submission ZIP: $zipPath" -ForegroundColor Green

    # Attachment pack (many directories cap attachments at ~25MB)
    $attachDir = Join-Path $desktopDir 'cnet_attachments'
    if (Test-Path $attachDir) { Remove-Item -Recurse -Force $attachDir }
    New-Item -ItemType Directory -Path (Join-Path $attachDir 'screenshots') | Out-Null

    Copy-Item -Force (Join-Path $submissionDir 'README') (Join-Path $attachDir 'README')
    Copy-Item -Force (Join-Path $submissionDir 'INSTALL') (Join-Path $attachDir 'INSTALL')
    Copy-Item -Force (Join-Path $submissionDir 'VERSION') (Join-Path $attachDir 'VERSION')
    Copy-Item -Force (Join-Path $screensDir '*') (Join-Path $attachDir 'screenshots')

    Write-HashesFile @($zipPath, $setupExe) (Join-Path $attachDir 'SHA256SUMS.txt')

    $attachZipPath = Join-Path $desktopDir ("PainTracker_CNET_Attachments_v$version.zip")
    if (Test-Path $attachZipPath) { Remove-Item -Force $attachZipPath }

    @"
DOWNLOAD

Direct HTTPS download URL (must be a direct file download):
https://paintracker.ca/downloads/PainTracker_CNET_Submission_v$version.zip

Notes:
- Attachments often have a ~25MB cap, so this attachment pack omits the installer EXE.
- Use the Download URL above for the full submission ZIP (includes the installer).
"@ | Set-Content -Encoding UTF8 (Join-Path $attachDir 'DOWNLOAD.txt')

    Compress-Archive -Path (Join-Path $attachDir '*') -DestinationPath $attachZipPath

    Write-Host "✓ Attachment ZIP: $attachZipPath" -ForegroundColor Green
  }
}
finally {
  Pop-Location
}
