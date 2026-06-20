#!/usr/bin/env bash
# Teknovo AI Workstation — recovery orchestrator
# Detects partial installation and resumes from last successful phase.
#
# Usage:
#   bash bootstrap/recover.sh
#   bash bootstrap/recover.sh --reset
set -euo pipefail

BOOTSTRAP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${1:-}" == "--reset" ]]; then
  exec bash "${BOOTSTRAP_DIR}/install.sh" --reset
fi

if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
  cat <<'EOF'
Teknovo AI Workstation recovery

Usage:
  bash bootstrap/recover.sh          Resume from checkpoint
  bash bootstrap/recover.sh --reset  Clear state and reinstall

Checkpoint file: .bootstrap/state.json
Logs:            .bootstrap/logs/
Preflight report: docs/ai/compatibility-report.md
EOF
  exit 0
fi

# shellcheck source=common.sh
source "${BOOTSTRAP_DIR}/common.sh"

init_state

if ! detect_partial_install; then
  log_recovery "No checkpoint found — running full install"
else
  log_recovery "Resuming after phase: $(get_last_completed_phase)"
fi

exec bash "${BOOTSTRAP_DIR}/install.sh" --recover
