param(
  [string]$CommitMessage = ""
)

$ErrorActionPreference = "Stop"

if (-not (git status --short)) {
  Write-Host "No changes detected. Nothing to deploy."
  exit 0
}

$currentBranch = (git branch --show-current).Trim()
if (-not $currentBranch) {
  Write-Error "Cannot determine current branch (detached HEAD)."
  exit 1
}

if ($env:SKIP_CHECKS -ne "true") {
  Write-Host "Running release checks..."
  npm run release:check
}

git add .

if (-not $CommitMessage) {
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $CommitMessage = "chore: deploy update ($timestamp)"
}

Write-Host "Committing changes..."
git commit -m $CommitMessage

Write-Host "Pushing $currentBranch to origin..."
git push origin $currentBranch

Write-Host "Push completed. CI/CD deployment should start automatically."
