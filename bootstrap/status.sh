#!/usr/bin/env bash
# Phase 12 — Final status screen
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

status_line() {
  local label="$1"
  local check_cmd="$2"
  local status="FAIL"
  if eval "${check_cmd}" >/dev/null 2>&1; then
    status="READY"
  fi
  printf "%-18s %s\n" "${label}:" "${status}"
}

recovery_status() {
  if [[ -x "${BOOTSTRAP_DIR}/install.sh" ]] && \
     [[ -f "${REPO_ROOT}/AI_RECOVERY.md" ]]; then
    echo "PASS"
  else
    echo "FAIL"
  fi
}

print_status() {
  local bold nc
  if [[ -t 1 ]]; then
    bold=$'\033[1m'
    nc=$'\033[0m'
  else
    bold='' nc=''
  fi

  echo ""
  echo "===================================="
  echo -e "${bold}COLEALLSTAR × TEKNOVO${nc}"
  echo -e "${bold}AI WORKSTATION${nc}"
  echo "===================================="
  status_line "Environment" "test -d ${REPO_ROOT}"
  status_line "Ollama" "curl -sf ${OLLAMA_HOST}/api/tags"
  status_line "Qwen2.5-Coder" "ollama list | grep -q '${OLLAMA_MODEL}'"
  status_line "OpenCode" "command -v opencode"
  status_line "Memory" "test -f ${REPO_ROOT}/memory/memory-registry.yaml"
  status_line "Skills" "test -f ${REPO_ROOT}/.agents/registry.yaml"
  status_line "Registry" "test -f ${REPO_ROOT}/registry/skill-registry.yaml"
  status_line "MCP" "test -f ${REPO_ROOT}/mcp/github/README.md"
  printf "%-18s %s\n" "Recovery:" "$(recovery_status)"
  echo "===================================="
  echo ""
  echo "Log: ${INSTALL_LOG:-${LOG_DIR}/latest.log}"
  echo "Docs: ${REPO_ROOT}/AI_BOOTSTRAP.md"
  echo ""
}

main() {
  print_status
}

main "$@"
