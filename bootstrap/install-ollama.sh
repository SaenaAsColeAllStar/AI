#!/usr/bin/env bash
# Phase 2 — Install and verify Ollama
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

OLLAMA_PID_FILE="${STATE_DIR}/ollama.pid"

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

start_ollama_systemd() {
  ${SUDO} systemctl enable ollama 2>/dev/null || true
  ${SUDO} systemctl start ollama 2>/dev/null || true
}

start_ollama_nohup() {
  if [[ -f "${OLLAMA_PID_FILE}" ]]; then
    local old_pid
    old_pid="$(cat "${OLLAMA_PID_FILE}" 2>/dev/null || true)"
    if [[ -n "${old_pid}" ]] && kill -0 "${old_pid}" 2>/dev/null; then
      info "Ollama already running (PID ${old_pid})"
      return 0
    fi
  fi

  warn "systemd unavailable — starting ollama serve in background (nohup)"
  nohup ollama serve > "${LOG_DIR}/ollama-serve.log" 2>&1 &
  echo $! > "${OLLAMA_PID_FILE}"
  info "Ollama serve PID: $(cat "${OLLAMA_PID_FILE}")"
  sleep 3
}

start_ollama_service() {
  if curl -sf "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1; then
    success "Ollama API already responding at ${OLLAMA_HOST}"
    return 0
  fi

  info "Starting Ollama service..."
  if command_exists systemctl && [[ -d /run/systemd/system ]] && systemctl list-unit-files ollama.service >/dev/null 2>&1; then
    start_ollama_systemd
  else
    start_ollama_nohup
  fi

  ensure_ollama_healthy
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
  start_ollama_service
  verify_ollama
  success "Ollama installation complete"
}

main "$@"
