# Fix markdown formatting issues in PWA-IMPLEMENTATION.md
$filePath = "docs/PWA-IMPLEMENTATION.md"
$content = Get-Content $filePath -Raw

# Fix headings - add blank line after headings
$content = $content -replace '(#{1,6} [^\r\n]+)\r?\n([^#\s\r\n-])', '$1`n`n$2'

# Fix lists - add blank line before lists
$content = $content -replace '([^\r\n])\r?\n(- \*\*[^*]+\*\*:)', '$1`n`n$2'
$content = $content -replace '([^\r\n])\r?\n(- [^*])', '$1`n`n$2'
$content = $content -replace '([^\r\n])\r?\n(\d+\. )', '$1`n`n$2'

# Fix code blocks - add blank lines around code blocks
$content = $content -replace '([^\r\n])\r?\n```', '$1`n`n```'
$content = $content -replace '```\r?\n([^`\r\n])', '````n`n$1'

# Fix specific code block language
$content = $content -replace '```\r?\npain-tracker-offline', '```text`npain-tracker-offline'

Set-Content $filePath $content
Write-Host "Fixed markdown formatting in $filePath"
