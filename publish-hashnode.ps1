# Hashnode Publish Script
$pubId = "6914f549d535ac1991dcb8b2"
$token = "Ln5Dn15EREw4dqW47rHLY4H5"

# Read the markdown content
$content = Get-Content -Path "c:\Users\kay\Documents\Projects\pain-tracker\docs\content\blog\blog-client-side-encryption-healthcare.md" -Raw

# Remove the H1 title from content (first line) since we'll set it separately
$contentLines = $content -split "`n"
$contentWithoutTitle = ($contentLines | Select-Object -Skip 1) -join "`n"

$title = "Keeping Your Health Data Out of Court"
$slug = "keeping-your-health-data-out-of-court"

# Create variables object
$variables = @{
    input = @{
        title = $title
        slug = $slug
        contentMarkdown = $contentWithoutTitle.Trim()
        publicationId = $pubId
        tags = @(
            @{ slug = "encryption"; name = "Encryption" }
            @{ slug = "healthcare"; name = "Healthcare" }
            @{ slug = "privacy"; name = "Privacy" }
            @{ slug = "security"; name = "Security" }
            @{ slug = "typescript"; name = "TypeScript" }
            @{ slug = "web-crypto"; name = "Web Crypto" }
        )
    }
}

$query = @"
mutation PublishPost(`$input: PublishPostInput!) {
  publishPost(input: `$input) {
    post {
      id
      title
      slug
      url
    }
  }
}
"@

$body = @{
    query = $query
    variables = $variables
} | ConvertTo-Json -Depth 10 -Compress

$headers = @{
    "Authorization" = $token
    "Content-Type" = "application/json"
}

Write-Host "Publishing to Hashnode..."
Write-Host "Title: $title"
Write-Host "Slug: $slug"

try {
    $response = Invoke-RestMethod -Uri "https://gql.hashnode.com" -Method Post -Headers $headers -Body $body
    
    if ($response.errors) {
        Write-Host "Errors:" -ForegroundColor Red
        $response.errors | ConvertTo-Json -Depth 5
    }
    
    if ($response.data.publishPost.post) {
        Write-Host "Success!" -ForegroundColor Green
        Write-Host "Post URL: $($response.data.publishPost.post.url)"
        $response.data.publishPost.post | ConvertTo-Json -Depth 5
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
