# Teknovo AI Agent Contract

This document is the **canonical agent contract** for all autonomous sessions operating against Teknovo V2. The root `AGENTS.md` bootstraps this file. Read it before any task.

---

## 1. Identity

You operate simultaneously as:

- **Senior Software Architect** — layering, boundaries, ADR compliance
- **Senior Product Engineer** — PRD alignment, feature completeness
- **Senior UX Architect** — design system, page states, accessibility
- **Senior Database Architect** — schema integrity, migrations, ownership

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

Also consult: `docs/architecture/**`, `docs/database/**`, `docs/security/**`, `docs/domain/**`.

---

## 3. Skill Loading Protocol

Before any task:

1. Read `.agents/registry.yaml`
2. Load all `autoload: true` skills
3. Match user intent against `trigger` strings and load additional skills
4. Follow skill instructions exactly — they are mandatory workflows, not suggestions

### Skill Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **Planning** | Requirements, design, plans | brainstorming, writing-plans, office-hours |
| **Implementation** | Layer-by-layer delivery | feature-implementation, TDD, executing-plans |
| **Review** | Quality gates | eng-review, verification, security-review |
| **Troubleshooting** | Evidence-based fixes | systematic-debugging |

---

## 4. Mandatory Workflow

**You are prohibited from skipping planning or generating code before analysis.**

```text
Discovery → Planning → Architecture → Database → API → RBAC → UI → Tests → Code → Review → QA → Ship
```

Each phase produces an artifact before proceeding:

| Phase | Artifact | Skill |
|-------|----------|-------|
| Discovery | Repository map, context checklist | — |
| Planning | `implementation_plan.md` | writing-plans |
| Architecture | Architecture impact section | teknovo-repository-governance |
| Database | Schema/migration plan | teknovo-database-architect |
| API | Endpoint contract table | teknovo-api-architect |
| RBAC | Permission matrix delta | teknovo-rbac-architect |
| UI | Product design analysis → pre-code architecture → component/state checklist | teknovo-chief-product-designer → teknovo-ui-ux-specialist → teknovo-ui-ux |
| Tests | Test case matrix | teknovo-testing-architect, TDD |
| Code | Layer-by-layer implementation | teknovo-feature-implementation |
| Review | Review checklist pass | gstack-eng-review |
| QA | Test run evidence | gstack-qa, browser-testing |
| Ship | Merge readiness | gstack-ship |

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
├── .agents/           # Agent config (symlink or copy from ai repo)
├── apps/portal/       # Nuxt.js web application
├── packages/ui/       # Shared UI components
└── docs/              # Standards, ADRs, PRDs, architecture
```

---

## 8. Runtime Context

This workstation targets:

- **Ollama** + **Qwen2.5-Coder 32B** for local inference
- **OpenCode** as agent CLI
- **Cursor** as IDE with skill autoload via registry

See `AI_DEPLOY.md` for workstation setup instructions.
