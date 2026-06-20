# Repository Analysis â€” Teknovo AI SuperStack

This document presents findings from the **Repository Discovery Phase** for the Teknovo AI SuperStack workstation and its target codebase (Teknovo V2).

**Last updated**: 2026-06-20

---

## 1. Repository Map

### 1.1 AI SuperStack Repository (`/home/coleallstar/Public/ai`)

This repository is the **agent workstation configuration** â€” skills, registry, master agent rules, and AI documentation. It is deployed into Teknovo V2 via copy or symlink.

```text
ai/
â”œâ”€â”€ AGENTS.md                          # Master agent bootstrap (read first)
â”œâ”€â”€ AI_DEPLOY.md                       # Ollama + OpenCode workstation setup
â”œâ”€â”€ README.md
â”œâ”€â”€ .cursor/
â”‚   â”œâ”€â”€ AGENTS.md                      # Full agent contract
â”‚   â”œâ”€â”€ registry.yaml                  # Skill autoload + trigger registry
â”‚   â””â”€â”€ skills/
â”‚       â”œâ”€â”€ superpowers/               # 11 methodological skills
â”‚       â”œâ”€â”€ gstack/                    # 6 sprint-loop skills
â”‚       â””â”€â”€ teknovo-*/                 # 13 enterprise domain skills
â””â”€â”€ docs/
    â””â”€â”€ ai/
        â”œâ”€â”€ repository-analysis.md     # This file
        â”œâ”€â”€ AI_ARCHITECTURE.md
        â”œâ”€â”€ AI_SKILLS_CATALOG.md
        â”œâ”€â”€ AI_WORKFLOW.md
        â”œâ”€â”€ AI_AGENT_LIFECYCLE.md
        â””â”€â”€ AI_ROADMAP.md
```

### 1.2 Target Codebase (`/home/coleallstar/Public/Teknovo-V2`)

PNPM monorepo containing the production application:

```text
Teknovo-V2/
â”œâ”€â”€ .cursor/                           # Agent config (from ai repo)
â”œâ”€â”€ apps/
â”‚   â””â”€â”€ portal/                        # Nuxt.js web application
â”œâ”€â”€ packages/
â”‚   â””â”€â”€ ui/                            # Shared UI components
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
â”œâ”€â”€ pnpm-workspace.yaml
â””â”€â”€ package.json
```

---

## 2. Domain Map

Teknovo is structured around subdomain-driven functional modules:

| Subdomain | Purpose |
|-----------|---------|
| `portal.domain.sch.id` | Public landing page, admissions, school overview, news |
| `ppdb.domain.sch.id` | Student admission â€” applicants, registration, payments |
| `erp.domain.sch.id` | Core school management â€” academics, classes, grading, attendance |
| `cbt.domain.sch.id` | Computer-based testing â€” exams, question banks, grading |
| `finance.domain.sch.id` | Billing plans, student payments, cash books |
| `wa.domain.sch.id` | WhatsApp notifications â€” templates, campaigns, logs |
| `api.domain.sch.id` | Centralized REST API under `/api/v1` |

### Database Schemas

`auth` Â· `student` Â· `academic` Â· `finance` Â· `cbt` Â· `wa` Â· `ppdb` Â· `audit` Â· `master` Â· `system`

---

## 3. Architecture Map

### Backend Layering

```text
Request â†’ Controller â†’ Service â†’ Repository â†’ Database
```

| Layer | Responsibility | Forbidden |
|-------|----------------|-----------|
| Controller | Zod validation, route handling, response envelope | Direct DB/repository access |
| Service | Business logic, transactions, event publishing | Raw SQL/ORM queries |
| Repository | Drizzle CRUD, filtering, pagination | Cross-module export |

### Frontend Layout

```text
PageShell â†’ PageHeader â†’ PageContent â†’ PageFooter
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
| **Security** | `.cursor/gates/security/rbac-matrix.md` |
| **Backend** | `backend/module-contract.md`, `service-contract.md`, `repository-contract.md`, `queue-contract.md` |
| **Infrastructure** | `infrastructure/cloudflare-setup-guide.md`, `deployment-standard.md`, `cicd-standard.md` |
| **Reviews** | `reviews/backend-review-template.md`, `database-review-template.md`, `security-review-template.md` |
| **AI** | `ai/ai-agent-contract.md`, `ai/cursor-rules.md` |

### AI SuperStack Documentation

| Document | Purpose |
|----------|---------|
| `AGENTS.md` | Master agent bootstrap and 12-step workflow |
| `.cursor/docs/AGENTS.md` | Full agent contract with doc paths |
| `.cursor/registry/legacy-registry.yaml` | Skill autoload and trigger registry |
| `.cursor/docs/ai/AI_ARCHITECTURE.md` | System block diagram |
| `.cursor/docs/ai/AI_SKILLS_CATALOG.md` | Complete skill index |
| `.cursor/docs/ai/AI_WORKFLOW.md` | 12-phase workstation loop |
| `.cursor/docs/ai/AI_AGENT_LIFECYCLE.md` | Agent state machine |
| `.cursor/docs/ai/AI_ROADMAP.md` | Milestone roadmap |
| `AI_DEPLOY.md` | Runtime setup (Ollama, OpenCode, Qwen) |

---

## 5. Existing Skills Inventory

### Superpowers (11 skills) â€” `.cursor/skills/superpowers/`

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

### GStack (8 skills) â€” `.cursor/skills/gstack/`

| Skill | Purpose |
|-------|---------|
| office-hours | Interactive consultation and blocker resolution |
| eng-review | Senior architecture and layering review |
| qa | Functional verification and boundary checks |
| browser-testing | Playwright E2E automation |
| ship | Release, migration, and merge checklists |
| retro | Post-sprint retrospective |
| cso | Customer success â€” stakeholder comms, release notes, rollout |
| investigate | Production incident investigation and root cause analysis |

### Teknovo Enterprise (19 skills) â€” `.cursor/skills/teknovo-*/`

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

### Teknovo Domain Module Skills (6) â€” `.cursor/skills/teknovo-*/`

| Skill | Purpose |
|-------|---------|
| teknovo-finance | Billing, payments, receipts, cash books, finance RBAC |
| teknovo-ppdb | Student admission, verification, selection, re-registration |
| teknovo-cbt | Question banks, exams, attempts, proctoring, results |
| teknovo-communication | WhatsApp templates, campaigns, delivery logs |
| teknovo-academic | Classes, schedules, attendance, grades, report cards |
| teknovo-reporting | Read models, dashboards, exports (no write-back) |

### Teknovo Cross-Cutting Skills (5)

| Skill | Purpose |
|-------|---------|
| teknovo-performance-engineer | Query optimization, caching, bundle size, Core Web Vitals |
| teknovo-observability | Logging, tracing, alerting, SLOs |
| teknovo-data-migration | Seed data, legacy import, data integrity |
| teknovo-integration-architect | Third-party APIs, webhooks, payment gateways |
| teknovo-incident-response | Outage command, rollback, postmortem facilitation |

**Total: 47 skills**

---

## 6. Missing Skills Inventory

### Completed (2026-06-20 â€” Ultimate AI Skill Pack)

| Skill | Category | Status |
|-------|----------|--------|
| gstack-cso | GStack | âœ… Implemented |
| gstack-investigate | GStack | âœ… Implemented |
| teknovo-finance | Domain | âœ… Implemented |
| teknovo-ppdb | Domain | âœ… Implemented |
| teknovo-cbt | Domain | âœ… Implemented |
| teknovo-communication | Domain | âœ… Implemented |
| teknovo-academic | Domain | âœ… Implemented |
| teknovo-reporting | Domain | âœ… Implemented |
| teknovo-performance-engineer | Cross-cutting | âœ… Implemented |
| teknovo-observability | Cross-cutting | âœ… Implemented |
| teknovo-data-migration | Cross-cutting | âœ… Implemented |
| teknovo-integration-architect | Cross-cutting | âœ… Implemented |
| teknovo-incident-response | Cross-cutting | âœ… Implemented |

**Gap analysis summary**: Three Pillars were complete. Roadmap M2â€“M5 domain and GStack extension skills were missing. Cross-cutting skills (observability, performance, migration, integration, incident response) were identified as gaps for production-grade AI workstation coverage.

### Remaining Future Enhancements

| Skill | Rationale | Milestone |
|-------|-----------|-----------|
| superpowers-dispatching-parallel-agents | Concurrent subagent dispatch (Superpowers upstream) | M2 |

### Integration Gaps

| Gap | Resolution |
|-----|------------|
| Skills not yet symlinked into Teknovo-V2 | Copy or symlink `.cursor/` from ai repo into Teknovo-V2 |
| No automated skill trigger detection | Manual trigger matching via registry.yaml; future: intent classifier |
| Playwright container not configured | Milestone 2: Automated Testing Rig |
| Ollama/Qwen not wired to registry autoload | Milestone 3: Local Dev Server integration |
