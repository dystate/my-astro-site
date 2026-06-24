# upload-album-upyun.ps1
# Batch-upload a local folder to an Upyun (又拍云) storage service under the
# /<album>/ directory, using the official upx CLI. Credentials stay in your
# local upx session; this script never reads them.
#
# One-time setup:
#   1) Download upx: https://github.com/upyun/upx/releases  (put upx.exe on PATH)
#   2) upx login <service> <operator> <password>
#        service  = 又拍云「云存储服务」名
#        operator = 该服务的「操作员」账号（在服务的“操作员管理”里建，需有读写权限）
#
# Usage:
#   .\scripts\upload-album-upyun.ps1 -Album newjourney -Dir .\photos\newjourney
#   .\scripts\upload-album-upyun.ps1 -Album newjourney -Dir .\photos\newjourney -DryRun

param(
  [Parameter(Mandatory = $true)][string]$Album,
  [Parameter(Mandatory = $true)][string]$Dir,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command upx -ErrorAction SilentlyContinue)) {
  Write-Error "upx not found on PATH. Install it and run 'upx login <service> <operator> <password>' first."
  exit 1
}
if (-not (Test-Path -LiteralPath $Dir)) { Write-Error "Dir not found: $Dir"; exit 1 }

$exts = ".jpg", ".jpeg", ".png", ".webp", ".avif"
$files = Get-ChildItem -LiteralPath $Dir -File |
  Where-Object { $exts -contains $_.Extension.ToLower() } |
  Sort-Object Name
if ($files.Count -eq 0) { Write-Warning "No images in $Dir"; exit 0 }

Write-Host ("-> upyun /{0}/  ({1} files)" -f $Album, $files.Count) -ForegroundColor Cyan

$i = 0; $fail = @()
foreach ($f in $files) {
  $i++
  $remote = "/$Album/$($f.Name)"   # e.g. /newjourney/01.jpg
  Write-Host ("[{0}/{1}] {2}" -f $i, $files.Count, $remote)
  if ($DryRun) { continue }
  upx put $f.FullName $remote | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "  FAIL ($LASTEXITCODE)" -ForegroundColor Red; $fail += $remote }
}

if ($DryRun) { Write-Host "(DryRun: nothing uploaded)" -ForegroundColor Yellow; exit 0 }
Write-Host ("Done: {0}/{1} ok, {2} failed" -f ($files.Count - $fail.Count), $files.Count, $fail.Count) -ForegroundColor Green
if ($fail.Count) { $fail -join ", " }
