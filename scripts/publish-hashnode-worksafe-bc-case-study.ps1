param(
  [Parameter(Mandatory = $false)]
  [string]$MarkdownPath = "c:\Users\kay\Documents\Projects\pain-tracker\docs\content\blog\blog-worksafe-bc-case-study-documentation-time-savings.md",

  [Parameter(Mandatory = $false)]
  [string]$Title = "How Pain Tracker Pro Streamlines WorkSafeBC Claims: A Composite Case Study",

  [Parameter(Mandatory = $false)]
  [string]$Slug = "worksafe-bc-case-study-documentation-time-savings",

  [Parameter(Mandatory = $false)]
  [string]$PublicationId = $env:HASHNODE_PUBLICATION_ID,

  [Parameter(Mandatory = $false)]
  [string]$Token = $env:HASHNODE_TOKEN
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($PublicationId)) {
  throw 'Missing HASHNODE_PUBLICATION_ID. Set it in your session: $env:HASHNODE_PUBLICATION_ID="..."'
}

if ([string]::IsNullOrWhiteSpace($Token)) {
  throw 'Missing HASHNODE_TOKEN. Set it in your session: $env:HASHNODE_TOKEN="..."'
}

if (-not (Test-Path -Path $MarkdownPath)) {
  throw "Markdown file not found: $MarkdownPath"
}

$content = Get-Content -Path $MarkdownPath -Raw

# Remove the leading H1 if present, since title is supplied separately.
# Also drop a single blank line immediately after the H1.
$contentLines = $content -split "`n"
if ($contentLines.Length -gt 0 -and $contentLines[0].TrimStart().StartsWith('# ')) {
  $contentLines = $contentLines | Select-Object -Skip 1
  if ($contentLines.Length -gt 0 -and [string]::IsNullOrWhiteSpace($contentLines[0])) {
    $contentLines = $contentLines | Select-Object -Skip 1
  }
}

$contentWithoutTitle = ($contentLines -join "`n").Trim()

$variables = @{
  input = @{
    title          = $Title
    slug           = $Slug
    contentMarkdown = $contentWithoutTitle
    publicationId  = $PublicationId
    tags           = @(
      @{ slug = 'worksafebc'; name = 'WorkSafeBC' }
      @{ slug = 'healthcare'; name = 'Healthcare' }
      @{ slug = 'privacy'; name = 'Privacy' }
      @{ slug = 'accessibility'; name = 'Accessibility' }
      @{ slug = 'pwa'; name = 'PWA' }
      @{ slug = 'typescript'; name = 'TypeScript' }
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
  query     = $query
  variables = $variables
} | ConvertTo-Json -Depth 10 -Compress

$headers = @{
  Authorization = $Token
  'Content-Type' = 'application/json'
}

Write-Host "Publishing to Hashnode..."
Write-Host "Title: $Title"
Write-Host "Slug:  $Slug"

$response = Invoke-RestMethod -Uri 'https://gql.hashnode.com' -Method Post -Headers $headers -Body $body

if ($response.errors) {
  Write-Host "Errors:" -ForegroundColor Red
  $response.errors | ConvertTo-Json -Depth 10
  exit 1
}

if ($response.data.publishPost.post) {
  $url = $response.data.publishPost.post.url
  Write-Host "Success!" -ForegroundColor Green
  Write-Host "Post URL: $url"
  $url | Out-File -FilePath "hashnode-published-url.txt" -Encoding utf8
  exit 0
}

Write-Host "Unexpected response:" -ForegroundColor Yellow
$response | ConvertTo-Json -Depth 10
exit 1
