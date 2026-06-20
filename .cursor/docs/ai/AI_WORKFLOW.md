# AI Workstation Workflow

This document details the Claude-Code style workflow implemented in the **Teknovo AI SuperStack Workstation**, combining [Superpowers](https://github.com/obra/superpowers) methodology with [GStack](https://github.com/garrytan/gstack) sprint operations and Teknovo enterprise standards.

---

## 1. Workstation Loop Overview

Every feature request, bug fix, or chore follows the 12-stage loop:

```text
Discovery → Planning → Architecture → Database → API → RBAC → UI → Tests → Code → Review → QA → Ship
```

**Hard rule**: No phase may be skipped. No code may be written before Planning completes.

---

## 2. Phase Detail

### Phase 1: Discovery

**Goal**: Build complete context before any decisions.

**Actions**:
- Read repository structure, `package.json`, dependencies
- Read relevant ADRs, PRDs, standards from `docs/`
- Locate target files; examine imports, exports, existing patterns
- Build repository map and context checklist

**Output**: Context summary (files examined, docs read, constraints identified)

**Skills**: None required (bootstrap phase)

---

### Phase 2: Planning

**Goal**: Produce an approved implementation plan.

**Actions**:
- For new features: run **superpowers-brainstorming** first (design approval required)
- Write `implementation_plan.md` with goal, file changes, verification steps
- Flag breaking changes, migrations, security modifications
- Get plan verification before proceeding

**Output**: `implementation_plan.md`

**Skills**: `superpowers-brainstorming`, `superpowers-writing-plans`

---

### Phase 3: Architecture Impact

**Goal**: Document structural changes to the monorepo.

**Actions**:
- Plan folder structures (kebab-case naming)
- Identify new modules, packages, dependencies
- Verify against `docs/architecture/folder-contract.md`
- Check domain boundaries via `docs/architecture/data-ownership-matrix.md`

**Output**: Architecture impact section in plan

**Skills**: `teknovo-repository-governance`, `teknovo-domain-management`

---

### Phase 4: Database Impact

**Goal**: Define schema changes with migration path.

**Actions**:
- Design tables with UUID v7 PKs and full audit columns
- Plan indexes for filter/join columns
- Write Drizzle schema definitions
- Generate and review SQL migrations
- Verify soft-delete hooks and RLS requirements

**Output**: Schema delta, migration files

**Skills**: `teknovo-database-architect`

**References**: `docs/standards/database/database-standard.md`, `docs/database/schema-contract.md`

---

### Phase 5: API Impact

**Goal**: Define REST endpoints with validated contracts.

**Actions**:
- Map routes under `/api/v1/...`
- Define Zod request/response schemas
- Document JSON envelope: `{ success, message, data }`
- Add OpenAPI decorators for Swagger

**Output**: Endpoint contract table

**Skills**: `teknovo-api-architect`

**References**: `docs/standards/api/api-contract.md`, `docs/standards/api/openapi-standard.md`

---

### Phase 6: RBAC Impact

**Goal**: Map permissions to every new route and UI element.

**Actions**:
- Define permissions in `domain.resource.action` format
- Add `@RequirePermissions()` guards to controllers
- Add route guards and conditional UI rendering
- Update `docs/.cursor/gates/security/rbac-matrix.md` if new permissions

**Output**: Permission matrix delta

**Skills**: `teknovo-rbac-architect`

**References**: `docs/standards/rbac/rbac-standard.md`

---

### Phase 7: UI/UX Impact

**Goal**: Design pages matching the design system.

**Actions**:
- Structure with PageShell → PageHeader → PageContent → PageFooter
- Use shadcn/ui, Radix, Phosphor icons (never Lucide/Bootstrap)
- Implement all 5 page states: Loading, Empty, Error, Success, Permission
- Validate forms with Zod; implement table standards

**Output**: Component/state checklist

**Skills**: `teknovo-ui-ux`

**References**: `docs/standards/design-system/design-system-contract.md`

---

### Phase 8: Test Plan

**Goal**: Define test cases before writing implementation code.

**Actions**:
- Write failing unit tests for service business logic (Red)
- Write integration tests for repository CRUD
- Write E2E tests for critical user flows
- Set coverage targets: 70% baseline, 90% auth/finance, 95% payments

**Output**: Test case matrix

**Skills**: `teknovo-testing-architect`, `superpowers-test-driven-development`

**References**: `docs/standards/testing/testing-standard.md`

---

### Phase 9: Code Implementation

**Goal**: Implement layer-by-layer with TDD discipline.

**Actions**:
- Database schema and migrations first
- Repository layer with integration tests
- Service layer with unit tests (Red → Green → Refactor)
- Controller layer with Zod validation
- UI components last

**Output**: Working feature across all layers

**Skills**: `teknovo-feature-implementation`, `teknovo-backend-development`, `superpowers-executing-plans`

---

### Phase 10: Review

**Goal**: Verify code against all architectural checklists.

**Actions**:
- Check layer isolation (no controller → repository shortcuts)
- Verify UUID v7, soft deletes, audit columns
- Check RBAC guards on all endpoints
- Run security audit (CORS, JWT, rate limits)
- Verify no forbidden icons, dump files, or `any` types

**Output**: Review checklist pass/fail

**Skills**: `gstack-eng-review`, `teknovo-security-review`, `teknovo-repository-governance`

---

### Phase 11: QA Verification

**Goal**: Prove the feature works with evidence.

**Actions**:
- Run `tsc --noEmit` (zero errors)
- Run linters (zero warnings on changed files)
- Run unit and integration test suites (all pass)
- Run Playwright E2E for user flows
- Manual boundary testing (empty data, permission denied, error paths)

**Output**: Test run logs as evidence

**Skills**: `gstack-qa`, `gstack-browser-testing`, `superpowers-verification-before-completion`

---

### Phase 12: Ship

**Goal**: Prepare branch for merge.

**Actions**:
- Verify branch cleanliness (no unrelated changes)
- Update environment variable examples if needed
- Confirm migrations are included and tested
- Present merge options (merge locally, create PR, keep branch)
- Clean up git worktrees if used

**Output**: Merge-ready branch

**Skills**: `gstack-ship`, `superpowers-finishing-development-branch`, `superpowers-requesting-code-review`

---

## 3. Workflow Variants

### Bug Fix (Short Path)

```text
Discovery → systematic-debugging → Fix → Verify → Review → Ship
```

Planning is abbreviated but verification is never skipped.

### Consultation (No Code)

```text
Discovery → office-hours → brainstorming → writing-plans (save only)
```

Use when requirements are ambiguous or architectural decisions are needed.

### Parallel Work (Multi-Agent)

```text
Discovery → Planning → git-worktrees → subagent-driven-development → Consolidate → Review → Ship
```

Each subagent gets isolated worktree, file boundaries, and verification criteria.

---

## 4. Anti-Patterns

| Anti-Pattern | Correct Behavior |
|--------------|------------------|
| Jump straight to coding | Run brainstorming + writing-plans first |
| Skip RBAC "for now" | Map permissions in Phase 6 before Phase 9 |
| Write tests after code | Red-Green-Refactor: tests before implementation |
| Claim "done" without test output | verification-before-completion requires evidence |
| Use Lucide icons "temporarily" | Phosphor/Tabler only, from Phase 7 |
| Hard delete for cleanup | Soft delete via `deleted_at` always |
