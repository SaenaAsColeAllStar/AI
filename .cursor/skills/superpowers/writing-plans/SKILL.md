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

> **Assurance gate**: Include **Assurance Sign-Off** section per `.cursor/gates/assurance/review-workflow.md`. No execution until APPROVE.

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

## Security Impact
| Control | Layer | Verification |
|---------|-------|--------------|
| RBAC permissions | API + UI | 403 test |
| Data ownership | Service | tenancy filter |
| Audit log | DB | mutation covered |
| Rate limits | API/Redis | if public/auth |

Reference: `.cursor/gates/security/security-principles.md`, `.cursor/gates/security/rbac-security.md`, `agents/security-reviewer.md`

## Taste Gate Sign-Off
| Gate | Status | Notes |
|------|--------|-------|
| 1 Product | | Removal test: |
| 2 UX | | Nav clicks: |
| 3 Visual | | |
| 4 Architecture | | |
| 5 Copy | | |

Reference: `.cursor/gates/taste/taste-gates.md` — all five must pass before execution.

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

## Assurance Sign-Off
| Step | Status | Evidence |
|------|--------|----------|
| Requirement clarification | ☐ | |
| Context build | ☐ | |
| Risk analysis | ☐ | |
| Sharp edges | ☐ | |
| Insecure defaults | ☐ | |
| Static analysis plan | ☐ | |
| Second opinion (if high-risk) | ☐ | |

**Assurance verdict**: PASS | BLOCK
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
| Product taste | `.cursor/gates/taste/product-principles.md` |
| UX taste | `.cursor/gates/taste/ux-principles.md` |
| Visual taste | `.cursor/gates/taste/design-principles.md` |
| Architecture taste | `.cursor/gates/taste/architecture-principles.md` |
| Copy taste | `.cursor/gates/taste/copywriting-principles.md` |
| Taste gates | `.cursor/gates/taste/taste-gates.md` |
| Product principles (quality) | `.cursor/gates/quality/product-principles.md` |
| UX principles (quality) | `.cursor/gates/quality/ux-principles.md` |
| Architecture principles (quality) | `.cursor/gates/quality/architecture-principles.md` |
| Engineering principles | `.cursor/gates/quality/engineering-principles.md` |
| Folder contract | `docs/architecture/folder-contract.md` |
| Database standard | `docs/standards/database/database-standard.md` |
| API contract | `docs/standards/api/api-contract.md` |
| RBAC standard | `docs/standards/rbac/rbac-standard.md` |
| Security principles | `.cursor/gates/security/security-principles.md` |
| Security gates | `.cursor/gates/security/security-gates.md` |
| Design system | `docs/standards/design-system/design-system-contract.md` |
| Testing standard | `docs/standards/testing/testing-standard.md` |
| Assurance workflow | `.cursor/gates/assurance/review-workflow.md` |
| Context builder | `agents/context-builder.md` |

---

## Pre-Execution Gate

Before invoking **superpowers-executing-plans**:

1. Run **agents/context-builder.md** — context checklist in plan
2. Complete **Assurance Review** — `.cursor/gates/assurance/review-workflow.md` with PASS verdict
3. Complete **Security Review** — `.cursor/gates/security/security-gates.md` with APPROVE

Load: `python .cursor/runtime/load-memory.py --include-assurance --assurance-bundle pre-implementation`

**Quality gate**: Plan must address product, UX, architecture, and **assurance** dimensions before execution begins.

Save plan to:

```text
docs/plans/YYYY-MM-DD-<feature-name>-plan.md
```

Or `implementation_plan.md` in the working directory for active sessions.

**Taste + security + quality gate**: Plan must include Taste Gate Sign-Off, **Security Impact section**, and address product, UX, and architecture dimensions before execution.

**Security gate**: After architecture approval, run `agents/security-reviewer.md` (APPROVE) before first code commit.

**CLI**: `python .cursor/runtime/load-memory.py --include-taste --include-assurance --include-security --include-quality --taste-bundle pre-feature --assurance-bundle pre-implementation --security-bundle planning --quality-bundle planning`

---

## Transition

After plan is verified, invoke **superpowers-executing-plans** or **superpowers-subagent-driven-development** depending on task complexity.
