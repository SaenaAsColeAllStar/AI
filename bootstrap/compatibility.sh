#!/usr/bin/env bash
# Phase 0 — Compatibility detection and requirements gate
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

REPORT_PATH="${REPO_ROOT}/docs/ai/compatibility-report.md"
COMPAT_OK=true

write_report_header() {
  mkdir -p "$(dirname "${REPORT_PATH}")"
  cat > "${REPORT_PATH}" << EOF
# Teknovo AI Workstation — Compatibility Report

> Auto-generated at install time. Re-run \`bash bootstrap/compatibility.sh\` to refresh.

**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")  
**Host**: $(hostname 2>/dev/null || echo "unknown")  
**Repository**: ${REPO_ROOT}

---

## Summary

| Check | Status | Detail |
|-------|--------|--------|
EOF
}

append_report_row() {
  local check="$1" status="$2" detail="$3"
  echo "| ${check} | ${status} | ${detail} |" >> "${REPORT_PATH}"
}

finalize_report() {
  local overall="$1"
  cat >> "${REPORT_PATH}" << EOF

---

## Overall

**Result**: ${overall}

## Minimum Requirements

| Requirement | Minimum | Notes |
|-------------|---------|-------|
| OS | Linux (${LOCK_OS:-Ubuntu 22.04/24.04}) | Clore Cloud GPU servers |
| RAM | ${MIN_RAM_GB} GB | For Qwen 32B inference |
| Disk (free) | ${MIN_DISK_GB} GB | Model + dependencies |
| Python | ${MIN_PYTHON_MAJOR}.${MIN_PYTHON_MINOR}+ | Pinned in install.lock.yaml |
| Node.js | ${MIN_NODE_MAJOR}+ | OpenCode ${LOCK_OPENCODE_VERSION:-CLI} |
| Ollama | ${LOCK_OLLAMA:-latest} | Model: ${LOCK_MODEL:-${OLLAMA_MODEL}} |
| GPU | Optional | CPU fallback with warning |

## GPU Details

EOF
  if command_exists nvidia-smi; then
    {
      echo '```'
      nvidia-smi 2>/dev/null || echo "nvidia-smi failed"
      echo '```'
    } >> "${REPORT_PATH}"
  else
    echo "_No NVIDIA GPU detected — Ollama will use CPU (slower)._ " >> "${REPORT_PATH}"
  fi
}

check_os() {
  local os kernel
  os="$(uname -s)"
  kernel="$(uname -r)"
  if [[ "${os}" == "Linux" ]]; then
    local distro="unknown"
    if [[ -f /etc/os-release ]]; then
      # shellcheck disable=SC1091
      source /etc/os-release
      distro="${NAME:-Linux} ${VERSION_ID:-}"
    fi
    append_report_row "OS" "PASS" "${os} (${distro}, kernel ${kernel})"
    success "OS: ${os} — ${distro}"
  else
    append_report_row "OS" "FAIL" "${os} (Linux required)"
    COMPAT_OK=false
    error "Unsupported OS: ${os}"
  fi
}

check_ram() {
  local ram_gb
  ram_gb="$(get_ram_gb)"
  if [[ "${ram_gb}" -ge "${MIN_RAM_GB}" ]]; then
    append_report_row "RAM" "PASS" "${ram_gb} GB"
    success "RAM: ${ram_gb} GB"
  else
    append_report_row "RAM" "FAIL" "${ram_gb} GB (need ${MIN_RAM_GB}+ GB)"
    COMPAT_OK=false
    error "Insufficient RAM: ${ram_gb} GB (minimum ${MIN_RAM_GB} GB)"
  fi
}

check_disk() {
  local disk_gb
  disk_gb="$(get_disk_free_gb "${REPO_ROOT}")"
  if [[ -z "${disk_gb}" ]] || [[ "${disk_gb}" -lt "${MIN_DISK_GB}" ]]; then
    append_report_row "Disk (free)" "FAIL" "${disk_gb:-0} GB (need ${MIN_DISK_GB}+ GB)"
    COMPAT_OK=false
    error "Insufficient disk space: ${disk_gb:-0} GB free (minimum ${MIN_DISK_GB} GB)"
  else
    append_report_row "Disk (free)" "PASS" "${disk_gb} GB"
    success "Disk free: ${disk_gb} GB"
  fi
}

check_python() {
  local ver major minor
  ver="$(get_python_version)"
  major="${ver%%.*}"
  minor="$(echo "${ver}" | cut -d. -f2)"
  if [[ "${major}" -ge "${MIN_PYTHON_MAJOR}" ]] && [[ "${minor}" -ge "${MIN_PYTHON_MINOR}" ]]; then
    append_report_row "Python" "PASS" "${ver}"
    success "Python: ${ver}"
  elif command_exists python3; then
    append_report_row "Python" "WARN" "${ver} (will upgrade in Phase 1)"
    warn "Python ${ver} below minimum — Phase 1 will install/upgrade"
  else
    append_report_row "Python" "WARN" "not found (Phase 1 will install)"
    warn "Python not found — Phase 1 will install"
  fi
}

check_node() {
  local major
  major="$(get_node_major)"
  if [[ "${major}" -ge "${MIN_NODE_MAJOR}" ]]; then
    append_report_row "Node.js" "PASS" "$(node -v 2>/dev/null)"
    success "Node.js: $(node -v)"
  elif command_exists node; then
    append_report_row "Node.js" "WARN" "$(node -v) (Phase 1 will upgrade)"
    warn "Node.js below minimum — Phase 1 will upgrade"
  else
    append_report_row "Node.js" "WARN" "not found (Phase 1 will install)"
    warn "Node.js not found — Phase 1 will install"
  fi
}

check_gpu() {
  if command_exists nvidia-smi; then
    local gpu_name vram
    gpu_name="$(nvidia-smi --query-gpu=name --format=csv,noheader 2>/dev/null | head -1 || echo "NVIDIA GPU")"
    vram="$(nvidia-smi --query-gpu=memory.total --format=csv,noheader 2>/dev/null | head -1 || echo "unknown")"
    append_report_row "GPU" "PASS" "${gpu_name} (${vram})"
    success "GPU detected: ${gpu_name}"
    if command_exists nvcc; then
      local cuda_ver
      cuda_ver="$(nvcc --version 2>/dev/null | grep -oP 'release \K[0-9.]+' || echo "unknown")"
      append_report_row "CUDA (toolkit)" "INFO" "${cuda_ver}"
    else
      append_report_row "CUDA (toolkit)" "INFO" "not installed (Ollama bundles runtime)"
    fi
  else
    append_report_row "GPU" "WARN" "No NVIDIA GPU — CPU inference only"
    warn "No GPU detected. Ollama will run on CPU (significantly slower for 32B model)."
  fi
}

check_git_curl() {
  for cmd in git curl; do
    if command_exists "${cmd}"; then
      append_report_row "${cmd}" "PASS" "$(command -v "${cmd}")"
    else
      append_report_row "${cmd}" "WARN" "missing (Phase 1 will install)"
      warn "${cmd} not found — Phase 1 will install"
    fi
  done
}

main() {
  step "Compatibility check (Phase 0)"
  require_linux
  load_install_lock
  if [[ -f "${INSTALL_LOCK}" ]]; then
    info "Expected versions from ${INSTALL_LOCK}: os=${LOCK_OS:-?} node=${LOCK_NODE:-?} python=${LOCK_PYTHON:-?} ollama=${LOCK_OLLAMA:-?} model=${LOCK_MODEL:-?} opencode=${LOCK_OPENCODE_VERSION:-?}"
  fi
  write_report_header
  check_os
  check_ram
  check_disk
  check_python
  check_node
  check_gpu
  check_git_curl

  if [[ "${COMPAT_OK}" == "true" ]]; then
    finalize_report "PASS — compatible with Teknovo AI Workstation"
    success "Compatibility check passed. Report: ${REPORT_PATH}"
  else
    finalize_report "FAIL — minimum requirements not met"
    die "Compatibility check failed. See ${REPORT_PATH}"
  fi
}

main "$@"
