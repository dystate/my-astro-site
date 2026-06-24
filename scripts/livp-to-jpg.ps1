# livp-to-jpg.ps1
# Turn a folder of .livp (Apple Live Photo packages, really zip) plus existing
# .jpg/.jpeg into sequentially numbered NN.jpg ordered by filename (timestamp),
# written to -Out. The still inside a .livp is extracted; if it is JPEG it is
# saved directly, if it is HEIC (no decoder here) it is reported and skipped.
#
# Usage:
#   .\scripts\livp-to-jpg.ps1 -Dir .\public\images\newjourney -Out .\photos\newjourney

param(
  [Parameter(Mandatory = $true)][string]$Dir,
  [Parameter(Mandatory = $true)][string]$Out
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (-not (Test-Path -LiteralPath $Dir)) { Write-Error "Source dir not found: $Dir"; exit 1 }
New-Item -ItemType Directory -Force -Path $Out | Out-Null
# remove old NN.jpg to avoid stale output
Get-ChildItem -LiteralPath $Out -File -Filter "*.jpg" -ErrorAction SilentlyContinue |
  Where-Object { $_.BaseName -match '^\d+$' } | Remove-Item -Force

function Test-Jpeg([byte[]]$b) {
  return ($b.Length -ge 3 -and $b[0] -eq 0xFF -and $b[1] -eq 0xD8 -and $b[2] -eq 0xFF)
}

# collect sources, sort by name (= timestamp)
$src = Get-ChildItem -LiteralPath $Dir -File |
  Where-Object { $_.Extension.ToLower() -in ".livp", ".jpg", ".jpeg" } |
  Sort-Object Name

if ($src.Count -eq 0) { Write-Warning "No .livp/.jpg/.jpeg found"; exit 0 }

$idx = 0
$skipped = @()
foreach ($f in $src) {
  $idx++
  $name = "{0:D2}.jpg" -f $idx
  $dest = Join-Path $Out $name

  if ($f.Extension.ToLower() -in ".jpg", ".jpeg") {
    Copy-Item -LiteralPath $f.FullName -Destination $dest -Force
    Write-Host ("{0}  <-  {1}" -f $name, $f.Name)
    continue
  }

  # .livp: open zip, take the non-.mov image entry (largest)
  $zip = [System.IO.Compression.ZipFile]::OpenRead($f.FullName)
  try {
    $entry = $zip.Entries |
      Where-Object { $_.Name -and $_.FullName -notmatch '\.mov$' } |
      Sort-Object Length -Descending | Select-Object -First 1
    if (-not $entry) { $skipped += ("{0} (no image entry)" -f $f.Name); continue }

    $ms = New-Object System.IO.MemoryStream
    $stream = $entry.Open()
    $stream.CopyTo($ms); $stream.Close()
    $bytes = $ms.ToArray(); $ms.Close()

    if (-not (Test-Jpeg $bytes)) {
      $hex = ($bytes[0..7] | ForEach-Object { $_.ToString("X2") }) -join " "
      $skipped += ("{0} (not JPEG, magic: {1} - likely HEIC, needs a decoder)" -f $f.Name, $hex)
      continue
    }
    [System.IO.File]::WriteAllBytes($dest, $bytes)
    Write-Host ("{0}  <-  {1}  [{2}]" -f $name, $f.Name, $entry.Name)
  } finally { $zip.Dispose() }
}

$done = (Get-ChildItem -LiteralPath $Out -File -Filter "*.jpg" | Where-Object { $_.BaseName -match '^\d+$' }).Count
Write-Host ""
Write-Host ("Done: {0} images -> {1}" -f $done, $Out) -ForegroundColor Green
if ($skipped.Count -gt 0) {
  Write-Host ("Skipped {0}:" -f $skipped.Count) -ForegroundColor Yellow
  $skipped | ForEach-Object { Write-Host ("   - {0}" -f $_) -ForegroundColor Yellow }
}
