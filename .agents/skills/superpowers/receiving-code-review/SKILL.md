---
name: superpowers-receiving-code-review
description: Process and implement feedback received from engineering reviews systematically.
---

# Receiving Code Review Skill

Use this skill when addressing feedback from code reviews. Process feedback systematically, not reactively.

Adapted from [Superpowers receiving-code-review](https://github.com/obra/superpowers).

---

## When to Activate

- Review comments received on a PR
- User provides feedback on implementation
- Trigger words: review feedback, address comments, review changes

---

## Processing Protocol

### 1. Triage Feedback

Categorize each comment:

| Category | Action |
|----------|--------|
| **Must fix** | Layer violation, security issue, missing RBAC, missing test |
| **Should fix** | Style inconsistency, better naming, missing edge case |
| **Discuss** | Architectural disagreement — escalate via office-hours |
| **Won't fix** | Out of scope — document rationale in PR reply |

### 2. Address Must-Fix Items First

For each must-fix item:

1. Understand the concern (re-read relevant standard doc)
2. Make the minimal fix
3. Add/update test if applicable
4. Reply to comment with what changed

### 3. Verify After Changes

After addressing all feedback:

1. Re-run **superpowers-verification-before-completion**
2. Re-run **gstack-eng-review** on changed files
3. Confirm no new issues introduced

---

## Response Template

For each review comment:

```markdown
> [Original comment]

Fixed in [commit/file]. [Brief explanation of change].
```

For disagreements:

```markdown
> [Original comment]

I considered this but [rationale referencing ADR/standard doc].
Alternative approach: [proposal]. Happy to discuss.
```

---

## Common Review Feedback Patterns

| Feedback | Standard Reference | Fix |
|----------|-------------------|-----|
| "Controller queries DB directly" | Layer isolation rule | Move query to repository, call via service |
| "Missing permission guard" | RBAC standard | Add `@RequirePermissions('domain.resource.action')` |
| "No soft delete filter" | Database standard | Add `where(isNull(table.deletedAt))` |
| "Using Lucide icons" | UI/UX skill | Replace with Phosphor equivalent |
| "Missing empty state" | 5 page states rule | Add empty state component with CTA |
| "No test for this logic" | TDD skill | Write failing test, then fix |
| "Function too long" | Coding standard (50 lines) | Extract into named functions |

---

## Anti-Patterns

- Fixing only some comments and ignoring others
- Making unrelated changes while addressing feedback
- Arguing without referencing standards docs
- Disabling tests to satisfy reviewer
- Batch-replying "fixed" without actually fixing

---

## Completion

All must-fix items addressed → re-request review → invoke **superpowers-verification-before-completion**.
