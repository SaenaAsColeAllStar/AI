#!/usr/bin/env bash
# Teknovo AI Workstation — Main installer orchestrator
# Usage: bash bootstrap/install.sh
# Idempotent — safe to re-run for recovery
set -euo pipefail

BOOTSTRAP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${BOOTSTRAP_DIR}/.." && pwd)"

# Ensure execute bits after git clone (may be lost on some platforms)
chmod +x "${BOOTSTRAP_DIR}"/*.sh 2>/dev/null || true

# 1. Banner (before any install step)
# shellcheck source=banner.sh
source "${BOOTSTRAP_DIR}/banner.sh"

# shellcheck source=common.sh
source "${BOOTSTRAP_DIR}/common.sh"

START_TIME=$(date +%s)

on_error() {
  local line="$1"
  error "Install failed at line ${line}. See log: ${INSTALL_LOG}"
  error "Recovery: re-run bash bootstrap/install.sh (idempotent) or see AI_RECOVERY.md"
  exit 1
}
trap 'on_error ${LINENO}' ERR

run_script() {
  local script="$1"
  local label="$2"
  if [[ ! -f "${BOOTSTRAP_DIR}/${script}" ]]; then
    die "Missing bootstrap script: ${script}"
  fi
  chmod +x "${BOOTSTRAP_DIR}/${script}" 2>/dev/null || true
  step "${label}"
  bash "${BOOTSTRAP_DIR}/${script}"
}

main() {
  info "Repository: ${REPO_ROOT}"
  info "Log file: ${INSTALL_LOG}"
  echo ""

  # 2. Compatibility (exit on fail)
  run_script "compatibility.sh" "Phase 0 — Compatibility"

  # 3. Install phases
  run_script "install-runtime.sh"  "Phase 1 — Runtime"
  run_script "install-ollama.sh"   "Phase 2 — Ollama"
  run_script "install-model.sh"    "Phase 3 — Model"
  run_script "install-opencode.sh" "Phase 4 — OpenCode"
  run_script "install-skills.sh"   "Phase 5 — Skills"
  run_script "build-memory.sh"     "Phase 6 — Memory"
  run_script "build-registries.sh" "Phase 7 — Registries"

  # Phase 8 (MCP) — structure committed in repo; verify only
  step "Phase 8 — MCP structure (committed in repo)"
  for svc in github cloudflare filesystem git; do
    if [[ -f "${REPO_ROOT}/mcp/${svc}/README.md" ]]; then
      success "MCP ${svc}: OK"
    else
      warn "MCP ${svc}: missing — check mcp/ directory"
    fi
  done

  # Phase 9 — docs committed; spot-check
  step "Phase 9 — Documentation"
  for doc in AI_BOOTSTRAP.md AI_RUNTIME.md AI_DEPLOY.md AI_RECOVERY.md AI_ARCHITECTURE.md; do
    [[ -f "${REPO_ROOT}/${doc}" ]] && success "Doc OK: ${doc}" || warn "Doc missing: ${doc}"
  done

  # 4. Verification
  run_script "verify.sh" "Phase 10 — Verification"

  # 5. Final status
  run_script "status.sh" "Phase 12 — Status"

  local elapsed=$(( $(date +%s) - START_TIME ))
  success "Installation complete in ${elapsed}s"
  info "Start OpenCode: cd ${REPO_ROOT} && opencode"
  info "[PLANNED] GitHub SSH and MCP credentials require manual setup — see AI_RECOVERY.md"
}

main "$@"
