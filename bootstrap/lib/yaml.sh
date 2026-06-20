#!/usr/bin/env bash
# Teknovo AI Workstation — install.lock.yaml parsing via Python + PyYAML

yaml_require_parser() {
  if python3 -c "import yaml" 2>/dev/null; then
    return 0
  fi
  if command_exists apt-get; then
    info "Installing python3-yaml for lock file parsing..."
    ${SUDO} apt-get update -qq
    ${SUDO} DEBIAN_FRONTEND=noninteractive apt-get install -y -qq python3-yaml
  fi
  if ! python3 -c "import yaml" 2>/dev/null; then
    ensure_pip_package pyyaml yaml
  fi
  python3 -c "import yaml" 2>/dev/null || die "PyYAML required to parse ${INSTALL_LOCK}"
}

yaml_validate_file() {
  local file="$1"
  if [[ ! -f "${file}" ]]; then
    return 1
  fi
  yaml_require_parser
  python3 - "${file}" <<'PY'
import sys
from pathlib import Path
import yaml

path = Path(sys.argv[1])
try:
    raw = path.read_text(encoding="utf-8")
except OSError as exc:
    print(f"Cannot read file: {exc}", file=sys.stderr)
    sys.exit(3)

if not raw.strip():
    print("Empty YAML file", file=sys.stderr)
    sys.exit(4)

try:
    yaml.safe_load(raw)
except yaml.YAMLError as exc:
    print(f"Invalid YAML: {exc}", file=sys.stderr)
    sys.exit(1)
PY
}

yaml_parse_install_lock() {
  local lock_file="$1"
  yaml_require_parser
  python3 - "${lock_file}" <<'PY'
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
}
