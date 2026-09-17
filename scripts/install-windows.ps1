param(
  [string]$Profile = "web",
  [string]$Workspace = "$env:USERPROFILE\Documents\dsh-nx-workspace",
  [string]$NxRoot = ""
)

$ErrorActionPreference = "Stop"
if (-not $IsWindows -and $env:OS -ne "Windows_NT") { throw "dsh-nx live mode requires native Windows" }
if (-not (Get-Command dsh -ErrorAction SilentlyContinue)) { throw "dsh command was not found on PATH" }

New-Item -ItemType Directory -Force $Workspace | Out-Null
dsh plugin --profile $Profile add github:ethanrise/dsh-nx

$projectSkill = Join-Path (Get-Location) ".dsh\skills\nx-modeling"
New-Item -ItemType Directory -Force $projectSkill | Out-Null
$profileRoot = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE ".dsh" }
$installedSkill = Get-ChildItem -Path (Join-Path $profileRoot "profiles\$Profile\node_modules\dsh-nx\skills\nx-modeling\SKILL.md") -ErrorAction Stop
Copy-Item $installedSkill.FullName (Join-Path $projectSkill "SKILL.md") -Force

Write-Host "Installed dsh-nx into profile '$Profile'."
Write-Host "Set DSH_NX_WORKSPACE=$Workspace"
if ($NxRoot) { Write-Host "Set DSH_NX_ROOT=$NxRoot" }
Write-Host "The real NX adapter remains disabled until the NX 2512 bridge passes acceptance."
