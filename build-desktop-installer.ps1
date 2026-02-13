param(
  [switch]$SkipWebBuild,
  [switch]$SkipSubmissionZip
)

$ErrorActionPreference = 'Stop'

& "$PSScriptRoot\scripts\build-desktop-installer.ps1" -SkipWebBuild:$SkipWebBuild -SkipSubmissionZip:$SkipSubmissionZip
