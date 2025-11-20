#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run security tests with API server in test mode
.DESCRIPTION
    Starts the API dev server with rate limiting disabled, runs security tests, and cleans up
#>

Write-Host "`n===============================================================================" -ForegroundColor Cyan
Write-Host "              PAIN TRACKER - SECURITY TEST RUNNER                          " -ForegroundColor Cyan
Write-Host "===============================================================================`n" -ForegroundColor Cyan

# Start API server in test mode (background)
Write-Host "[*] Starting API dev server in TEST MODE (rate limiting disabled)..." -ForegroundColor Yellow
$apiServer = Start-Process -FilePath "npm" -ArgumentList "run", "dev:api:test" -PassThru -NoNewWindow

# Wait for server to start
Write-Host "[*] Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check if server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -ErrorAction Stop
    Write-Host "[+] API server is running" -ForegroundColor Green
} catch {
    Write-Host "[-] API server failed to start" -ForegroundColor Red
    Stop-Process -Id $apiServer.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

# Run security tests
Write-Host "`n[*] Running security test suite...`n" -ForegroundColor Cyan
$testResult = & node scripts/test-security.js
$exitCode = $LASTEXITCODE

# Cleanup: Stop API server
Write-Host "`n[*] Stopping API dev server..." -ForegroundColor Yellow
Stop-Process -Id $apiServer.Id -Force -ErrorAction SilentlyContinue

# Wait a moment for cleanup
Start-Sleep -Seconds 1

Write-Host "`n[+] Test run complete`n" -ForegroundColor Green
exit $exitCode
