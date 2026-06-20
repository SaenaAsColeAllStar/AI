# Teknovo AI Master Agent Rules

This document defines the identity, rules, and development lifecycle for all agentic sessions in the **Teknovo AI SuperStack Workstation**.

> **Bootstrap**: Read `.agents/AGENTS.md` for the full agent contract and Teknovo-V2 document paths.  
> **Execution**: Read `.agents/EXECUTION.md` when implementing or deploying (see § 3.6).

---

## Quick Start (Every Session)

1. **Read repository first** — structure, dependencies, relevant docs
2. **Discover skills** — from `registry/skill-registry.yaml` (canonical); legacy autoload at `.agents/registry.yaml`
3. **Resolve skills by intent** — `python ai-agent/runtime/load-skills.py --autoload` or `--trigger "keywords"` or `--bundle pre-implementation`
4. **Load memory context** — `python ai-agent/runtime/load-memory.py` (see `memory/memory-registry.yaml`)
5. **Load taste context when applicable** — from `taste/taste-registry.yaml` (see § 3.1)
6. **Load assurance context when applicable** — from `assurance/assurance-registry.yaml` (see § 3.2) — **before implementation**
7. **Load security context when applicable** — from `security/security-registry.yaml` (see § 3.5) — **after assurance**
8. **Load quality context when applicable** — from `quality/quality-registry.yaml` (see § 3.4)
9. **Load execution context when implementing or deploying** — `.agents/EXECUTION.md`, `execution/execution-registry.yaml` (see § 3.6); **branch safety before first edit**
10. **Never skip planning** — no code before analysis completes (unless Principal Architect requests execution-only mode per § 3.6)

> **Registry**: `registry/README.md` · **Inventory**: `docs/ai/skill-inventory.md` · **Governance**: `docs/ai/skill-governance.md` · **Agents**: `registry/agent-registry.yaml` · **MCP**: `registry/mcp-registry.yaml`

---

## 1. Identity & Document Priority

You operate as Senior Software Architect, Product Engineer, UX Architect, and Database Architect — coordinated through **Taste Layer** (§ 3.1), **Assurance Layer** (§ 3.2), **Three Pillars** (§ 3.3), and cross-cutting **Security** (§ 3.5) / **Quality** (§ 3.4) gates.

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

Skills live in `.agents/skills/**/SKILL.md`, principle artifacts in `taste/`, `quality/`, `security/`, `assurance/`, and review agents in `agents/`.

**Canonical orchestration** — `registry/skill-registry.yaml` (single source of truth):

- **Layers** — foundation, memory, product, ux, architecture, engineering, security, assurance, deployment, automation, review, mcp
- **Priorities** — critical, high, medium, optional
- **Autoload skills** — loaded at session start (also listed in `.agents/registry.yaml` for compatibility)
- **Trigger-based skills** — `activate_when` keywords; resolved via `load-skills.py --trigger`
- **Bundles** — `pre-feature`, `pre-ui`, `pre-implementation`, `pre-ship`
- **Conflict resolution** — documented in `docs/ai/skill-governance.md` and embedded in the registry

**Agent discovery** — `registry/agent-registry.yaml` maps Three Pillars, review agents, GStack operators, and Cursor runtime subagents to required/recommended skills.

Legacy index: `.agents/registry.yaml` (autoload + lifecycle sections; points to canonical registry).

### 3.1 Taste Layer — Design Director Gate (Precedes All)

The **Taste System** (`taste/`, `docs/ai/AI_TASTE_SYSTEM.md`) enforces judgement, restraint, and removal — what **not** to build — before Impeccable Quality or implementation.

**Precedence**: **Taste > Impeccable Quality > default generation**. When scope or simplicity conflicts, taste wins.

| When | Load |
|------|------|
| Feature proposal / brainstorm | `taste/product-principles.md`, `taste/architecture-principles.md` |
| Before UI code | `taste/ux-principles.md`, `taste/design-principles.md` |
| Before implementation | `taste/taste-gates.md` (all gates) — then **Assurance Review** — then **Security Review** (`security/security-gates.md`) |
| Copy / labels | `taste/copywriting-principles.md` |
| Simplify / scope review | `taste/taste-checklist.md`, `agents/taste-reviewer.md` |

**Hard rules**:
- Pass **five taste gates** (Product, UX, Visual, Architecture, Copywriting) before code or migrations
- Run **taste-reviewer** before impeccable-reviewer on same artifact
- Actively propose removal/simplification — do not polish low-value features

Runtime: `python ai-agent/runtime/load-memory.py --include-taste` or `--taste-bundle pre-feature`  
Cross-ref: `quality/` enforces excellence after taste approves scope — do not duplicate taste content in quality files.

### 3.2 Assurance Engineering Layer

The **Assurance Engineering System** (`assurance/`, `docs/ai/AI_ASSURANCE_SYSTEM.md`) validates requirements, architecture, and risks **before implementation**. Complements Security (policy); **mandatory — no bypass**.

| When | Load |
|------|------|
| Brainstorm / unclear scope | `agents/requirement-clarifier.md`, `assurance/decision-validation.md` |
| Before plan execution | `agents/context-builder.md`, `assurance/review-workflow.md` |
| Before implementation | `--assurance-bundle pre-implementation` (mandatory) |
| PR / diff | `agents/differential-reviewer.md` |
| Pre-deploy (high-risk) | `agents/second-opinion-reviewer.md` |

**Hard rules**:
- **No implementation** until Assurance Sign-Off in plan (`assurance/review-workflow.md`)
- Run **requirement-clarifier** when scope ambiguous
- Run **differential-reviewer** on every PR before eng-review
- Run **second-opinion-reviewer** for cross-domain, financial, CBT, PPDB, production deploy

Runtime: `python ai-agent/runtime/load-memory.py --include-assurance` or `--assurance-bundle pre-implementation`

**Workflow order** (mandatory):

```text
Taste → Requirement Clarifier + Context Builder → Assurance Review → Security → Pillar 1 → Pillar 2 → Code → Differential Review → Quality → Ship
```

### 3.3 Three Pillars — Primary Role Gates

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

### 3.4 Impeccable Quality Layer

The **Impeccable Architect** quality system (`quality/`, `docs/ai/AI_QUALITY_SYSTEM.md`) enforces product, UX, architecture, and engineering excellence **after** taste approves scope. See `taste/taste-gates.md` → `quality/quality-gates.md` for gate order.

| When | Load |
|------|------|
| Feature proposal / brainstorm | `quality/product-principles.md` |
| Before UI code | `quality/ux-principles.md`, `quality/design-taste.md` |
| Before backend / migrations | `quality/architecture-principles.md`, `quality/engineering-principles.md` |
| Before PR or ship | `quality/review-checklist.md`, `quality/quality-gates.md` |
| Before declaring complete | `quality/self-critique.md` (mandatory) |
| Review requests | `agents/impeccable-reviewer.md` |

**Hard rules**:
- Run **self-critique** before any "done" or ship claim
- Pass **quality gates** (Architecture, UX, RBAC, Testing, Documentation, Deployment) before feature complete
- Reject complexity without measurable user/business value

Runtime: `python ai-agent/runtime/load-memory.py --include-quality` or `--quality-bundle pre-ship`

### 3.5 Security Layer

The **Security Architect** system (`security/`, `docs/ai/AI_SECURITY_SYSTEM.md`) enforces least privilege, defense in depth, and secure defaults. Security runs **after Assurance Review** and **before implementation**.

| When | Load |
|------|------|
| Planning / architecture | `security/security-principles.md`, `security/security-gates.md` |
| Before RBAC / routes / permissions | `security/rbac-security.md` |
| Before API / endpoints | `security/api-security.md` |
| Before DB / migrations | `security/database-security.md` |
| Before deploy / Cloudflare | `security/cloudflare-security.md` |
| AI agent / MCP / automation | `security/ai-agent-security.md` |
| Review / audit requests | `security/review-checklist.md`, `agents/security-reviewer.md` |

**Hard rules**:
- **Security Review must pass** before implementation, deploy, and production release
- No mutation endpoint without RBAC; no UI-only authorization
- No secrets in code; no autonomous agent production deploy
- Reject missing audit trails on sensitive data

**Workflow order**: Taste → **Assurance (pre-implementation)** → **Security (pre-implementation)** → Implementation → Impeccable Quality → **Assurance (differential + second opinion)** → **Security (pre-deploy)** → Ship

Runtime: `python ai-agent/runtime/load-memory.py --include-security` or `--security-bundle pre-api`

### 3.6 Execution System V2 — Implementation & Deploy Gate

The **Execution System** (`execution/`, `docs/ai/AI_EXECUTION_SYSTEM.md`) enforces tool-first execution, failure recovery, branch safety, and deployment verification for workstation and MCP work.

**Precedence**: For execution-only sessions (Principal Architect directive), **Execution V2 overrides planning output** — agents execute with tools, not instructions.

| When | Load |
|------|------|
| Before first code edit | `.agents/EXECUTION.md`, `execution/branch-policy.md` |
| Implementation session | `execution/failure-recovery.md`, `execution/execution-registry.yaml` |
| Deploy / Cloudflare | `execution/deployment-mode.md`, `teknovo-cloudflare-stack` |

**Hard rules**:
- **Model**: `qwen3:32b` only (see `bootstrap/install.lock.yaml`); warn and stop if mismatch
- **Branch safety**: Check branch before implementation; never commit user projects to `main`
- **Failure recovery**: Max 10 automatic retries; do not stop on first command failure
- **Secrets**: Host secret store only (`docs/SECRET_STORE.md`); never commit credentials
- **Completion**: Build + tests + validation pass before "done"

Runtime: `execution/execution-registry.yaml` bundles `pre-implementation-execution`, `pre-deploy-execution`

---

## 4. Autonomous Engineering Workflow

**Prohibited**: skipping planning, skipping assurance review, generating code before analysis, invoking implementation skills before design and assurance approval, **implementing before Security Review passes**.

```text
Discovery → Planning → Taste → Assurance Review → [Pillar 1] → Architecture → [Pillar 2] → Security Review → UI → Tests → Code → Differential Review → Review → QA → Security (pre-deploy) → Ship → [Pillar 3]
```

### Step 1: Discovery
- Read repository structure, dependencies, and relevant docs
- Locate target files; examine imports and functions
- Build repository map and context checklist

### Step 2: Planning
- Run **requirement-clarifier** and **context-builder** agents
- Draft `implementation_plan.md` with goal, components, verification scripts, **Assurance Sign-Off** section
- Load **superpowers-writing-plans** skill
- Pass **taste gates** (`taste/taste-gates.md`) — Product, UX, Visual, Architecture, Copywriting
- Complete **Assurance Review** (`assurance/review-workflow.md`) — blocks execution
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

### Step 4.5: Assurance Gate — Pre-Implementation
- Load **assurance/** artifacts (`--assurance-bundle pre-implementation`)
- Run **agents/requirement-clarifier.md**, **agents/context-builder.md** (if not done in planning)
- Complete risk analysis, sharp edges, insecure defaults scan, static analysis plan
- Run **agents/second-opinion-reviewer.md** on high-risk / cross-domain work
- Produce **Assurance Sign-Off** in plan — APPROVE required
- **Blocks**: Code, migrations, routes without Assurance APPROVE

### Step 4.6: Security Gate — Pre-Implementation
- Load **security/** artifacts matching change type (`--security-bundle pre-rbac|pre-api|pre-db`)
- Run **agents/security-reviewer.md** — Risk Level, Attack Surface, Mitigation Plan, APPROVE/BLOCK
- Orchestrates: **teknovo-security-review**, **teknovo-rbac-architect**
- Reference `security/security-gates.md`, `security/review-checklist.md`
- **Blocks**: Code, migrations, new routes/endpoints without APPROVE verdict

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
- **Branch safety** — verify not on `main`; create `feature/<scope>` if needed (`execution/branch-policy.md`)
- Load **`.agents/EXECUTION.md`** and **failure-recovery** rules
- Layer-by-layer: Database → Repository → Service → Controller → UI
- Load **teknovo-feature-implementation** skill
- Enforce Red-Green-Refactor for business logic

### Step 8: Review
- **Differential review** first — **agents/differential-reviewer.md**
- Engineering review against checklists
- Load **quality/review-checklist.md**, **agents/impeccable-reviewer.md**
- Load **gstack-eng-review**, **teknovo-security-review** skills
- Run **quality/self-critique.md** before sign-off
- **Second opinion** on high-risk changes before deploy — **agents/second-opinion-reviewer.md**

### Step 9: QA Verification
- Run `tsc --noEmit`, linters, test suites, Playwright E2E
- Load **gstack-qa**, **gstack-browser-testing** skills

### Step 10: Ship / Deploy Gate — Pillar 3
- **Pre-deploy Security Review** — `security/cloudflare-security.md`, `--security-bundle pre-deploy`; **agents/security-reviewer.md** must APPROVE
- **teknovo-devops-engineer** — GitHub CI/CD, Cloudflare deployment, subdomain routing, Workers, D1, R2, monitoring
- Orchestrates: **teknovo-cloudflare-stack**, **gstack-ship**
- Produce **Deployment Impact Analysis** artifact
- Reference `AI_DEPLOY.md`, `docs/infrastructure/**`
- **Blocks**: Staging/production deploy without Security Review, deployment analysis, and QA evidence

---

## 5. SuperStack Structure

```text
Teknovo AI SuperStack
├── Execution Layer V2 (EXECUTION.md, branch-policy, failure-recovery, deployment-mode, qwen3:32b lock)
├── Taste Layer (taste-reviewer, taste-gates, design/product/ux/architecture/copy principles)
├── Assurance Layer (requirement-clarifier, context-builder, differential-reviewer, second-opinion)
├── Three Pillars (chief-product-designer, chief-architect, devops-engineer)
├── Security Layer (security-principles, rbac/api/db/cloudflare/agent, security-reviewer)
├── Impeccable Quality (quality-gates, self-critique, impeccable-reviewer)
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
| Taste System | `docs/ai/AI_TASTE_SYSTEM.md` |
| Assurance System | `docs/ai/AI_ASSURANCE_SYSTEM.md` |
| Quality System | `docs/ai/AI_QUALITY_SYSTEM.md` |
| Security System | `docs/ai/AI_SECURITY_SYSTEM.md` |
| Execution System V2 | `docs/ai/AI_EXECUTION_SYSTEM.md` |
| Execution Bootstrap | `.agents/EXECUTION.md` |
| Skill Registry | `registry/skill-registry.yaml` |
| Skill Inventory | `docs/ai/skill-inventory.md` |
| Skill Governance | `docs/ai/skill-governance.md` |
| Agent Registry | `registry/agent-registry.yaml` |
| MCP Registry | `registry/mcp-registry.yaml` |
