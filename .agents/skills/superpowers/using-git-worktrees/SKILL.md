---
name: superpowers-using-git-worktrees
description: Manage separate development tracks using git worktrees to keep work directories clean.
---

# Using Git Worktrees Skill

Use this skill to create isolated workspaces for parallel development tracks. Keeps the main working directory clean.

Adapted from [Superpowers using-git-worktrees](https://github.com/obra/superpowers).

---

## When to Activate

- Starting parallel feature tracks
- Subagent-driven development needs isolated branches
- Need to work on two features simultaneously without stashing
- Trigger words: worktree, parallel branch, isolated workspace

---

## Worktree Protocol

### 1. Create Worktree

```bash
# From main repo root
git worktree add ../teknovo-<feature-name> -b feature/<feature-name>
```

### 2. Setup Isolated Environment

```bash
cd ../teknovo-<feature-name>
pnpm install
cp .env.example .env.local  # if needed
```

### 3. Verify Clean Baseline

Before starting work:

```bash
pnpm tsc --noEmit          # must pass
pnpm test -- --run          # must pass
pnpm lint                   # must pass
```

If baseline is not clean, fix on main branch first.

### 4. Work in Isolation

- All changes happen in the worktree directory
- Commit frequently with descriptive messages
- Run tests after each logical change

### 5. Merge Back

When feature is complete:

```bash
# From main repo
git merge feature/<feature-name>
```

Or create PR from the worktree branch.

### 6. Cleanup

```bash
git worktree remove ../teknovo-<feature-name>
git branch -d feature/<feature-name>  # after merge
```

---

## Multi-Agent Worktree Layout

```text
/home/coleallstar/Public/
├── Teknovo-V2/                    # main worktree (main branch)
├── teknovo-attendance-db/         # worktree: feature/attendance-db
├── teknovo-attendance-api/        # worktree: feature/attendance-api
└── teknovo-attendance-ui/         # worktree: feature/attendance-ui
```

---

## Rules

- One worktree per feature track — do not share
- Each worktree gets its own branch
- Never force-push from a worktree
- Run verification before merging back
- Clean up worktrees after merge (see finishing-development-branch)

---

## Integration with Subagents

When using **superpowers-subagent-driven-development**:

1. Master agent creates worktrees
2. Each subagent operates in its worktree
3. Master agent consolidates after two-stage review
4. Master agent cleans up worktrees after ship

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Worktree already exists | `git worktree list` then remove stale ones |
| Branch already checked out | Use different branch name or remove existing worktree |
| pnpm install fails | Ensure same Node version as main repo |
| Merge conflicts | Resolve in main repo after subagent completes |
