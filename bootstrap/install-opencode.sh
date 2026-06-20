#!/usr/bin/env bash
# Phase 4 — Install OpenCode CLI and default Ollama provider config
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

OPENCODE_CONFIG_DIR="${HOME}/.config/opencode"
OPENCODE_CONFIG="${OPENCODE_CONFIG_DIR}/opencode.jsonc"

install_opencode_cli() {
  if command_exists opencode; then
    success "OpenCode already installed: $(opencode --version 2>/dev/null || echo 'installed')"
    return 0
  fi

  info "Installing OpenCode globally via npm..."
  sudo npm install -g opencode-ai 2>/dev/null || npm install -g opencode-ai
  command_exists opencode || die "OpenCode install failed"
  success "OpenCode installed: $(opencode --version 2>/dev/null || echo 'ok')"
}

write_opencode_config() {
  mkdir -p "${OPENCODE_CONFIG_DIR}"

  if [[ -f "${OPENCODE_CONFIG}" ]]; then
    success "OpenCode config already exists: ${OPENCODE_CONFIG}"
    return 0
  fi

  info "Writing default OpenCode config for local Ollama..."
  cat > "${OPENCODE_CONFIG}" << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",

  "provider": {
    "ollama-local": {
      "npm": "@ai-sdk/openai-compatible",
      "options": {
        "baseURL": "http://127.0.0.1:11434/v1"
      },
      "models": {
        "qwen2.5-coder:32b": {}
      }
    }
  },

  "model": "ollama-local/qwen2.5-coder:32b"
}
EOF
  success "OpenCode config written: ${OPENCODE_CONFIG}"
}

verify_opencode() {
  opencode --version >/dev/null 2>&1 || die "opencode --version failed"
  success "OpenCode CLI verified: $(opencode --version 2>&1 | head -1)"
}

main() {
  step "Install OpenCode (Phase 4)"
  require_linux
  command_exists npm || die "npm not found. Run bootstrap/install-runtime.sh first."
  install_opencode_cli
  write_opencode_config
  verify_opencode
  success "OpenCode installation complete"
}

main "$@"
