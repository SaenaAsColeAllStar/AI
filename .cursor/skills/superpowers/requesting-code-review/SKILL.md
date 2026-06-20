---
name: superpowers-requesting-code-review
description: Draft descriptive PR descriptions and check against code review checklists before asking for feedback.
---

# Requesting Code Review Skill

Use this skill when preparing a pull request or requesting engineering review. Structure the review request for efficient, thorough feedback.

Adapted from [Superpowers requesting-code-review](https://github.com/obra/superpowers).

---

## When to Activate

- Ready to create a PR or merge request
- All verification checks have passed
- Trigger words: pull request, PR, code review, merge request

---

## Pre-Review Checklist

Before requesting review, confirm:

- [ ] **agents/differential-reviewer.md** — differential review PASS on diff
- [ ] **.cursor/gates/quality/self-critique.md** completed
- [ ] **.cursor/gates/security/review-checklist.md** applicable sections pass (Critical rows)
- [ ] **Security Reviewer** APPROVE for changes touching auth/API/DB/infra (`agents/security-reviewer.md`)
- [ ] **.cursor/gates/quality/review-checklist.md** all Critical rows pass
- [ ] **superpowers-verification-before-completion** passed with evidence
- [ ] **gstack-eng-review** self-review completed
- [ ] Plan/tasks all marked complete
- [ ] No unrelated changes in diff
- [ ] Migration files included (if schema changed)
- [ ] RBAC matrix updated (if new permissions)

---

## PR Description Template

```markdown
## Summary
- [1-3 bullet points describing what changed and why]

## Plan Reference
- Design: `docs/plans/YYYY-MM-DD-<feature>-design.md`
- Plan: `docs/plans/YYYY-MM-DD-<feature>-plan.md`

## Changes by Layer
### Database
- [schema/migration changes]

### Backend
- [service/controller changes]

### Frontend
- [UI component changes]

## RBAC Changes
| Permission | Roles | Endpoints |
|------------|-------|-----------|

## Test Plan
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E test for [critical flow]
- [ ] Manual verification steps

## Verification Evidence
| Check | Result |
|-------|--------|
| tsc --noEmit | ✅ |
| lint | ✅ |
| tests | ✅ X/X |
| coverage | ✅ X% |

## Breaking Changes
- [None / list breaking changes]

## Migration Notes
- [None / migration steps for deploy]
```

---

## Severity Classification for Known Issues

If leaving known issues for follow-up, classify:

| Severity | Definition | Blocks Merge? |
|----------|-----------|---------------|
| **Critical** | Security hole, data loss risk, layer violation | Yes |
| **Major** | Missing test, RBAC gap, missing page state | Yes |
| **Minor** | Style inconsistency, naming preference | No |
| **Info** | Suggestion for future improvement | No |

Critical and Major issues must be resolved before requesting review.

---

## Review Request Message

When asking for review:

> Please review this PR against Teknovo standards:
> - Layer isolation (Controller → Service → Repository)
> - UUID v7, soft deletes, audit columns
> - RBAC guards on all new endpoints
> - 5 page states on new UI pages
> - Coverage meets module threshold
>
> Checklist: `.cursor/gates/quality/review-checklist.md` · Security: `.cursor/gates/security/review-checklist.md` · Reviewers: `agents/impeccable-reviewer.md`, `agents/security-reviewer.md`

---

## After Review Request

Load **superpowers-receiving-code-review** when feedback arrives.
