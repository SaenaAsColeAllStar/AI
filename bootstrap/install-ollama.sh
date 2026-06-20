#!/usr/bin/env bash
# Phase 2 — Install and verify Ollama
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

wait_for_ollama() {
  local retries=30
  local i=0
  while [[ ${i} -lt ${retries} ]]; do
    if curl -sf "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
    i=$((i + 1))
  done
  return 1
}

install_ollama() {
  if command_exists ollama; then
    success "Ollama already installed: $(ollama --version 2>/dev/null || echo 'installed')"
    return 0
  fi

  info "Installing Ollama..."
  curl -fsSL https://ollama.com/install.sh | sh
  success "Ollama installed"
}

start_ollama_service() {
  if curl -sf "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1; then
    success "Ollama API already responding at ${OLLAMA_HOST}"
    return 0
  fi

  info "Starting Ollama service..."
  if command_exists systemctl && systemctl list-unit-files ollama.service >/dev/null 2>&1; then
    sudo systemctl enable ollama 2>/dev/null || true
    sudo systemctl start ollama 2>/dev/null || true
  else
    warn "systemd ollama unit not found — starting ollama serve in background"
    nohup ollama serve > "${LOG_DIR}/ollama-serve.log" 2>&1 &
    sleep 3
  fi

  if wait_for_ollama; then
    success "Ollama API ready at ${OLLAMA_HOST}"
  else
    die "Ollama failed to start. Check ${LOG_DIR}/ollama-serve.log or journalctl -u ollama"
  fi
}

verify_ollama() {
  local response
  response="$(curl -sf "${OLLAMA_HOST}/api/tags")" || die "Cannot reach Ollama API at ${OLLAMA_HOST}/api/tags"
  success "Ollama /api/tags responded"
  info "Models currently loaded: $(echo "${response}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('models',[])))" 2>/dev/null || echo '?')"
}

main() {
  step "Install Ollama (Phase 2)"
  require_linux
  install_ollama
  start_ollama_service
  verify_ollama
  success "Ollama installation complete"
}

main "$@"
