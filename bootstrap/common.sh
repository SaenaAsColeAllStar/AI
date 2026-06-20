#!/usr/bin/env bash
# Teknovo AI Workstation — shared bootstrap utilities
# shellcheck disable=SC2034
set -euo pipefail

# Resolve repo root (bootstrap/ parent)
BOOTSTRAP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${BOOTSTRAP_DIR}/.." && pwd)"
export BOOTSTRAP_DIR REPO_ROOT

# shellcheck source=lib/privilege.sh
source "${BOOTSTRAP_DIR}/lib/privilege.sh"

if [[ -z "${INSTALL_LOG:-}" ]]; then
  LOG_DIR="${REPO_ROOT}/.bootstrap/logs"
  mkdir -p "${LOG_DIR}"
  INSTALL_LOG="${LOG_DIR}/install-$(date +%Y%m%d-%H%M%S).log"
  export INSTALL_LOG LOG_DIR
else
  LOG_DIR="${LOG_DIR:-${REPO_ROOT}/.bootstrap/logs}"
  mkdir -p "${LOG_DIR}"
  export LOG_DIR
fi

# Minimum requirements (Clore Cloud GPU workstation)
MIN_RAM_GB=16
MIN_DISK_GB=50
MIN_PYTHON_MAJOR=3
MIN_PYTHON_MINOR=10
MIN_NODE_MAJOR=18
OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen3:32b}"
INSTALL_LOCK="${BOOTSTRAP_DIR}/install.lock.yaml"
LOCK_OS=""
LOCK_NODE=""
LOCK_PYTHON=""
LOCK_OLLAMA=""
LOCK_MODEL=""
LOCK_OPENCODE_VERSION=""

# shellcheck source=lib/yaml.sh
source "${BOOTSTRAP_DIR}/lib/yaml.sh"
# shellcheck source=lib/logging.sh
source "${BOOTSTRAP_DIR}/lib/logging.sh"
# shellcheck source=lib/prereqs.sh
source "${BOOTSTRAP_DIR}/lib/prereqs.sh"
# shellcheck source=lib/state.sh
source "${BOOTSTRAP_DIR}/lib/state.sh"
# shellcheck source=lib/gpu.sh
source "${BOOTSTRAP_DIR}/lib/gpu.sh"
# shellcheck source=lib/ollama.sh
source "${BOOTSTRAP_DIR}/lib/ollama.sh"
# shellcheck source=lib/ollama-start.sh
source "${BOOTSTRAP_DIR}/lib/ollama-start.sh"

apply_env_overrides() {
  # Priority: install.lock.yaml > env vars > defaults (lock applied in load_install_lock first)
  if [[ -n "${TEKNOVO_NODE_MAJOR:-}" ]] && [[ -z "${LOCK_NODE}" ]]; then
    MIN_NODE_MAJOR="${TEKNOVO_NODE_MAJOR}"
  fi
  if [[ -n "${TEKNOVO_PYTHON_VERSION:-}" ]] && [[ -z "${LOCK_PYTHON}" ]]; then
    MIN_PYTHON_MAJOR="${TEKNOVO_PYTHON_VERSION%%.*}"
    MIN_PYTHON_MINOR="${TEKNOVO_PYTHON_VERSION#*.}"
    MIN_PYTHON_MINOR="${MIN_PYTHON_MINOR%%.*}"
  fi
  if [[ -n "${TEKNOVO_OLLAMA_MODEL:-}" ]] && [[ -z "${LOCK_MODEL}" ]]; then
    OLLAMA_MODEL="${TEKNOVO_OLLAMA_MODEL}"
  fi
  if [[ -n "${TEKNOVO_OPENCODE_VERSION:-}" ]] && [[ -z "${LOCK_OPENCODE_VERSION}" ]]; then
    LOCK_OPENCODE_VERSION="${TEKNOVO_OPENCODE_VERSION}"
  fi
}

load_install_lock() {
  if [[ ! -f "${INSTALL_LOCK}" ]]; then
    apply_env_overrides
    return 0
  fi

  local rc=0
  yaml_validate_file "${INSTALL_LOCK}" || rc=$?
  if [[ ${rc} -eq 1 ]] || [[ ${rc} -eq 4 ]]; then
    die "Invalid YAML in ${INSTALL_LOCK} — fix syntax before continuing"
  elif [[ ${rc} -ne 0 ]]; then
    warn "Cannot read ${INSTALL_LOCK} — using built-in defaults"
    apply_env_overrides
    return 0
  fi

  local parsed
  parsed="$(yaml_parse_install_lock "${INSTALL_LOCK}")" || die "Failed to parse ${INSTALL_LOCK}"

  # shellcheck disable=SC2086
  eval "${parsed}"

  if [[ -n "${LOCK_NODE}" ]]; then
    MIN_NODE_MAJOR="${LOCK_NODE}"
  fi
  if [[ -n "${LOCK_PYTHON}" ]]; then
    MIN_PYTHON_MAJOR="${LOCK_PYTHON%%.*}"
    MIN_PYTHON_MINOR="${LOCK_PYTHON#*.}"
    MIN_PYTHON_MINOR="${MIN_PYTHON_MINOR%%.*}"
  fi
  if [[ -n "${LOCK_MODEL}" ]]; then
    OLLAMA_MODEL="${LOCK_MODEL}"
  fi

  apply_env_overrides
}

# Colors (disabled when not a TTY)
if [[ -t 1 ]]; then
  RED=$'\033[0;31m'
  GREEN=$'\033[0;32m'
  YELLOW=$'\033[1;33m'
  BLUE=$'\033[0;34m'
  CYAN=$'\033[0;36m'
  BOLD=$'\033[1m'
  NC=$'\033[0m'
else
  RED='' GREEN='' YELLOW='' BLUE='' CYAN='' BOLD='' NC=''
fi

log() {
  local level="$1"
  shift
  local msg="[$(date +'%Y-%m-%d %H:%M:%S')] [${level}] $*"
  echo -e "${msg}" | tee -a "${INSTALL_LOG}"
}

info()    { log_info "$@"; }
success() { log "OK"   "${GREEN}$*${NC}"; }
warn()    { log "WARN" "${YELLOW}$*${NC}"; }
error()   { log_error "$@"; }

die() {
  error "$@"
  exit 1
}

step() {
  log_phase_start "$*"
}

require_linux() {
  if [[ "$(uname -s)" != "Linux" ]]; then
    die "This installer targets Linux (Ubuntu 22.04/24.04). Detected: $(uname -s). Use bootstrap/install.ps1 on Windows for guidance."
  fi
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

version_ge() {
  # usage: version_ge "3.10.0" "3.10"
  printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

get_python_version() {
  if command_exists python3; then
    python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")'
  else
    echo "0.0.0"
  fi
}

get_node_major() {
  if command_exists node; then
    node -p 'process.versions.node.split(".")[0]'
  else
    echo "0"
  fi
}

get_ram_gb() {
  if [[ -r /proc/meminfo ]]; then
    awk '/MemTotal/ {printf "%.0f\n", $2/1024/1024}' /proc/meminfo
  else
    echo "0"
  fi
}

get_disk_free_gb() {
  local path="${1:-${REPO_ROOT}}"
  df -BG "${path}" 2>/dev/null | awk 'NR==2 {gsub(/G/,"",$4); print $4}'
}

ensure_pip_package() {
  local pkg="$1"
  local import_name="${2:-${pkg//-/_}}"
  if [[ "${pkg}" == "pyyaml" ]]; then
    import_name="yaml"
  fi
  if python3 -c "import ${import_name}" 2>/dev/null; then
    success "Python package ${pkg} already installed"
  else
    info "Installing Python package: ${pkg}"
    python3 -m pip install --user -q "${pkg}" || python3 -m pip install -q "${pkg}"
    success "Installed ${pkg}"
  fi
}

validate_yaml() {
  yaml_validate_file "$1"
}

run_phase_script() {
  local script="$1"
  local phase_id="$2"
  local label="$3"

  if should_skip_phase "${phase_id}"; then
    log_recovery "Skipping completed phase: ${label} (${phase_id})"
    return 0
  fi

  if [[ ! -f "${BOOTSTRAP_DIR}/${script}" ]]; then
    die "Missing bootstrap script: ${script}"
  fi
  chmod +x "${BOOTSTRAP_DIR}/${script}" 2>/dev/null || true

  log_phase_start "${label}"
  if bash "${BOOTSTRAP_DIR}/${script}"; then
    mark_phase_complete "${phase_id}"
    log_phase_success "${label}"
  else
    log_phase_failure "${label}"
    return 1
  fi
}
