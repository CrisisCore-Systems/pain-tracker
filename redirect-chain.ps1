param(
  [Parameter(Mandatory = $true)]
  [string[]] $Urls,

  [int] $MaxHops = 10,

  [int] $SleepMs = 0
)

# Windows PowerShell 5.1 may not pre-load this assembly.
try {
  Add-Type -AssemblyName System.Net.Http -ErrorAction Stop
} catch {
  # Best-effort; if unavailable, requests will fail with a clear error.
}

# Ensure TLS 1.2 for older PowerShell environments
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
} catch {
  # ignore
}

function Trace-RedirectChain {
  param([string] $Url, [int] $MaxHops)

  Write-Host "`n=== $Url ===" -ForegroundColor Cyan

  $current = $Url
  for ($i = 0; $i -lt $MaxHops; $i++) {
    function Request-Once {
      param(
        [Parameter(Mandatory = $true)][string] $Url,
        [Parameter(Mandatory = $true)][ValidateSet('HEAD', 'GET')][string] $Method
      )

      $handler = New-Object System.Net.Http.HttpClientHandler
      $handler.AllowAutoRedirect = $false

      $client = New-Object System.Net.Http.HttpClient($handler)
      $client.Timeout = [TimeSpan]::FromSeconds(15)

      $httpMethod = [System.Net.Http.HttpMethod]::$Method
      $req = New-Object System.Net.Http.HttpRequestMessage($httpMethod, $Url)

      $req.Headers.TryAddWithoutValidation('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36') | Out-Null
      $req.Headers.TryAddWithoutValidation('Accept', '*/*') | Out-Null
      $req.Headers.TryAddWithoutValidation('Accept-Language', 'en-US,en;q=0.9') | Out-Null
      $req.Headers.TryAddWithoutValidation('Cache-Control', 'no-cache') | Out-Null
      $req.Headers.TryAddWithoutValidation('Pragma', 'no-cache') | Out-Null

      if ($Method -eq 'GET') {
        $req.Headers.TryAddWithoutValidation('Range', 'bytes=0-0') | Out-Null
      }

      try {
        $resp = $client.SendAsync($req, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).Result
        $status = [int] $resp.StatusCode
        $loc = $null
        if ($resp.Headers.Location) { $loc = $resp.Headers.Location.ToString() }

        $vercelMitigated = $null
        if ($resp.Headers.Contains('X-Vercel-Mitigated')) {
          $vercelMitigated = ($resp.Headers.GetValues('X-Vercel-Mitigated') | Select-Object -First 1)
        }

        return [pscustomobject]@{ Status = $status; Location = $loc; VercelMitigated = $vercelMitigated }
      } finally {
        $client.Dispose()
      }
    }

    function Fetch-Hop {
      param([Parameter(Mandatory = $true)][string] $Url)

      $head = Request-Once -Url $Url -Method 'HEAD'
      if ($head.Status -in 429, 403, 405) {
        $get = Request-Once -Url $Url -Method 'GET'

        $extra = $null
        if ($get.VercelMitigated -eq 'challenge') {
          $extra = 'Vercel Security Checkpoint challenge'
        }

        return [pscustomobject]@{
          Status   = $get.Status
          Location = $get.Location
          Note     = ("HEAD blocked ($($head.Status)); used GET+Range" + $(if ($extra) { "; $extra" } else { '' }))
        }
      }

      if ($head.VercelMitigated -eq 'challenge') {
        return [pscustomobject]@{
          Status   = $head.Status
          Location = $head.Location
          Note     = 'Vercel Security Checkpoint challenge'
        }
      }

      return [pscustomobject]@{
        Status   = $head.Status
        Location = $head.Location
        Note     = $null
      }
    }

    $hop = $null
    try {
      $hop = Fetch-Hop -Url $current
    } catch {
      Write-Host ("ERR: {0}" -f $_.Exception.Message) -ForegroundColor Red
      return
    }

    $status = $hop.Status
    $loc = $hop.Location
    $note = $hop.Note

    if ($loc) {
      if ($note) {
        Write-Host ("{0,2}. {1}  ->  {2}  ({3})" -f ($i + 1), $status, $loc, $note)
      } else {
        Write-Host ("{0,2}. {1}  ->  {2}" -f ($i + 1), $status, $loc)
      }

      $current = (New-Object System.Uri((New-Object System.Uri($current)), $loc)).AbsoluteUri
      if ($SleepMs -gt 0) { Start-Sleep -Milliseconds $SleepMs }
      continue
    }

    if ($note) {
      Write-Host ("{0,2}. {1}  (final)  ({2})" -f ($i + 1), $status, $note) -ForegroundColor Green
    } else {
      Write-Host ("{0,2}. {1}  (final)" -f ($i + 1), $status) -ForegroundColor Green
    }
    return
  }

  Write-Host "Stopped after $MaxHops hops (possible loop or unexpected chain)." -ForegroundColor Yellow
}

$Urls | ForEach-Object { Trace-RedirectChain -Url $_ -MaxHops $MaxHops }
