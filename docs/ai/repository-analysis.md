# Repository Analysis — Teknovo AI SuperStack

This document presents findings from the **Repository Discovery Phase** for the Teknovo AI SuperStack workstation and its target codebase (Teknovo V2).

**Last updated**: 2026-06-20

---

## 1. Repository Map

### 1.1 AI SuperStack Repository (`/home/coleallstar/Public/ai`)

This repository is the **agent workstation configuration** — skills, registry, master agent rules, and AI documentation. It is deployed into Teknovo V2 via copy or symlink.

```text
ai/
├── AGENTS.md                          # Master agent bootstrap (read first)
├── AI_DEPLOY.md                       # Ollama + OpenCode workstation setup
├── README.md
├── .agents/
│   ├── AGENTS.md                      # Full agent contract
│   ├── registry.yaml                  # Skill autoload + trigger registry
│   └── skills/
│       ├── superpowers/               # 11 methodological skills
│       ├── gstack/                    # 6 sprint-loop skills
│       └── teknovo-*/                 # 13 enterprise domain skills
└── docs/
    └── ai/
        ├── repository-analysis.md     # This file
        ├── AI_ARCHITECTURE.md
        ├── AI_SKILLS_CATALOG.md
        ├── AI_WORKFLOW.md
        ├── AI_AGENT_LIFECYCLE.md
        └── AI_ROADMAP.md
```

### 1.2 Target Codebase (`/home/coleallstar/Public/Teknovo-V2`)

PNPM monorepo containing the production application:

```text
Teknovo-V2/
├── .agents/                           # Agent config (from ai repo)
├── apps/
│   └── portal/                        # Nuxt.js web application
├── packages/
│   └── ui/                            # Shared UI components
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
├── pnpm-workspace.yaml
└── package.json
```

---

## 2. Domain Map

Teknovo is structured around subdomain-driven functional modules:

| Subdomain | Purpose |
|-----------|---------|
| `portal.domain.sch.id` | Public landing page, admissions, school overview, news |
| `ppdb.domain.sch.id` | Student admission — applicants, registration, payments |
| `erp.domain.sch.id` | Core school management — academics, classes, grading, attendance |
| `cbt.domain.sch.id` | Computer-based testing — exams, question banks, grading |
| `finance.domain.sch.id` | Billing plans, student payments, cash books |
| `wa.domain.sch.id` | WhatsApp notifications — templates, campaigns, logs |
| `api.domain.sch.id` | Centralized REST API under `/api/v1` |

### Database Schemas

`auth` · `student` · `academic` · `finance` · `cbt` · `wa` · `ppdb` · `audit` · `master` · `system`

---

## 3. Architecture Map

### Backend Layering

```text
Request → Controller → Service → Repository → Database
```

| Layer | Responsibility | Forbidden |
|-------|----------------|-----------|
| Controller | Zod validation, route handling, response envelope | Direct DB/repository access |
| Service | Business logic, transactions, event publishing | Raw SQL/ORM queries |
| Repository | Drizzle CRUD, filtering, pagination | Cross-module export |

### Frontend Layout

```text
PageShell → PageHeader → PageContent → PageFooter
```

### Event System

- **Engine**: BullMQ + Redis
- **Naming**: `domain.entity.action` (events), `domain.action` (jobs)
- **Requirements**: Idempotency, 3 retries, DLQ, correlation/trace IDs

### Database Standards

- **Engine**: PostgreSQL 17+
- **IDs**: UUID v7 (auto-increment forbidden)
- **Audit**: `id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`
- **Deletes**: Soft only via `deleted_at`

---

## 4. Documentation Inventory

### Teknovo-V2 Source of Truth

| Category | Key Documents |
|----------|---------------|
| **ADR** | `adr/ADR-001-monorepo.md`, `adr/ADR-011-subdomain-architecture.md`, `adr/package-ownership.md` |
| **Architecture** | `architecture/system-overview.md`, `folder-contract.md`, `domain-context-map.md`, `domain-event-catalog.md`, `data-ownership-matrix.md` |
| **Database** | `database/database-overview.md`, `schema-contract.md`, `drizzle-contract.md`, domain ERDs and data dictionaries |
| **Standards** | `standards/database/database-standard.md`, `standards/api/api-contract.md`, `standards/rbac/rbac-standard.md`, `standards/coding/coding-standard.md`, `standards/testing/testing-standard.md` |
| **PRD** | `prd/master/master-prd.md`, `prd/ui-ux/landing-page-*.md` |
| **Security** | `security/rbac-matrix.md` |
| **Backend** | `backend/module-contract.md`, `service-contract.md`, `repository-contract.md`, `queue-contract.md` |
| **Infrastructure** | `infrastructure/cloudflare-setup-guide.md`, `deployment-standard.md`, `cicd-standard.md` |
| **Reviews** | `reviews/backend-review-template.md`, `database-review-template.md`, `security-review-template.md` |
| **AI** | `ai/ai-agent-contract.md`, `ai/cursor-rules.md` |

### AI SuperStack Documentation

| Document | Purpose |
|----------|---------|
| `AGENTS.md` | Master agent bootstrap and 12-step workflow |
| `.agents/AGENTS.md` | Full agent contract with doc paths |
| `.agents/registry.yaml` | Skill autoload and trigger registry |
| `docs/ai/AI_ARCHITECTURE.md` | System block diagram |
| `docs/ai/AI_SKILLS_CATALOG.md` | Complete skill index |
| `docs/ai/AI_WORKFLOW.md` | 12-phase workstation loop |
| `docs/ai/AI_AGENT_LIFECYCLE.md` | Agent state machine |
| `docs/ai/AI_ROADMAP.md` | Milestone roadmap |
| `AI_DEPLOY.md` | Runtime setup (Ollama, OpenCode, Qwen) |

---

## 5. Existing Skills Inventory

### Superpowers (11 skills) — `.agents/skills/superpowers/`

| Skill | Purpose |
|-------|---------|
| brainstorming | Requirements analysis before any creative work |
| writing-plans | Detailed implementation plans before coding |
| executing-plans | Systematic plan execution with checkpoints |
| systematic-debugging | 4-phase evidence-based debugging |
| verification-before-completion | Pre-completion quality gates |
| requesting-code-review | PR formatting and review requests |
| receiving-code-review | Processing review feedback |
| test-driven-development | Red-Green-Refactor with coverage targets |
| subagent-driven-development | Multi-agent orchestration |
| using-git-worktrees | Isolated parallel branch workspaces |
| finishing-development-branch | Merge readiness and cleanup |

### GStack (6 skills) — `.agents/skills/gstack/`

| Skill | Purpose |
|-------|---------|
| office-hours | Interactive consultation and blocker resolution |
| eng-review | Senior architecture and layering review |
| qa | Functional verification and boundary checks |
| browser-testing | Playwright E2E automation |
| ship | Release, migration, and merge checklists |
| retro | Post-sprint retrospective |

### Teknovo Enterprise (13 skills) — `.agents/skills/teknovo-*/`

| Skill | Purpose |
|-------|---------|
| teknovo-rbac-architect | Role-based access across API and UI |
| teknovo-cloudflare-stack | Tunnels, DNS, R2, edge security |
| teknovo-database-architect | PostgreSQL 17, Drizzle, UUID v7, migrations |
| teknovo-prd-generator | Master and module PRD generation |
| teknovo-feature-implementation | End-to-end layer-by-layer delivery |
| teknovo-repository-governance | Monorepo structure and naming |
| teknovo-testing-architect | Vitest/Playwright coverage matrices |
| teknovo-api-architect | REST contracts, Zod, OpenAPI |
| teknovo-security-review | JWT, CORS, rate limits, OWASP |
| teknovo-ui-ux | Design system, PageShell, 5 page states |
| teknovo-backend-development | Controllers, services, repositories, queues |
| teknovo-domain-management | DDD boundaries, domain events |
| teknovo-landing-page | Marketing site, SEO, performance |

**Total: 30 skills**

---

## 6. Missing Skills Inventory

### Completed (this SuperStack build)

All planned Superpowers, GStack, and Teknovo Enterprise skills are implemented.

### Future Enhancements (Roadmap)

| Skill | Rationale | Milestone |
|-------|-----------|-----------|
| teknovo-finance-module | Specialized billing/payment workflows | M2 |
| teknovo-ppdb-module | Admission-specific domain rules | M2 |
| teknovo-cbt-module | Exam engine and proctoring rules | M3 |
| teknovo-wa-module | WhatsApp campaign and template rules | M3 |
| teknovo-reporting | Report generation and export standards | M3 |
| superpowers-dispatching-parallel-agents | Concurrent subagent dispatch (from Superpowers upstream) | M2 |
| gstack-cso | Chief Security Officer OWASP/STRIDE audit (from GStack upstream) | M4 |
| gstack-investigate | Root cause investigation methodology | M4 |

### Integration Gaps

| Gap | Resolution |
|-----|------------|
| Skills not yet symlinked into Teknovo-V2 | Copy or symlink `.agents/` from ai repo into Teknovo-V2 |
| No automated skill trigger detection | Manual trigger matching via registry.yaml; future: intent classifier |
| Playwright container not configured | Milestone 2: Automated Testing Rig |
| Ollama/Qwen not wired to registry autoload | Milestone 3: Local Dev Server integration |
