#!/usr/bin/env bash
# Teknovo AI Workstation — Ollama helpers (health wait, API probes)

wait_for_ollama() {
  local host="${OLLAMA_HOST:-http://127.0.0.1:11434}"
  for i in $(seq 1 180); do
    if curl -sf "${host}/api/tags" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done
  return 1
}

ollama_api_tags() {
  curl -sf "${OLLAMA_HOST:-http://127.0.0.1:11434}/api/tags"
}

ollama_v1_models() {
  curl -sf "${OLLAMA_HOST:-http://127.0.0.1:11434}/v1/models"
}

model_in_api_tags() {
  local target="${1:-${OLLAMA_MODEL}}"
  local tags_json
  tags_json="$(ollama_api_tags)" || return 1
  printf '%s' "${tags_json}" | python3 -c "
import json, sys
target = sys.argv[1]
data = json.load(sys.stdin)
for item in data.get('models', []):
    name = item.get('name', '')
    if name == target or name.startswith(f'{target}:'):
        sys.exit(0)
sys.exit(1)
" "${target}"
}

model_in_v1_models() {
  local target="${1:-${OLLAMA_MODEL}}"
  local v1_json
  v1_json="$(ollama_v1_models)" || return 1
  printf '%s' "${v1_json}" | python3 -c "
import json, sys
target = sys.argv[1]
data = json.load(sys.stdin)
for item in data.get('data', []):
    mid = item.get('id', '')
    if mid == target or mid.startswith(f'{target}:'):
        sys.exit(0)
sys.exit(1)
" "${target}"
}

model_present() {
  local target="${1:-${OLLAMA_MODEL}}"
  if command_exists ollama && ollama list 2>/dev/null | grep -q "${target}"; then
    return 0
  fi
  model_in_api_tags "${target}" && return 0
  model_in_v1_models "${target}"
}

ensure_ollama_healthy() {
  if wait_for_ollama; then
    success "Ollama API ready at ${OLLAMA_HOST:-http://127.0.0.1:11434}"
    return 0
  fi
  die "Ollama API unavailable after 360s wait — run: bash bootstrap/start-ollama.sh (or tmux attach -t ollama, or systemctl status ollama)"
}
