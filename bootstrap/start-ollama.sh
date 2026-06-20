#!/usr/bin/env bash
# Teknovo AI Workstation — start/restart Ollama (containers without systemd)
#
# Usage:
#   bash bootstrap/start-ollama.sh
#
# Startup priority: systemd → tmux → screen → nohup
# Recovery: tmux attach -t ollama
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

main() {
  require_linux
  init_state

  if start_ollama_service; then
    echo "OLLAMA READY"
    exit 0
  fi

  echo "OLLAMA FAILED"
  exit 1
}

main "$@"
