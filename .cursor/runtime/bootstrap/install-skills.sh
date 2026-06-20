#!/usr/bin/env bash
# Phase 5 â€” Verify and register AI skills, memory, quality, taste, security, assurance layers
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

trap 'on_phase_error ${LINENO}' ERR

SKILL_ROOTS=(
  ".cursor/skills/teknovo-academic"
  ".cursor/skills/teknovo-api-architect"
  ".cursor/skills/teknovo-backend-development"
  ".cursor/skills/teknovo-cbt"
  ".cursor/skills/teknovo-chief-architect"
  ".cursor/skills/teknovo-ux-architecture"
  ".cursor/skills/teknovo-cloudflare-stack"
  ".cursor/skills/teknovo-communication"
  ".cursor/skills/teknovo-data-migration"
  ".cursor/skills/teknovo-database-architect"
  ".cursor/skills/teknovo-devops-engineer"
  ".cursor/skills/teknovo-domain-management"
  ".cursor/skills/teknovo-feature-implementation"
  ".cursor/skills/teknovo-finance"
  ".cursor/skills/teknovo-incident-response"
  ".cursor/skills/teknovo-integration-architect"
  ".cursor/skills/teknovo-landing-page"
  ".cursor/skills/teknovo-observability"
  ".cursor/skills/teknovo-performance-engineer"
  ".cursor/skills/teknovo-ppdb"
  ".cursor/skills/teknovo-prd-generator"
  ".cursor/skills/teknovo-rbac-architect"
  ".cursor/skills/teknovo-reporting"
  ".cursor/skills/teknovo-repository-governance"
  ".cursor/skills/teknovo-security-review"
  ".cursor/skills/teknovo-testing-architect"
  ".cursor/skills/teknovo-ui-ux"
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
  ".cursor/docs/memory/memory-registry.yaml"
  ".cursor/gates/quality/quality-registry.yaml"
  ".cursor/gates/taste/taste-registry.yaml"
  ".cursor/gates/security/security-registry.yaml"
  ".cursor/gates/assurance/assurance-registry.yaml"
  ".cursor/registry/legacy-registry.yaml"
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
    count="$(find "${REPO_ROOT}/.cursor/skills" -maxdepth 2 -path "*/${group}/*/SKILL.md" 2>/dev/null | wc -l)"
    if [[ "${group}" == "teknovo" ]]; then
      count="$(find "${REPO_ROOT}/.cursor/skills" -maxdepth 1 -name 'teknovo-*' -type d 2>/dev/null | wc -l)"
    fi
    if [[ "${count}" -gt 0 ]]; then
      success "Skill group ${group}: ${count} skill(s)"
    else
      warn "Skill group ${group}: no skills found under expected paths"
    fi
  done
}

count_skills() {
  find "${REPO_ROOT}/.cursor/skills" -name 'SKILL.md' 2>/dev/null | wc -l
}

verify_core_files() {
  local files=(
    "AGENTS.md"
    ".cursor/registry/legacy-registry.yaml"
    ".cursor/runtime/load-memory.py"
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
  success "Registry directory ready: .cursor/registry/"
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
    warn "${missing_skills} optional teknovo skills not found â€” non-blocking"
  fi

  success "Skills and layer directories verified"
}

main "$@"
