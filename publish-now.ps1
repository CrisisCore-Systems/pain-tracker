$apiKey = "Ln5Dn15EREw4dqW47rHLY4H5"
$content = Get-Content -Path "docs/content/blog/blog-client-side-encryption-healthcare.md" -Raw

$body = @{
    article = @{
        title = "Client-Side Encryption for Healthcare Apps"
        published = $true
        body_markdown = $content
        tags = @("react", "typescript", "privacy", "healthtech")
        series = "CrisisCore Build Log"
        description = "AES-GCM encryption, PBKDF2 key derivation, secure key management. Web Crypto API. No backend."
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://dev.to/api/articles" -Method Post -Headers @{ "api-key" = $apiKey; "Content-Type" = "application/json" } -Body $body
    Write-Host "SUCCESS"
    Write-Host "URL: $($response.url)"
    Write-Host "ID: $($response.id)"
    $response.url | Out-File -FilePath "devto-published-url.txt"
} catch {
    Write-Host "ERROR: $_"
    $_.Exception.Response
}
