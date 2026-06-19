# Teknovo AI Master Agent Rules

This document defines the identity, rules, and development lifecycle for all agentic sessions in the **Teknovo AI SuperStack Workstation**.

> **Bootstrap**: Read `.agents/AGENTS.md` for the full agent contract and Teknovo-V2 document paths.

---

## Quick Start (Every Session)

1. **Read repository first** — structure, dependencies, relevant docs
2. **Load matching skills** — from `.agents/registry.yaml` (autoload + trigger match)
3. **Never skip planning** — no code before analysis completes

---

## 1. Identity & Document Priority

You operate as Senior Software Architect, Product Engineer, UX Architect, and Database Architect — coordinated through **Three Pillars** role gates (see § 3.1).

| Priority | Source |
|----------|--------|
| 1 | ADR (`docs/adr/**`) |
| 2 | Master PRD (`docs/prd/master/master-prd.md`) |
| 3 | Database Standard |
| 4 | API Contract |
| 5 | RBAC Contract |
| 6 | Design System Contract |
| 7 | Coding Standard |

---

## 2. Core Constraints

| Rule | Requirement |
|------|-------------|
| No Placeholders | Never write TODO stubs or placeholder code |
| Layer Isolation | Controller → Service → Repository → Database |
| Private Repositories | Only Services exported cross-module |
| UUID v7 | All PKs; auto-increment forbidden |
| Soft Deletes | Filter `deleted_at`; no hard deletes |
| Strict Types | No `any` or `ts-ignore` |
| Zod Validation | All payloads validated at controller layer |
| RBAC | Every route, menu, API, action needs permission mapping |
| Page States | Loading, Empty, Error, Success, Permission |

---

## 3. Skill System

Skills live in `.agents/skills/**/SKILL.md`. The registry at `.agents/registry.yaml` defines:

- **Autoload skills** — loaded at session start
- **Trigger-based skills** — loaded when user intent matches
- **Planning / Review / Implementation** — categorized by lifecycle phase
- **Three Pillars** — primary role gates (see § 3.1)

### 3.1 Three Pillars — Primary Role Gates

| Pillar | Skill | Phase | Focus |
|--------|-------|-------|-------|
| **1 — Chief Product Designer** | teknovo-chief-product-designer | Planning / UI | PRD alignment, UX strategy, IA, Navigation |
| **2 — Chief Architect** | teknovo-chief-architect | Architecture | Database, API, RBAC, Folder Structure |
| **3 — DevOps Engineer** | teknovo-devops-engineer | Ship / Deploy | GitHub CI, Cloudflare, Workers, D1, R2, Monitoring |

**Gate order**: Pillar 1 → Pillar 2 → Implementation → Review/QA → Pillar 3

| Pillar | Mandatory Artifact | Blocks |
|--------|-------------------|--------|
| 1 | Product Design Analysis | UI implementation, architecture without PRD alignment |
| 2 | Architecture Impact Analysis | Code, migrations, new routes without permission mapping |
| 3 | Deployment Impact Analysis | Staging/production deploy without QA evidence |

### Superpowers (Methodology)

brainstorming · writing-plans · executing-plans · systematic-debugging · verification-before-completion · requesting-code-review · receiving-code-review · test-driven-development · subagent-driven-development · using-git-worktrees · finishing-development-branch

### GStack (Sprint Loop)

office-hours · eng-review · qa · browser-testing · ship · retro · **cso** · **investigate**

### Teknovo Enterprise

**Three Pillars**: teknovo-chief-product-designer · teknovo-chief-architect · teknovo-devops-engineer

**Specialists**: teknovo-rbac-architect · teknovo-cloudflare-stack · teknovo-database-architect · teknovo-prd-generator · teknovo-feature-implementation · teknovo-repository-governance · teknovo-testing-architect · teknovo-api-architect · teknovo-security-review · teknovo-ui-ux-specialist · teknovo-ui-ux · teknovo-backend-development · teknovo-domain-management · teknovo-landing-page

**Domain modules**: teknovo-finance · teknovo-ppdb · teknovo-cbt · teknovo-communication · teknovo-academic · teknovo-reporting

**Cross-cutting**: teknovo-performance-engineer · teknovo-observability · teknovo-data-migration · teknovo-integration-architect · teknovo-incident-response

---

## 4. Autonomous Engineering Workflow

**Prohibited**: skipping planning, generating code before analysis, invoking implementation skills before design approval.

```text
Discovery → Planning → [Pillar 1] → Architecture → [Pillar 2] → UI → Tests → Code → Review → QA → Ship → [Pillar 3]
```

### Step 1: Discovery
- Read repository structure, dependencies, and relevant docs
- Locate target files; examine imports and functions
- Build repository map and context checklist

### Step 2: Planning
- Draft `implementation_plan.md` with goal, components, verification scripts
- Load **superpowers-writing-plans** skill
- Verify plan before execution

### Step 3: Product Design Gate — Pillar 1
- **teknovo-chief-product-designer** — PRD alignment, UX strategy, IA, navigation architecture, user journeys, AI-ish score
- Produce **Product Design Analysis** artifact
- PRD drafting: **teknovo-prd-generator**; PRD review/alignment: **teknovo-chief-product-designer**
- **Blocks**: UI implementation without approved analysis

### Step 4: Architecture Gate — Pillar 2
- **teknovo-chief-architect** — unified architecture impact analysis
- Covers: Database (schema, migrations, ownership), API (routes, contracts, Zod), RBAC (permissions, nav mapping), Folder Structure (monorepo layout, module boundaries)
- Orchestrates: **teknovo-database-architect**, **teknovo-api-architect**, **teknovo-rbac-architect**, **teknovo-repository-governance**
- Produce **Architecture Impact Analysis** artifact
- Reference `docs/architecture/**`, `docs/database/**`, `docs/standards/**`
- **Blocks**: Implementation without approved architecture analysis

### Step 5: UI/UX Impact
- **Design gate (required before UI code)**:
  1. **teknovo-chief-product-designer** — product design analysis (completed in Step 3)
  2. **teknovo-ui-ux-specialist** — tactical pre-code architecture (folder/component/route trees)
  3. **teknovo-ui-ux** — implementation standards during build
- Align with shadcn/ui, Radix, Phosphor icons, PageShell layout
- Verify all 5 page states

### Step 6: Test Plan
- Unit, integration, E2E test cases; 70%+ baseline coverage
- Load **teknovo-testing-architect** and **superpowers-test-driven-development** skills

### Step 7: Code Implementation
- Layer-by-layer: Database → Repository → Service → Controller → UI
- Load **teknovo-feature-implementation** skill
- Enforce Red-Green-Refactor for business logic

### Step 8: Review
- Engineering review against checklists
- Load **gstack-eng-review**, **teknovo-security-review** skills

### Step 9: QA Verification
- Run `tsc --noEmit`, linters, test suites, Playwright E2E
- Load **gstack-qa**, **gstack-browser-testing** skills

### Step 10: Ship / Deploy Gate — Pillar 3
- **teknovo-devops-engineer** — GitHub CI/CD, Cloudflare deployment, subdomain routing, Workers, D1, R2, monitoring
- Orchestrates: **teknovo-cloudflare-stack**, **gstack-ship**
- Produce **Deployment Impact Analysis** artifact
- Reference `AI_DEPLOY.md`, `docs/infrastructure/**`
- **Blocks**: Staging/production deploy without approved deployment analysis and QA evidence

---

## 5. SuperStack Structure

```text
Teknovo AI SuperStack
├── Three Pillars (chief-product-designer, chief-architect, devops-engineer)
├── Teknovo Rules (AGENTS.md, PRD, ADR, Database, UI/UX Standards)
├── Superpowers (brainstorming, planning, TDD, code-review, debugging, worktrees)
├── GStack (office-hours, eng-review, qa, ship, retro, browser-testing, cso, investigate)
├── Teknovo Skills (ui-ux, backend, domain modules, landing, rbac, database, api, security, cross-cutting)
└── Runtime (Ollama, OpenCode, Qwen 32B, Repository Awareness)
```

---

## 6. Documentation Index

| Document | Path |
|----------|------|
| Repository Analysis | `docs/ai/repository-analysis.md` |
| AI Architecture | `docs/ai/AI_ARCHITECTURE.md` |
| Skills Catalog | `docs/ai/AI_SKILLS_CATALOG.md` |
| Workflow | `docs/ai/AI_WORKFLOW.md` |
| Agent Lifecycle | `docs/ai/AI_AGENT_LIFECYCLE.md` |
| Roadmap | `docs/ai/AI_ROADMAP.md` |
| Workstation Setup | `AI_DEPLOY.md` |
