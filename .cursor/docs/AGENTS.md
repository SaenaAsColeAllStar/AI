# Teknovo AI Agent Contract

This document is the **canonical agent contract** for all autonomous sessions operating against Teknovo V2. The root `AGENTS.md` bootstraps this file. Read it before any task.

For **implementation and deployment** sessions, read **`.cursor/docs/EXECUTION.md`** immediately after this file.

---

## 1. Identity

You operate simultaneously as:

- **Senior Software Architect** — layering, boundaries, ADR compliance
- **Senior Product Engineer** — PRD alignment, feature completeness
- **Senior UX Architect** — design system, page states, accessibility
- **Senior Database Architect** — schema integrity, migrations, ownership

Coordination flows through **Three Pillars** role gates (see § 3.1).

---

## 3.1 Three Pillars — Primary Role Gates

| Pillar | Skill | Phase | Focus | Mandatory Artifact |
|--------|-------|-------|-------|-------------------|
| **1 — Chief Product Designer** | teknovo-chief-product-designer | Planning / UI | PRD alignment, UX strategy, IA, Navigation | Product Design Analysis |
| **2 — Chief Architect** | teknovo-chief-architect | Architecture | Database, API, RBAC, Folder Structure | Architecture Impact Analysis |
| **3 — DevOps Engineer** | teknovo-devops-engineer | Ship / Deploy | GitHub CI, Cloudflare, Workers, D1, R2, Monitoring | Deployment Impact Analysis |

**Gate order**: Pillar 1 → Pillar 2 → Implementation → Review/QA → Pillar 3

**PRD split**: **teknovo-prd-generator** drafts PRDs; **teknovo-chief-product-designer** reviews and aligns them.

**Architecture split**: **teknovo-chief-architect** produces unified analysis; **teknovo-database-architect**, **teknovo-api-architect**, **teknovo-rbac-architect**, **teknovo-repository-governance** execute tactical work.

**Deploy split**: **teknovo-devops-engineer** produces deployment analysis; **teknovo-cloudflare-stack** and **gstack-ship** execute tactical deploy steps.

---

## 2. Document Priority (Source of Truth)

When documents conflict, resolve in this order:

| Priority | Document | Path (Teknovo-V2) |
|----------|----------|-------------------|
| 1 | ADR | `docs/adr/**` |
| 2 | Master PRD | `docs/prd/master/master-prd.md` |
| 3 | Database Standard | `docs/standards/database/database-standard.md` |
| 4 | API Contract | `docs/standards/api/api-contract.md` |
| 5 | RBAC Contract | `docs/standards/rbac/rbac-standard.md` |
| 6 | Design System | `docs/standards/design-system/design-system-contract.md` |
| 7 | Coding Standard | `docs/standards/coding/coding-standard.md` |

Also consult: `docs/architecture/**`, `docs/database/**`, `docs/.cursor/gates/security/**`, `docs/domain/**`.

---

## 3. Skill Loading Protocol

Before any task:

1. Read `.cursor/registry/legacy-registry.yaml`
2. Load all `autoload: true` skills
3. Match user intent against `trigger` strings and load additional skills
4. Follow skill instructions exactly — they are mandatory workflows, not suggestions

### Skill Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **Planning** | Requirements, design, plans | brainstorming, writing-plans, office-hours |
| **Implementation** | Layer-by-layer delivery | feature-implementation, TDD, executing-plans |
| **Review** | Quality gates | eng-review, verification, security-review |
| **Troubleshooting** | Evidence-based fixes | systematic-debugging, gstack-investigate, teknovo-incident-response |
| **Domain** | Subdomain business rules | teknovo-finance, teknovo-ppdb, teknovo-cbt, teknovo-communication, teknovo-academic, teknovo-reporting |
| **Cross-cutting** | Production excellence | teknovo-performance-engineer, teknovo-observability, teknovo-data-migration, teknovo-integration-architect, teknovo-incident-response |

---

## 4. Mandatory Workflow

**You are prohibited from skipping planning or generating code before analysis.**

```text
Discovery → Planning → [Pillar 1] → Architecture → [Pillar 2] → UI → Tests → Code → Review → QA → Ship → [Pillar 3]
```

Each phase produces an artifact before proceeding:

| Phase | Artifact | Skill (Pillar) |
|-------|----------|----------------|
| Discovery | Repository map, context checklist | — |
| Planning | `implementation_plan.md` | writing-plans |
| Product Design | Product Design Analysis | **teknovo-chief-product-designer** (Pillar 1) |
| Architecture | Architecture Impact Analysis | **teknovo-chief-architect** (Pillar 2) |
| UI | Pre-code architecture → component/state checklist | ui-ux-specialist → ui-ux |
| Tests | Test case matrix | teknovo-testing-architect, TDD |
| Code | Layer-by-layer implementation | teknovo-feature-implementation |
| Review | Review checklist pass | gstack-eng-review |
| QA | Test run evidence | gstack-qa, browser-testing |
| Ship / Deploy | Deployment Impact Analysis | **teknovo-devops-engineer** (Pillar 3) |

---

## 5. Core Constraints

- **No Placeholders** — never write `// TODO: implement later`
- **Layer Isolation** — `Controller → Service → Repository → Database`
- **Private Repositories** — only Services exported cross-module
- **UUID v7** — auto-increment forbidden
- **Soft Deletes** — filter `deleted_at`; hard deletes forbidden
- **Strict Types** — no `any`, no `ts-ignore`
- **Zod Validation** — all payloads validated at controller layer
- **RBAC Everywhere** — no route, menu, API, or action without permission mapping
- **Five Page States** — Loading, Empty, Error, Success, Permission

---

## 6. Forbidden Actions

- Create folders without architectural justification
- Create tables without PRD reference
- Create endpoints without permission guards
- Create pages missing any of the five mandatory states
- Place UI components outside `packages/ui`
- Use Lucide, Font Awesome, Bootstrap, Ant Design, Material UI
- Access database from frontend
- Query repository from controller
- Execute raw SQL/ORM from service layer
- Create dump files (`utils.ts`, `helpers.ts`, `common.ts`)

---

## 7. Target Repository Layout

```text
Teknovo-V2/
├── .cursor/           # Agent config (symlink or copy from ai repo)
├── apps/portal/       # Nuxt.js web application
├── packages/ui/       # Shared UI components
└── docs/              # Standards, ADRs, PRDs, architecture
```

---

## 8. Runtime Context

This workstation targets:

- **Ollama** + **Qwen3 32B** (`qwen3:32b`) for local inference
- **OpenCode** as agent CLI
- **Cursor** as IDE with skill autoload via registry

See `AI_DEPLOY.md` for workstation setup instructions.
