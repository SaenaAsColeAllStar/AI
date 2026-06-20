#!/usr/bin/env bash
# Teknovo AI Workstation — structured phase logging
# Requires common.sh colors/log helpers and INSTALL_LOG to be set.

CURRENT_PHASE=""

log_info() {
  log "INFO" "${BLUE:-}$*${NC:-}"
}

log_error() {
  log "ERROR" "${RED:-}$*${NC:-}" >&2
}

log_phase_start() {
  local phase="$1"
  CURRENT_PHASE="${phase}"
  log "PHASE" "START ${phase}"
  echo ""
  log_info "${BOLD:-}==> ${phase}${NC:-}"
}

log_phase_success() {
  local phase="${1:-${CURRENT_PHASE}}"
  log "PHASE" "SUCCESS ${phase}"
  success "Phase complete: ${phase}"
}

log_phase_failure() {
  local phase="${1:-${CURRENT_PHASE}}"
  local reason="${2:-unknown error}"
  log "PHASE" "FAILURE ${phase} — ${reason}"
  error "Phase failed: ${phase} — ${reason}"
}

log_recovery() {
  log "RECOVERY" "$*"
  warn "Recovery: $*"
}

on_phase_error() {
  local line="$1"
  log_phase_failure "${CURRENT_PHASE:-unknown}" "line ${line}"
  log_error "Install failed at line ${line}. See log: ${INSTALL_LOG}"
  log_recovery "Re-run: bash bootstrap/install.sh --recover (or bash bootstrap/recover.sh)"
  exit 1
}
