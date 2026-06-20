# AI Workstation Architecture

This document describes the conceptual architecture and runtime structure of the **Teknovo AI SuperStack Workstation**.

---

## 1. System Block Diagram

```text
       ┌────────────────────────────────────────────────────────┐
       │                 Teknovo AI SuperStack                  │
       └───────────────────────────┬────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
 ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
 │  Master Agent │         │ Agent Registry│         │  Agent Skills │
 │  (AGENTS.md)  │         │(registry.yaml)│         │ (skills/**)   │
 └───────┬───────┘         └───────┬───────┘         └───────┬───────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
         ┌───────────────────────────────────────────────────┐
         │                  Runtime Engine                   │
         │    Cursor · Ollama · Qwen 32B · OpenCode          │
         └─────────────────────────┬─────────────────────────┘
                                   │
                                   ▼
         ┌───────────────────────────────────────────────────┐
         │                 Target Repository                   │
         │                  (Teknovo V2)                       │
         │  apps/ · packages/ · docs/ · drizzle migrations     │
         └───────────────────────────────────────────────────┘
```

---

## 2. SuperStack Layers

```text
Teknovo AI SuperStack
├── Layer 1: Teknovo Rules
│   ├── AGENTS.md (master bootstrap)
│   ├── .agents/AGENTS.md (full contract)
│   ├── PRD, ADR, Database/API/RBAC/UI Standards
│   └── docs/ai/* (workstation documentation)
│
├── Layer 2: Superpowers (Methodology)
│   ├── brainstorming → writing-plans → executing-plans
│   ├── test-driven-development
│   ├── systematic-debugging → verification-before-completion
│   ├── requesting/receiving-code-review
│   ├── subagent-driven-development
│   └── using-git-worktrees → finishing-development-branch
│
├── Layer 3: GStack (Sprint Loop)
│   ├── office-hours (consultation)
│   ├── eng-review → qa → browser-testing
│   ├── ship
│   └── retro
│
├── Layer 4: Teknovo Enterprise Skills
│   ├── teknovo-feature-implementation (orchestrator)
│   ├── teknovo-database-architect · teknovo-api-architect
│   ├── teknovo-rbac-architect · teknovo-security-review
│   ├── teknovo-ui-ux · teknovo-backend-development
│   ├── teknovo-domain-management · teknovo-landing-page
│   ├── teknovo-cloudflare-stack · teknovo-prd-generator
│   ├── teknovo-repository-governance · teknovo-testing-architect
│   └── (future: finance, ppdb, cbt, wa modules)
│
└── Layer 5: Runtime
    ├── Ollama (local model server)
    ├── Qwen3 32B (reasoning model, `qwen3:32b`)
    ├── OpenCode (agent CLI)
    └── Cursor (IDE with skill autoload)
```

---

## 3. Core Components

### 3.1 Master Agent (`AGENTS.md`)

Entry point for every session. Defines identity, document priority, core constraints, 12-step workflow, and skill index. Bootstraps `.agents/AGENTS.md` for full contract details.

### 3.2 Agent Registry (`.agents/registry.yaml`)

Central skill index with four lookup mechanisms:

| Section | Purpose |
|---------|---------|
| `autoload` | Skills loaded at session start (18 skills) |
| `planning` | Requirements, design, consultation triggers |
| `implementation` | Coding, TDD, orchestration triggers |
| `review` | Quality gates, security, shipping triggers |
| `troubleshooting` | Debugging triggers |
| `skills` | Flat backward-compatible index |

### 3.3 Agent Skills (`.agents/skills/**/SKILL.md`)

Markdown files with YAML frontmatter (`name`, `description`). Each skill encapsulates a mandatory workflow — not suggestions. Skills reference Teknovo-V2 documentation paths for standards compliance.

### 3.4 Runtime Engine

| Component | Role |
|-----------|------|
| **Cursor** | Primary IDE; loads skills via agent context |
| **Ollama** | Local model execution on GPU workstation |
| **Qwen3 32B** | Core reasoning and code generation model (`qwen3:32b`) |
| **OpenCode** | Agent CLI for terminal-based autonomous sessions |

---

## 4. Data Flow

```text
User Request
    │
    ▼
AGENTS.md (bootstrap rules)
    │
    ▼
registry.yaml (match triggers → load skills)
    │
    ├── superpowers-brainstorming (if new feature)
    ├── superpowers-writing-plans (always)
    │
    ▼
12-Phase Workflow
    │
    ├── Discovery → read Teknovo-V2 docs
    ├── Planning → implementation_plan.md
    ├── Impact Analysis → architecture/database/API/RBAC/UI
    ├── Tests → Red-Green-Refactor
    ├── Code → layer-by-layer implementation
    ├── Review → eng-review + security-review
    ├── QA → vitest + Playwright
    └── Ship → merge readiness
    │
    ▼
Target Repository (Teknovo-V2)
```

---

## 5. Deployment Model

The AI SuperStack repo (`/home/coleallstar/Public/ai`) is the **source of truth** for agent configuration. It deploys into Teknovo-V2 via:

1. **Copy**: `cp -r ai/.agents Teknovo-V2/.agents && cp ai/AGENTS.md Teknovo-V2/`
2. **Symlink**: `ln -s ../ai/.agents Teknovo-V2/.agents`
3. **Git submodule**: Add ai repo as submodule at `.agents/`

See `AI_DEPLOY.md` for full workstation setup including Ollama and OpenCode configuration.

---

## 6. Design Principles

Inspired by [Superpowers](https://github.com/obra/superpowers) and [GStack](https://github.com/garrytan/gstack):

| Principle | Implementation |
|-----------|----------------|
| **Test-Driven Development** | Red-Green-Refactor enforced via TDD skill |
| **Systematic over ad-hoc** | 12-phase workflow; no skipping planning |
| **Complexity reduction** | YAGNI in brainstorming; minimal correct diffs |
| **Evidence over claims** | verification-before-completion requires test output |
| **Skills as mandatory workflows** | Registry autoload + triggers, not optional hints |
| **Teknovo standards preserved** | Every skill references actual doc paths |
