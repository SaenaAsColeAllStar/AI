#!/usr/bin/env bash
# Teknovo AI Workstation — Main installer orchestrator
# Usage:
#   bash bootstrap/install.sh              # full install
#   bash bootstrap/install.sh --recover    # resume from last checkpoint
#   bash bootstrap/install.sh --reset      # clear state and reinstall
#   bash bootstrap/install.sh --browser-dev  # optional browser dev mode after install
#   INSTALL_BROWSER_DEV=1 bash bootstrap/install.sh
set -euo pipefail

BOOTSTRAP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${BOOTSTRAP_DIR}/.." && pwd)"

chmod +x "${BOOTSTRAP_DIR}"/*.sh "${BOOTSTRAP_DIR}"/lib/*.sh 2>/dev/null || true

# shellcheck source=banner.sh
source "${BOOTSTRAP_DIR}/banner.sh"
# shellcheck source=common.sh
source "${BOOTSTRAP_DIR}/common.sh"

RECOVER_MODE="false"
RESET_MODE="false"
BROWSER_DEV_MODE="false"

parse_args() {
  for arg in "$@"; do
    case "${arg}" in
      --recover|-r)
        RECOVER_MODE="true"
        export RECOVER_MODE
        ;;
      --reset)
        RESET_MODE="true"
        ;;
      --browser-dev)
        BROWSER_DEV_MODE="true"
        export INSTALL_BROWSER_DEV=1
        ;;
      --help|-h)
        cat <<'EOF'
Teknovo AI Workstation installer

Usage:
  bash bootstrap/install.sh [--recover] [--reset] [--browser-dev]

  --recover     Resume from last successful phase (.bootstrap/state.json)
  --reset       Clear checkpoint state and run full install
  --browser-dev Optional: install code-server + Open WebUI after core stack

Environment:
  INSTALL_BROWSER_DEV=1           Same as --browser-dev
  INSTALL_FORCE_OPENCODE_CONFIG=1 Overwrite ~/.config/opencode/opencode.jsonc
EOF
        exit 0
        ;;
      *)
        die "Unknown argument: ${arg} (use --help)"
        ;;
    esac
  done

  if [[ "${INSTALL_BROWSER_DEV:-0}" == "1" ]]; then
    BROWSER_DEV_MODE="true"
  fi
}

START_TIME=$(date +%s)

on_error() {
  on_phase_error "${LINENO}"
}
trap 'on_error ${LINENO}' ERR

run_mcp_phase() {
  local phase_id="mcp"
  if should_skip_phase "${phase_id}"; then
    log_recovery "Skipping completed phase: Phase 8 — MCP structure"
    return 0
  fi
  log_phase_start "Phase 8 — MCP structure (committed in repo)"
  for svc in github cloudflare filesystem git; do
    if [[ -f "${REPO_ROOT}/mcp/${svc}/README.md" ]]; then
      success "MCP ${svc}: OK"
    else
      warn "MCP ${svc}: missing — check mcp/ directory"
    fi
  done
  mark_phase_complete "${phase_id}"
  log_phase_success "Phase 8 — MCP structure"
}

run_docs_phase() {
  local phase_id="docs"
  if should_skip_phase "${phase_id}"; then
    log_recovery "Skipping completed phase: Phase 9 — Documentation"
    return 0
  fi
  log_phase_start "Phase 9 — Documentation"
  for doc in AI_BOOTSTRAP.md AI_RUNTIME.md AI_DEPLOY.md AI_RECOVERY.md AI_ARCHITECTURE.md; do
    [[ -f "${REPO_ROOT}/${doc}" ]] && success "Doc OK: ${doc}" || warn "Doc missing: ${doc}"
  done
  mark_phase_complete "${phase_id}"
  log_phase_success "Phase 9 — Documentation"
}

run_browser_dev_optional() {
  if [[ "${BROWSER_DEV_MODE}" != "true" ]]; then
    return 0
  fi
  log_phase_start "Optional — Browser Development Mode"
  bash "${BOOTSTRAP_DIR}/install-browser-dev.sh"
  log_phase_success "Optional — Browser Development Mode"
}

main() {
  parse_args "$@"

  init_state

  if [[ "${RESET_MODE}" == "true" ]]; then
    reset_state
    RECOVER_MODE="false"
    export RECOVER_MODE
  elif detect_partial_install; then
    log_recovery "Partial installation detected (last: $(get_last_completed_phase)) — auto-resuming"
    RECOVER_MODE="true"
    export RECOVER_MODE
  fi

  if [[ "${RECOVER_MODE}" == "true" ]]; then
    log_recovery "Recovery mode — continuing from checkpoint: $(get_last_completed_phase || echo 'start')"
  fi

  info "Repository: ${REPO_ROOT}"
  info "Log file: ${INSTALL_LOG}"
  info "State file: ${STATE_FILE}"
  echo ""

  run_phase_script "preflight.sh"        "preflight"   "Phase 0 — Preflight"
  run_phase_script "install-runtime.sh"  "runtime"       "Phase 1 — Runtime"
  run_phase_script "install-ollama.sh"   "ollama"        "Phase 2 — Ollama"
  run_phase_script "install-model.sh"    "model"         "Phase 3 — Model"
  run_phase_script "install-opencode.sh" "opencode"      "Phase 4 — OpenCode"
  run_phase_script "install-skills.sh"   "skills"        "Phase 5 — Skills"
  run_phase_script "build-memory.sh"     "memory"        "Phase 6 — Memory"
  run_phase_script "build-registries.sh" "registries"    "Phase 7 — Registries"

  run_mcp_phase
  run_docs_phase

  run_phase_script "verify.sh" "verify" "Phase 10 — Verification"
  run_phase_script "status.sh" "status" "Phase 11 — Status"

  run_browser_dev_optional

  local elapsed=$(( $(date +%s) - START_TIME ))
  success "Installation complete in ${elapsed}s"
  info "Report: ${REPO_ROOT}/.bootstrap/reports/final-report.md"
  info "Compatibility: ${REPO_ROOT}/docs/ai/compatibility-report.md"
  info "Start OpenCode: cd ${REPO_ROOT} && opencode"
  if [[ "${BROWSER_DEV_MODE}" != "true" ]]; then
    info "Optional browser dev: INSTALL_BROWSER_DEV=1 bash bootstrap/install.sh --browser-dev"
  fi
  info "[PLANNED] GitHub SSH and MCP credentials require manual setup — see AI_RECOVERY.md"
}

main "$@"
