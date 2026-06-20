# Repository Map — Teknovo AI SuperStack

> **Auto-regeneratable**: Run `scripts/refresh-memory.sh` or `scripts/refresh-memory.ps1` to rebuild this file from live repository structure.  
> **Last generated**: 2026-06-20  
> **Source**: Live scan of `c:\Users\fajar\Downloads\AI` + `docs/ai/repository-analysis.md`

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
├── AGENTS.md                          # Master agent bootstrap (read first)
├── AI_DEPLOY.md                       # Ollama + OpenCode workstation setup
├── README.md
├── .agents/
│   ├── AGENTS.md                      # Full agent contract
│   ├── registry.yaml                  # Skill autoload + trigger registry (v1.3)
│   └── skills/
│       ├── superpowers/               # 11 methodological skills
│       │   ├── brainstorming/
│       │   ├── dispatching-parallel-agents/
│       │   ├── executing-plans/
│       │   ├── finishing-development-branch/
│       │   ├── receiving-code-review/
│       │   ├── requesting-code-review/
│       │   ├── subagent-driven-development/
│       │   ├── systematic-debugging/
│       │   ├── test-driven-development/
│       │   ├── using-git-worktrees/
│       │   ├── verification-before-completion/
│       │   └── writing-plans/
│       ├── gstack/                    # 8 sprint-loop skills
│       │   ├── browser-testing/
│       │   ├── cso/
│       │   ├── eng-review/
│       │   ├── investigate/
│       │   ├── office-hours/
│       │   ├── qa/
│       │   ├── retro/
│       │   └── ship/
│       └── teknovo-*/                 # 28 enterprise/domain/cross-cutting skills
├── ai-agent/
│   └── runtime/
│       ├── load-memory.py             # Memory loader module + CLI
│       └── refresh_helpers.py         # Refresh script helpers
├── docs/
│   └── ai/
│       ├── repository-analysis.md
│       ├── AI_ARCHITECTURE.md
│       ├── AI_SKILLS_CATALOG.md
│       ├── AI_WORKFLOW.md
│       ├── AI_AGENT_LIFECYCLE.md
│       └── AI_ROADMAP.md
├── memory/                            # Long-term agent memory artifacts
│   ├── memory-registry.yaml
│   ├── project-context.md
│   ├── repository-map.md              # This file
│   ├── product-context.md
│   ├── domain-knowledge.md
│   ├── architecture-decisions.md
│   ├── coding-standards.md
│   ├── ui-ux-rules.md
│   ├── lessons-learned.md
│   └── sessions/
│       └── README.md
└── scripts/
    ├── refresh-memory.sh
    └── refresh-memory.ps1
```

---

## 2. Package Structure (This Repo)

This repository has **no application packages** (no `package.json`, no PNPM workspace). It is configuration-only.

| Artifact Type | Location | Count |
|---------------|----------|-------|
| Skill definitions | `.agents/skills/**/SKILL.md` | 47 |
| Agent contract | `.agents/AGENTS.md` | 1 |
| Skill registry | `.agents/registry.yaml` | 1 |
| AI documentation | `docs/ai/*.md` | 6 |
| Memory artifacts | `memory/*.md` | 9+ |
| Runtime scripts | `ai-agent/runtime/*.py` | 2 |
| Refresh scripts | `scripts/refresh-memory.*` | 2 |

---

## 3. Target Application Structure (Teknovo-V2)

> **Source**: `docs/ai/repository-analysis.md`, `.agents/AGENTS.md`, `teknovo-repository-governance` skill  
> Not present in this repo — documented for agent awareness when working on Teknovo-V2.

```text
Teknovo-V2/
├── .agents/                           # Agent config (symlink/copy from ai repo)
├── apps/
│   └── portal/                        # Nuxt.js web application
│       └── src/
│           ├── modules/               # Domain backend modules
│           └── pages/                 # Nuxt frontend routes
├── packages/
│   └── ui/                            # Shared UI components ONLY
├── docs/
│   ├── adr/                           # Architecture Decision Records
│   ├── ai/                            # AI agent contract
│   ├── architecture/                  # System topology, folder contracts
│   ├── backend/                       # Module, service, repository contracts
│   ├── database/                      # Schema, ERDs, data dictionaries
│   ├── domain/                        # Domain-specific PRDs
│   ├── infrastructure/                # Cloudflare, CI/CD, deployment
│   ├── prd/                           # Product requirements
│   ├── reviews/                       # Review templates
│   ├── security/                      # RBAC matrix
│   └── standards/                     # Database, API, RBAC, coding, testing
├── drizzle/                           # Migrations
├── pnpm-workspace.yaml
└── package.json
```

### Backend Module Layout (Per Domain)

```text
apps/portal/src/modules/<domain>/
├── <domain>.module.ts
├── <domain>.controller.ts
├── <domain>.service.ts
├── <domain>.repository.ts             # PRIVATE — not exported
├── <domain>.events.ts
├── <domain>.dto.ts
├── <domain>.mapper.ts
├── <domain>.policy.ts
├── schemas/<domain>.schema.ts
└── __tests__/
```

---

## 4. Shared Package Structure (Teknovo-V2)

```text
packages/ui/
└── src/
    └── components/
        └── <domain>/                  # Shared UI only — no app-local components
```

**Rules**:
- UI components live in `packages/ui/` — never directly in `apps/`
- Shared utilities in `packages/shared-utils/` (if needed) — never dump files
- Applications in `apps/` — never in repository root

---

## 5. Skill Categories Map

| Category | Path | Count |
|----------|------|-------|
| Superpowers | `.agents/skills/superpowers/` | 11 |
| GStack | `.agents/skills/gstack/` | 8 |
| Teknovo Enterprise | `.agents/skills/teknovo-{architect,backend,...}/` | 13 |
| Teknovo Domain | `.agents/skills/teknovo-{finance,ppdb,cbt,...}/` | 6 |
| Teknovo Cross-cutting | `.agents/skills/teknovo-{observability,...}/` | 5 |
| **Total** | | **47** |

### Autoload Skills (18 — loaded every session)

`superpowers-brainstorming`, `superpowers-writing-plans`, `superpowers-executing-plans`, `superpowers-verification-before-completion`, `superpowers-test-driven-development`, `gstack-eng-review`, `gstack-qa`, `teknovo-rbac-architect`, `teknovo-database-architect`, `teknovo-feature-implementation`, `teknovo-repository-governance`, `teknovo-testing-architect`, `teknovo-api-architect`, `teknovo-security-review`, `teknovo-ui-ux`, `teknovo-backend-development`, `teknovo-domain-management`, `teknovo-landing-page`

---

## 6. Subdomain Architecture (Teknovo-V2 Production)

| Subdomain | Purpose | Port |
|-----------|---------|------|
| `portal.domain.sch.id` | Public landing page, admissions, school overview | 3000 |
| `ppdb.domain.sch.id` | Student admission — applicants, registration | 3000 |
| `erp.domain.sch.id` | Core ERP — academics, classes, grading, attendance | 3000 |
| `cbt.domain.sch.id` | Computer-based testing — exams, question banks | 3000 |
| `finance.domain.sch.id` | Billing plans, student payments, cash books | 3000 |
| `wa.domain.sch.id` | WhatsApp notifications — templates, campaigns | 4001 |
| `api.domain.sch.id` | Centralized REST API under `/api/v1` | 4000 |

---

## 7. Database Schemas (Teknovo-V2)

`auth` · `student` · `academic` · `finance` · `cbt` · `wa` · `ppdb` · `audit` · `master` · `system`

---

## 8. Deployment Model

The AI SuperStack deploys into Teknovo-V2 via:

1. **Copy**: `cp -r ai/.agents Teknovo-V2/.agents && cp ai/AGENTS.md Teknovo-V2/`
2. **Symlink**: `ln -s ../ai/.agents Teknovo-V2/.agents`
3. **Git submodule**: Add ai repo as submodule at `.agents/`

---

## Regeneration Notice

This file is **automatically regeneratable**. The refresh script:

1. Scans the live repository tree (excluding `.git`, `node_modules`)
2. Rebuilds folder structure sections 1–2
3. Preserves Teknovo-V2 reference sections 3–7 from canonical sources
4. Updates the `Last generated` timestamp

Run: `python ai-agent/runtime/refresh_helpers.py --repo-map-only`
