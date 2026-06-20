---
name: superpowers-finishing-development-branch
description: Complete development tracks, perform final compiles, and prepare for merge or PR creation.
---

# Finishing Development Branch Skill

Use this skill when all plan tasks are complete and verified. Present merge options and clean up.

Adapted from [Superpowers finishing-a-development-branch](https://github.com/obra/superpowers).

---

## When to Activate

- All plan tasks complete
- **superpowers-verification-before-completion** passed
- **gstack-eng-review** passed
- Trigger words: merge branch, finish branch, cleanup worktree

---

## Pre-Finish Checklist

- [ ] All plan tasks marked complete
- [ ] Verification evidence captured (tsc, lint, tests, coverage)
- [ ] Self-review completed (eng-review)
- [ ] No unrelated changes in diff
- [ ] Migration files included and tested
- [ ] Environment variable examples updated
- [ ] RBAC matrix updated if new permissions added

---

## Present Options to User

```markdown
## Branch Ready: feature/<name>

All verification checks passed. Choose next step:

1. **Merge locally** — merge into main branch now
2. **Create PR** — push branch and open pull request
3. **Keep branch** — leave as-is for further work
4. **Discard** — delete branch and worktree (if experimental)
```

**Note**: Only commit when user explicitly requests. Only push when user explicitly requests.

---

## Option 1: Merge Locally

```bash
git checkout main
git pull origin main
git merge feature/<name>
pnpm tsc --noEmit && pnpm test -- --run && pnpm build
```

If all pass → branch merged. Clean up worktree if used.

---

## Option 2: Create PR

Follow user PR creation rules:

1. `git status`, `git diff`, `git log` — understand changes
2. Push with `-u origin HEAD` (if user requests)
3. Create PR with summary, test plan, verification evidence
4. Load **superpowers-requesting-code-review** for PR description

---

## Option 3: Keep Branch

Document current state:

```markdown
## Branch Status: feature/<name>
- Tasks complete: X/X
- Verification: passed
- Pending: [what remains if anything]
- Worktree: [path if applicable]
```

---

## Cleanup Protocol

After merge or discard:

```bash
# Remove worktree if used
git worktree remove ../teknovo-<feature-name>

# Delete merged branch
git branch -d feature/<name>

# Prune stale worktree references
git worktree prune
```

---

## Post-Merge Verification

After merge to main:

```bash
pnpm tsc --noEmit
pnpm test -- --run
pnpm build
```

Confirm main branch is still healthy.

---

## Transition to Ship

For deployment to staging/production, invoke **gstack-ship** after branch is merged.

For sprint retrospective, invoke **gstack-retro**.
