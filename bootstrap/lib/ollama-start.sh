#!/usr/bin/env bash
# Teknovo AI Workstation — unified Ollama service startup (systemd → tmux → screen → nohup)

OLLAMA_PID_FILE="${STATE_DIR:-${REPO_ROOT}/.bootstrap}/ollama.pid"
OLLAMA_START_METHOD=""

ollama_log_path() {
  if [[ "$(id -u)" -eq 0 ]]; then
    echo "/root/ollama.log"
  else
    echo "${REPO_ROOT}/.bootstrap/logs/ollama.log"
  fi
}

_ollama_screen_session_running() {
  command_exists screen || return 1
  screen -list 2>/dev/null | grep -qE '[0-9]+\.ollama(\s|$|\()'
}

start_ollama_nohup() {
  local log_file
  log_file="$(ollama_log_path)"
  mkdir -p "$(dirname "${log_file}")"

  info "Stopping any existing Ollama processes (nohup fallback)..."
  pkill -f ollama 2>/dev/null || true

  info "Starting ollama serve via nohup (log: ${log_file})..."
  nohup ollama serve > "${log_file}" 2>&1 &
  echo $! > "${OLLAMA_PID_FILE}"
  OLLAMA_START_METHOD="nohup"
}

# Start Ollama using the best available method for the environment.
# Priority: systemd → existing tmux → existing screen → new tmux → new screen → nohup
start_ollama_service() {
  init_state 2>/dev/null || true

  if curl -sf "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1; then
    success "Ollama API already responding at ${OLLAMA_HOST}"
    OLLAMA_START_METHOD="already_running"
    return 0
  fi

  ensure_session_tools

  if command_exists systemctl && [[ -d /run/systemd/system ]]; then
    info "Starting Ollama via systemd..."
    ${SUDO} systemctl enable ollama 2>/dev/null || true
    ${SUDO} systemctl start ollama 2>/dev/null || true
    OLLAMA_START_METHOD="systemd"
  elif command_exists tmux && tmux has-session -t ollama 2>/dev/null; then
    info "Ollama tmux session already running"
    OLLAMA_START_METHOD="tmux_existing"
  elif _ollama_screen_session_running; then
    info "Ollama screen session already running"
    OLLAMA_START_METHOD="screen_existing"
  elif command_exists tmux; then
    info "Starting Ollama in new tmux session 'ollama'..."
    tmux new-session -d -s ollama "ollama serve"
    OLLAMA_START_METHOD="tmux"
  elif command_exists screen; then
    info "Starting Ollama in new screen session 'ollama'..."
    screen -dmS ollama ollama serve
    OLLAMA_START_METHOD="screen"
  else
    warn "No systemd/tmux/screen — using nohup fallback"
    start_ollama_nohup
  fi

  success "Ollama startup method: ${OLLAMA_START_METHOD}"

  if wait_for_ollama; then
    success "Ollama ready at ${OLLAMA_HOST}"
    return 0
  fi

  error "Ollama failed to start (method: ${OLLAMA_START_METHOD})"
  return 1
}
