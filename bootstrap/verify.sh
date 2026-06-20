#!/usr/bin/env bash
# Phase 10 — Full workstation verification
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

FAILURES=0
WARNINGS=0

check() {
  local name="$1"
  local cmd="$2"
  if eval "${cmd}" >/dev/null 2>&1; then
    success "CHECK PASS: ${name}"
    return 0
  else
    error "CHECK FAIL: ${name}"
    FAILURES=$((FAILURES + 1))
    return 1
  fi
}

warn_check() {
  local name="$1"
  local cmd="$2"
  if eval "${cmd}" >/dev/null 2>&1; then
    success "CHECK PASS: ${name}"
  else
    warn "CHECK WARN: ${name}"
    WARNINGS=$((WARNINGS + 1))
  fi
}

verify_ollama() {
  step "Verify Ollama"
  check "Ollama CLI" "command -v ollama"
  check "Ollama API /api/tags" "curl -sf ${OLLAMA_HOST}/api/tags"
}

verify_model() {
  step "Verify Qwen model"
  check "Model ${OLLAMA_MODEL} in ollama list" "ollama list | grep -q '${OLLAMA_MODEL}'"
  check "Model ${OLLAMA_MODEL} in API tags" "curl -sf ${OLLAMA_HOST}/api/tags | grep -q '${OLLAMA_MODEL}'"
}

verify_opencode() {
  step "Verify OpenCode"
  check "OpenCode CLI" "command -v opencode"
  check "OpenCode version" "opencode --version"
  check "OpenCode config" "test -f ${HOME}/.config/opencode/opencode.jsonc"
}

verify_memory() {
  step "Verify memory layer"
  local files=(
    "memory/memory-registry.yaml"
    "memory/project-context.md"
    "memory/repository-map.md"
    "ai-agent/runtime/load-memory.py"
  )
  for f in "${files[@]}"; do
    check "Memory: ${f}" "test -f ${REPO_ROOT}/${f}"
  done
  check "Memory loader runs" "python3 ${REPO_ROOT}/ai-agent/runtime/load-memory.py --format json --quiet-warnings"
}

verify_skills() {
  step "Verify skills"
  check "AGENTS.md" "test -f ${REPO_ROOT}/AGENTS.md"
  check ".agents/registry.yaml" "test -f ${REPO_ROOT}/.agents/registry.yaml"
  local count
  count="$(find ${REPO_ROOT}/.agents/skills -name 'SKILL.md' 2>/dev/null | wc -l)"
  if [[ "${count}" -ge 30 ]]; then
    success "CHECK PASS: Skills count (${count} >= 30)"
  else
    warn "CHECK WARN: Skills count ${count} (expected 30+)"
    WARNINGS=$((WARNINGS + 1))
  fi
}

verify_layers() {
  step "Verify taste/quality/security/assurance"
  for layer in taste quality security assurance; do
    check "${layer} registry" "test -f ${REPO_ROOT}/${layer}/${layer}-registry.yaml"
  done
}

verify_registries() {
  step "Verify registry/"
  for f in skill-registry.yaml agent-registry.yaml mcp-registry.yaml; do
    check "registry/${f}" "test -f ${REGISTRY_DIR:-${REPO_ROOT}/registry}/${f}"
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
  check "compatibility-report.md" "test -f ${REPO_ROOT}/docs/ai/compatibility-report.md"
}

verify_recovery() {
  step "Verify recovery idempotency markers"
  check "install.sh executable" "test -x ${REPO_ROOT}/bootstrap/install.sh"
  for script in compatibility.sh install-runtime.sh install-ollama.sh install-model.sh \
                install-opencode.sh install-skills.sh build-memory.sh build-registries.sh; do
    check "bootstrap/${script}" "test -f ${REPO_ROOT}/bootstrap/${script}"
  done
}

main() {
  step "Workstation verification (Phase 10)"
  verify_ollama
  verify_model
  verify_opencode
  verify_memory
  verify_skills
  verify_layers
  verify_registries
  verify_mcp
  verify_docs
  verify_recovery

  echo ""
  if [[ ${FAILURES} -eq 0 ]]; then
    success "Verification passed (${WARNINGS} warning(s))"
    exit 0
  else
    error "Verification failed: ${FAILURES} failure(s), ${WARNINGS} warning(s)"
    exit 1
  fi
}

main "$@"
