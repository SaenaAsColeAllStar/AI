#!/usr/bin/env bash
# Teknovo Memory Refresh — regenerates auto-refreshable memory artifacts
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "==> Teknovo Memory Refresh"
echo "    Repository: $REPO_ROOT"

# Regenerate repository-map.md from live tree scan
python3 ai-agent/runtime/refresh_helpers.py --repo-map-only

# Load memory to verify artifacts (warnings only)
if python3 ai-agent/runtime/load-memory.py --format json --quiet-warnings > /dev/null 2>&1; then
  echo "==> Memory loader verification: OK"
else
  echo "==> Memory loader verification: completed with warnings (see stderr)"
  python3 ai-agent/runtime/load-memory.py --format json --quiet-warnings > /dev/null || true
fi

echo "==> Done. Manual artifacts (product, domain, architecture, lessons) require human review."
echo "    Append new lessons to memory/lessons-learned.md"
echo "    Add session summaries to memory/sessions/YYYY-MM-DD-topic.md"
