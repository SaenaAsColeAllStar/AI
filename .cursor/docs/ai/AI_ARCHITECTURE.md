# AI Workstation Architecture

This document describes the conceptual architecture and runtime structure of the **Teknovo AI SuperStack Workstation**.

---

## 1. System Block Diagram

```text
       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
       â”‚                 Teknovo AI SuperStack                  â”‚
       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                   â”‚
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â–¼                         â–¼                         â–¼
 â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 â”‚  Master Agent â”‚         â”‚ Agent Registryâ”‚         â”‚  Agent Skills â”‚
 â”‚  (AGENTS.md)  â”‚         â”‚(registry.yaml)â”‚         â”‚ (skills/**)   â”‚
 â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜         â””â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚                         â”‚                         â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                   â”‚
                                   â–¼
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚                  Runtime Engine                   â”‚
         â”‚    Cursor Â· Ollama Â· Qwen 32B Â· OpenCode          â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                   â”‚
                                   â–¼
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚                 Target Repository                   â”‚
         â”‚                  (Teknovo V2)                       â”‚
         â”‚  apps/ Â· packages/ Â· docs/ Â· drizzle migrations     â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 2. SuperStack Layers

```text
Teknovo AI SuperStack
â”œâ”€â”€ Layer 1: Teknovo Rules
â”‚   â”œâ”€â”€ AGENTS.md (master bootstrap)
â”‚   â”œâ”€â”€ .cursor/docs/AGENTS.md (full contract)
â”‚   â”œâ”€â”€ PRD, ADR, Database/API/RBAC/UI Standards
â”‚   â””â”€â”€ .cursor/docs/ai/* (workstation documentation)
â”‚
â”œâ”€â”€ Layer 2: Superpowers (Methodology)
â”‚   â”œâ”€â”€ brainstorming â†’ writing-plans â†’ executing-plans
â”‚   â”œâ”€â”€ test-driven-development
â”‚   â”œâ”€â”€ systematic-debugging â†’ verification-before-completion
â”‚   â”œâ”€â”€ requesting/receiving-code-review
â”‚   â”œâ”€â”€ subagent-driven-development
â”‚   â””â”€â”€ using-git-worktrees â†’ finishing-development-branch
â”‚
â”œâ”€â”€ Layer 3: GStack (Sprint Loop)
â”‚   â”œâ”€â”€ office-hours (consultation)
â”‚   â”œâ”€â”€ eng-review â†’ qa â†’ browser-testing
â”‚   â”œâ”€â”€ ship
â”‚   â””â”€â”€ retro
â”‚
â”œâ”€â”€ Layer 4: Teknovo Enterprise Skills
â”‚   â”œâ”€â”€ teknovo-feature-implementation (orchestrator)
â”‚   â”œâ”€â”€ teknovo-database-architect Â· teknovo-api-architect
â”‚   â”œâ”€â”€ teknovo-rbac-architect Â· teknovo-security-review
â”‚   â”œâ”€â”€ teknovo-ui-ux Â· teknovo-backend-development
â”‚   â”œâ”€â”€ teknovo-domain-management Â· teknovo-landing-page
â”‚   â”œâ”€â”€ teknovo-cloudflare-stack Â· teknovo-prd-generator
â”‚   â”œâ”€â”€ teknovo-repository-governance Â· teknovo-testing-architect
â”‚   â””â”€â”€ (future: finance, ppdb, cbt, wa modules)
â”‚
â””â”€â”€ Layer 5: Runtime
    â”œâ”€â”€ Ollama (local model server)
    â”œâ”€â”€ Qwen3 32B (reasoning model, `qwen3:32b`)
    â”œâ”€â”€ OpenCode (agent CLI)
    â””â”€â”€ Cursor (IDE with skill autoload)
```

---

## 3. Core Components

### 3.1 Master Agent (`AGENTS.md`)

Entry point for every session. Defines identity, document priority, core constraints, 12-step workflow, and skill index. Bootstraps `.cursor/docs/AGENTS.md` for full contract details.

### 3.2 Agent Registry (`.cursor/registry/legacy-registry.yaml`)

Central skill index with four lookup mechanisms:

| Section | Purpose |
|---------|---------|
| `autoload` | Skills loaded at session start (18 skills) |
| `planning` | Requirements, design, consultation triggers |
| `implementation` | Coding, TDD, orchestration triggers |
| `review` | Quality gates, security, shipping triggers |
| `troubleshooting` | Debugging triggers |
| `skills` | Flat backward-compatible index |

### 3.3 Agent Skills (`.cursor/skills/**/SKILL.md`)

Markdown files with YAML frontmatter (`name`, `description`). Each skill encapsulates a mandatory workflow â€” not suggestions. Skills reference Teknovo-V2 documentation paths for standards compliance.

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
    â”‚
    â–¼
AGENTS.md (bootstrap rules)
    â”‚
    â–¼
registry.yaml (match triggers â†’ load skills)
    â”‚
    â”œâ”€â”€ superpowers-brainstorming (if new feature)
    â”œâ”€â”€ superpowers-writing-plans (always)
    â”‚
    â–¼
12-Phase Workflow
    â”‚
    â”œâ”€â”€ Discovery â†’ read Teknovo-V2 docs
    â”œâ”€â”€ Planning â†’ implementation_plan.md
    â”œâ”€â”€ Impact Analysis â†’ architecture/database/API/RBAC/UI
    â”œâ”€â”€ Tests â†’ Red-Green-Refactor
    â”œâ”€â”€ Code â†’ layer-by-layer implementation
    â”œâ”€â”€ Review â†’ eng-review + security-review
    â”œâ”€â”€ QA â†’ vitest + Playwright
    â””â”€â”€ Ship â†’ merge readiness
    â”‚
    â–¼
Target Repository (Teknovo-V2)
```

---

## 5. Deployment Model

The AI SuperStack repo (`/home/coleallstar/Public/ai`) is the **source of truth** for agent configuration. It deploys into Teknovo-V2 via:

1. **Copy**: `cp -r ai/.agents Teknovo-V2/.agents && cp ai/AGENTS.md Teknovo-V2/`
2. **Symlink**: `ln -s ../ai/.agents Teknovo-V2/.agents`
3. **Git submodule**: Add ai repo as submodule at `.cursor/`

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
