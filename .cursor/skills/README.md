# Teknovo Native Cursor Skills

Project-scoped Agent Skills for Cursor IDE. **Canonical instructions live here** at `.cursor/skills/**/SKILL.md`.

**Full index:** [INDEX.md](INDEX.md) — skill name, path, layer, triggers, bundle membership.

**Cursor Rules:** Persistent session gates in [`.cursor/rules/`](../rules/) — product, UI/UX, engineering, testing, DevOps, GitHub, Cloudflare.

---

## Discovery (for Cursor Agent)

1. Read this file or **`INDEX.md`** for the complete skill catalog
2. Resolve bundles via `.cursor/registry/skill-registry.yaml`
3. CLI: `python .cursor/runtime/load-skills.py --autoload` or `--bundle pre-implementation`

---

## Three Pillars

| Pillar | Skill | Path |
|--------|-------|------|
| 1 — Product Design | teknovo-chief-product-designer → **teknovo-ux-architecture** | [teknovo-ux-architecture/SKILL.md](teknovo-ux-architecture/SKILL.md) |
| 2 — Chief Architect | teknovo-chief-architect | [teknovo-chief-architect/SKILL.md](teknovo-chief-architect/SKILL.md) |
| 3 — DevOps Engineer | teknovo-devops-engineer | [teknovo-devops-engineer/SKILL.md](teknovo-devops-engineer/SKILL.md) |

---

## UI/UX Skills

| Skill | Use when |
|-------|----------|
| [teknovo-design-system](teknovo-design-system/SKILL.md) | Tokens, icons, components, visual taste |
| [teknovo-ux-architecture](teknovo-ux-architecture/SKILL.md) | Pre-code IA, product design analysis, UX reviews |
| [teknovo-ui-ux](teknovo-ui-ux/SKILL.md) | Build/review ERP pages, tables, forms, 5 states |
| [teknovo-landing-page](teknovo-landing-page/SKILL.md) | Public school marketing / PPDB landing |

Load order: `ux-architecture` → `chief-architect` → `ui-ux` + `design-system`

---

## Security Skills

| Skill | Use when |
|-------|----------|
| [teknovo-security](teknovo-security/SKILL.md) | Principles, gates, workflow, hard rules |
| [teknovo-security-domain](teknovo-security-domain/SKILL.md) | RBAC, API, DB tenancy, audit |
| [teknovo-security-infra](teknovo-security-infra/SKILL.md) | Cloudflare, R2, tunnel, MCP |
| [teknovo-security-review](teknovo-security-review/SKILL.md) | Formal audit, APPROVE/BLOCK verdict |

---

## Architecture & Engineering

| Skill | Path |
|-------|------|
| teknovo-database-architect | [teknovo-database-architect/SKILL.md](teknovo-database-architect/SKILL.md) |
| teknovo-api-architect | [teknovo-api-architect/SKILL.md](teknovo-api-architect/SKILL.md) |
| teknovo-rbac-architect | [teknovo-rbac-architect/SKILL.md](teknovo-rbac-architect/SKILL.md) |
| teknovo-repository-governance | [teknovo-repository-governance/SKILL.md](teknovo-repository-governance/SKILL.md) |
| teknovo-backend-development | [teknovo-backend-development/SKILL.md](teknovo-backend-development/SKILL.md) |
| teknovo-feature-implementation | [teknovo-feature-implementation/SKILL.md](teknovo-feature-implementation/SKILL.md) |
| teknovo-domain-management | [teknovo-domain-management/SKILL.md](teknovo-domain-management/SKILL.md) |
| teknovo-prd-generator | [teknovo-prd-generator/SKILL.md](teknovo-prd-generator/SKILL.md) |
| teknovo-testing-architect | [teknovo-testing-architect/SKILL.md](teknovo-testing-architect/SKILL.md) |

---

## DevOps & Infra

| Skill | Path |
|-------|------|
| teknovo-devops-engineer | [teknovo-devops-engineer/SKILL.md](teknovo-devops-engineer/SKILL.md) |
| teknovo-cloudflare-stack | [teknovo-cloudflare-stack/SKILL.md](teknovo-cloudflare-stack/SKILL.md) |
| teknovo-mcp-stack | [teknovo-mcp-stack/SKILL.md](teknovo-mcp-stack/SKILL.md) |
| teknovo-observability | [teknovo-observability/SKILL.md](teknovo-observability/SKILL.md) |
| teknovo-incident-response | [teknovo-incident-response/SKILL.md](teknovo-incident-response/SKILL.md) |
| teknovo-performance-engineer | [teknovo-performance-engineer/SKILL.md](teknovo-performance-engineer/SKILL.md) |

---

## Domain Modules

| Skill | Path |
|-------|------|
| teknovo-finance | [teknovo-finance/SKILL.md](teknovo-finance/SKILL.md) |
| teknovo-ppdb | [teknovo-ppdb/SKILL.md](teknovo-ppdb/SKILL.md) |
| teknovo-cbt | [teknovo-cbt/SKILL.md](teknovo-cbt/SKILL.md) |
| teknovo-communication | [teknovo-communication/SKILL.md](teknovo-communication/SKILL.md) |
| teknovo-academic | [teknovo-academic/SKILL.md](teknovo-academic/SKILL.md) |
| teknovo-reporting | [teknovo-reporting/SKILL.md](teknovo-reporting/SKILL.md) |
| teknovo-data-migration | [teknovo-data-migration/SKILL.md](teknovo-data-migration/SKILL.md) |
| teknovo-integration-architect | [teknovo-integration-architect/SKILL.md](teknovo-integration-architect/SKILL.md) |

---

## GStack

| Skill | Path |
|-------|------|
| gstack-office-hours | [gstack/office-hours/SKILL.md](gstack/office-hours/SKILL.md) |
| gstack-eng-review | [gstack/eng-review/SKILL.md](gstack/eng-review/SKILL.md) |
| gstack-qa | [gstack/qa/SKILL.md](gstack/qa/SKILL.md) |
| gstack-browser-testing | [gstack/browser-testing/SKILL.md](gstack/browser-testing/SKILL.md) |
| gstack-ship | [gstack/ship/SKILL.md](gstack/ship/SKILL.md) |
| gstack-retro | [gstack/retro/SKILL.md](gstack/retro/SKILL.md) |
| gstack-cso | [gstack/cso/SKILL.md](gstack/cso/SKILL.md) |
| gstack-investigate | [gstack/investigate/SKILL.md](gstack/investigate/SKILL.md) |

---

## Superpowers

| Skill | Path |
|-------|------|
| superpowers-brainstorming | [superpowers/brainstorming/SKILL.md](superpowers/brainstorming/SKILL.md) |
| superpowers-writing-plans | [superpowers/writing-plans/SKILL.md](superpowers/writing-plans/SKILL.md) |
| superpowers-executing-plans | [superpowers/executing-plans/SKILL.md](superpowers/executing-plans/SKILL.md) |
| superpowers-systematic-debugging | [superpowers/systematic-debugging/SKILL.md](superpowers/systematic-debugging/SKILL.md) |
| superpowers-verification-before-completion | [superpowers/verification-before-completion/SKILL.md](superpowers/verification-before-completion/SKILL.md) |
| superpowers-test-driven-development | [superpowers/test-driven-development/SKILL.md](superpowers/test-driven-development/SKILL.md) |
| superpowers-requesting-code-review | [superpowers/requesting-code-review/SKILL.md](superpowers/requesting-code-review/SKILL.md) |
| superpowers-receiving-code-review | [superpowers/receiving-code-review/SKILL.md](superpowers/receiving-code-review/SKILL.md) |
| superpowers-subagent-driven-development | [superpowers/subagent-driven-development/SKILL.md](superpowers/subagent-driven-development/SKILL.md) |
| superpowers-dispatching-parallel-agents | [superpowers/dispatching-parallel-agents/SKILL.md](superpowers/dispatching-parallel-agents/SKILL.md) |
| superpowers-using-git-worktrees | [superpowers/using-git-worktrees/SKILL.md](superpowers/using-git-worktrees/SKILL.md) |
| superpowers-finishing-development-branch | [superpowers/finishing-development-branch/SKILL.md](superpowers/finishing-development-branch/SKILL.md) |

---

## Auto Orchestrator

Declarative intent → chain routing:

| Artifact | Path |
|----------|------|
| Skill | [teknovo-auto-orchestrator/SKILL.md](teknovo-auto-orchestrator/SKILL.md) |
| Intent routing | [teknovo-auto-orchestrator/intent-routing.yaml](teknovo-auto-orchestrator/intent-routing.yaml) |
| Chain map | [teknovo-auto-orchestrator/chain-map.yaml](teknovo-auto-orchestrator/chain-map.yaml) |
| Execution policy | [teknovo-auto-orchestrator/execution-policy.yaml](teknovo-auto-orchestrator/execution-policy.yaml) |

---

## Consolidated Registry IDs

| Registry ID | Canonical skill |
|-------------|-----------------|
| teknovo-chief-product-designer | teknovo-ux-architecture |
| teknovo-ui-ux-specialist | teknovo-ux-architecture |

---

Registry: `.cursor/registry/skill-registry.yaml` · Sub-registry: `.cursor/gates/security/security-registry.yaml`
