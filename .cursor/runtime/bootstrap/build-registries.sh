#!/usr/bin/env bash
# Phase 7 — Build and verify workstation registries
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=common.sh
source "${SCRIPT_DIR}/common.sh"

trap 'on_phase_error ${LINENO}' ERR

REGISTRY_DIR="${REPO_ROOT}/registry"

generate_skill_registry() {
  local out="${REGISTRY_DIR}/skill-registry.yaml"
  if [[ -f "${out}" ]]; then
    success "skill-registry.yaml already exists"
    return 0
  fi

  info "Generating .cursor/registry/skill-registry.yaml from .cursor/skills..."
  local skill_count
  skill_count="$(find "${REPO_ROOT}/.cursor/skills" -name 'SKILL.md' 2>/dev/null | wc -l | tr -d ' ')"

  cat > "${out}" << EOF
# Teknovo AI Workstation — Skill Registry Index
# Aggregates .cursor/skills for bootstrap verification and tooling.
# Canonical skill definitions remain in .cursor/registry/skill-registry.yaml

version: "1.0"
last_updated: "$(date +%Y-%m-%d)"
generated_by: .cursor/runtime/bootstrap/build-registries.sh

source:
  canonical: .cursor/registry/skill-registry.yaml
  skills_root: .cursor/skills

summary:
  total_skills: ${skill_count}
  groups:
    - superpowers
    - gstack
    - teknovo

skills:
EOF

  find "${REPO_ROOT}/.cursor/skills" -name 'SKILL.md' 2>/dev/null | sort | while read -r skill_file; do
    local rel dir name
    rel="${skill_file#${REPO_ROOT}/}"
    dir="$(dirname "${rel}")"
    name="$(basename "${dir}")"
    echo "  ${name}:" >> "${out}"
    echo "    path: ${rel}" >> "${out}"
  done

  success "Generated ${out}"
}

generate_agent_registry() {
  local out="${REGISTRY_DIR}/agent-registry.yaml"
  if [[ -f "${out}" ]]; then
    success "agent-registry.yaml already exists"
    return 0
  fi

  info "Generating .cursor/registry/agent-registry.yaml from agents/..."
  cat > "${out}" << EOF
# Teknovo AI Workstation — Agent Registry Index
# Review agents for taste, quality, security, and assurance workflows.

version: "1.0"
last_updated: "$(date +%Y-%m-%d)"
generated_by: .cursor/runtime/bootstrap/build-registries.sh

agents_root: agents

agents:
EOF

  for agent_file in "${REPO_ROOT}"/agents/*.md; do
    [[ -f "${agent_file}" ]] || continue
    local name rel
    name="$(basename "${agent_file}" .md)"
    rel="agents/${name}.md"
    echo "  ${name}:" >> "${out}"
    echo "    path: ${rel}" >> "${out}"
  done

  success "Generated ${out}"
}

generate_mcp_registry() {
  local out="${REGISTRY_DIR}/mcp-registry.yaml"
  if [[ -f "${out}" ]]; then
    success "mcp-registry.yaml already exists"
    return 0
  fi

  info "Generating .cursor/registry/mcp-registry.yaml..."
  cat > "${out}" << 'EOF'
# Teknovo AI Workstation — MCP Server Registry
# Placeholder configs only — no credentials. Configure per mcp/*/README.md

version: "1.0"
last_updated: "2026-06-20"

defaults:
  mcp_root: mcp
  credential_policy: env_or_secret_manager  # never commit secrets

servers:
  github:
    path: mcp/github
    config_template: mcp/github/config.template.json
    status: placeholder
    required_env:
      - GITHUB_PERSONAL_ACCESS_TOKEN

  cloudflare:
    path: mcp/cloudflare
    config_template: .cursor/mcp/cloudflare/config.template.json
    status: placeholder
    required_env:
      - CLOUDFLARE_API_TOKEN
      - CLOUDFLARE_ACCOUNT_ID

  filesystem:
    path: mcp/filesystem
    config_template: mcp/filesystem/config.template.json
    status: ready
    notes: Local filesystem access — set allowed paths only

  git:
    path: mcp/git
    config_template: mcp/git/config.template.json
    status: ready
    notes: Local git operations — no remote credentials in template
EOF
  success "Generated ${out}"
}

validate_registries() {
  local files=(
    "${REGISTRY_DIR}/skill-registry.yaml"
    "${REGISTRY_DIR}/agent-registry.yaml"
    "${REGISTRY_DIR}/mcp-registry.yaml"
    "${REPO_ROOT}/.cursor/registry/legacy-registry.yaml"
    "${REPO_ROOT}/.cursor/docs/memory/memory-registry.yaml"
    "${REPO_ROOT}/.cursor/gates/quality/quality-registry.yaml"
    "${REPO_ROOT}/.cursor/gates/taste/taste-registry.yaml"
    "${REPO_ROOT}/.cursor/gates/security/security-registry.yaml"
    "${REPO_ROOT}/.cursor/gates/assurance/assurance-registry.yaml"
  )

  local failed=0
  for f in "${files[@]}"; do
    if [[ ! -f "${f}" ]]; then
      error "Missing registry: ${f}"
      failed=$((failed + 1))
      continue
    fi
    local rc=0
    validate_yaml "${f}" || rc=$?
    if [[ ${rc} -eq 0 ]]; then
      success "Valid YAML: ${f#${REPO_ROOT}/}"
    elif [[ ${rc} -eq 2 ]]; then
      warn "PyYAML not installed — skipping YAML parse for ${f#${REPO_ROOT}/}"
    else
      error "Invalid YAML: ${f#${REPO_ROOT}/}"
      failed=$((failed + 1))
    fi
  done

  [[ ${failed} -eq 0 ]] || die "Registry validation failed"
}

main() {
  step "Build registries (Phase 7)"
  mkdir -p "${REGISTRY_DIR}"
  generate_skill_registry
  generate_agent_registry
  generate_mcp_registry
  validate_registries
  success "Registry build complete"
}

main "$@"
