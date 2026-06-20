---
name: superpowers-subagent-driven-development
description: Delegate independent subtasks to specialized subagents using defined interfaces and boundaries.
---

# Subagent-Driven Development Skill

Use this skill when a plan has 3+ independent tracks that can execute in parallel. Each subagent gets fresh context, clear boundaries, and two-stage review.

Adapted from [Superpowers subagent-driven-development](https://github.com/obra/superpowers).

---

## When to Activate

- Plan has parallel tracks (backend + frontend + migration)
- Task is large enough to benefit from specialization
- User asks to orchestrate agents or delegate tasks
- Trigger words: subagent, parallel tasks, orchestrate agents, delegate

---

## Orchestration Protocol

### 1. Decompose Plan into Subtasks

Split by **file boundaries**, not by time:

| Subagent | Scope | Files |
|----------|-------|-------|
| Agent A | Database + Repository | `schema/`, `*.repository.ts` |
| Agent B | Service + Controller | `*.service.ts`, `*.controller.ts` |
| Agent C | UI Components | `packages/ui/`, `apps/portal/pages/` |

### 2. Define Subagent Contract

Each subagent prompt must include:

```markdown
## Subagent Task: [Name]

### Scope Boundary
- ALLOWED: [exact directories/files]
- FORBIDDEN: [files other agents own]

### Interface Definition
- INPUT: [what this agent receives from others]
- OUTPUT: [what this agent produces for others]

### Standards
- Load skills: [list applicable Teknovo skills]
- Follow: [specific doc references]

### Verification Criteria
- [ ] Tests pass: [specific test command]
- [ ] No layer violations
- [ ] Coverage meets threshold

### Completion Signal
Report: files changed, tests run, any blockers
```

### 3. Create Isolated Workspaces

Use **superpowers-using-git-worktrees** to create isolated branches:

```bash
git worktree add ../teknovo-agent-a -b feature/attendance-db
git worktree add ../teknovo-agent-b -b feature/attendance-api
git worktree add ../teknovo-agent-c -b feature/attendance-ui
```

### 4. Two-Stage Review Per Subagent

When subagent reports complete:

**Stage 1: Spec Compliance**
- Does the output match the plan?
- Are all specified files created/modified?
- Do interfaces match the contract?

**Stage 2: Code Quality**
- Layer isolation respected?
- Teknovo standards met (UUID v7, soft deletes, RBAC)?
- Tests pass with evidence?

Reject and respawn if either stage fails.

### 5. Consolidate

1. Merge subagent branches into integration branch
2. Resolve conflicts (master agent owns resolution)
3. Run full verification suite
4. Run **gstack-eng-review** on consolidated diff

---

## When NOT to Use Subagents

- Simple single-file changes
- Tasks with tight coupling between layers (execute sequentially instead)
- Bug fixes (use systematic-debugging)
- When plan has fewer than 3 independent tracks

---

## Subagent Spawn Template

```
Task tool with subagent_type="generalPurpose" or "explore":

Full Repository Path: /home/coleallstar/Public/Teknovo-V2
Scope: [exact files]
Task: [specific implementation from plan]
Skills to follow: [teknovo-database-architect, teknovo-backend-development]
Verification: Run [test command] and report results
Do NOT modify: [forbidden files]
```

---

## Completion

All subagents pass two-stage review → consolidate → **superpowers-verification-before-completion** → **gstack-eng-review**.
