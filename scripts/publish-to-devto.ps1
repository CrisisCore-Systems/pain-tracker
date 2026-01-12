# Publish blog post to DEV.to
# Usage: .\scripts\publish-to-devto.ps1 -ApiKey "your_api_key" -FilePath "docs/content/blog/blog-client-side-encryption-healthcare.md"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey,
    
    [Parameter(Mandatory=$false)]
    [string]$FilePath = "docs/content/blog/blog-client-side-encryption-healthcare.md"
)

$ErrorActionPreference = "Stop"

# Read the markdown file
$fullPath = Join-Path $PSScriptRoot ".." $FilePath
if (-not (Test-Path $fullPath)) {
    $fullPath = $FilePath
}

Write-Host "Reading file: $fullPath" -ForegroundColor Cyan
$content = Get-Content -Path $fullPath -Raw

# Extract title from first H1 or use default
if ($content -match '^#\s+(.+)$' -or $content -match '\n#\s+(.+)$') {
    $title = $Matches[1].Trim()
} else {
    $title = "Client-Side Encryption for Healthcare Apps"
}

Write-Host "Title: $title" -ForegroundColor Green

# Build the article body (DEV.to frontmatter + content)
$articleBody = @"
---
title: "Client-Side Encryption for Healthcare Apps"
published: true
description: "AES-GCM encryption, PBKDF2 key derivation, secure key management—all client-side. Web Crypto API. No backend. No trust required."
tags: react, typescript, privacy, healthtech
series: CrisisCore Build Log
---

$content
"@

# Create the API request body
$body = @{
    article = @{
        title = "Client-Side Encryption for Healthcare Apps"
        published = $true
        body_markdown = $content
        tags = @("react", "typescript", "privacy", "healthtech")
        series = "CrisisCore Build Log"
        description = "AES-GCM encryption, PBKDF2 key derivation, secure key management—all client-side. Web Crypto API. No backend. No trust required."
    }
} | ConvertTo-Json -Depth 10

Write-Host "`nPublishing to DEV.to..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://dev.to/api/articles" `
        -Method Post `
        -Headers @{
            "api-key" = $ApiKey
            "Content-Type" = "application/json"
        } `
        -Body $body

    Write-Host "`n✅ Published successfully!" -ForegroundColor Green
    Write-Host "URL: $($response.url)" -ForegroundColor Yellow
    Write-Host "ID: $($response.id)" -ForegroundColor Gray
    Write-Host "Slug: $($response.slug)" -ForegroundColor Gray
    
    # Output the URL for use in updating other posts
    return $response
}
catch {
    Write-Host "`n❌ Failed to publish" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    throw
}
