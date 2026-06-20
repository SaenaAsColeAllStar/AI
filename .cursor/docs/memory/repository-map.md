# Repository Map â€” Teknovo AI SuperStack

> **Auto-regeneratable**: Run `scripts/refresh-memory.sh` or `scripts/refresh-memory.ps1` to rebuild this file from live repository structure.  
> **Last generated**: 2026-06-20  
> **Source**: Live scan of `c:\Users\fajar\Downloads\AI` + `.cursor/docs/ai/repository-analysis.md`

---

## Overview

| Repository | Role | GitHub |
|------------|------|--------|
| **AI SuperStack** (this repo) | Agent skills, rules, memory, AI docs | `SaenaAsColeAllStar/AI` |
| **Teknovo-V2** (target) | Production PNPM monorepo application | `SaenaAsColeAllStar/teknovo` |

---

## 1. AI SuperStack Folder Structure

```text
AI/
â”œâ”€â”€ AGENTS.md                          # Master agent bootstrap (read first)
â”œâ”€â”€ AI_DEPLOY.md                       # Ollama + OpenCode workstation setup
â”œâ”€â”€ README.md
â”œâ”€â”€ .cursor/
â”‚   â”œâ”€â”€ AGENTS.md                      # Full agent contract
â”‚   â”œâ”€â”€ registry.yaml                  # Skill autoload + trigger registry (v1.3)
â”‚   â””â”€â”€ skills/
â”‚       â”œâ”€â”€ superpowers/               # 11 methodological skills
â”‚       â”‚   â”œâ”€â”€ brainstorming/
â”‚       â”‚   â”œâ”€â”€ dispatching-parallel-agents/
â”‚       â”‚   â”œâ”€â”€ executing-plans/
â”‚       â”‚   â”œâ”€â”€ finishing-development-branch/
â”‚       â”‚   â”œâ”€â”€ receiving-code-review/
â”‚       â”‚   â”œâ”€â”€ requesting-code-review/
â”‚       â”‚   â”œâ”€â”€ subagent-driven-development/
â”‚       â”‚   â”œâ”€â”€ systematic-debugging/
â”‚       â”‚   â”œâ”€â”€ test-driven-development/
â”‚       â”‚   â”œâ”€â”€ using-git-worktrees/
â”‚       â”‚   â”œâ”€â”€ verification-before-completion/
â”‚       â”‚   â””â”€â”€ writing-plans/
â”‚       â”œâ”€â”€ gstack/                    # 8 sprint-loop skills
â”‚       â”‚   â”œâ”€â”€ browser-testing/
â”‚       â”‚   â”œâ”€â”€ cso/
â”‚       â”‚   â”œâ”€â”€ eng-review/
â”‚       â”‚   â”œâ”€â”€ investigate/
â”‚       â”‚   â”œâ”€â”€ office-hours/
â”‚       â”‚   â”œâ”€â”€ qa/
â”‚       â”‚   â”œâ”€â”€ retro/
â”‚       â”‚   â””â”€â”€ ship/
â”‚       â””â”€â”€ teknovo-*/                 # 28 enterprise/domain/cross-cutting skills
â”œâ”€â”€ ai-agent/
â”‚   â””â”€â”€ runtime/
â”‚       â”œâ”€â”€ load-memory.py             # Memory loader module + CLI
â”‚       â””â”€â”€ refresh_helpers.py         # Refresh script helpers
â”œâ”€â”€ docs/
â”‚   â””â”€â”€ ai/
â”‚       â”œâ”€â”€ repository-analysis.md
â”‚       â”œâ”€â”€ AI_ARCHITECTURE.md
â”‚       â”œâ”€â”€ AI_SKILLS_CATALOG.md
â”‚       â”œâ”€â”€ AI_WORKFLOW.md
â”‚       â”œâ”€â”€ AI_AGENT_LIFECYCLE.md
â”‚       â””â”€â”€ AI_ROADMAP.md
â”œâ”€â”€ .cursor/docs/memory/                            # Long-term agent memory artifacts
â”‚   â”œâ”€â”€ memory-registry.yaml
â”‚   â”œâ”€â”€ project-context.md
â”‚   â”œâ”€â”€ repository-map.md              # This file
â”‚   â”œâ”€â”€ product-context.md
â”‚   â”œâ”€â”€ domain-knowledge.md
â”‚   â”œâ”€â”€ architecture-decisions.md
â”‚   â”œâ”€â”€ coding-standards.md
â”‚   â”œâ”€â”€ ui-ux-rules.md
â”‚   â”œâ”€â”€ lessons-learned.md
â”‚   â””â”€â”€ sessions/
â”‚       â””â”€â”€ README.md
â””â”€â”€ scripts/
    â”œâ”€â”€ refresh-memory.sh
    â””â”€â”€ refresh-memory.ps1
```

---

## 2. Package Structure (This Repo)

This repository has **no application packages** (no `package.json`, no PNPM workspace). It is configuration-only.

| Artifact Type | Location | Count |
|---------------|----------|-------|
| Skill definitions | `.cursor/skills/**/SKILL.md` | 47 |
| Agent contract | `.cursor/docs/AGENTS.md` | 1 |
| Skill registry | `.cursor/registry/legacy-registry.yaml` | 1 |
| AI documentation | `.cursor/docs/ai/*.md` | 6 |
| Memory artifacts | `.cursor/docs/memory/*.md` | 9+ |
| Runtime scripts | `.cursor/runtime/*.py` | 2 |
| Refresh scripts | `scripts/refresh-memory.*` | 2 |

---

## 3. Target Application Structure (Teknovo-V2)

> **Source**: `.cursor/docs/ai/repository-analysis.md`, `.cursor/docs/AGENTS.md`, `teknovo-repository-governance` skill  
> Not present in this repo â€” documented for agent awareness when working on Teknovo-V2.

```text
Teknovo-V2/
â”œâ”€â”€ .cursor/                           # Agent config (symlink/copy from ai repo)
â”œâ”€â”€ apps/
â”‚   â””â”€â”€ portal/                        # Nuxt.js web application
â”‚       â””â”€â”€ src/
â”‚           â”œâ”€â”€ modules/               # Domain backend modules
â”‚           â””â”€â”€ pages/                 # Nuxt frontend routes
â”œâ”€â”€ packages/
â”‚   â””â”€â”€ ui/                            # Shared UI components ONLY
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ adr/                           # Architecture Decision Records
â”‚   â”œâ”€â”€ ai/                            # AI agent contract
â”‚   â”œâ”€â”€ architecture/                  # System topology, folder contracts
â”‚   â”œâ”€â”€ backend/                       # Module, service, repository contracts
â”‚   â”œâ”€â”€ database/                      # Schema, ERDs, data dictionaries
â”‚   â”œâ”€â”€ domain/                        # Domain-specific PRDs
â”‚   â”œâ”€â”€ infrastructure/                # Cloudflare, CI/CD, deployment
â”‚   â”œâ”€â”€ prd/                           # Product requirements
â”‚   â”œâ”€â”€ reviews/                       # Review templates
â”‚   â”œâ”€â”€ .cursor/gates/security/                      # RBAC matrix
â”‚   â””â”€â”€ standards/                     # Database, API, RBAC, coding, testing
â”œâ”€â”€ drizzle/                           # Migrations
â”œâ”€â”€ pnpm-workspace.yaml
â””â”€â”€ package.json
```

### Backend Module Layout (Per Domain)

```text
apps/portal/src/modules/<domain>/
â”œâ”€â”€ <domain>.module.ts
â”œâ”€â”€ <domain>.controller.ts
â”œâ”€â”€ <domain>.service.ts
â”œâ”€â”€ <domain>.repository.ts             # PRIVATE â€” not exported
â”œâ”€â”€ <domain>.events.ts
â”œâ”€â”€ <domain>.dto.ts
â”œâ”€â”€ <domain>.mapper.ts
â”œâ”€â”€ <domain>.policy.ts
â”œâ”€â”€ schemas/<domain>.schema.ts
â””â”€â”€ __tests__/
```

---

## 4. Shared Package Structure (Teknovo-V2)

```text
packages/ui/
â””â”€â”€ src/
    â””â”€â”€ components/
        â””â”€â”€ <domain>/                  # Shared UI only â€” no app-local components
```

**Rules**:
- UI components live in `packages/ui/` â€” never directly in `apps/`
- Shared utilities in `packages/shared-utils/` (if needed) â€” never dump files
- Applications in `apps/` â€” never in repository root

---

## 5. Skill Categories Map

| Category | Path | Count |
|----------|------|-------|
| Superpowers | `.cursor/skills/superpowers/` | 11 |
| GStack | `.cursor/skills/gstack/` | 8 |
| Teknovo Enterprise | `.cursor/skills/teknovo-{architect,backend,...}/` | 13 |
| Teknovo Domain | `.cursor/skills/teknovo-{finance,ppdb,cbt,...}/` | 6 |
| Teknovo Cross-cutting | `.cursor/skills/teknovo-{observability,...}/` | 5 |
| **Total** | | **47** |

### Autoload Skills (18 â€” loaded every session)

`superpowers-brainstorming`, `superpowers-writing-plans`, `superpowers-executing-plans`, `superpowers-verification-before-completion`, `superpowers-test-driven-development`, `gstack-eng-review`, `gstack-qa`, `teknovo-rbac-architect`, `teknovo-database-architect`, `teknovo-feature-implementation`, `teknovo-repository-governance`, `teknovo-testing-architect`, `teknovo-api-architect`, `teknovo-security-review`, `teknovo-ui-ux`, `teknovo-backend-development`, `teknovo-domain-management`, `teknovo-landing-page`

---

## 6. Subdomain Architecture (Teknovo-V2 Production)

| Subdomain | Purpose | Port |
|-----------|---------|------|
| `portal.domain.sch.id` | Public landing page, admissions, school overview | 3000 |
| `ppdb.domain.sch.id` | Student admission â€” applicants, registration | 3000 |
| `erp.domain.sch.id` | Core ERP â€” academics, classes, grading, attendance | 3000 |
| `cbt.domain.sch.id` | Computer-based testing â€” exams, question banks | 3000 |
| `finance.domain.sch.id` | Billing plans, student payments, cash books | 3000 |
| `wa.domain.sch.id` | WhatsApp notifications â€” templates, campaigns | 4001 |
| `api.domain.sch.id` | Centralized REST API under `/api/v1` | 4000 |

---

## 7. Database Schemas (Teknovo-V2)

`auth` Â· `student` Â· `academic` Â· `finance` Â· `cbt` Â· `wa` Â· `ppdb` Â· `audit` Â· `master` Â· `system`

---

## 8. Deployment Model

The AI SuperStack deploys into Teknovo-V2 via:

1. **Copy**: `cp -r ai/.agents Teknovo-V2/.agents && cp ai/AGENTS.md Teknovo-V2/`
2. **Symlink**: `ln -s ../ai/.agents Teknovo-V2/.agents`
3. **Git submodule**: Add ai repo as submodule at `.cursor/`

---

## Regeneration Notice

This file is **automatically regeneratable**. The refresh script:

1. Scans the live repository tree (excluding `.git`, `node_modules`)
2. Rebuilds folder structure sections 1â€“2
3. Preserves Teknovo-V2 reference sections 3â€“7 from canonical sources
4. Updates the `Last generated` timestamp

Run: `python .cursor/runtime/refresh_helpers.py --repo-map-only`
