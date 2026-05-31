#!/usr/bin/env bash

set -euo pipefail

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage:
  ./push-and-deploy.sh "commit message"

Options:
  SKIP_CHECKS=true   Skip quality checks before commit/push.
EOF
  exit 0
fi

if [[ -z "$(git status --short)" ]]; then
  echo "No changes detected. Nothing to deploy."
  exit 0
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [[ -z "${CURRENT_BRANCH}" ]]; then
  echo "Cannot determine current branch (detached HEAD)."
  exit 1
fi

if [[ "${SKIP_CHECKS:-false}" != "true" ]]; then
  echo "Running release checks..."
  npm run release:check
fi

git add .

COMMIT_MSG="${1:-}"
if [[ -z "${COMMIT_MSG}" ]]; then
  COMMIT_MSG="chore: deploy update ($(date +'%Y-%m-%d %H:%M:%S'))"
fi

echo "Committing changes..."
git commit -m "${COMMIT_MSG}"

echo "Pushing ${CURRENT_BRANCH} to origin..."
git push origin "${CURRENT_BRANCH}"

echo "Push completed. CI/CD deployment should start automatically."
