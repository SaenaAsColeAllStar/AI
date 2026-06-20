#!/usr/bin/env bash
# Phase 3 — Pull and verify Qwen2.5-Coder 32B model
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

model_present() {
  ollama list 2>/dev/null | grep -q "${OLLAMA_MODEL}" || \
    curl -sf "${OLLAMA_HOST}/api/tags" | grep -q "${OLLAMA_MODEL}"
}

pull_model() {
  if model_present; then
    success "Model ${OLLAMA_MODEL} already present"
    return 0
  fi

  warn "[PLANNED] Model download is large (~20GB) and may take 15-60 minutes depending on bandwidth."
  info "Pulling ${OLLAMA_MODEL}..."
  ollama pull "${OLLAMA_MODEL}"
  success "Model ${OLLAMA_MODEL} pulled"
}

verify_model() {
  if ! model_present; then
    die "Model ${OLLAMA_MODEL} not found after pull. Run: ollama pull ${OLLAMA_MODEL}"
  fi

  success "Verified model in ollama list:"
  ollama list | grep "${OLLAMA_MODEL}" || true

  if curl -sf "${OLLAMA_HOST}/api/tags" | grep -q "${OLLAMA_MODEL}"; then
    success "Model visible via ${OLLAMA_HOST}/api/tags"
  else
    warn "Model not in API tags yet — may need ollama serve restart"
  fi
}

main() {
  step "Install model (Phase 3)"
  require_linux
  command_exists ollama || die "Ollama not installed. Run bootstrap/install-ollama.sh first."

  if ! curl -sf "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1; then
    die "Ollama not running. Run bootstrap/install-ollama.sh first."
  fi

  pull_model
  verify_model
  success "Model installation complete"
}

main "$@"
