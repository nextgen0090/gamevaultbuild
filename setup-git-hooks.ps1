# Run once to enable auto buildVersion bump on commit when Build/ files change.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

git config core.hooksPath .githooks
Write-Host "Git hooks enabled (.githooks/pre-commit)" -ForegroundColor Green
Write-Host "When you commit changes under public/Build/ or public/StreamingAssets/, buildVersion updates automatically." -ForegroundColor Cyan
