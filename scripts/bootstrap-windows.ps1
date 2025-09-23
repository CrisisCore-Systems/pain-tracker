<#
Bootstrap helper for Windows developers to prepare native deps for canvas@3.x.
Run as Administrator when installing Visual Studio Build Tools or MSYS2.

This script provides guidance and attempts to install MSYS2 via Chocolatey if present.
It does not force changes; it prints steps and optionally invokes choco.
#>

Write-Host "Bootstrap Windows prerequisites for canvas@3.x" -ForegroundColor Cyan

Write-Host "1) Ensure Visual Studio Build Tools (Desktop development with C++) is installed."
Write-Host "   Download: https://visualstudio.microsoft.com/downloads/"

Write-Host "2) Recommended: Install MSYS2 for Cairo and pkg-config (easier library management)."
Write-Host "   See https://www.msys2.org/"

if (Get-Command choco -ErrorAction SilentlyContinue) {
  Write-Host "Chocolatey detected. You can install MSYS2 with: choco install msys2 -y" -ForegroundColor Yellow
  $do = Read-Host "Do you want to install MSYS2 now via choco? (y/N)"
  if ($do -eq 'y') {
    choco install msys2 -y
    Write-Host "MSYS2 installed. Open an MSYS2 shell and run: pacman -Syu" -ForegroundColor Green
  }
} else {
  Write-Host "Chocolatey not found. Please install MSYS2 manually: https://www.msys2.org/" -ForegroundColor Yellow
}

Write-Host "After MSYS2 is installed, open the MSYS2 MinGW64 shell and run:"
Write-Host "  pacman -Syu"
Write-Host "  pacman -S mingw-w64-x86_64-toolchain mingw-w64-x86_64-cairo mingw-w64-x86_64-pkg-config mingw-w64-x86_64-fontconfig"

Write-Host "Set PKG_CONFIG_PATH and add MSYS2 mingw64 bin to PATH in PowerShell before running npm install:"
Write-Host "  $env:PKG_CONFIG_PATH = 'C:\msys64\mingw64\lib\pkgconfig'"
Write-Host "  $env:PATH = 'C:\msys64\mingw64\bin;' + $env:PATH"

Write-Host "If you encounter build issues, consult docs/CANVAS_WINDOWS_PREREQS.md for troubleshooting." -ForegroundColor Cyan
