#!/usr/bin/env bash
# Phase 3 — Pull and verify Qwen3 32B model (from install.lock.yaml)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

trap 'on_phase_error ${LINENO}' ERR

pull_model() {
  load_install_lock
  info "Target model: ${OLLAMA_MODEL}"

  ensure_ollama_healthy

  if model_present "${OLLAMA_MODEL}"; then
    success "Model ${OLLAMA_MODEL} already present (list /api/tags /v1/models)"
    return 0
  fi

  warn "Model download is large (~20GB) and may take 15-60 minutes depending on bandwidth."
  info "Pulling ${OLLAMA_MODEL}..."
  ollama pull "${OLLAMA_MODEL}"
  success "Model ${OLLAMA_MODEL} pulled"
}

verify_model() {
  if ! model_present "${OLLAMA_MODEL}"; then
    die "Model ${OLLAMA_MODEL} not found after pull. Run: ollama pull ${OLLAMA_MODEL}"
  fi

  success "Verified model in ollama list:"
  ollama list | grep "${OLLAMA_MODEL}" || true

  if model_in_api_tags "${OLLAMA_MODEL}"; then
    success "Model visible via ${OLLAMA_HOST}/api/tags"
  else
    die "Model ${OLLAMA_MODEL} not visible in /api/tags — restart ollama serve"
  fi

  if model_in_v1_models "${OLLAMA_MODEL}"; then
    success "Model visible via ${OLLAMA_HOST}/v1/models"
  else
    die "Model ${OLLAMA_MODEL} not visible in /v1/models — restart ollama serve"
  fi
}

main() {
  step "Install model (Phase 3)"
  require_linux
  load_install_lock
  command_exists ollama || die "Ollama not installed. Run bootstrap/install-ollama.sh first."

  pull_model
  verify_model
  success "Model installation complete"
}

main "$@"
