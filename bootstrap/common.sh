#!/usr/bin/env bash
# Teknovo AI Workstation — shared bootstrap utilities
# shellcheck disable=SC2034
set -euo pipefail

# Resolve repo root (bootstrap/ parent)
BOOTSTRAP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${BOOTSTRAP_DIR}/.." && pwd)"
export BOOTSTRAP_DIR REPO_ROOT

if [[ -z "${INSTALL_LOG:-}" ]]; then
  LOG_DIR="${REPO_ROOT}/.bootstrap/logs"
  mkdir -p "${LOG_DIR}"
  INSTALL_LOG="${LOG_DIR}/install-$(date +%Y%m%d-%H%M%S).log"
  export INSTALL_LOG LOG_DIR
else
  LOG_DIR="${LOG_DIR:-${REPO_ROOT}/.bootstrap/logs}"
  export LOG_DIR
fi

# Minimum requirements (Clore Cloud GPU workstation)
MIN_RAM_GB=16
MIN_DISK_GB=50
MIN_PYTHON_MAJOR=3
MIN_PYTHON_MINOR=10
MIN_NODE_MAJOR=18
OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen2.5-coder:32b}"
INSTALL_LOCK="${BOOTSTRAP_DIR}/install.lock.yaml"
LOCK_OS=""
LOCK_NODE=""
LOCK_PYTHON=""
LOCK_OLLAMA=""
LOCK_MODEL=""
LOCK_OPENCODE_VERSION=""

load_install_lock() {
  if [[ ! -f "${INSTALL_LOCK}" ]]; then
    return 0
  fi
  if ! validate_yaml "${INSTALL_LOCK}" 2>/dev/null; then
    warn "Invalid ${INSTALL_LOCK} — using built-in defaults"
    return 0
  fi

  local parsed
  parsed="$(python3 - "${INSTALL_LOCK}" <<'PY'
import sys
import yaml
from pathlib import Path

data = yaml.safe_load(Path(sys.argv[1]).read_text(encoding="utf-8")) or {}

def emit(key, value):
    if value is None:
        return
    escaped = str(value).replace("\\", "\\\\").replace('"', '\\"')
    print(f'LOCK_{key}="{escaped}"')

emit("OS", data.get("os"))
emit("NODE", data.get("node"))
emit("PYTHON", data.get("python"))
emit("OLLAMA", data.get("ollama"))

model = data.get("model")
if isinstance(model, dict) and model:
    emit("MODEL", next(iter(model)))
elif isinstance(model, str):
    emit("MODEL", model)

opencode = data.get("opencode") or {}
if isinstance(opencode, dict):
    emit("OPENCODE_VERSION", opencode.get("version"))
PY
)" || return 0

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

info()    { log "INFO" "${BLUE}$*${NC}"; }
success() { log "OK"   "${GREEN}$*${NC}"; }
warn()    { log "WARN" "${YELLOW}$*${NC}"; }
error()   { log "ERROR" "${RED}$*${NC}" >&2; }

die() {
  error "$@"
  exit 1
}

step() {
  echo ""
  info "${BOLD}==> $*${NC}"
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

run_phase() {
  local script="$1"
  local name="$2"
  if [[ ! -x "${BOOTSTRAP_DIR}/${script}" ]]; then
    chmod +x "${BOOTSTRAP_DIR}/${script}" 2>/dev/null || true
  fi
  step "Phase: ${name}"
  # shellcheck source=/dev/null
  source "${BOOTSTRAP_DIR}/common.sh"
  bash "${BOOTSTRAP_DIR}/${script}"
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
  local file="$1"
  python3 -c "
import sys
try:
    import yaml
except ImportError:
    sys.exit(2)
with open('${file}', encoding='utf-8') as f:
    yaml.safe_load(f)
" 2>/dev/null
}
