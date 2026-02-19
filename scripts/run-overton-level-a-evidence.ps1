param(
  [ValidateSet('dev', 'staging', 'production')]
  [string]$EnvName = 'dev'
)

$ErrorActionPreference = 'Stop'

function Assert-LastExitCode {
  param(
    [string]$What
  )
  if ($LASTEXITCODE -ne 0) {
    throw "$What failed with exit code $LASTEXITCODE"
  }
}

Push-Location (Split-Path -Parent $PSScriptRoot)
try {
  $date = Get-Date -Format 'yyyy-MM-dd'

  $gitHash = ''
  try {
    $gitHash = (git rev-parse --short HEAD).Trim()
  } catch {
    $gitHash = 'unknown'
  }

  $evidenceRoot = Join-Path $PWD ('evidence\overton-level-a')
  $evidenceDirName = "{0}_{1}_{2}" -f $date, $EnvName, $gitHash
  $evidenceDir = Join-Path $evidenceRoot $evidenceDirName

  New-Item -ItemType Directory -Force -Path $evidenceDir | Out-Null
  New-Item -ItemType Directory -Force -Path (Join-Path $evidenceDir '01-offline') | Out-Null
  New-Item -ItemType Directory -Force -Path (Join-Path $evidenceDir '02-exports') | Out-Null
  New-Item -ItemType Directory -Force -Path (Join-Path $evidenceDir '03-telemetry') | Out-Null
  New-Item -ItemType Directory -Force -Path (Join-Path $evidenceDir '04-crisis-ux') | Out-Null

  $node = ''
  $npm = ''
  try { $node = (node -v).Trim() } catch { $node = 'unknown' }
  try { $npm = (npm -v).Trim() } catch { $npm = 'unknown' }

  $scope = @()
  $scope += "# Overton Level A Evidence Packet (Self-assessed)"
  $scope += ""
  $scope += "- Date: $date"
  $scope += "- Env: $EnvName"
  $scope += "- Git hash: $gitHash"
  $scope += "- OS: $([System.Environment]::OSVersion.VersionString)"
  $scope += "- Node: $node"
  $scope += "- npm: $npm"
  $scope += ""
  $scope += "## Declared offline guarantee window"
  $scope += "- TODO"
  $scope += ""
  $scope += "## Declared Essential Operations"
  $scope += "- TODO"
  $scope += ""
  $scope += "## Explicit out-of-scope surfaces (for this packet)"
  $scope += "- TODO (e.g., weather capture, WCB submission, Stripe checkout)"
  $scope += ""
  $scope += "This folder is generated locally. Do not publish without review/redaction."

  Set-Content -Path (Join-Path $evidenceDir '00-scope.md') -Value ($scope -join "`n") -Encoding UTF8

  $notes = @()
  $notes += "# Evidence Run Notes"
  $notes += ""
  $notes += "This run targets the Level A evidence packet items (PC-1 offline proof, PC-5 exports, PC-4 crisis UX screenshots)."
  $notes += ""
  $notes += "## Playwright suites executed"
  $notes += "- Chromium only (self-assessed)"
  $notes += "- PWA: offline + service-worker specs (stable subset)"
  $notes += "- Evidence: overton-level-a-evidence.spec.ts"
  $notes += ""
  $notes += "## Suites intentionally skipped"
  $notes += "- Caching strategy assertions (can time out on slow/contended dev server; offline suite still validates cache use)"
  $notes += "- Background Sync specs (flaky across environments; not required for PC-1/PC-5/PC-4 Level A packet)"
  $notes += "- Performance/security CSP-header assertions (dev server may differ from preview/prod headers)"
  $notes += ""
  $notes += "## Review note (PC-4 close action)"
  $notes += 'Panic Mode''s close button text is adaptive microcopy (e.g., "Exit", "Done", or "I''m feeling better") rather than a literal "Close" label. Evidence automation targets the visible close-action button by this adaptive label to avoid false failures.'
  $notes += ""
  Set-Content -Path (Join-Path $evidenceDir '99-notes.md') -Value ($notes -join "`n") -Encoding UTF8

  $telemetry = @()
  $telemetry += "# Telemetry Evidence (PC-3.2)"
  $telemetry += ""
  $telemetry += "This folder is intentionally NOT populated automatically."
  $telemetry += ""
  $telemetry += "Place screenshots here for the three cases described in the v0.2 Level A checklist:"
  $telemetry += "- Case A: env disabled / consent cleared"
  $telemetry += "- Case B: env enabled / consent NOT granted"
  $telemetry += "- Case C: env enabled / consent granted"
  $telemetry += ""
  $telemetry += "Safety note: prefer screenshots over HAR files to avoid accidentally capturing Class A payloads."
  Set-Content -Path (Join-Path $evidenceDir '03-telemetry\README.md') -Value ($telemetry -join "`n") -Encoding UTF8

  $env:EVIDENCE_DIR = $evidenceDir

  Write-Output "Evidence dir: $evidenceDir"
  Write-Output "Running: PWA suite (chromium)"
  # Use explicit file paths (Playwright CLI treats args as regex unless they are exact files).
  npx playwright test `
    e2e/tests/pwa-offline.spec.ts `
    e2e/tests/pwa-service-worker.spec.ts `
    --project=chromium `
    --config=e2e/playwright.config.ts
  Assert-LastExitCode 'PWA suite'

  Write-Output "Running: Overton Level A evidence spec (chromium)"
  npx playwright test e2e/tests/overton-level-a-evidence.spec.ts --project=chromium --config=e2e/playwright.config.ts
  Assert-LastExitCode 'Level A evidence spec'

  Write-Output "Done. Evidence packet populated."
} finally {
  Pop-Location
}
