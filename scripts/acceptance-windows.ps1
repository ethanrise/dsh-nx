param(
  [string]$Workspace = "$env:USERPROFILE\Documents\dsh-nx-acceptance"
)

$ErrorActionPreference = "Stop"
$required = @("DSH_NX_BRIDGE_URL", "DSH_NX_BRIDGE_TOKEN")
foreach ($name in $required) {
  if (-not [Environment]::GetEnvironmentVariable($name)) { throw "$name is required" }
}
New-Item -ItemType Directory -Force $Workspace | Out-Null
$env:DSH_NX_WORKSPACE = $Workspace

Write-Host "Running static package checks..."
npm run check
if ($LASTEXITCODE -ne 0) { throw "Static checks failed" }

Write-Host "Transport acceptance is ready."
Write-Host "The current bridge advertises no NXOpen mutation capability, so CAD acceptance must remain NOT RUN."
Write-Host "Follow docs/nx2512-validation.md after implementing the main-thread dispatcher and typed NXOpen handlers."
