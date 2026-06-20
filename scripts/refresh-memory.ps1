# Teknovo Memory Refresh — Windows PowerShell
# Regenerates auto-refreshable memory artifacts

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Split-Path -Parent $ScriptDir

Set-Location $RepoRoot

Write-Host "==> Teknovo Memory Refresh"
Write-Host "    Repository: $RepoRoot"

# Prefer python, fallback to py launcher
$Python = $null
foreach ($cmd in @("python", "python3", "py")) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        $Python = $cmd
        break
    }
}

if (-not $Python) {
    Write-Error "Python not found. Install Python 3 and ensure it is on PATH."
}

& $Python ai-agent/runtime/refresh_helpers.py --repo-map-only

try {
    & $Python ai-agent/runtime/load-memory.py --format json --quiet-warnings | Out-Null
    Write-Host "==> Memory loader verification: OK"
} catch {
    Write-Host "==> Memory loader verification: completed with warnings"
    & $Python ai-agent/runtime/load-memory.py --format json --quiet-warnings 2>&1 | Out-Null
}

Write-Host "==> Done. Manual artifacts require human review."
Write-Host "    Append lessons to memory/lessons-learned.md"
Write-Host "    Add sessions to memory/sessions/YYYY-MM-DD-topic.md"
