---
name: superpowers-executing-plans
description: Track and systematically execute the approved implementation plan using checklist tasks with verification at each step.
---

# Executing Plans Skill

Use this skill to execute an approved implementation plan systematically. Work through tasks in order with verification at each step.

Adapted from [Superpowers executing-plans](https://github.com/obra/superpowers).

---

## When to Activate

- An approved plan exists (`implementation_plan.md` or `docs/plans/*-plan.md`)
- User says "execute the plan", "implement this", "go ahead"
- Single-agent execution (not delegating to subagents)

---

## Execution Protocol

### 1. Load Plan
- Read the full plan document
- Create task checklist (TodoWrite or markdown checklist)
- Identify dependencies between tasks

### 2. Execute Layer-by-Layer

Follow Teknovo layer order strictly:

```text
Database → Repository → Service → Controller → UI
```

For each task:

1. **Read** surrounding code for conventions
2. **Write failing test** (if service/repository layer) — invoke TDD skill
3. **Implement** minimal code to pass
4. **Verify** task-specific checks from plan
5. **Mark complete** before proceeding to next task

### 3. Checkpoint Reviews

After completing each layer, pause and verify:

| Layer Complete | Verification |
|----------------|-------------|
| Database | Migration generates cleanly; schema has audit columns |
| Repository | Integration tests pass; soft-delete filters present |
| Service | Unit tests pass; no raw SQL/ORM in service |
| Controller | Zod validation present; RBAC guards applied |
| UI | 5 page states implemented; Phosphor icons only |

### 4. Human Checkpoints

For plans with `[USER REVIEW REQUIRED]` flags:
- Stop and present progress
- Wait for approval before continuing
- Document user decisions in plan

---

## Batch Execution Rules

- Execute tasks in plan order — do not skip ahead
- If a task fails verification, fix before proceeding (invoke systematic-debugging if needed)
- Do not add tasks not in the plan (YAGNI)
- Keep diffs minimal and focused per task

---

## Progress Reporting

Update plan checklist as tasks complete:

```markdown
- [x] Task 1: Create student_attendance schema
- [x] Task 2: Generate migration
- [ ] Task 3: Create attendance repository ← current
```

---

## Completion Criteria

All plan tasks verified → invoke **superpowers-verification-before-completion** → then **gstack-eng-review**.

Do NOT declare done without running the full verification suite.

---

## When to Switch to Subagents

If plan has 3+ independent tracks (e.g., backend + frontend + migration), switch to **superpowers-subagent-driven-development** instead of executing sequentially.
