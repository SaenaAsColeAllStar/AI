#!/usr/bin/env bash
# Phase 4 — Install OpenCode CLI and default Ollama provider config
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

OPENCODE_CONFIG_DIR="${HOME}/.config/opencode"
OPENCODE_CONFIG="${OPENCODE_CONFIG_DIR}/opencode.jsonc"
OPENCODE_BIN="${REPO_ROOT}/.bootstrap/bin/opencode"
OPENCODE_MODEL_ID="ollama-local/${OLLAMA_MODEL}"

trap 'on_phase_error ${LINENO}' ERR

verify_opencode_cli() {
  if command_exists opencode && opencode --version >/dev/null 2>&1; then
    return 0
  fi
  if [[ -x "${OPENCODE_BIN}" ]] && "${OPENCODE_BIN}" --version >/dev/null 2>&1; then
    export PATH="${REPO_ROOT}/.bootstrap/bin:${PATH}"
    return 0
  fi
  return 1
}

install_opencode_npm() {
  local pkg="opencode-ai"
  if [[ -n "${LOCK_OPENCODE_VERSION}" ]]; then
    pkg="opencode-ai@${LOCK_OPENCODE_VERSION}"
  fi

  info "Installing OpenCode globally: ${pkg}"
  ${SUDO} npm install -g "${pkg}" 2>/dev/null || npm install -g "${pkg}" || return 1
  verify_opencode_cli
}

install_opencode_npx_wrapper() {
  log_recovery "npm global install failed — creating npx wrapper"
  mkdir -p "${REPO_ROOT}/.bootstrap/bin"
  local pkg="opencode-ai"
  if [[ -n "${LOCK_OPENCODE_VERSION}" ]]; then
    pkg="opencode-ai@${LOCK_OPENCODE_VERSION}"
  fi
  cat > "${OPENCODE_BIN}" <<EOF
#!/usr/bin/env bash
exec npx --yes ${pkg} "\$@"
EOF
  chmod +x "${OPENCODE_BIN}"
  export PATH="${REPO_ROOT}/.bootstrap/bin:${PATH}"
  verify_opencode_cli
}

install_opencode_cli() {
  load_install_lock
  if verify_opencode_cli; then
    success "OpenCode already installed: $(opencode --version 2>/dev/null | head -1 || echo 'installed')"
    return 0
  fi

  if install_opencode_npm; then
    success "OpenCode installed via npm: $(opencode --version 2>/dev/null | head -1)"
    return 0
  fi

  if install_opencode_npx_wrapper; then
    success "OpenCode available via npx wrapper: $(opencode --version 2>/dev/null | head -1)"
    return 0
  fi

  die "OpenCode install failed — npm and npx fallback both failed"
}

write_opencode_config() {
  mkdir -p "${OPENCODE_CONFIG_DIR}"
  load_install_lock

  local force="${INSTALL_FORCE_OPENCODE_CONFIG:-0}"
  if [[ -f "${OPENCODE_CONFIG}" ]] && [[ "${force}" != "1" ]]; then
    success "OpenCode config already exists: ${OPENCODE_CONFIG}"
    return 0
  fi

  if [[ -f "${OPENCODE_CONFIG}" ]] && [[ "${force}" == "1" ]]; then
    info "INSTALL_FORCE_OPENCODE_CONFIG=1 — overwriting ${OPENCODE_CONFIG}"
  else
    info "Writing default OpenCode config for local Ollama..."
  fi

  cat > "${OPENCODE_CONFIG}" << EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama-local": {
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "http://127.0.0.1:11434/v1"
      },
      "models": {
        "${OLLAMA_MODEL}": {}
      }
    }
  },
  "model": "ollama-local/${OLLAMA_MODEL}"
}
EOF
  success "OpenCode config written: ${OPENCODE_CONFIG}"
}

validate_opencode_model() {
  local models_output model_id="${OPENCODE_MODEL_ID}"
  load_install_lock
  model_id="ollama-local/${OLLAMA_MODEL}"

  if ! models_output="$(opencode models 2>&1)"; then
    die "opencode models failed — config may be invalid. Output: ${models_output}"
  fi

  if echo "${models_output}" | grep -qF "${model_id}"; then
    success "OpenCode model registered: ${model_id}"
    return 0
  fi

  die "OpenCode model ${model_id} not found in 'opencode models' output. Run with INSTALL_FORCE_OPENCODE_CONFIG=1 or check ${OPENCODE_CONFIG}"
}

verify_opencode() {
  opencode --version >/dev/null 2>&1 || die "opencode --version failed"
  success "OpenCode CLI verified: $(opencode --version 2>&1 | head -1)"
}

main() {
  step "Install OpenCode (Phase 4)"
  require_linux
  load_install_lock
  command_exists npm || die "npm not found. Run bootstrap/install-runtime.sh first."
  install_opencode_cli
  write_opencode_config
  verify_opencode
  validate_opencode_model
  success "OpenCode installation complete"
}

main "$@"
