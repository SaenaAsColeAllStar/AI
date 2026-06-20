#!/usr/bin/env bash
# Phase 1 — Install runtime dependencies (Git, curl, Node, Python, pip/npm packages)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

install_apt_packages() {
  if ! command_exists apt-get; then
    warn "apt-get not found — skipping system package install (ensure deps manually)"
    return 0
  fi

  local pkgs=(
    git curl wget ca-certificates gnupg lsb-release
    build-essential python3 python3-pip python3-venv
    jq tree zstd nano
  )

  info "Updating apt package index..."
  sudo apt-get update -qq

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
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${to_install[@]}"
    success "System packages installed"
  fi
}

install_node() {
  local major
  major="$(get_node_major)"
  if [[ "${major}" -ge "${MIN_NODE_MAJOR}" ]]; then
    success "Node.js already satisfies requirement: $(node -v)"
    return 0
  fi

  info "Installing Node.js ${MIN_NODE_MAJOR}.x via NodeSource..."
  if command_exists apt-get; then
    curl -fsSL https://deb.nodesource.com/setup_${MIN_NODE_MAJOR}.x | sudo -E bash -
    sudo apt-get install -y -qq nodejs
  else
    die "Node.js ${MIN_NODE_MAJOR}+ required but apt-get unavailable. Install Node manually."
  fi

  major="$(get_node_major)"
  if [[ "${major}" -lt "${MIN_NODE_MAJOR}" ]]; then
    die "Node.js install failed — got $(node -v 2>/dev/null || echo 'none')"
  fi
  success "Node.js installed: $(node -v)"
}

install_python_packages() {
  info "Ensuring pip is available..."
  python3 -m pip install --upgrade pip --quiet 2>/dev/null || true
  ensure_pip_package pyyaml
}

verify_runtime() {
  step "Runtime verification"
  command_exists git    || die "git not available"
  command_exists curl   || die "curl not available"
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
  success "Python: ${py_ver}"
  success "Node:   ${node_ver}"
  success "npm:    $(npm -v)"
}

main() {
  step "Install runtime (Phase 1)"
  require_linux
  install_apt_packages
  install_node
  install_python_packages
  verify_runtime
  success "Runtime installation complete"
}

main "$@"
