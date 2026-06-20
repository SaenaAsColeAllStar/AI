#!/usr/bin/env bash
# Phase 0 — Preflight: OS, resources, network, container, GPU, tooling
# Generates docs/ai/compatibility-report.md BEFORE install phases.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

REPORT_PATH="${REPO_ROOT}/docs/ai/compatibility-report.md"
PREFLIGHT_OK=true
CONTAINER_ENV="bare-metal"
IS_ROOT="false"

trap 'on_phase_error ${LINENO}' ERR

detect_container_env() {
  if [[ -f /.dockerenv ]]; then
    CONTAINER_ENV="docker"
    return 0
  fi
  if [[ -r /proc/1/cgroup ]] && grep -qE 'docker|kubepods|containerd|lxc' /proc/1/cgroup 2>/dev/null; then
    CONTAINER_ENV="container"
    return 0
  fi
  CONTAINER_ENV="bare-metal"
}

detect_cloud_provider() {
  local provider="unknown"
  if [[ -n "${CLORE_HOST:-}" ]] || hostname 2>/dev/null | grep -qi clore; then
    provider="clore"
  elif [[ -n "${VAST_CONTAINERLABEL:-}" ]] || [[ -n "${VAST_DEVICE_ID:-}" ]]; then
    provider="vast"
  elif [[ -n "${RUNPOD_POD_ID:-}" ]] || [[ -n "${RUNPOD_POD_HOSTNAME:-}" ]]; then
    provider="runpod"
  elif [[ "${CONTAINER_ENV}" != "bare-metal" ]]; then
    provider="container-host"
  fi
  echo "${provider}"
}

write_report_header() {
  mkdir -p "$(dirname "${REPORT_PATH}")"
  local provider
  provider="$(detect_cloud_provider)"
  cat > "${REPORT_PATH}" << EOF
# Teknovo AI Workstation — Compatibility Report

> Auto-generated at preflight. Re-run \`bash bootstrap/preflight.sh\` to refresh.

**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Host**: $(hostname 2>/dev/null || echo "unknown")
**Repository**: ${REPO_ROOT}
**Container**: ${CONTAINER_ENV}
**Cloud provider hint**: ${provider}
**User**: $(id -un 2>/dev/null || echo unknown) (uid $(id -u 2>/dev/null || echo ?))

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

## Environment Notes

| Topic | Value |
|-------|-------|
| systemd | $(command_exists systemctl && echo "available" || echo "absent — Ollama uses tmux/screen/nohup fallback") |
| sudo | $(command_exists sudo && echo "available" || echo "absent — running as $(id -u)") |
| Docker | $(command_exists docker && echo "available" || echo "not installed (optional)") |
| Container | ${CONTAINER_ENV} |

## Minimum Requirements

| Requirement | Minimum | Notes |
|-------------|---------|-------|
| OS | Linux (${LOCK_OS:-Ubuntu 22.04/24.04}) | Clore / Vast / RunPod GPU servers |
| RAM | ${MIN_RAM_GB} GB | For Qwen 32B inference |
| Disk (free) | ${MIN_DISK_GB} GB | Model + dependencies |
| Python | ${MIN_PYTHON_MAJOR}.${MIN_PYTHON_MINOR}+ | Pinned in install.lock.yaml |
| Node.js | ${MIN_NODE_MAJOR}+ | OpenCode ${LOCK_OPENCODE_VERSION:-CLI} |
| Ollama | ${LOCK_OLLAMA:-latest} | Model: ${LOCK_MODEL:-${OLLAMA_MODEL}} |
| GPU | Optional | CPU fallback with warning |

## GPU Details

**Detection**: $(gpu_report_summary)

EOF
  if [[ "${GPU_DETECTED}" == "true" ]] && [[ "${GPU_VENDOR}" == "nvidia" ]] && command_exists nvidia-smi; then
    {
      echo '```'
      nvidia-smi 2>/dev/null || echo "nvidia-smi failed"
      echo '```'
    } >> "${REPORT_PATH}"
  elif [[ "${GPU_DETECTED}" == "true" ]]; then
    echo "_GPU detected via ${GPU_METHOD}: ${GPU_NAME}_" >> "${REPORT_PATH}"
  else
    echo "_No GPU detected — Ollama will use CPU (slower)._ " >> "${REPORT_PATH}"
  fi
}

check_os() {
  local os kernel distro="unknown"
  os="$(uname -s)"
  kernel="$(uname -r)"
  if [[ "${os}" == "Linux" ]]; then
    if [[ -f /etc/os-release ]]; then
      # shellcheck disable=SC1091
      source /etc/os-release
      distro="${NAME:-Linux} ${VERSION_ID:-}"
    fi
    append_report_row "OS" "PASS" "${os} (${distro}, kernel ${kernel})"
    success "OS: ${os} — ${distro}"
  else
    append_report_row "OS" "FAIL" "${os} (Linux required)"
    PREFLIGHT_OK=false
    error "Unsupported OS: ${os}"
  fi
}

check_internet() {
  if curl -sf --max-time 15 https://github.com >/dev/null 2>&1; then
    append_report_row "Internet" "PASS" "github.com reachable"
    success "Internet: OK"
  elif curl -sf --max-time 15 https://ollama.com >/dev/null 2>&1; then
    append_report_row "Internet" "PASS" "ollama.com reachable"
    success "Internet: OK (ollama.com)"
  else
    append_report_row "Internet" "FAIL" "cannot reach github.com or ollama.com"
    PREFLIGHT_OK=false
    error "No internet connectivity — required for install"
  fi
}

check_root() {
  if [[ "$(id -u)" -eq 0 ]]; then
    IS_ROOT="true"
    append_report_row "Privileges" "INFO" "running as root (SUDO disabled)"
    info "Running as root — apt installs run without sudo"
  elif command_exists sudo; then
    append_report_row "Privileges" "PASS" "non-root with sudo"
    success "Privileges: non-root with sudo"
  else
    append_report_row "Privileges" "WARN" "non-root without sudo — some installs may fail"
    warn "No sudo — ensure write permissions for apt/npm global installs"
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
    PREFLIGHT_OK=false
    error "Insufficient RAM: ${ram_gb} GB (minimum ${MIN_RAM_GB} GB)"
  fi
}

check_disk() {
  local disk_gb
  disk_gb="$(get_disk_free_gb "${REPO_ROOT}")"
  if [[ -z "${disk_gb}" ]] || [[ "${disk_gb}" -lt "${MIN_DISK_GB}" ]]; then
    append_report_row "Disk (free)" "FAIL" "${disk_gb:-0} GB (need ${MIN_DISK_GB}+ GB)"
    PREFLIGHT_OK=false
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
    append_report_row "Python" "WARN" "${ver} (Phase 1 will upgrade if needed)"
    warn "Python ${ver} below minimum — Phase 1 will install/upgrade"
  else
    append_report_row "Python" "WARN" "not found (Phase 1 will install)"
    warn "Python not found — Phase 1 will install"
  fi
}

check_pip() {
  if python3 -m pip --version >/dev/null 2>&1 || command_exists pip3; then
    append_report_row "pip3" "PASS" "$(python3 -m pip --version 2>/dev/null | head -1 || pip3 --version 2>/dev/null)"
    success "pip3: OK"
  else
    append_report_row "pip3" "WARN" "missing (Phase 1 will install)"
    warn "pip3 not found — Phase 1 will install"
  fi
}

check_node() {
  local major
  major="$(get_node_major)"
  if [[ "${major}" -ge "${MIN_NODE_MAJOR}" ]]; then
    append_report_row "Node.js" "PASS" "$(node -v 2>/dev/null) (lock: ${MIN_NODE_MAJOR})"
    success "Node.js: $(node -v)"
  elif command_exists node; then
    append_report_row "Node.js" "WARN" "$(node -v) (Phase 1 will upgrade to ${MIN_NODE_MAJOR})"
    warn "Node.js below lock ${MIN_NODE_MAJOR} — Phase 1 will upgrade"
  else
    append_report_row "Node.js" "WARN" "not found (Phase 1 will install ${MIN_NODE_MAJOR})"
    warn "Node.js not found — Phase 1 will install ${MIN_NODE_MAJOR}"
  fi
}

check_git_curl() {
  for cmd in git curl wget; do
    if command_exists "${cmd}"; then
      append_report_row "${cmd}" "PASS" "$(command -v "${cmd}")"
      success "${cmd}: OK"
    else
      append_report_row "${cmd}" "WARN" "missing (auto-install in preflight/runtime)"
      warn "${cmd} not found — will auto-install"
    fi
  done
}

check_gpu() {
  detect_gpu || true
  if [[ "${GPU_DETECTED}" == "true" ]]; then
    append_report_row "GPU" "PASS" "$(gpu_report_summary)"
    success "GPU: $(gpu_report_summary)"
  else
    append_report_row "GPU" "WARN" "No GPU — CPU inference only"
    warn "No GPU detected. Ollama will run on CPU (significantly slower for 32B model)."
  fi
}

check_docker() {
  if command_exists docker; then
    local docker_ver
    docker_ver="$(docker --version 2>/dev/null || echo "installed")"
    append_report_row "Docker" "INFO" "${docker_ver}"
    success "Docker: ${docker_ver}"
  else
    append_report_row "Docker" "INFO" "not installed (optional — browser-dev may use pip fallback)"
    info "Docker not installed (optional)"
  fi
}

check_ollama_preflight() {
  if command_exists ollama; then
    append_report_row "Ollama (pre-install)" "INFO" "$(ollama --version 2>/dev/null || echo installed)"
    if curl -sf "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1; then
      append_report_row "Ollama API" "PASS" "${OLLAMA_HOST} responding"
      success "Ollama already running at ${OLLAMA_HOST}"
    else
      append_report_row "Ollama API" "WARN" "binary present, API not responding yet"
      warn "Ollama installed but API not up — Phase 2 will start service"
    fi
  else
    append_report_row "Ollama (pre-install)" "INFO" "not installed (Phase 2)"
    info "Ollama not yet installed — Phase 2"
  fi
}

check_container() {
  detect_container_env
  append_report_row "Container env" "INFO" "${CONTAINER_ENV}"
  if [[ "${CONTAINER_ENV}" != "bare-metal" ]]; then
    info "Container environment detected: ${CONTAINER_ENV} — systemd/desktop not assumed"
    append_report_row "Clore/Vast/RunPod" "INFO" "$(detect_cloud_provider)"
  fi
}

main() {
  step "Preflight check (Phase 0)"
  require_linux
  ensure_prerequisites
  load_install_lock

  if [[ -f "${INSTALL_LOCK}" ]]; then
    info "Lock file ${INSTALL_LOCK}: os=${LOCK_OS:-?} node=${LOCK_NODE:-?} python=${LOCK_PYTHON:-?} ollama=${LOCK_OLLAMA:-?} model=${LOCK_MODEL:-?} opencode=${LOCK_OPENCODE_VERSION:-?}"
  fi

  write_report_header
  check_container
  check_os
  check_root
  check_internet
  check_ram
  check_disk
  check_python
  check_pip
  check_node
  check_git_curl
  check_gpu
  check_docker
  check_ollama_preflight

  if [[ "${PREFLIGHT_OK}" == "true" ]]; then
    finalize_report "PASS — compatible with Teknovo AI Workstation"
    success "Preflight passed. Report: ${REPORT_PATH}"
  else
    finalize_report "FAIL — minimum requirements not met"
    die "Preflight failed. See ${REPORT_PATH}"
  fi
}

main "$@"
