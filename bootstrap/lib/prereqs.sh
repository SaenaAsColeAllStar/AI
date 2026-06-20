#!/usr/bin/env bash
# Teknovo AI Workstation — early prerequisite checks and auto-install
# Ensures: curl, wget, git, python3, pip3 before downstream phases.

ensure_prerequisites() {
  if command_exists apt-get; then
    _ensure_prerequisites_apt
  else
    _ensure_prerequisites_manual
  fi
}

_ensure_prerequisites_apt() {
  local pkgs=()
  for cmd_pkg in curl:curl wget:wget git:git python3:python3 python3-pip:python3-pip; do
    local cmd="${cmd_pkg%%:*}"
    local pkg="${cmd_pkg##*:}"
    if ! command_exists "${cmd}"; then
      pkgs+=("${pkg}")
    fi
  done

  if [[ ${#pkgs[@]} -gt 0 ]]; then
    info "Installing missing prerequisites: ${pkgs[*]}"
    ${SUDO} apt-get update -qq
    ${SUDO} DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${pkgs[@]}"
  fi

  _verify_prerequisites_or_die
}

_ensure_prerequisites_manual() {
  warn "apt-get not found — ensure curl, wget, git, python3, pip3 manually"
  for cmd in curl wget git python3; do
    command_exists "${cmd}" || warn "Missing prerequisite: ${cmd}"
  done
  if ! command_exists pip3 && ! python3 -m pip --version >/dev/null 2>&1; then
    warn "pip3 not found — Phase 1 will attempt python3 -m pip"
  fi
}

_verify_prerequisites_or_die() {
  local ok=true
  for cmd in curl wget git python3; do
    if command_exists "${cmd}"; then
      success "Prerequisite OK: ${cmd}"
    else
      error "Prerequisite missing: ${cmd}"
      ok=false
    fi
  done
  if python3 -m pip --version >/dev/null 2>&1 || command_exists pip3; then
    success "Prerequisite OK: pip3"
  else
    error "Prerequisite missing: pip3"
    ok=false
  fi
  [[ "${ok}" == "true" ]] || die "Required prerequisites missing — install curl, wget, git, python3, pip3"
}

run_bash_script() {
  # Run a remote install script without broken sudo -E pipe patterns.
  # Usage: run_bash_script "https://example.com/install.sh" [extra curl args...]
  local url="$1"
  shift
  curl -fsSL "${url}" "$@" | bash -
}

ensure_session_tools() {
  # tmux/screen keep Ollama alive in containers without systemd.
  if ! command_exists apt-get; then
    return 0
  fi

  local pkgs=()
  for cmd_pkg in tmux:tmux screen:screen; do
    local cmd="${cmd_pkg%%:*}"
    local pkg="${cmd_pkg##*:}"
    if ! command_exists "${cmd}"; then
      pkgs+=("${pkg}")
    fi
  done

  if [[ ${#pkgs[@]} -gt 0 ]]; then
    info "Installing session tools for Ollama persistence: ${pkgs[*]}"
    ${SUDO} apt-get update -qq
    ${SUDO} DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${pkgs[@]}"
  fi
}
