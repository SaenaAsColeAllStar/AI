#!/usr/bin/env bash
# Phase 11 — Final status screen
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

status_check() {
  local label="$1"
  shift
  if "$@"; then
    printf "✓ %s\n" "${label}"
    return 0
  fi
  printf "✗ %s\n" "${label}"
  return 1
}

check_runtime() {
  command -v git >/dev/null 2>&1 && \
  command -v curl >/dev/null 2>&1 && \
  command -v python3 >/dev/null 2>&1 && \
  command -v node >/dev/null 2>&1
}

check_python_min() {
  command -v python3 >/dev/null 2>&1 || return 1
  python3 -c "import sys; raise SystemExit(0 if sys.version_info >= (${MIN_PYTHON_MAJOR}, ${MIN_PYTHON_MINOR}) else 1)"
}

check_node_min() {
  command -v node >/dev/null 2>&1 || return 1
  [[ "$(get_node_major)" -ge "${MIN_NODE_MAJOR}" ]]
}

check_opencode() {
  command -v opencode >/dev/null 2>&1 && opencode --version >/dev/null 2>&1
}

print_status() {
  local bold nc green red
  if [[ -t 1 ]]; then
    bold=$'\033[1m'
    nc=$'\033[0m'
    green=$'\033[0;32m'
    red=$'\033[0;31m'
  else
    bold='' nc='' green='' red=''
  fi

  load_install_lock
  local node_label="Node ${MIN_NODE_MAJOR}"
  local model_label="Qwen2.5-Coder 32B"
  local all_ok=true

  echo ""
  echo "================================="
  echo -e "${bold}COLEALLSTAR${nc}"
  echo "          X"
  echo -e "${bold}TEKNOVO${nc}"
  echo "================================="

  status_check "Runtime" check_runtime || all_ok=false
  status_check "Python" check_python_min || all_ok=false
  status_check "${node_label}" check_node_min || all_ok=false
  status_check "Git" git --version || all_ok=false
  status_check "Ollama" ollama_api_tags || all_ok=false
  status_check "${model_label}" model_present || all_ok=false
  status_check "OpenCode" check_opencode || all_ok=false
  status_check "Registry" test -f "${REPO_ROOT}/registry/skill-registry.yaml" || all_ok=false
  status_check "Skills" test -f "${REPO_ROOT}/.agents/registry.yaml" || all_ok=false
  status_check "Memory" test -f "${REPO_ROOT}/memory/memory-registry.yaml" || all_ok=false
  status_check "Validation" test -f "${REPO_ROOT}/.bootstrap/reports/final-report.md" || all_ok=false

  echo "================================="
  if [[ "${all_ok}" == "true" ]]; then
    echo -e "${green}${bold}AI WORKSTATION READY${nc}"
  else
    echo -e "${red}${bold}AI WORKSTATION INCOMPLETE${nc}"
    echo "Run: bash bootstrap/recover.sh"
  fi
  echo ""

  if [[ "${INSTALL_BROWSER_DEV:-0}" != "1" ]] && [[ ! -d "${REPO_ROOT}/.bootstrap/browser-dev" ]]; then
    echo "Optional: INSTALL_BROWSER_DEV=1 bash bootstrap/install.sh --browser-dev"
  fi
  echo "Log: ${INSTALL_LOG:-${LOG_DIR}/latest.log}"
  echo "Report: ${REPO_ROOT}/.bootstrap/reports/final-report.md"
  echo "State: ${REPO_ROOT}/.bootstrap/state.json"
  echo "Docs: ${REPO_ROOT}/AI_BOOTSTRAP.md"
  echo ""
}

main() {
  print_status
}

main "$@"
