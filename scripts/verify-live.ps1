# Verify that the live site matches the committed HTML.
#
#   powershell -File scripts/verify-live.ps1
#   powershell -File scripts/verify-live.ps1 -BaseUrl https://lpg-learning-centre.vercel.app
#
# Compares all 13 served pages byte-for-byte. Follows the cleanUrls redirect
# (/login.html -> /login). Exits 1 if any page differs, so it can gate a deploy.

param(
  [string]$BaseUrl = "https://lpg-learning-centre.vercel.app"
)

$ErrorActionPreference = "Stop"
$root  = Split-Path -Parent $PSScriptRoot
$pages = @(
  "a-day", "careers", "eccd", "find-us", "games", "index", "login",
  "parents", "portal", "programmes", "scholarship", "story", "why-lpg"
)

$tmp = Join-Path $env:TEMP ("verify-live-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tmp | Out-Null

$failed = 0
foreach ($page in $pages) {
  $file = Join-Path $root "$page.html"
  $url  = if ($page -eq "index") { "$BaseUrl/" } else { "$BaseUrl/$page" }
  $out  = Join-Path $tmp "$page.html"

  curl.exe -sS -L --fail -o "$out" $url 2>$null | Out-Null

  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $out)) {
    Write-Host ("FAIL {0,-12} could not fetch {1}" -f $page, $url)
    $failed++
    continue
  }

  $local = (Get-FileHash $file -Algorithm SHA256).Hash
  $live  = (Get-FileHash $out  -Algorithm SHA256).Hash

  if ($local -eq $live) {
    Write-Host ("ok   {0,-12} {1}" -f $page, $local.Substring(0, 12))
  } else {
    Write-Host ("FAIL {0,-12} local={1} live={2}" -f $page, $local.Substring(0, 12), $live.Substring(0, 12))
    $failed++
  }
}

Remove-Item -Recurse -Force $tmp

if ($failed -gt 0) {
  Write-Host ""
  Write-Host "$failed of $($pages.Count) page(s) differ from the repository."
  exit 1
}

Write-Host ""
Write-Host "All $($pages.Count) pages match the repository."
