param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$SeriesId = "",
  [int]$TimeoutSec = 20
)

$ErrorActionPreference = "Stop"
$results = New-Object System.Collections.Generic.List[object]
$hasFailure = $false

function Test-Endpoint {
  param([string]$Url)
  try {
    Invoke-RestMethod -Method GET -Uri "$Url/api/public" -TimeoutSec ([Math]::Min($TimeoutSec, 6)) | Out-Null
    return $true
  }
  catch {
    return $false
  }
}

function Add-Result {
  param(
    [string]$Step,
    [string]$Status,
    [string]$Detail
  )
  $results.Add([PSCustomObject]@{
      Step   = $Step
      Status = $Status
      Detail = $Detail
    })
}

function Invoke-Api {
  param(
    [ValidateSet("GET", "POST", "PUT", "DELETE")]
    [string]$Method,
    [string]$Path,
    [object]$Body = $null,
    [string]$Token = ""
  )

  $uri = "$BaseUrl$Path"
  $headers = @{}
  if ($Token) {
    $headers["Authorization"] = "Bearer $Token"
  }

  if ($Method -eq "GET") {
    return Invoke-RestMethod -Method GET -Uri $uri -Headers $headers -TimeoutSec $TimeoutSec
  }

  $json = if ($null -eq $Body) { "{}" } else { $Body | ConvertTo-Json -Depth 10 }
  return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -Body $json -ContentType "application/json" -TimeoutSec $TimeoutSec
}

function Assert-True {
  param(
    [bool]$Condition,
    [string]$Message
  )
  if (-not $Condition) {
    throw $Message
  }
}

Write-Host "== MVP API Regression Start =="

if (-not (Test-Endpoint -Url $BaseUrl)) {
  if ($BaseUrl -match "127\.0\.0\.1") {
    $fallback = $BaseUrl -replace "127\.0\.0\.1", "localhost"
    if (Test-Endpoint -Url $fallback) {
      $BaseUrl = $fallback
    }
  }
  elseif ($BaseUrl -match "localhost") {
    $fallback = $BaseUrl -replace "localhost", "127.0.0.1"
    if (Test-Endpoint -Url $fallback) {
      $BaseUrl = $fallback
    }
  }
}

Write-Host "BaseUrl: $BaseUrl"
Write-Host ""

$token = ""
$user = $null
$pickedSeriesId = $SeriesId

try {
  $resp = Invoke-Api -Method GET -Path "/api/public"
  Assert-True ($resp.code -eq 200) "Unexpected code: $($resp.code)"
  Add-Result -Step "public.index" -Status "PASS" -Detail "GET /api/public"
}
catch {
  $hasFailure = $true
  Add-Result -Step "public.index" -Status "FAIL" -Detail $_.Exception.Message
}

try {
  $resp = Invoke-Api -Method POST -Path "/api/public/anonymous" -Body @{}
  Assert-True ($resp.code -eq 200) "Unexpected code: $($resp.code)"
  Assert-True (-not [string]::IsNullOrWhiteSpace($resp.data.token)) "Token is empty"
  $token = $resp.data.token
  $user = $resp.data.user
  Add-Result -Step "public.anonymous" -Status "PASS" -Detail "Token issued"
}
catch {
  $hasFailure = $true
  Add-Result -Step "public.anonymous" -Status "FAIL" -Detail $_.Exception.Message
}

try {
  $resp = Invoke-Api -Method POST -Path "/api/public/home" -Body @{}
  Assert-True ($resp.code -eq 200) "Unexpected code: $($resp.code)"

  $recommendCount = @($resp.data.recommend).Count
  $releaseCount = @($resp.data.release).Count

  if (-not $pickedSeriesId) {
    if ($recommendCount -gt 0 -and $resp.data.recommend[0]._id) {
      $pickedSeriesId = [string]$resp.data.recommend[0]._id
    }
    elseif ($releaseCount -gt 0 -and $resp.data.release[0]._id) {
      $pickedSeriesId = [string]$resp.data.release[0]._id
    }
    elseif (@($resp.data.categorys).Count -gt 0 -and @($resp.data.categorys[0].series).Count -gt 0) {
      $pickedSeriesId = [string]$resp.data.categorys[0].series[0]._id
    }
  }

  $detail = "recommend=$recommendCount, release=$releaseCount"
  if ($pickedSeriesId) { $detail = "$detail, pickedSeriesId=$pickedSeriesId" }
  Add-Result -Step "public.home" -Status "PASS" -Detail $detail
}
catch {
  $hasFailure = $true
  Add-Result -Step "public.home" -Status "FAIL" -Detail $_.Exception.Message
}

try {
  Assert-True (-not [string]::IsNullOrWhiteSpace($pickedSeriesId)) "No seriesId available. Pass -SeriesId manually."
  $resp = Invoke-Api -Method POST -Path "/api/public/series" -Body @{ id = $pickedSeriesId }
  Assert-True ($resp.code -eq 200) "Unexpected code: $($resp.code)"
  $episodes = @($resp.data)
  Assert-True ($episodes.Count -gt 0) "No episode data"

  $invalid = $episodes | Where-Object {
    $v = $_.video
    ($null -eq $v) -or (@($v).Count -eq 0) -or [string]::IsNullOrWhiteSpace([string]@($v)[0])
  }
  Assert-True (@($invalid).Count -eq 0) "Found episodes with invalid video field"

  Add-Result -Step "public.series" -Status "PASS" -Detail "episodes=$($episodes.Count)"
}
catch {
  $hasFailure = $true
  Add-Result -Step "public.series" -Status "FAIL" -Detail $_.Exception.Message
}

try {
  $resp = Invoke-Api -Method POST -Path "/api/profile/favorite" -Body @{} -Token $token
  Assert-True ($resp.code -eq 200) "Unexpected code: $($resp.code)"
  Add-Result -Step "profile.favorite(auth)" -Status "PASS" -Detail "JWT valid"
}
catch {
  $hasFailure = $true
  Add-Result -Step "profile.favorite(auth)" -Status "FAIL" -Detail $_.Exception.Message
}

try {
  $uri = "$BaseUrl/api/profile/favorite"
  $json = "{}"
  Invoke-RestMethod -Method POST -Uri $uri -Body $json -ContentType "application/json" -TimeoutSec $TimeoutSec | Out-Null
  throw "Expected 401 but request succeeded."
}
catch {
  $msg = $_.Exception.Message
  if ($msg -match "401") {
    Add-Result -Step "profile.favorite(no-auth)" -Status "PASS" -Detail "401 as expected"
  }
  else {
    $hasFailure = $true
    Add-Result -Step "profile.favorite(no-auth)" -Status "FAIL" -Detail $msg
  }
}

Write-Host ""
Write-Host "== Result =="
$results | Format-Table -AutoSize

if ($hasFailure) {
  Write-Host ""
  Write-Host "MVP regression FAILED." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "MVP regression PASSED." -ForegroundColor Green
exit 0
