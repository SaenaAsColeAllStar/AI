# Teknovo Skill Inventory

> **Canonical registry**: `.cursor/registry/skill-registry.yaml`  
> **Last updated**: 2026-06-20  
> **Total registered skills**: 97

This catalog inventories every skill, artifact, and agent-adjacent entry in the Teknovo AI SuperStack. Each entry is registered in the central skill registry with exactly one primary layer, a priority level, activation triggers, and dependencies.

---

## Summary by Layer

| Layer | Count | Primary purpose |
|-------|------:|-----------------|
| foundation | 2 | Master contracts (`AGENTS.md`) |
| memory | 8 | Claude-Mem long-term context |
| product | 14 | PRD, pillars, domain modules, planning |
| ux | 8 | UI implementation, design taste, copy |
| architecture | 7 | Chief architect, DB, API, DDD, monorepo |
| engineering | 9 | Implementation, TDD, backend, performance |
| security | 10 | Security principles, RBAC security, review gate |
| assurance | 12 | Trail-of-Bits-inspired verification |
| deployment | 6 | DevOps, Cloudflare, ship, incidents |
| automation | 3 | Subagents, parallel dispatch, worktrees |
| review | 16 | Taste, quality, GStack review, code review |
| mcp | 1 | Agent/MCP security boundaries |
| **Total** | **97** | |

## Summary by Source

| Source | Count | Registry path |
|--------|------:|---------------|
| Teknovo Skills | 28 | `.cursor/skills/teknovo-*/SKILL.md` |
| Superpowers | 12 | `.cursor/skills/superpowers/*/SKILL.md` |
| GStack | 8 | `.cursor/skills/gstack/*/SKILL.md` |
| Taste | 8 | `.cursor/gates/taste/*.md`, `agents/taste-reviewer.md` |
| Impeccable (Quality) | 10 | `.cursor/gates/quality/*.md`, `agents/impeccable-reviewer.md` |
| Security | 9 | `.cursor/gates/security/*.md`, `agents/security-reviewer.md` |
| Assurance | 12 | `.cursor/gates/assurance/*.md`, `agents/*.md` |
| Memory | 8 | `.cursor/docs/memory/*.md` |
| Foundation | 2 | `AGENTS.md`, `.cursor/docs/AGENTS.md` |

---

## Foundation

| ID | Path | Layer | Priority | Purpose | Activation triggers |
|----|------|-------|----------|---------|---------------------|
| `agents-md` | `AGENTS.md` | foundation | critical | Master agent contract â€” identity, workflow, Three Pillars | session start, every task, bootstrap |
| `agents-contract` | `.cursor/docs/AGENTS.md` | foundation | critical | Extended contract with Teknovo-V2 document paths | session start, V2 paths, module work |

---

## Memory (Claude-Mem)

| ID | Path | Layer | Priority | Purpose | Activation triggers |
|----|------|-------|----------|---------|---------------------|
| `memory-project-context` | `.cursor/docs/memory/project-context.md` | memory | critical | Master project context â€” workflow, constraints, roadmap | session start, bootstrap |
| `memory-repository-map` | `.cursor/docs/memory/repository-map.md` | memory | high | Folder and package structure | repo structure, find file |
| `memory-product-context` | `.cursor/docs/memory/product-context.md` | memory | high | ERP modules, business concepts | product context, PPDB, finance |
| `memory-domain-knowledge` | `.cursor/docs/memory/domain-knowledge.md` | memory | high | Bounded contexts, domain events | domain, bounded context |
| `memory-architecture-decisions` | `.cursor/docs/memory/architecture-decisions.md` | memory | high | ADR summaries | ADR, architecture decision |
| `memory-coding-standards` | `.cursor/docs/memory/coding-standards.md` | memory | critical | Layer isolation, naming, API/RBAC standards | coding standard, UUID v7 |
| `memory-ui-ux-rules` | `.cursor/docs/memory/ui-ux-rules.md` | memory | high | Design tokens, sidebar, page states | design token, page state |
| `memory-lessons-learned` | `.cursor/docs/memory/lessons-learned.md` | memory | medium | Workstation recovery, integration gaps | lessons learned, past incident |

**Sub-registry**: `.cursor/docs/memory/memory-registry.yaml` â€” refresh policies, session episodic storage.

---

## Superpowers Skills

| ID | Path | Layer | Priority | Purpose | Activation triggers |
|----|------|-------|----------|---------|---------------------|
| `superpowers-brainstorming` | `.cursor/skills/superpowers/brainstorming/SKILL.md` | product | high | Divergent requirements before creative work | new feature, brainstorm, requirements |
| `superpowers-writing-plans` | `.cursor/skills/superpowers/writing-plans/SKILL.md` | product | high | Step-by-step implementation plans | implementation plan, create plan |
| `superpowers-executing-plans` | `.cursor/skills/superpowers/executing-plans/SKILL.md` | engineering | high | Execute approved plans systematically | execute plan, build from plan |
| `superpowers-systematic-debugging` | `.cursor/skills/superpowers/systematic-debugging/SKILL.md` | engineering | high | Evidence-based debugging | bug, error, debug, stacktrace |
| `superpowers-verification-before-completion` | `.cursor/skills/superpowers/verification-before-completion/SKILL.md` | review | high | Checks before declaring done | done, complete, verify |
| `superpowers-requesting-code-review` | `.cursor/skills/superpowers/requesting-code-review/SKILL.md` | review | medium | PR descriptions and review alignment | pull request, PR, code review |
| `superpowers-receiving-code-review` | `.cursor/skills/superpowers/receiving-code-review/SKILL.md` | review | medium | Process review feedback | review feedback, address comments |
| `superpowers-test-driven-development` | `.cursor/skills/superpowers/test-driven-development/SKILL.md` | engineering | high | Red-Green-Refactor TDD | write tests, TDD, coverage |
| `superpowers-subagent-driven-development` | `.cursor/skills/superpowers/subagent-driven-development/SKILL.md` | automation | medium | Delegate subtasks with interfaces | subagent, delegate task |
| `superpowers-dispatching-parallel-agents` | `.cursor/skills/superpowers/dispatching-parallel-agents/SKILL.md` | automation | medium | Parallel sibling agents | parallel agents, multitask |
| `superpowers-using-git-worktrees` | `.cursor/skills/superpowers/using-git-worktrees/SKILL.md` | automation | optional | Isolated git worktrees | worktree, parallel branch |
| `superpowers-finishing-development-branch` | `.cursor/skills/superpowers/finishing-development-branch/SKILL.md` | review | medium | Complete tracks for merge | merge branch, finish branch |

---

## GStack Skills

| ID | Path | Layer | Priority | Purpose | Activation triggers |
|----|------|-------|----------|---------|---------------------|
| `gstack-office-hours` | `.cursor/skills/gstack/office-hours/SKILL.md` | product | medium | Consultation and blocker resolution | blocker, consultation |
| `gstack-eng-review` | `.cursor/skills/gstack/eng-review/SKILL.md` | review | high | Layer audit, architecture review | engineering review, layer audit |
| `gstack-qa` | `.cursor/skills/gstack/qa/SKILL.md` | review | high | Functional validation with evidence | QA, functional test, validate feature |
| `gstack-browser-testing` | `.cursor/skills/gstack/browser-testing/SKILL.md` | review | high | Playwright/Vitest E2E | E2E, Playwright, browser test |
| `gstack-ship` | `.cursor/skills/gstack/ship/SKILL.md` | deployment | high | Safe release and deploy verification | deploy, release, ship |
| `gstack-retro` | `.cursor/skills/gstack/retro/SKILL.md` | review | optional | Sprint retrospective | retrospective, lessons learned |
| `gstack-cso` | `.cursor/skills/gstack/cso/SKILL.md` | product | medium | Stakeholder and school-facing comms | release notes, customer success |
| `gstack-investigate` | `.cursor/skills/gstack/investigate/SKILL.md` | deployment | high | Production incident investigation | root cause, production anomaly |

---

## Teknovo Skills

### Three Pillars

| ID | Path | Layer | Priority | Role | Purpose | Activation triggers |
|----|------|-------|----------|------|---------|---------------------|
| `teknovo-chief-product-designer` | `.cursor/skills/teknovo-ux-architecture/SKILL.md` | product | critical | pillar-1 | PRD alignment, UX strategy, IA | product design review, PRD alignment |
| `teknovo-chief-architect` | `.cursor/skills/teknovo-chief-architect/SKILL.md` | architecture | critical | pillar-2 | Architecture impact analysis | architecture gate, schema impact |
| `teknovo-devops-engineer` | `.cursor/skills/teknovo-devops-engineer/SKILL.md` | deployment | critical | pillar-3 | CI/CD, Cloudflare, monitoring | cloudflare deploy, release to production |

### Specialists

| ID | Path | Layer | Priority | Purpose | Activation triggers |
|----|------|-------|----------|---------|---------------------|
| `teknovo-prd-generator` | `.cursor/skills/teknovo-prd-generator/SKILL.md` | product | high | Generate module PRDs | create PRD, write spec |
| `teknovo-feature-implementation` | `.cursor/skills/teknovo-feature-implementation/SKILL.md` | engineering | critical | End-to-end feature build | implement feature, create endpoint |
| `teknovo-backend-development` | `.cursor/skills/teknovo-backend-development/SKILL.md` | engineering | critical | Backend modules (NestJS/Drizzle) | backend, controller, repository |
| `teknovo-database-architect` | `.cursor/skills/teknovo-database-architect/SKILL.md` | architecture | critical | PostgreSQL schemas, migrations | schema, migration, drizzle |
| `teknovo-api-architect` | `.cursor/skills/teknovo-api-architect/SKILL.md` | architecture | critical | REST contracts, OpenAPI | REST API, endpoint, openapi |
| `teknovo-rbac-architect` | `.cursor/skills/teknovo-rbac-architect/SKILL.md` | security | critical | Permissions across API and UI | RBAC, permission, route guard |
| `teknovo-ui-ux` | `.cursor/skills/teknovo-ui-ux/SKILL.md` | ux | critical | shadcn/Radix UI implementation | UI, component, design system |
| `teknovo-ui-ux-specialist` | `.cursor/skills/teknovo-ux-architecture/SKILL.md` | ux | high | UX architecture, a11y audit | UX review, accessibility audit |
| `teknovo-domain-management` | `.cursor/skills/teknovo-domain-management/SKILL.md` | architecture | high | DDD boundaries, domain events | domain event, DDD, data ownership |
| `teknovo-landing-page` | `.cursor/skills/teknovo-landing-page/SKILL.md` | ux | high | Public school landing page | landing page, SEO, Lighthouse |
| `teknovo-repository-governance` | `.cursor/skills/teknovo-repository-governance/SKILL.md` | architecture | high | Monorepo folder contracts | folder structure, monorepo |
| `teknovo-testing-architect` | `.cursor/skills/teknovo-testing-architect/SKILL.md` | engineering | high | Test matrices, Vitest coverage | test plan, vitest, coverage |
| `teknovo-security-review` | `.cursor/skills/teknovo-security-review/SKILL.md` | security | critical | Auth, CORS, JWT audits | security audit, OWASP |
| `teknovo-cloudflare-stack` | `.cursor/skills/teknovo-cloudflare-stack/SKILL.md` | deployment | high | Tunnels, DNS, R2 | cloudflare, tunnel, R2 |
| `teknovo-observability` | `.cursor/skills/teknovo-observability/SKILL.md` | deployment | medium | Logging, tracing, SLOs | logging, tracing, alerting |
| `teknovo-incident-response` | `.cursor/skills/teknovo-incident-response/SKILL.md` | deployment | high | Incident commander | incident, outage, rollback |
| `teknovo-performance-engineer` | `.cursor/skills/teknovo-performance-engineer/SKILL.md` | engineering | medium | Query/cache/CWV optimization | slow query, Core Web Vitals |
| `teknovo-data-migration` | `.cursor/skills/teknovo-data-migration/SKILL.md` | engineering | medium | ETL, legacy import | data migration, seed data |
| `teknovo-integration-architect` | `.cursor/skills/teknovo-integration-architect/SKILL.md` | architecture | medium | Webhooks, payment gateways | integration, third-party API |

### Domain Modules

| ID | Path | Layer | Priority | Purpose | Activation triggers |
|----|------|-------|----------|---------|---------------------|
| `teknovo-finance` | `.cursor/skills/teknovo-finance/SKILL.md` | product | medium | Billing, payments, arrears | finance, tagihan, pembayaran |
| `teknovo-ppdb` | `.cursor/skills/teknovo-ppdb/SKILL.md` | product | medium | Student admission workflows | PPDB, pendaftaran, seleksi |
| `teknovo-cbt` | `.cursor/skills/teknovo-cbt/SKILL.md` | product | medium | Online exams, proctoring | CBT, ujian online, bank soal |
| `teknovo-communication` | `.cursor/skills/teknovo-communication/SKILL.md` | product | medium | WhatsApp campaigns | WhatsApp, WA template, broadcast |
| `teknovo-academic` | `.cursor/skills/teknovo-academic/SKILL.md` | product | medium | Classes, grades, report cards | academic, absensi, rapor |
| `teknovo-reporting` | `.cursor/skills/teknovo-reporting/SKILL.md` | product | medium | Read models, PDF export | report, laporan, analytics |

---

## Taste Artifacts

| ID | Path | Layer | Priority | Purpose | Activation triggers |
|----|------|-------|----------|---------|---------------------|
| `taste-product-principles` | `.cursor/gates/taste/product-principles.md` | product | medium | Removal test, reject complexity | new feature, PRD, brainstorm |
| `taste-ux-principles` | `.cursor/gates/taste/ux-principles.md` | ux | medium | Nav simplicity, cognitive load | before UI, UX review, navigation |
| `taste-design-principles` | `.cursor/gates/taste/design-principles.md` | ux | medium | Anti-AI-dashboard visual taste | dashboard, AI dashboard |
| `taste-architecture-principles` | `.cursor/gates/taste/architecture-principles.md` | architecture | medium | Reject overengineering | architecture gate, new module |
| `taste-copywriting-principles` | `.cursor/gates/taste/copywriting-principles.md` | ux | medium | Clear Indonesian copy | copy review, labels, i18n |
| `taste-checklist` | `.cursor/gates/taste/taste-checklist.md` | review | medium | Simpler, smaller, removable | taste review, simplify |
| `taste-gates` | `.cursor/gates/taste/taste-gates.md` | review | high | Five mandatory taste gates | taste gate, feature complete |
| `taste-reviewer` | `agents/taste-reviewer.md` | review | high | Removal and simplification agent | taste review, scope cut |

**Sub-registry**: `.cursor/gates/taste/taste-registry.yaml` â€” bundles: `planning`, `pre-ui`, `pre-feature`, `pre-code`, `full`.

---

## Impeccable (Quality) Artifacts

| ID | Path | Layer | Priority | Purpose | Activation triggers |
|----|------|-------|----------|---------|---------------------|
| `quality-product-principles` | `.cursor/gates/quality/product-principles.md` | product | medium | User/business value scoring | new feature proposal, PRD draft |
| `quality-ux-principles` | `.cursor/gates/quality/ux-principles.md` | ux | medium | UX excellence, a11y | before UI implementation |
| `quality-architecture-principles` | `.cursor/gates/quality/architecture-principles.md` | architecture | medium | Domain ownership, API boundaries | architecture gate, new module |
| `quality-engineering-principles` | `.cursor/gates/quality/engineering-principles.md` | engineering | high | Readability, tests, security | before code generation, refactor |
| `quality-review-principles` | `.cursor/gates/quality/review-principles.md` | review | high | Review philosophy, severity model | code review, quality audit |
| `quality-review-checklist` | `.cursor/gates/quality/review-checklist.md` | review | high | Pre-ship checklist | before PR, before merge |
| `quality-design-taste` | `.cursor/gates/quality/design-taste.md` | ux | medium | Stripe/Linear/Notion reference | UI design, AI-ish design |
| `quality-gates` | `.cursor/gates/quality/quality-gates.md` | review | high | Mandatory quality gates | deploy, feature complete |
| `quality-self-critique` | `.cursor/gates/quality/self-critique.md` | review | critical | Mandatory before final output | done, task complete |
| `impeccable-reviewer` | `agents/impeccable-reviewer.md` | review | high | Full quality review agent | review, audit, code review |

**Sub-registry**: `.cursor/gates/quality/quality-registry.yaml` â€” bundles: `planning`, `pre-ui`, `pre-code`, `pre-ship`, `full`.

---

## Security Artifacts

| ID | Path | Layer | Priority | Purpose | Activation triggers |
|----|------|-------|----------|---------|---------------------|
| `security-principles` | `.cursor/gates/security/security-principles.md` | security | critical | Least privilege, defense in depth | security review, architecture gate |
| `security-rbac-security` | `.cursor/gates/security/rbac-security.md` | security | critical | RBAC hierarchy, route guards | RBAC, permission, role |
| `security-api-security` | `.cursor/gates/security/api-security.md` | security | high | Auth, rate limits, CORS | REST API, endpoint |
| `security-database-security` | `.cursor/gates/security/database-security.md` | security | high | Audit logs, tenancy, soft delete | migration, schema |
| `security-cloudflare-security` | `.cursor/gates/security/cloudflare-security.md` | security | high | Workers, R2, tunnel hardening | cloudflare, deploy |
| `security-ai-agent-security` | `.cursor/gates/security/ai-agent-security.md` | mcp | high | MCP and agent tool boundaries | MCP, automation, cursor |
| `security-review-checklist` | `.cursor/gates/security/review-checklist.md` | security | high | Ten-section security checklist | security audit, before PR |
| `security-gates` | `.cursor/gates/security/security-gates.md` | security | critical | Pre-implementation/deploy gates | security gate, release |
| `security-reviewer` | `agents/security-reviewer.md` | security | critical | APPROVE/BLOCK security agent | security review, OWASP |

**Sub-registry**: `.cursor/gates/security/security-registry.yaml` â€” bundles: `planning`, `pre-rbac`, `pre-api`, `pre-db`, `pre-deploy`, `pre-agent`, `full`.

---

## Assurance Artifacts (Trail of Bits inspired)

| ID | Path | Layer | Priority | Status | Purpose | Activation triggers |
|----|------|-------|----------|--------|---------|---------------------|
| `assurance-principles` | `.cursor/gates/assurance/assurance-principles.md` | assurance | high | active | Verify assumptions, evidence over narrative | assurance, verify |
| `assurance-review-workflow` | `.cursor/gates/assurance/review-workflow.md` | assurance | high | active | End-to-end assurance workflow | assurance review, gate sequence |
| `assurance-risk-analysis` | `.cursor/gates/assurance/risk-analysis.md` | assurance | medium | active | Structured risk analysis | risk analysis, threat model |
| `assurance-decision-validation` | `.cursor/gates/assurance/decision-validation.md` | assurance | medium | active | ADR/PRD one-way door checks | decision validation, ADR check |
| `assurance-sharp-edges` | `.cursor/gates/assurance/sharp-edges.md` | assurance | medium | active | Stack footguns catalog | sharp edge, footgun |
| `assurance-insecure-defaults` | `.cursor/gates/assurance/insecure-defaults.md` | assurance | high | active | Reject insecure defaults | insecure default, env vars |
| `assurance-dependency-review` | `.cursor/gates/assurance/dependency-review.md` | assurance | high | active | Lockfile change review | dependency, lockfile, npm audit |
| `assurance-static-analysis` | `.cursor/gates/assurance/static-analysis.md` | assurance | medium | active | SAST/CI expectations | static analysis, SAST |
| `requirement-clarifier` | `agents/requirement-clarifier.md` | assurance | high | active | Requirements auditor | unclear requirements, clarify |
| `context-builder` | `agents/context-builder.md` | assurance | high | active | ADR/PRD context verification | read ADR, before implementation |
| `differential-reviewer` | `agents/differential-reviewer.md` | assurance | high | **[PLANNED]** | Diff-focused review | PR diff, migration diff |
| `second-opinion-reviewer` | `agents/second-opinion-reviewer.md` | assurance | medium | **[PLANNED]** | Challenge high-risk decisions | second opinion, pre-deploy |

**Sub-registry**: `.cursor/gates/assurance/assurance-registry.yaml` â€” bundles: `pre-planning`, `pre-implementation`, `pre-review`, `pre-deploy`, `full`.

---

## Autoload Skills (Session Start)

These 29 skills load at every session (see `.cursor/registry/skill-registry.yaml` â†’ `autoload`):

`agents-md`, all 8 memory core artifacts, `superpowers-brainstorming`, `superpowers-writing-plans`, `superpowers-executing-plans`, `superpowers-verification-before-completion`, `superpowers-test-driven-development`, `quality-self-critique`, `gstack-eng-review`, `gstack-qa`, `teknovo-rbac-architect`, `teknovo-database-architect`, `teknovo-feature-implementation`, `teknovo-repository-governance`, `teknovo-testing-architect`, `teknovo-api-architect`, `teknovo-security-review`, `teknovo-ui-ux`, `teknovo-backend-development`, `teknovo-domain-management`, `teknovo-landing-page`, `taste-reviewer`.

---

## Skill Bundles

| Bundle | Phase | Key skills |
|--------|-------|------------|
| `session-bootstrap` | Every session | `agents-md`, memory core, superpowers planning |
| `pre-feature` | Before scoping | taste gates, requirement-clarifier, Pillar 1 |
| `pre-ui` | Before UI code | .cursor/gates/taste/quality UX, ui-ux-specialist |
| `pre-implementation` | Before code | Pillar 2, context-builder, security-reviewer |
| `pre-ship` | Before merge/deploy | quality gates, security-reviewer, GStack QA |

Load via: `python .cursor/runtime/load-skills.py --bundle pre-implementation`

---

## Cross-References

| Document | Path |
|----------|------|
| Skill registry (canonical) | `.cursor/registry/skill-registry.yaml` |
| Agent registry | `.cursor/registry/agent-registry.yaml` |
| MCP registry | `.cursor/registry/mcp-registry.yaml` |
| Governance policies | `.cursor/docs/ai/skill-governance.md` |
| Legacy compatibility | `.cursor/registry/legacy-registry.yaml` |
| Skill loader | `.cursor/runtime/load-skills.py` |
| Memory loader | `.cursor/runtime/load-memory.py` |
