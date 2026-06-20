#!/usr/bin/env bash
# Teknovo AI Workstation — checkpoint state for recovery mode

STATE_DIR="${REPO_ROOT}/.bootstrap"
STATE_FILE="${STATE_DIR}/state.json"

# Ordered phase IDs (must match install.sh)
BOOTSTRAP_PHASES=(
  "preflight"
  "compatibility"
  "runtime"
  "ollama"
  "model"
  "opencode"
  "skills"
  "memory"
  "registries"
  "mcp"
  "docs"
  "verify"
  "status"
)

init_state() {
  mkdir -p "${STATE_DIR}/logs" "${STATE_DIR}/reports"
  if [[ ! -f "${STATE_FILE}" ]]; then
    cat > "${STATE_FILE}" <<'EOF'
{
  "version": 1,
  "started_at": "",
  "last_completed": "",
  "completed_phases": []
}
EOF
    python3 - "${STATE_FILE}" <<'PY'
import json, sys
from datetime import datetime, timezone
from pathlib import Path

path = Path(sys.argv[1])
data = json.loads(path.read_text(encoding="utf-8"))
data["started_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
PY
  fi
}

phase_is_complete() {
  local phase="$1"
  python3 - "${STATE_FILE}" "${phase}" <<'PY'
import json, sys
from pathlib import Path

path = Path(sys.argv[1])
phase = sys.argv[2]
if not path.exists():
    sys.exit(1)
data = json.loads(path.read_text(encoding="utf-8"))
sys.exit(0 if phase in data.get("completed_phases", []) else 1)
PY
}

mark_phase_complete() {
  local phase="$1"
  init_state
  python3 - "${STATE_FILE}" "${phase}" <<'PY'
import json, sys
from datetime import datetime, timezone
from pathlib import Path

path = Path(sys.argv[1])
phase = sys.argv[2]
data = json.loads(path.read_text(encoding="utf-8"))
phases = data.setdefault("completed_phases", [])
if phase not in phases:
    phases.append(phase)
data["last_completed"] = phase
data["updated_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
PY
  log_info "Checkpoint saved: ${phase}"
}

get_last_completed_phase() {
  python3 - "${STATE_FILE}" <<'PY'
import json, sys
from pathlib import Path

path = Path(sys.argv[1])
if not path.exists():
    sys.exit(0)
data = json.loads(path.read_text(encoding="utf-8"))
print(data.get("last_completed", ""))
PY
}

detect_partial_install() {
  local last
  last="$(get_last_completed_phase 2>/dev/null || true)"
  [[ -n "${last}" ]]
}

phase_index() {
  local target="$1"
  local i=0
  for p in "${BOOTSTRAP_PHASES[@]}"; do
    if [[ "${p}" == "${target}" ]]; then
      echo "${i}"
      return 0
    fi
    i=$((i + 1))
  done
  echo "-1"
}

should_skip_phase() {
  local phase="$1"
  local recover_mode="${RECOVER_MODE:-false}"
  if [[ "${recover_mode}" != "true" ]]; then
    return 1
  fi
  if phase_is_complete "${phase}"; then
    return 0
  fi
  # Legacy checkpoint: compatibility phase renamed to preflight
  if [[ "${phase}" == "preflight" ]] && phase_is_complete "compatibility"; then
    return 0
  fi
  return 1
}

reset_state() {
  rm -f "${STATE_FILE}"
  init_state
  log_recovery "Bootstrap state reset — full install will run"
}
