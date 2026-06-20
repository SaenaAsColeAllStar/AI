#!/usr/bin/env bash
# Phase 10 — Full workstation verification + final report
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

REPORT_DIR="${REPO_ROOT}/..cursor/runtime/bootstrap/reports"
FINAL_REPORT="${REPORT_DIR}/final-report.md"

FAILURES=0
WARNINGS=0
RESULT_ROWS=()

trap 'on_phase_error ${LINENO}' ERR

record_result() {
  local name="$1"
  local status="$2"
  local detail="${3:-}"
  RESULT_ROWS+=("| ${name} | ${status} | ${detail} |")
}

check() {
  local name="$1"
  local cmd="$2"
  local detail="${3:-OK}"
  if eval "${cmd}" >/dev/null 2>&1; then
    success "CHECK PASS: ${name}"
    record_result "${name}" "PASS" "${detail}"
    return 0
  else
    error "CHECK FAIL: ${name}"
    record_result "${name}" "FAIL" "${detail}"
    FAILURES=$((FAILURES + 1))
    return 1
  fi
}

warn_check() {
  local name="$1"
  local cmd="$2"
  local detail="${3:-optional}"
  if eval "${cmd}" >/dev/null 2>&1; then
    success "CHECK PASS: ${name}"
    record_result "${name}" "PASS" "${detail}"
  else
    warn "CHECK WARN: ${name}"
    record_result "${name}" "WARN" "${detail}"
    WARNINGS=$((WARNINGS + 1))
  fi
}

verify_runtime_tools() {
  step "Verify runtime tools"
  load_install_lock
  check "Git" "command -v git" "$(git --version 2>/dev/null | head -1 || echo 'missing')"
  check "Curl" "command -v curl" "$(curl --version 2>/dev/null | head -1 || echo 'missing')"
  check "Python 3" "command -v python3" "$(get_python_version)"
  check "Node.js" "command -v node" "$(node -v 2>/dev/null || echo 'missing')"
  check "npm" "command -v npm" "$(npm -v 2>/dev/null || echo 'missing')"
  warn_check "pnpm" "command -v pnpm" "$(pnpm -v 2>/dev/null || echo 'not installed — optional')"
}

verify_ollama() {
  step "Verify Ollama"
  if ! check "Ollama CLI" "command -v ollama"; then
    return 1
  fi
  if ! check "Ollama API /api/tags" "curl -sf ${OLLAMA_HOST}/api/tags"; then
    warn "Ollama API down — try: bash .cursor/runtime/bootstrap/start-ollama.sh (or tmux attach -t ollama)"
    return 1
  fi
}

verify_model() {
  step "Verify Qwen model"
  load_install_lock
  check "Model ${OLLAMA_MODEL} in ollama list" "ollama list | grep -q '${OLLAMA_MODEL}'"
  check "Model ${OLLAMA_MODEL} in /api/tags" "model_in_api_tags '${OLLAMA_MODEL}'"
  check "Model ${OLLAMA_MODEL} in /v1/models" "model_in_v1_models '${OLLAMA_MODEL}'"
}

verify_opencode() {
  step "Verify OpenCode"
  load_install_lock
  check "OpenCode CLI" "command -v opencode"
  check "OpenCode version" "opencode --version"
  check "OpenCode config" "test -f ${HOME}/.config/opencode/opencode.jsonc"
  check "OpenCode model ollama-local/${OLLAMA_MODEL}" "opencode models 2>&1 | grep -qF 'ollama-local/${OLLAMA_MODEL}'"
}

verify_memory() {
  step "Verify memory layer"
  local files=(
    ".cursor/docs/memory/memory-registry.yaml"
    ".cursor/docs/memory/project-context.md"
    ".cursor/docs/memory/repository-map.md"
    ".cursor/runtime/load-memory.py"
  )
  for f in "${files[@]}"; do
    check "Memory: ${f}" "test -f ${REPO_ROOT}/${f}"
  done
  check "Memory loader runs" "python3 ${REPO_ROOT}/.cursor/runtime/load-memory.py --format json --quiet-warnings"
}

verify_skills() {
  step "Verify skills"
  check "AGENTS.md" "test -f ${REPO_ROOT}/AGENTS.md"
  check ".cursor/registry/legacy-registry.yaml" "test -f ${REPO_ROOT}/.cursor/registry/legacy-registry.yaml"
  local count
  count="$(find ${REPO_ROOT}/.cursor/skills -name 'SKILL.md' 2>/dev/null | wc -l)"
  if [[ "${count}" -ge 30 ]]; then
    success "CHECK PASS: Skills count (${count} >= 30)"
    record_result "Skills count" "PASS" "${count} skills"
  else
    warn "CHECK WARN: Skills count ${count} (expected 30+)"
    record_result "Skills count" "WARN" "${count} skills"
    WARNINGS=$((WARNINGS + 1))
  fi
}

verify_layers() {
  step "Verify .cursor/gates/taste/.cursor/gates/quality/.cursor/gates/security/assurance"
  for layer in taste quality security assurance; do
    check "${layer} registry" "test -f ${REPO_ROOT}/${layer}/${layer}-registry.yaml"
  done
}

verify_registries() {
  step "Verify .cursor/registry/"
  for f in skill-registry.yaml agent-registry.yaml mcp-registry.yaml; do
    check ".cursor/registry/${f}" "test -f ${REPO_ROOT}/.cursor/registry/${f}"
  done
}

verify_mcp() {
  step "Verify MCP structure"
  for svc in github cloudflare filesystem git; do
    check "mcp/${svc}/README.md" "test -f ${REPO_ROOT}/mcp/${svc}/README.md"
    check "mcp/${svc}/config.template.json" "test -f ${REPO_ROOT}/mcp/${svc}/config.template.json"
  done
}

verify_docs() {
  step "Verify documentation"
  for doc in AI_BOOTSTRAP.md AI_RUNTIME.md AI_DEPLOY.md AI_RECOVERY.md AI_ARCHITECTURE.md; do
    check "Doc: ${doc}" "test -f ${REPO_ROOT}/${doc}"
  done
  check "compatibility-report.md" "test -f ${REPO_ROOT}/.cursor/docs/ai/compatibility-report.md"
  check "preflight.sh" "test -x ${REPO_ROOT}/.cursor/runtime/bootstrap/preflight.sh"
  warn_check "GPU detection lib" "test -f ${REPO_ROOT}/.cursor/runtime/bootstrap/lib/gpu.sh"
}

verify_recovery() {
  step "Verify recovery idempotency markers"
  check "install.sh executable" "test -x ${REPO_ROOT}/.cursor/runtime/bootstrap/install.sh"
  check "recover.sh executable" "test -x ${REPO_ROOT}/.cursor/runtime/bootstrap/recover.sh"
  check "state checkpoint dir" "test -d ${REPO_ROOT}/.bootstrap"
  for script in preflight.sh compatibility.sh install-runtime.sh install-ollama.sh start-ollama.sh install-model.sh \
                install-opencode.sh install-skills.sh build-memory.sh build-registries.sh; do
    check ".cursor/runtime/bootstrap/${script}" "test -f ${REPO_ROOT}/.cursor/runtime/bootstrap/${script}"
  done
}

write_final_report() {
  mkdir -p "${REPORT_DIR}"
  local overall="PASS"
  if [[ ${FAILURES} -gt 0 ]]; then
    overall="FAIL"
  elif [[ ${WARNINGS} -gt 0 ]]; then
    overall="PASS WITH WARNINGS"
  fi

  {
    echo "# Teknovo AI Workstation — Final Verification Report"
    echo ""
    echo "**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    echo "**Host**: $(hostname 2>/dev/null || echo unknown)"
    echo "**Repository**: ${REPO_ROOT}"
    echo "**Log**: ${INSTALL_LOG}"
    echo ""
    echo "## Summary"
    echo ""
    echo "| Metric | Value |"
    echo "|--------|-------|"
    echo "| Overall | **${overall}** |"
    echo "| Failures | ${FAILURES} |"
    echo "| Warnings | ${WARNINGS} |"
    echo ""
    echo "## Checks"
    echo ""
    echo "| Check | Status | Detail |"
    echo "|-------|--------|--------|"
    for row in "${RESULT_ROWS[@]}"; do
      echo "${row}"
    done
    echo ""
    echo "## Lock file targets"
    echo ""
    echo "| Key | Value |"
    echo "|-----|-------|"
    echo "| OS | ${LOCK_OS:-ubuntu-22.04} |"
    echo "| Node | ${MIN_NODE_MAJOR}+ |"
    echo "| Python | ${MIN_PYTHON_MAJOR}.${MIN_PYTHON_MINOR}+ |"
    echo "| Ollama model | ${OLLAMA_MODEL} |"
    echo "| OpenCode | ${LOCK_OPENCODE_VERSION:-latest} |"
    echo ""
    echo "## Recovery"
    echo ""
    echo "If verification failed, run:"
    echo ""
    echo "\`\`\`bash"
    echo "bash .cursor/runtime/bootstrap/recover.sh"
    echo "\`\`\`"
    echo ""
    echo "If Ollama API is down (common in containers without systemd):"
    echo ""
    echo "\`\`\`bash"
    echo "bash .cursor/runtime/bootstrap/start-ollama.sh"
    echo "tmux attach -t ollama    # inspect tmux session if used"
    echo "\`\`\`"
  } > "${FINAL_REPORT}"

  success "Final report written: ${FINAL_REPORT}"
}

main() {
  step "Workstation verification (Phase 10)"
  load_install_lock
  init_state

  verify_runtime_tools || true
  verify_ollama || true
  verify_model || true
  verify_opencode || true
  verify_memory || true
  verify_skills || true
  verify_layers || true
  verify_registries || true
  verify_mcp || true
  verify_docs || true
  verify_recovery || true

  write_final_report

  echo ""
  if [[ ${FAILURES} -eq 0 ]]; then
    success "Verification passed (${WARNINGS} warning(s))"
    exit 0
  else
    error "Verification failed: ${FAILURES} failure(s), ${WARNINGS} warning(s)"
    error "See ${FINAL_REPORT}"
    exit 1
  fi
}

main "$@"
