# AI Skills Catalog

Complete index of all skills in the **Teknovo AI SuperStack Workstation**.

**Registry**: `.cursor/registry/legacy-registry.yaml` · **Total skills**: 47

---

## 0. Three Pillars — Primary Role Gates

| Pillar | Skill ID | Phase | Focus | Mandatory Artifact |
|--------|----------|-------|-------|-------------------|
| **1** | teknovo-chief-product-designer | Planning / UI | PRD alignment, UX strategy, IA, Navigation | Product Design Analysis |
| **2** | teknovo-chief-architect | Architecture | Database, API, RBAC, Folder Structure | Architecture Impact Analysis |
| **3** | teknovo-devops-engineer | Ship / Deploy | GitHub CI, Cloudflare, Workers, D1, R2, Monitoring | Deployment Impact Analysis |

### Three Pillars Workflow Chain

```text
brainstorming → chief-product-designer → chief-architect → writing-plans → feature-implementation
  → eng-review → qa → devops-engineer → ship
```

### Role Boundaries

| Role | Owns | Delegates To |
|------|------|--------------|
| Chief Product Designer | PRD review/alignment, UX strategy, IA, nav architecture, journeys | teknovo-prd-generator (draft), teknovo-ui-ux-specialist (tactical UI) |
| Chief Architect | Unified architecture gate before code | teknovo-database-architect, teknovo-api-architect, teknovo-rbac-architect, teknovo-repository-governance |
| DevOps Engineer | Deploy/infra gate before release | teknovo-cloudflare-stack, gstack-ship, gstack-qa |

---

## 1. Superpowers Skills (Methodology)

Adapted from [obra/superpowers](https://github.com/obra/superpowers). These drive structured development habits and are mandatory workflows.

| Skill ID | Autoload | Trigger Examples | Purpose |
|----------|----------|------------------|---------|
| superpowers-brainstorming | ✅ | new feature, design, requirements | Socratic design refinement before any creative work |
| superpowers-writing-plans | ✅ | implementation plan, create plan | Detailed step-by-step plans with file paths and verification |
| superpowers-executing-plans | ✅ | execute plan, build from plan | Systematic checklist execution with human checkpoints |
| superpowers-systematic-debugging | ❌ | bug, error, stacktrace, crash | 4-phase root cause process: isolate → reproduce → fix → verify |
| superpowers-verification-before-completion | ✅ | done, complete, finish task | Pre-completion gates: lint, build, test evidence required |
| superpowers-requesting-code-review | ❌ | pull request, code review | PR formatting, severity classification, review checklist |
| superpowers-receiving-code-review | ❌ | review feedback, address comments | Systematic incorporation of review feedback |
| superpowers-test-driven-development | ✅ | write tests, TDD, red green refactor | RED-GREEN-REFACTOR cycle; delete code written before tests |
| superpowers-subagent-driven-development | ❌ | subagent, parallel tasks, delegate | Two-stage review: spec compliance then code quality |
| superpowers-using-git-worktrees | ❌ | worktree, parallel branch | Isolated workspace on new branch with clean test baseline |
| superpowers-finishing-development-branch | ❌ | merge branch, finish branch | Merge/PR/keep/discard options with cleanup |

### Superpowers Workflow Chain

```text
brainstorming → writing-plans → [git-worktrees] → executing-plans OR subagent-driven-development
    → test-driven-development → requesting-code-review → finishing-development-branch
```

---

## 2. GStack Skills (Sprint Loop)

Adapted from [garrytan/gstack](https://github.com/garrytan/gstack). Model a virtual engineering team's sprint delivery loop.

| Skill ID | Autoload | Trigger Examples | Purpose |
|----------|----------|------------------|---------|
| gstack-office-hours | ❌ | blocker, consultation, unclear requirements | Interactive product interrogation with forcing questions |
| gstack-eng-review | ✅ | engineering review, layer audit | Senior architecture review: layers, types, database rules |
| gstack-qa | ✅ | QA, functional test, user flow | Functional verification and boundary condition testing |
| gstack-browser-testing | ❌ | E2E, Playwright, browser test | Real browser automation for user flow validation |
| gstack-ship | ❌ | deploy, release, ship | Migration checks, env vars, merge readiness |
| gstack-retro | ❌ | retrospective, post-mortem, sprint review | Weekly engineering retrospective and pattern improvement |
| gstack-cso | ❌ | stakeholder update, release notes, customer success | School-facing comms, release notes, rollout briefings |
| gstack-investigate | ❌ | investigate production, root cause, incident timeline | Production RCA with logs, traces, queues, timeline |

### GStack Sprint Loop

```text
office-hours → eng-review → qa → browser-testing → ship → retro
cso (stakeholder comms) · investigate (production RCA)
```

---

## 3. Teknovo Enterprise Skills

Domain-specific architectural extensions enforcing Teknovo V2 compliance. Reference actual documentation paths.

| Skill ID | Autoload | Trigger Examples | Purpose |
|----------|----------|------------------|---------|
| teknovo-rbac-architect | ✅ | permission, role, RBAC, route guard | 8 roles, 5 access layers, `domain.resource.action` format |
| teknovo-cloudflare-stack | ❌ | cloudflare, tunnel, R2, DNS | Tunnels, DNS records, R2 buckets, edge security headers |
| teknovo-database-architect | ✅ | schema, migration, drizzle, UUID v7 | PostgreSQL 17+, Drizzle, soft deletes, audit columns |
| teknovo-prd-generator | ❌ | create PRD, product requirements | Master and module PRD structure with boundaries |
| teknovo-feature-implementation | ✅ | implement feature, build feature | End-to-end: Database → Repo → Service → Controller → UI |
| teknovo-repository-governance | ✅ | folder structure, monorepo, kebab-case | Monorepo rules, naming, forbidden dump files |
| teknovo-testing-architect | ✅ | test plan, vitest, coverage audit | Vitest/Playwright matrices, 70-95% coverage targets |
| teknovo-api-architect | ✅ | REST API, swagger, openapi, DTO | `/api/v1` routes, Zod validation, JSON envelopes |
| teknovo-security-review | ✅ | security audit, CORS, JWT, OWASP | Auth headers, rate limits, secret rotation |
| teknovo-ui-ux | ✅ | UI, page layout, design system | PageShell, 5 page states, Phosphor icons, design tokens |
| teknovo-ui-ux-specialist | ❌ | UX review, design review, build UI, accessibility audit | Principal UX Architect — tactical IA, review frameworks, pre-code architecture |
| teknovo-chief-product-designer | ❌ | product design review, PRD alignment, user journey, AI-ish design, before UI implementation | **Pillar 1** — PRD alignment/review, UX strategy, IA, navigation, journeys, conversion, AI-ish detection |
| teknovo-chief-architect | ❌ | architecture gate, architecture impact, before backend implementation | **Pillar 2** — unified architecture gate: database, API, RBAC, folder structure impact analysis |
| teknovo-devops-engineer | ❌ | deploy, CI/CD, cloudflare deploy, release to production | **Pillar 3** — deploy/infra gate: GitHub CI, Cloudflare, Workers, D1, R2, monitoring |
| teknovo-backend-development | ✅ | backend, controller, repository | NestJS modules, BullMQ events, response contracts |
| teknovo-domain-management | ✅ | domain event, cross-domain, DDD | Context mapping, data ownership, event catalog |
| teknovo-landing-page | ✅ | landing page, SEO, Lighthouse | Marketing site, wireframes, performance limits |

### Teknovo Document References

| Skill | Primary Doc Reference |
|-------|----------------------|
| teknovo-database-architect | `docs/standards/database/database-standard.md` |
| teknovo-api-architect | `docs/standards/api/api-contract.md` |
| teknovo-rbac-architect | `docs/standards/rbac/rbac-standard.md`, `docs/.cursor/gates/security/rbac-matrix.md` |
| teknovo-ui-ux | `docs/standards/design-system/design-system-contract.md` |
| teknovo-ui-ux-specialist | `docs/standards/design-system/navigation-architecture-standard.md`, `design-system-contract.md` |
| teknovo-chief-product-designer | `docs/prd/master/master-prd.md`, `navigation-architecture-standard.md`, `domain-context-map.md` |
| teknovo-chief-architect | `docs/architecture/folder-contract.md`, `docs/standards/database/database-standard.md`, `docs/standards/api/api-contract.md`, `docs/.cursor/gates/security/rbac-matrix.md` |
| teknovo-devops-engineer | `AI_DEPLOY.md`, `docs/infrastructure/deployment-standard.md`, `docs/infrastructure/cloudflare-setup-guide.md` |
| teknovo-backend-development | `docs/backend/module-contract.md`, `service-contract.md` |
| teknovo-domain-management | `docs/architecture/domain-context-map.md`, `data-ownership-matrix.md` |
| teknovo-landing-page | `docs/prd/ui-ux/landing-page-prd.md` |
| teknovo-security-review | `docs/reviews/security-review-template.md` |
| teknovo-testing-architect | `docs/standards/testing/testing-standard.md` |
| teknovo-repository-governance | `docs/architecture/folder-contract.md` |
| teknovo-cloudflare-stack | `docs/infrastructure/cloudflare-setup-guide.md` |
| teknovo-prd-generator | `docs/prd/master/master-prd.md` |

---

## 4. Teknovo Domain Module Skills

Deep domain expertise aligned with `docs/domain/**` and Teknovo-V2 subdomain architecture.

| Skill ID | Autoload | Trigger Examples | Purpose |
|----------|----------|------------------|---------|
| teknovo-finance | ❌ | billing, tagihan, pembayaran, tunggakan | Fee types, bills, payments, receipts, cash books, finance RBAC |
| teknovo-ppdb | ❌ | PPDB, pendaftaran, seleksi, admission | Applicants, verification, selection, re-registration → Student |
| teknovo-cbt | ❌ | CBT, ujian online, bank soal, proctoring | Question banks, exams, attempts, immutable results |
| teknovo-communication | ❌ | WhatsApp, WA template, campaign, notifikasi | Event-driven WA: templates, campaigns, delivery logs |
| teknovo-academic | ❌ | akademik, kelas, absensi, nilai, rapor | Teachers, classes, schedules, attendance, grades |
| teknovo-reporting | ❌ | report, dashboard, laporan, export PDF | Read-only dashboards, analytics, async exports |

### Domain Document References

| Skill | Primary Doc Reference |
|-------|----------------------|
| teknovo-finance | `docs/domain/finance-domain.md` |
| teknovo-ppdb | `docs/domain/ppdb-domain.md` |
| teknovo-cbt | `docs/domain/cbt-domain.md` |
| teknovo-communication | `docs/domain/wa-domain.md` |
| teknovo-academic | `docs/domain/academic-domain.md` |
| teknovo-reporting | `docs/domain/reporting-domain.md` |

---

## 5. Teknovo Cross-Cutting Skills

Production-grade capabilities complementing Three Pillars and GStack.

| Skill ID | Autoload | Trigger Examples | Purpose |
|----------|----------|------------------|---------|
| teknovo-performance-engineer | ❌ | slow query, Lighthouse, Core Web Vitals | Query optimization, caching, bundle size, queue throughput |
| teknovo-observability | ❌ | logging, tracing, alerting, SLO | Structured logs, metrics, alerts, SLOs (complements devops-engineer) |
| teknovo-data-migration | ❌ | data migration, seed data, bulk import | Legacy import, seed scripts, integrity validation |
| teknovo-integration-architect | ❌ | webhook, payment gateway, third-party API | External adapters, idempotent callbacks, resilience |
| teknovo-incident-response | ❌ | incident, outage, rollback, SEV-1 | Outage command, rollback decisions, postmortem |

### Cross-Cutting Handoff Chain

```text
incident-response → investigate → [domain skill fix] → observability (alerts)
                  → cso (external comms) → retro (postmortem)
```

---

## 6. Trigger Mapping Quick Reference

| User Intent | Skills Loaded |
|-------------|---------------|
| "Review dashboard UX" | ui-ux-specialist → ui-ux → browser-testing |
| "Product design review before building attendance" | chief-product-designer → chief-architect → ui-ux-specialist → writing-plans → feature-implementation |
| "Build a new student attendance feature" | brainstorming → chief-product-designer → chief-architect → writing-plans → feature-implementation → ui-ux-specialist → ui-ux → testing-architect |
| "Fix the login 500 error" | systematic-debugging → verification-before-completion |
| "Review this PR" | eng-review → security-review → repository-governance |
| "Deploy to staging" | devops-engineer → ship → verification-before-completion |
| "Deploy to production" | devops-engineer → qa evidence → ship |
| "I'm blocked on the API design" | office-hours → chief-architect → api-architect |
| "Architecture review before implementation" | chief-architect → database-architect + api-architect + rbac-architect |
| "PRD alignment check" | chief-product-designer → prd-generator (if gaps) |
| "Run E2E tests on the portal" | browser-testing → qa |
| "What did we learn this sprint?" | retro |
| "Production payment failures" | investigate → teknovo-finance → incident-response |
| "Release notes for school admin" | cso |
| "Import legacy student data" | data-migration → chief-architect |
| "Payment gateway webhook" | integration-architect → teknovo-finance → security-review |
| "Finance billing feature" | chief-product-designer → chief-architect → teknovo-finance → feature-implementation |

---

## 7. Future Skills (Roadmap)

| Skill | Category | Milestone |
|-------|----------|-----------|
| superpowers-dispatching-parallel-agents | Superpowers | M2 |
