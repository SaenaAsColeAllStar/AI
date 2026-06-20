# Project Context — Teknovo AI SuperStack

> **Source**: `AGENTS.md`, `.agents/AGENTS.md`, `README.md`, `docs/ai/repository-analysis.md`  
> **Last updated**: 2026-06-20  
> **Refresh policy**: Manual on major workflow changes; partial auto via `scripts/refresh-memory.*`

---

## What This Repository Is

The **Teknovo AI SuperStack** (`SaenaAsColeAllStar/AI`) is the **agent workstation configuration repository** for autonomous development on [Teknovo V2](https://github.com/SaenaAsColeAllStar/teknovo). It is **not** the production application codebase.

| Role | Description |
|------|-------------|
| **Purpose** | Skills, agent rules, registry, AI documentation, memory system |
| **Deploys into** | Teknovo-V2 via copy, symlink, or git submodule of `.agents/` and `AGENTS.md` |
| **Runtime** | Cursor IDE, Ollama (Qwen3 32B / `qwen3:32b`), OpenCode CLI |

---

## Agent Identity

Every session operates as four coordinated roles:

- **Senior Software Architect** — layering, boundaries, ADR compliance
- **Senior Product Engineer** — PRD alignment, feature completeness
- **Senior UX Architect** — design system, page states, accessibility
- **Senior Database Architect** — schema integrity, migrations, ownership

Coordination flows through **Three Pillars** role gates (Product Designer → Chief Architect → DevOps Engineer).

---

## Document Priority (Source of Truth)

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

## Mandatory Workflow (Never Skip)

```text
Discovery → Planning → [Pillar 1] → Architecture → [Pillar 2] → UI → Tests → Code → Review → QA → Ship → [Pillar 3]
```

| Phase | Mandatory Artifact | Blocking Skill |
|-------|-------------------|----------------|
| Discovery | Repository map, context checklist | — |
| Planning | `implementation_plan.md` | superpowers-writing-plans |
| Product Design | Product Design Analysis | teknovo-chief-product-designer |
| Architecture | Architecture Impact Analysis | teknovo-chief-architect |
| UI | Pre-code architecture checklist | teknovo-ui-ux-specialist → teknovo-ui-ux |
| Tests | Test case matrix | teknovo-testing-architect, TDD |
| Code | Layer-by-layer implementation | teknovo-feature-implementation |
| Review | Review checklist pass | gstack-eng-review |
| QA | Test run evidence | gstack-qa, browser-testing |
| Ship | Deployment Impact Analysis | teknovo-devops-engineer |

**Prohibited**: Skipping planning, generating code before analysis, invoking implementation skills before design approval.

---

## Core Constraints (Non-Negotiable)

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

## Skill System

- **Location**: `.agents/skills/**/SKILL.md`
- **Registry**: `.agents/registry.yaml` — autoload (18 skills), triggers, categories
- **Total skills**: 47 (11 Superpowers + 8 GStack + 28 Teknovo)

### Three Pillars

| Pillar | Skill | Focus |
|--------|-------|-------|
| 1 | teknovo-chief-product-designer | PRD, UX, IA, Navigation |
| 2 | teknovo-chief-architect | Database, API, RBAC, Folders |
| 3 | teknovo-devops-engineer | CI, Cloudflare, Workers, D1, R2 |

### Skill Loading Protocol

1. Read `.agents/registry.yaml`
2. Load all `autoload: true` skills
3. Match user intent against `trigger` strings
4. Follow skill instructions exactly — mandatory workflows, not suggestions

---

## SuperStack Layers

```text
Teknovo AI SuperStack
├── Layer 1: Teknovo Rules (AGENTS.md, PRD, ADR, Standards)
├── Layer 2: Superpowers (brainstorming, planning, TDD, debugging, code-review)
├── Layer 3: GStack (office-hours, eng-review, qa, ship, retro, browser-testing, cso, investigate)
├── Layer 4: Teknovo Enterprise Skills (47 total including domain modules)
└── Layer 5: Runtime (Ollama, Qwen 32B, OpenCode, Cursor)
```

---

## Target Codebase (Teknovo-V2)

```text
Teknovo-V2/
├── .agents/           # Agent config (from this ai repo)
├── apps/portal/       # Nuxt.js web application
├── packages/ui/       # Shared UI components
└── docs/              # Standards, ADRs, PRDs, architecture
```

---

## Key Documentation Index (This Repo)

| Document | Path |
|----------|------|
| Master Agent Bootstrap | `AGENTS.md` |
| Full Agent Contract | `.agents/AGENTS.md` |
| Skill Registry | `.agents/registry.yaml` |
| Repository Analysis | `docs/ai/repository-analysis.md` |
| AI Architecture | `docs/ai/AI_ARCHITECTURE.md` |
| Skills Catalog | `docs/ai/AI_SKILLS_CATALOG.md` |
| Workflow | `docs/ai/AI_WORKFLOW.md` |
| Agent Lifecycle | `docs/ai/AI_AGENT_LIFECYCLE.md` |
| Roadmap | `docs/ai/AI_ROADMAP.md` |
| Workstation Setup | `AI_DEPLOY.md` |
| Memory Registry | `memory/memory-registry.yaml` |

---

## Roadmap Status (2026-06-20)

| Milestone | Status |
|-----------|--------|
| M1: Workstation Setup | ✅ Complete |
| M2: Automated Testing Rig | 🔲 Next |
| M3: Local LLM Integration | 🔲 Planned |
| M4: Production Deployment | 🔲 Planned |
| M5: Domain Module Skills | ✅ Complete (skills) |

---

## Memory System

This `memory/` directory provides long-term workstation context inspired by Claude-Mem. Load via:

```bash
python ai-agent/runtime/load-memory.py
```

Refresh repository structure via:

```bash
./scripts/refresh-memory.sh    # Linux/macOS
./scripts/refresh-memory.ps1   # Windows
```
