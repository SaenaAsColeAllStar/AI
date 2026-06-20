#!/usr/bin/env bash
# Phase 2 — Install and verify Ollama
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

trap 'on_phase_error ${LINENO}' ERR

install_ollama() {
  if command_exists ollama; then
    success "Ollama already installed: $(ollama --version 2>/dev/null || echo 'installed')"
    return 0
  fi

  info "Installing Ollama..."
  run_bash_script "https://ollama.com/install.sh"
  success "Ollama installed"
}

verify_ollama() {
  local response
  response="$(ollama_api_tags)" || die "Cannot reach Ollama API at ${OLLAMA_HOST}/api/tags"
  success "Ollama /api/tags responded"
  info "Models currently loaded: $(echo "${response}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('models',[])))" 2>/dev/null || echo '?')"
}

main() {
  step "Install Ollama (Phase 2)"
  require_linux
  init_state
  install_ollama
  start_ollama_service || die "Ollama service failed to start"
  verify_ollama
  success "Ollama installation complete"
}

main "$@"
