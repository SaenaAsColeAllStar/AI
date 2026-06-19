# AI Skills Catalog

Complete index of all skills in the **Teknovo AI SuperStack Workstation**.

**Registry**: `.agents/registry.yaml` · **Total skills**: 32

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

### GStack Sprint Loop

```text
office-hours → eng-review → qa → browser-testing → ship → retro
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
| teknovo-chief-product-designer | ❌ | product design review, user journey, AI-ish design, before UI implementation | Chief Product Designer — strategic IA, journeys, conversion, AI-ish detection, planning gate |
| teknovo-backend-development | ✅ | backend, controller, repository | NestJS modules, BullMQ events, response contracts |
| teknovo-domain-management | ✅ | domain event, cross-domain, DDD | Context mapping, data ownership, event catalog |
| teknovo-landing-page | ✅ | landing page, SEO, Lighthouse | Marketing site, wireframes, performance limits |

### Teknovo Document References

| Skill | Primary Doc Reference |
|-------|----------------------|
| teknovo-database-architect | `docs/standards/database/database-standard.md` |
| teknovo-api-architect | `docs/standards/api/api-contract.md` |
| teknovo-rbac-architect | `docs/standards/rbac/rbac-standard.md`, `docs/security/rbac-matrix.md` |
| teknovo-ui-ux | `docs/standards/design-system/design-system-contract.md` |
| teknovo-ui-ux-specialist | `docs/standards/design-system/navigation-architecture-standard.md`, `design-system-contract.md` |
| teknovo-chief-product-designer | `docs/prd/master/master-prd.md`, `navigation-architecture-standard.md`, `domain-context-map.md` |
| teknovo-backend-development | `docs/backend/module-contract.md`, `service-contract.md` |
| teknovo-domain-management | `docs/architecture/domain-context-map.md`, `data-ownership-matrix.md` |
| teknovo-landing-page | `docs/prd/ui-ux/landing-page-prd.md` |
| teknovo-security-review | `docs/reviews/security-review-template.md` |
| teknovo-testing-architect | `docs/standards/testing/testing-standard.md` |
| teknovo-repository-governance | `docs/architecture/folder-contract.md` |
| teknovo-cloudflare-stack | `docs/infrastructure/cloudflare-setup-guide.md` |
| teknovo-prd-generator | `docs/prd/master/master-prd.md` |

---

## 4. Trigger Mapping Quick Reference

| User Intent | Skills Loaded |
|-------------|---------------|
| "Review dashboard UX" | ui-ux-specialist → ui-ux → browser-testing |
| "Product design review before building attendance" | chief-product-designer → ui-ux-specialist → writing-plans → feature-implementation |
| "Build a new student attendance feature" | brainstorming → chief-product-designer → writing-plans → feature-implementation → database-architect → rbac-architect → ui-ux-specialist → ui-ux → testing-architect |
| "Fix the login 500 error" | systematic-debugging → verification-before-completion |
| "Review this PR" | eng-review → security-review → repository-governance |
| "Deploy to staging" | ship → verification-before-completion |
| "I'm blocked on the API design" | office-hours → api-architect |
| "Run E2E tests on the portal" | browser-testing → qa |
| "What did we learn this sprint?" | retro |

---

## 5. Future Skills (Roadmap)

| Skill | Category | Milestone |
|-------|----------|-----------|
| teknovo-finance-module | Enterprise | M2 |
| teknovo-ppdb-module | Enterprise | M2 |
| teknovo-cbt-module | Enterprise | M3 |
| teknovo-wa-module | Enterprise | M3 |
| gstack-cso | GStack | M4 |
| gstack-investigate | GStack | M4 |
| superpowers-dispatching-parallel-agents | Superpowers | M2 |
