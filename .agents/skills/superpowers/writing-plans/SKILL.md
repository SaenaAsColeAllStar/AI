---
name: superpowers-writing-plans
description: Formulate and document detailed, step-by-step implementation plans before coding. Planning is mandatory before modifying any files.
---

# Writing Plans Skill

Use this skill to create standard, robust implementation plans. **Planning is mandatory before modifying any files or writing code.**

Adapted from [Superpowers writing-plans](https://github.com/obra/superpowers) with Teknovo 12-phase workflow integration.

---

## When to Activate

- After brainstorming design is approved
- Before any code implementation begins
- When user asks to "create a plan" or "how should we implement this"

---

## Plan Structure

Every plan must follow this template:

```markdown
# [Feature Name] Implementation Plan

## Goal
[One paragraph: core purpose of the change]

## User Review Required
> [!IMPORTANT]
> [Flag breaking changes, migrations, security modifications, RBAC additions]

## Proposed Changes

### Database Layer
- [NEW/MODIFY] `path/to/schema.ts` — description

### Repository Layer
- [NEW/MODIFY] `path/to/repository.ts` — description

### Service Layer
- [NEW/MODIFY] `path/to/service.ts` — description

### Controller Layer
- [NEW/MODIFY] `path/to/controller.ts` — description

### UI Layer
- [NEW/MODIFY] `path/to/page.vue` — description

## Architecture Impact
[Module boundaries, new dependencies, event flows]

## Database Impact
[Schema changes, migrations, indexes, soft-delete hooks]

## API Impact
| Method | Route | Permission | Description |
|--------|-------|------------|-------------|

## RBAC Impact
| Permission | Roles | Layer |
|------------|-------|-------|

## UI Impact
[Pages, components, 5 page states checklist]

## Test Plan
| Type | File | Scenario |
|------|------|----------|

## Verification Plan
- [ ] `pnpm tsc --noEmit` passes
- [ ] Unit tests pass (service layer)
- [ ] Integration tests pass (repository layer)
- [ ] E2E test passes (critical flow)
- [ ] Coverage meets threshold (70%+)
- [ ] eng-review checklist passes
```

---

## Task Granularity

Break work into bite-sized tasks (2-5 minutes each):

- Each task has **exact file paths**
- Each task has **verification steps**
- Each task references **which Teknovo skill applies**
- Tasks follow layer order: Database → Repository → Service → Controller → UI

---

## Guidelines

- **Be specific** — actual schema fields, endpoint signatures, component names
- **Identify risks** — migrations, API breaks, security changes, RBAC gaps
- **Enforce standards** — verify alignment with `AGENTS.md`, UUID v7, soft deletes
- **No placeholders** — every `[NEW]` entry must specify the actual file path
- **Include rollback** — note how to revert migrations or feature flags

---

## Teknovo Document Cross-References

Verify plan alignment against:

| Standard | Path |
|----------|------|
| Folder contract | `docs/architecture/folder-contract.md` |
| Database standard | `docs/standards/database/database-standard.md` |
| API contract | `docs/standards/api/api-contract.md` |
| RBAC standard | `docs/standards/rbac/rbac-standard.md` |
| Design system | `docs/standards/design-system/design-system-contract.md` |
| Testing standard | `docs/standards/testing/testing-standard.md` |

---

## Output Location

Save plan to:

```text
docs/plans/YYYY-MM-DD-<feature-name>-plan.md
```

Or `implementation_plan.md` in the working directory for active sessions.

---

## Transition

After plan is verified, invoke **superpowers-executing-plans** or **superpowers-subagent-driven-development** depending on task complexity.
