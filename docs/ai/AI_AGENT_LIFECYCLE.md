# AI Agent Lifecycle

State transitions and execution contexts for agents and subagents in the **Teknovo AI SuperStack Workstation**.

---

## 1. Agent State Machine

```text
 ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
 │     Idle     ├─────►│  Discovery   ├─────►│   Planning   │
 └──────▲───────┘      └──────────────┘      └──────┬───────┘
        │                                            │
        │              ┌──────────────┐      ┌───────▼───────┐
        │              │   Impact     │◄─────┤  (Brainstorm) │
        │              │  Analysis    │      └───────────────┘
        │              │ (Arch/DB/API │
        │              │  /RBAC/UI)   │
        │              └──────┬───────┘
        │                     │
        │              ┌──────▼───────┐
        │              │  Execution   │
        │              │  (TDD Code)  │
        │              └──────┬───────┘
        │                     │
 ┌──────┴───────┐      ┌──────▼───────┐
 │   Shipping   │◄─────┤  Review & QA │
 └──────────────┘      └──────────────┘
```

### State Descriptions

| State | Entry Condition | Actions | Exit Condition |
|-------|----------------|---------|----------------|
| **Idle** | Session initialized | Wait for user instruction | User sends task |
| **Discovery** | Task received | Read repo, docs, target files | Context checklist complete |
| **Planning** | Discovery complete | Brainstorm (if new), write plan | Plan verified/approved |
| **Impact Analysis** | Plan approved | Document arch/DB/API/RBAC/UI impacts | All impact sections written |
| **Execution** | Impact analysis complete | TDD layer-by-layer implementation | All plan tasks complete |
| **Review & QA** | Code complete | eng-review, security, test runs | All checks pass with evidence |
| **Shipping** | QA passed | Merge prep, cleanup, PR | Branch merged or PR created |

---

## 2. Skill Activation by State

| State | Required Skills | Optional Skills |
|-------|----------------|-----------------|
| Discovery | (autoload only) | — |
| Planning | brainstorming, writing-plans | office-hours, prd-generator |
| Impact Analysis | database-architect, api-architect, rbac-architect, ui-ux | domain-management, repository-governance |
| Execution | feature-implementation, TDD, executing-plans | backend-development, cloudflare-stack |
| Review & QA | eng-review, security-review, verification-before-completion | qa, browser-testing, testing-architect |
| Shipping | ship, finishing-development-branch | requesting-code-review |

---

## 3. Multi-Agent Orchestration

When tasks require concurrent or specialized tracks, the master agent spawns subagents.

### 3.1 Orchestration Pattern

```text
Master Agent
    │
    ├── Define interfaces (work directory, file boundaries, prompt)
    ├── Create git worktree (using-git-worktrees skill)
    │
    ├── Subagent A: Database + Repository layer
    ├── Subagent B: Service + Controller layer
    ├── Subagent C: UI components
    │
    ├── Two-stage review per subagent:
    │   1. Spec compliance (does it match the plan?)
    │   2. Code quality (does it match Teknovo standards?)
    │
    └── Consolidate → resolve conflicts → run verification suite
```

### 3.2 Subagent Contract

Each subagent prompt must include:

1. **Scope boundary** — exact files/directories allowed to modify
2. **Interface definition** — inputs/outputs expected from other subagents
3. **Verification criteria** — tests that must pass before reporting complete
4. **Standards reference** — which Teknovo skills apply to this subtask
5. **No-go zones** — files/domains that must not be touched

### 3.3 Consolidation Protocol

When subagents complete:

1. Pull changes from each worktree into integration branch
2. Resolve merge conflicts (master agent owns resolution)
3. Run full verification suite (`tsc`, lint, unit, integration, E2E)
4. Run eng-review on consolidated diff
5. Only then proceed to Shipping state

---

## 4. Session Lifecycle Events

| Event | Action |
|-------|--------|
| Session start | Load autoload skills from registry |
| User message | Match triggers → load additional skills |
| Context compaction | Re-read AGENTS.md and active skill instructions |
| Task complete | Run verification-before-completion |
| Session end | Document decisions in plan or ADR if architectural |

---

## 5. Error Recovery Transitions

| Failure | Transition |
|---------|------------|
| Compile error during execution | Execution → systematic-debugging → Execution |
| Test failure during QA | Review & QA → systematic-debugging → Execution |
| Review finds layer violation | Review & QA → Execution (fix) → Review & QA |
| Blocker during planning | Planning → office-hours → Planning |
| Subagent produces non-compliant code | Reject → respawn with clearer boundaries |

**Rule**: Never transition to Shipping without verification evidence.

---

## 6. Branch Lifecycle

```text
main
 └── feature/<name>          (using-git-worktrees creates isolated copy)
      ├── Subagent worktrees (parallel tracks)
      ├── Integration merge
      ├── QA verification
      └── PR → main           (finishing-development-branch)
           └── cleanup worktrees
```

See `superpowers-using-git-worktrees` and `superpowers-finishing-development-branch` skills for detailed procedures.
