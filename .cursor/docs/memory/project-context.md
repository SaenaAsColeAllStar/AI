# Project Context â€” Teknovo AI SuperStack

> **Source**: `AGENTS.md`, `.cursor/docs/AGENTS.md`, `README.md`, `.cursor/docs/ai/repository-analysis.md`  
> **Last updated**: 2026-06-20  
> **Refresh policy**: Manual on major workflow changes; partial auto via `scripts/refresh-memory.*`

---

## What This Repository Is

The **Teknovo AI SuperStack** (`SaenaAsColeAllStar/AI`) is the **agent workstation configuration repository** for autonomous development on [Teknovo V2](https://github.com/SaenaAsColeAllStar/teknovo). It is **not** the production application codebase.

| Role | Description |
|------|-------------|
| **Purpose** | Skills, agent rules, registry, AI documentation, memory system |
| **Deploys into** | Teknovo-V2 via copy, symlink, or git submodule of `.cursor/` and `AGENTS.md` |
| **Runtime** | Cursor IDE, Ollama (Qwen3 32B / `qwen3:32b`), OpenCode CLI |

---

## Agent Identity

Every session operates as four coordinated roles:

- **Senior Software Architect** â€” layering, boundaries, ADR compliance
- **Senior Product Engineer** â€” PRD alignment, feature completeness
- **Senior UX Architect** â€” design system, page states, accessibility
- **Senior Database Architect** â€” schema integrity, migrations, ownership

Coordination flows through **Three Pillars** role gates (Product Designer â†’ Chief Architect â†’ DevOps Engineer).

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

Also consult: `docs/architecture/**`, `docs/database/**`, `docs/.cursor/gates/security/**`, `docs/domain/**`.

---

## Mandatory Workflow (Never Skip)

```text
Discovery â†’ Planning â†’ [Pillar 1] â†’ Architecture â†’ [Pillar 2] â†’ UI â†’ Tests â†’ Code â†’ Review â†’ QA â†’ Ship â†’ [Pillar 3]
```

| Phase | Mandatory Artifact | Blocking Skill |
|-------|-------------------|----------------|
| Discovery | Repository map, context checklist | â€” |
| Planning | `implementation_plan.md` | superpowers-writing-plans |
| Product Design | Product Design Analysis | teknovo-chief-product-designer |
| Architecture | Architecture Impact Analysis | teknovo-chief-architect |
| UI | Pre-code architecture checklist | teknovo-ui-ux-specialist â†’ teknovo-ui-ux |
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
| Layer Isolation | Controller â†’ Service â†’ Repository â†’ Database |
| Private Repositories | Only Services exported cross-module |
| UUID v7 | All PKs; auto-increment forbidden |
| Soft Deletes | Filter `deleted_at`; no hard deletes |
| Strict Types | No `any` or `ts-ignore` |
| Zod Validation | All payloads validated at controller layer |
| RBAC | Every route, menu, API, action needs permission mapping |
| Page States | Loading, Empty, Error, Success, Permission |

---

## Skill System

- **Location**: `.cursor/skills/**/SKILL.md`
- **Registry**: `.cursor/registry/legacy-registry.yaml` â€” autoload (18 skills), triggers, categories
- **Total skills**: 47 (11 Superpowers + 8 GStack + 28 Teknovo)

### Three Pillars

| Pillar | Skill | Focus |
|--------|-------|-------|
| 1 | teknovo-chief-product-designer | PRD, UX, IA, Navigation |
| 2 | teknovo-chief-architect | Database, API, RBAC, Folders |
| 3 | teknovo-devops-engineer | CI, Cloudflare, Workers, D1, R2 |

### Skill Loading Protocol

1. Read `.cursor/registry/legacy-registry.yaml`
2. Load all `autoload: true` skills
3. Match user intent against `trigger` strings
4. Follow skill instructions exactly â€” mandatory workflows, not suggestions

---

## SuperStack Layers

```text
Teknovo AI SuperStack
â”œâ”€â”€ Layer 1: Teknovo Rules (AGENTS.md, PRD, ADR, Standards)
â”œâ”€â”€ Layer 2: Superpowers (brainstorming, planning, TDD, debugging, code-review)
â”œâ”€â”€ Layer 3: GStack (office-hours, eng-review, qa, ship, retro, browser-testing, cso, investigate)
â”œâ”€â”€ Layer 4: Teknovo Enterprise Skills (47 total including domain modules)
â””â”€â”€ Layer 5: Runtime (Ollama, Qwen 32B, OpenCode, Cursor)
```

---

## Target Codebase (Teknovo-V2)

```text
Teknovo-V2/
â”œâ”€â”€ .cursor/           # Agent config (from this ai repo)
â”œâ”€â”€ apps/portal/       # Nuxt.js web application
â”œâ”€â”€ packages/ui/       # Shared UI components
â””â”€â”€ docs/              # Standards, ADRs, PRDs, architecture
```

---

## Key Documentation Index (This Repo)

| Document | Path |
|----------|------|
| Master Agent Bootstrap | `AGENTS.md` |
| Full Agent Contract | `.cursor/docs/AGENTS.md` |
| Skill Registry | `.cursor/registry/legacy-registry.yaml` |
| Repository Analysis | `.cursor/docs/ai/repository-analysis.md` |
| AI Architecture | `.cursor/docs/ai/AI_ARCHITECTURE.md` |
| Skills Catalog | `.cursor/docs/ai/AI_SKILLS_CATALOG.md` |
| Workflow | `.cursor/docs/ai/AI_WORKFLOW.md` |
| Agent Lifecycle | `.cursor/docs/ai/AI_AGENT_LIFECYCLE.md` |
| Roadmap | `.cursor/docs/ai/AI_ROADMAP.md` |
| Workstation Setup | `AI_DEPLOY.md` |
| Memory Registry | `.cursor/docs/memory/memory-registry.yaml` |

---

## Roadmap Status (2026-06-20)

| Milestone | Status |
|-----------|--------|
| M1: Workstation Setup | âœ… Complete |
| M2: Automated Testing Rig | ðŸ”² Next |
| M3: Local LLM Integration | ðŸ”² Planned |
| M4: Production Deployment | ðŸ”² Planned |
| M5: Domain Module Skills | âœ… Complete (skills) |

---

## Memory System

This `.cursor/docs/memory/` directory provides long-term workstation context inspired by Claude-Mem. Load via:

```bash
python .cursor/runtime/load-memory.py
```

Refresh repository structure via:

```bash
./scripts/refresh-memory.sh    # Linux/macOS
./scripts/refresh-memory.ps1   # Windows
```
