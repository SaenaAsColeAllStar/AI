#!/usr/bin/env bash
# Phase 6 — Build and refresh memory artifacts
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

trap 'on_phase_error ${LINENO}' ERR

REQUIRED_MEMORY_FILES=(
  "memory/project-context.md"
  "memory/repository-map.md"
  "memory/product-context.md"
  "memory/domain-knowledge.md"
  "memory/architecture-decisions.md"
  "memory/coding-standards.md"
  "memory/ui-ux-rules.md"
  "memory/lessons-learned.md"
  "memory/memory-registry.yaml"
)

run_refresh() {
  if [[ -x "${REPO_ROOT}/scripts/refresh-memory.sh" ]]; then
    info "Running scripts/refresh-memory.sh..."
    bash "${REPO_ROOT}/scripts/refresh-memory.sh"
  elif [[ -f "${REPO_ROOT}/scripts/refresh-memory.sh" ]]; then
    bash "${REPO_ROOT}/scripts/refresh-memory.sh"
  else
    warn "scripts/refresh-memory.sh not found — running refresh_helpers directly"
    python3 "${REPO_ROOT}/ai-agent/runtime/refresh_helpers.py" --repo-map-only
  fi
}

verify_memory_loader() {
  if [[ ! -f "${REPO_ROOT}/ai-agent/runtime/load-memory.py" ]]; then
    die "load-memory.py not found"
  fi

  info "Verifying memory loader..."
  if python3 "${REPO_ROOT}/ai-agent/runtime/load-memory.py" --format json --quiet-warnings > /dev/null 2>&1; then
    success "Memory loader verification: OK"
  else
    warn "Memory loader completed with warnings"
    python3 "${REPO_ROOT}/ai-agent/runtime/load-memory.py" --format json --quiet-warnings > /dev/null || true
  fi
}

ensure_memory_files() {
  local missing=0
  for f in "${REQUIRED_MEMORY_FILES[@]}"; do
    if [[ -f "${REPO_ROOT}/${f}" ]]; then
      success "Memory artifact OK: ${f}"
    else
      warn "Missing memory artifact: ${f}"
      missing=$((missing + 1))
    fi
  done
  if [[ ${missing} -gt 0 ]]; then
    warn "${missing} memory files missing — refresh may partially regenerate"
  fi
}

main() {
  step "Build memory (Phase 6)"
  command_exists python3 || die "python3 required for memory build"

  run_refresh
  ensure_memory_files
  verify_memory_loader
  success "Memory build complete"
}

main "$@"
