param(
  [Parameter(Mandatory = $true)][string]$NxOpenDir,
  [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"
if (-not (Test-Path (Join-Path $NxOpenDir "NXOpen.dll"))) { throw "NXOpen.dll was not found under $NxOpenDir" }
dotnet build "$PSScriptRoot\..\bridge\NX2512Bridge\NX2512Bridge.csproj" -c $Configuration -p:NXOpenDir="$NxOpenDir"
if ($LASTEXITCODE -ne 0) { throw "NX bridge build failed" }
