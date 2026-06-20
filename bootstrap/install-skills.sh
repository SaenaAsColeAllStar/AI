#!/usr/bin/env bash
# Phase 5 — Verify and register AI skills, memory, quality, taste, security, assurance layers
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

trap 'on_phase_error ${LINENO}' ERR

SKILL_ROOTS=(
  ".agents/skills/teknovo-academic"
  ".agents/skills/teknovo-api-architect"
  ".agents/skills/teknovo-backend-development"
  ".agents/skills/teknovo-cbt"
  ".agents/skills/teknovo-chief-architect"
  ".agents/skills/teknovo-chief-product-designer"
  ".agents/skills/teknovo-cloudflare-stack"
  ".agents/skills/teknovo-communication"
  ".agents/skills/teknovo-data-migration"
  ".agents/skills/teknovo-database-architect"
  ".agents/skills/teknovo-devops-engineer"
  ".agents/skills/teknovo-domain-management"
  ".agents/skills/teknovo-feature-implementation"
  ".agents/skills/teknovo-finance"
  ".agents/skills/teknovo-incident-response"
  ".agents/skills/teknovo-integration-architect"
  ".agents/skills/teknovo-landing-page"
  ".agents/skills/teknovo-observability"
  ".agents/skills/teknovo-performance-engineer"
  ".agents/skills/teknovo-ppdb"
  ".agents/skills/teknovo-prd-generator"
  ".agents/skills/teknovo-rbac-architect"
  ".agents/skills/teknovo-reporting"
  ".agents/skills/teknovo-repository-governance"
  ".agents/skills/teknovo-security-review"
  ".agents/skills/teknovo-testing-architect"
  ".agents/skills/teknovo-ui-ux"
  ".agents/skills/teknovo-ui-ux-specialist"
)

LAYER_DIRS=(
  "memory"
  "quality"
  "taste"
  "security"
  "assurance"
  "registry"
  ".agents"
  "agents"
  "ai-agent/runtime"
)

REGISTRY_FILES=(
  "memory/memory-registry.yaml"
  "quality/quality-registry.yaml"
  "taste/taste-registry.yaml"
  "security/security-registry.yaml"
  "assurance/assurance-registry.yaml"
  ".agents/registry.yaml"
)

verify_directory() {
  local rel="$1"
  local full="${REPO_ROOT}/${rel}"
  if [[ -d "${full}" ]]; then
    success "Directory OK: ${rel}"
    return 0
  else
    error "Missing directory: ${rel}"
    return 1
  fi
}

verify_skill_groups() {
  local groups=("superpowers" "gstack" "teknovo")
  for group in "${groups[@]}"; do
    local count
    count="$(find "${REPO_ROOT}/.agents/skills" -maxdepth 2 -path "*/${group}/*/SKILL.md" 2>/dev/null | wc -l)"
    if [[ "${group}" == "teknovo" ]]; then
      count="$(find "${REPO_ROOT}/.agents/skills" -maxdepth 1 -name 'teknovo-*' -type d 2>/dev/null | wc -l)"
    fi
    if [[ "${count}" -gt 0 ]]; then
      success "Skill group ${group}: ${count} skill(s)"
    else
      warn "Skill group ${group}: no skills found under expected paths"
    fi
  done
}

count_skills() {
  find "${REPO_ROOT}/.agents/skills" -name 'SKILL.md' 2>/dev/null | wc -l
}

verify_core_files() {
  local files=(
    "AGENTS.md"
    ".agents/registry.yaml"
    "ai-agent/runtime/load-memory.py"
    "scripts/refresh-memory.sh"
  )
  local ok=true
  for f in "${files[@]}"; do
    if [[ -f "${REPO_ROOT}/${f}" ]]; then
      success "Core file OK: ${f}"
    else
      error "Missing core file: ${f}"
      ok=false
    fi
  done
  [[ "${ok}" == "true" ]]
}

ensure_registry_dir() {
  mkdir -p "${REPO_ROOT}/registry"
  success "Registry directory ready: registry/"
}

main() {
  step "Install skills (Phase 5)"
  local failed=0

  for dir in "${LAYER_DIRS[@]}"; do
    verify_directory "${dir}" || failed=$((failed + 1))
  done

  ensure_registry_dir

  for reg in "${REGISTRY_FILES[@]}"; do
    if [[ -f "${REPO_ROOT}/${reg}" ]]; then
      success "Registry file OK: ${reg}"
    else
      warn "Registry file missing (may be generated in Phase 7): ${reg}"
    fi
  done

  local skill_count missing_skills=0
  skill_count="$(count_skills)"
  success "Total SKILL.md files: ${skill_count}"

  for skill_path in "${SKILL_ROOTS[@]}"; do
    if [[ ! -f "${REPO_ROOT}/${skill_path}/SKILL.md" ]]; then
      warn "Expected skill missing: ${skill_path}/SKILL.md"
      missing_skills=$((missing_skills + 1))
    fi
  done

  verify_skill_groups
  verify_core_files || failed=$((failed + 1))

  if [[ ${failed} -gt 0 ]]; then
    die "Skills verification failed (${failed} critical issues)"
  fi

  if [[ ${missing_skills} -gt 0 ]]; then
    warn "${missing_skills} optional teknovo skills not found — non-blocking"
  fi

  success "Skills and layer directories verified"
}

main "$@"
