#!/usr/bin/env bash
# Phase 1 — Install runtime dependencies (Git, curl, Node, Python, pip/npm packages)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

trap 'on_phase_error ${LINENO}' ERR

install_apt_packages() {
  if ! command_exists apt-get; then
    warn "apt-get not found — skipping system package install (ensure deps manually)"
    return 0
  fi

  local pkgs=(
    git curl wget ca-certificates gnupg lsb-release
    build-essential python3 python3-pip python3-venv python3-yaml
    jq tree zstd nano
  )

  info "Updating apt package index..."
  ${SUDO} apt-get update -qq

  local to_install=()
  for pkg in "${pkgs[@]}"; do
    if dpkg -s "${pkg}" >/dev/null 2>&1; then
      success "Package ${pkg} already installed"
    else
      to_install+=("${pkg}")
    fi
  done

  if [[ ${#to_install[@]} -gt 0 ]]; then
    info "Installing: ${to_install[*]}"
    ${SUDO} DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${to_install[@]}"
    success "System packages installed"
  fi
}

verify_node_version() {
  local major
  major="$(get_node_major)"
  if [[ "${major}" -lt "${MIN_NODE_MAJOR}" ]]; then
    return 1
  fi
  node -v >/dev/null 2>&1
}

install_node_nodesource() {
  info "Trying Node.js ${MIN_NODE_MAJOR}.x via NodeSource..."
  if ! command_exists apt-get; then
    return 1
  fi
  if ! run_bash_script "https://deb.nodesource.com/setup_${MIN_NODE_MAJOR}.x"; then
    log_recovery "NodeSource setup script failed"
    return 1
  fi
  ${SUDO} apt-get install -y -qq nodejs || return 1
  verify_node_version
}

install_node_ubuntu() {
  info "Trying Node.js from Ubuntu packages..."
  ${SUDO} apt-get install -y -qq nodejs npm || return 1
  verify_node_version
}

install_node_nvm() {
  info "Trying Node.js via nvm..."
  export NVM_DIR="${HOME}/.nvm"
  if [[ ! -s "${NVM_DIR}/nvm.sh" ]]; then
    run_bash_script "https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh" || return 1
  fi
  # shellcheck source=/dev/null
  source "${NVM_DIR}/nvm.sh"
  nvm install "${MIN_NODE_MAJOR}" || return 1
  nvm use "${MIN_NODE_MAJOR}" || return 1
  verify_node_version
}

install_node() {
  if verify_node_version; then
    success "Node.js already satisfies requirement: $(node -v)"
    return 0
  fi

  load_install_lock
  info "Target Node major version: ${MIN_NODE_MAJOR} (lock=${LOCK_NODE:-none})"

  if install_node_nodesource; then
    success "Node.js installed via NodeSource: $(node -v)"
    return 0
  fi
  log_recovery "NodeSource failed — trying Ubuntu packages"

  if install_node_ubuntu; then
    success "Node.js installed via Ubuntu packages: $(node -v)"
    return 0
  fi
  log_recovery "Ubuntu packages failed — trying nvm"

  if install_node_nvm; then
    success "Node.js installed via nvm: $(node -v)"
    return 0
  fi

  die "Node.js ${MIN_NODE_MAJOR}+ required — all install methods failed"
}

install_python_packages() {
  info "Ensuring pip is available..."
  python3 -m pip install --upgrade pip --quiet 2>/dev/null || true
  ensure_pip_package pyyaml yaml
}

verify_runtime() {
  step "Runtime verification"
  command_exists git    || die "git not available"
  command_exists curl   || die "curl not available"
  command_exists wget   || die "wget not available"
  command_exists python3 || die "python3 not available"
  command_exists node   || die "node not available"
  command_exists npm    || die "npm not available"

  local py_ver node_ver
  py_ver="$(get_python_version)"
  node_ver="$(node -v)"

  local py_minor
  py_minor="$(echo "${py_ver}" | cut -d. -f2)"
  if [[ "${py_minor}" -lt "${MIN_PYTHON_MINOR}" ]]; then
    die "Python ${py_ver} below minimum ${MIN_PYTHON_MAJOR}.${MIN_PYTHON_MINOR}"
  fi

  success "Git:    $(git --version)"
  success "Curl:   $(curl --version | head -1)"
  success "Python: ${py_ver}"
  success "Node:   ${node_ver}"
  success "npm:    $(npm -v)"
}

main() {
  step "Install runtime (Phase 1)"
  require_linux
  load_install_lock
  ensure_prerequisites
  install_apt_packages
  install_node
  install_python_packages
  verify_runtime
  success "Runtime installation complete"
}

main "$@"
