param([Parameter(Mandatory=$true)][string]$OutputPath)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$archivePath = [System.IO.Path]::GetFullPath($OutputPath)
if (Test-Path -LiteralPath $archivePath) { throw "Archive already exists: $archivePath" }
$archiveDirectory = Split-Path -Parent $archivePath
if (-not (Test-Path -LiteralPath $archiveDirectory)) { New-Item -ItemType Directory -Path $archiveDirectory -Force | Out-Null }
$archive = [System.IO.Compression.ZipFile]::Open($archivePath,[System.IO.Compression.ZipArchiveMode]::Create)
try {
  $includedPaths = @('dist','content','scripts','README.md','START-HERE.md','package.json','server.mjs','.gitignore','ASSET_PROVENANCE.md','RENDER_SOURCES.md','DIRECTION.md')
  foreach ($includedPath in $includedPaths) {
    $absolutePath = Join-Path $projectDirectory $includedPath
    if (-not (Test-Path -LiteralPath $absolutePath)) { continue }
    $item = Get-Item -LiteralPath $absolutePath -Force
    $files = if ($item.PSIsContainer) { Get-ChildItem -LiteralPath $absolutePath -Recurse -File -Force } else { @($item) }
    foreach ($file in $files) {
      $relativePath = [System.IO.Path]::GetRelativePath($projectDirectory,$file.FullName).Replace('\','/')
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$file.FullName,('Vikram-R-Portfolio/' + $relativePath),[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  }
  $originalClip = Join-Path $projectDirectory 'original-renders\controller 1.mp4'
  if (-not (Test-Path -LiteralPath $originalClip)) { $originalClip = Join-Path $projectDirectory 'download-extras\original-renders\controller 1.mp4' }
  if (Test-Path -LiteralPath $originalClip) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$originalClip,'Vikram-R-Portfolio/original-renders/controller 1.mp4',[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $archive.Dispose() }
$verified = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
try {
  $required = @('Vikram-R-Portfolio/dist/index.html','Vikram-R-Portfolio/dist/work/index.html','Vikram-R-Portfolio/dist/intro.js','Vikram-R-Portfolio/content/sections/loader.html','Vikram-R-Portfolio/scripts/build-site.mjs','Vikram-R-Portfolio/original-renders/controller 1.mp4')
  foreach ($entry in $required) { if (-not $verified.GetEntry($entry)) { throw "Missing archive entry: $entry" } }
  $controllerStream = $verified.GetEntry('Vikram-R-Portfolio/original-renders/controller 1.mp4').Open()
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try { $archivedHash = [Convert]::ToHexString($sha.ComputeHash($controllerStream)) } finally { $controllerStream.Dispose(); $sha.Dispose() }
  if ($archivedHash -ne (Get-FileHash -Algorithm SHA256 -LiteralPath $originalClip).Hash) { throw 'Original controller render checksum mismatch' }
  $htmlCount = @($verified.Entries | Where-Object { $_.FullName -like 'Vikram-R-Portfolio/dist/*.html' }).Count
  $filmCount = @($verified.Entries | Where-Object { $_.FullName -like 'Vikram-R-Portfolio/dist/assets/*.mp4' }).Count
  if ($htmlCount -ne 12 -or $filmCount -ne 8) { throw "Unexpected contents: $htmlCount pages, $filmCount deployed films" }
  if ($verified.Entries.FullName -match '/\.git/' -or $verified.Entries.FullName -match '/node_modules/') { throw 'Unexpected repository or dependency cache in archive' }
  [PSCustomObject]@{Archive=$archivePath;Files=$verified.Entries.Count;Pages=$htmlCount;Films=$filmCount;OriginalControllerIncluded=$true;SizeMB=[Math]::Round((Get-Item -LiteralPath $archivePath).Length/1MB,2)} | ConvertTo-Json
} finally { $verified.Dispose() }
