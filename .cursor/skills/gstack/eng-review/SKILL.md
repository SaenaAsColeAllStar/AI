---
name: gstack-eng-review
description: Perform strict engineering reviews matching Teknovo's architectural layers, database rules, and code standards.
---

# Engineering Review Skill

Use this skill to review code changes. Acts as an automated Senior Software Architect ensuring strict layering and Teknovo compliance.

Modeled after [GStack /review](https://github.com/garrytan/gstack) with Teknovo standards.

---

## When to Activate

- Before requesting code review (self-review)
- After implementation complete, before QA
- User asks for engineering audit or architecture review
- Autoload: true (always available)

---

## Review Checkpoints

### 1. Architectural Layers

| Layer | Must Do | Must NOT Do |
|-------|---------|-------------|
| Controller | Zod validation, call service, wrap response | Query repository/DB directly |
| Service | Business logic, transactions, events | Raw SQL/ORM queries |
| Repository | Drizzle CRUD, filters, pagination | Export outside module |

Reference: `docs/backend/module-contract.md`, `service-contract.md`, `repository-contract.md`

### 2. Code Cleanliness

- [ ] Components ≤ 300 lines; functions ≤ 50 lines
- [ ] Strict TypeScript — no `any`, no `ts-ignore`
- [ ] No dump files: `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts`
- [ ] kebab-case file and folder names
- [ ] Contextual utility naming (not generic)

Reference: `docs/standards/coding/coding-standard.md`, `docs/architecture/folder-contract.md`

### 3. Database Rules

- [ ] UUID v7 for all primary keys
- [ ] Audit columns: `id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`
- [ ] Soft deletes only — `deleted_at IS NULL` in all reads
- [ ] Foreign keys use `RESTRICT` by default
- [ ] Migrations via Drizzle — no manual SQL on staging/prod

Reference: `docs/standards/database/database-standard.md`

### 4. API Contract

- [ ] Routes prefixed `/api/v1/`
- [ ] Response envelope: `{ success, message, data }`
- [ ] Error envelope: `{ success: false, message, errors }`
- [ ] Pagination meta on list endpoints
- [ ] OpenAPI decorators on controllers

Reference: `docs/standards/api/api-contract.md`

### 5. RBAC

- [ ] `@UseGuards(PermissionsGuard)` on all controllers
- [ ] `@RequirePermissions('domain.resource.action')` on mutations
- [ ] UI buttons/menus conditionally rendered by permission
- [ ] Route guards on frontend pages

Reference: `docs/standards/rbac/rbac-standard.md`, `docs/.cursor/gates/security/rbac-matrix.md`

### 6. UI/UX

- [ ] PageShell → PageHeader → PageContent → PageFooter
- [ ] 5 page states: Loading, Empty, Error, Success, Permission
- [ ] Phosphor/Tabler icons only — no Lucide, Bootstrap, Font Awesome
- [ ] Zod form validation with inline errors
- [ ] Breadcrumb: `Domain > Module > Page`

Reference: `docs/standards/design-system/design-system-contract.md`

### 7. Events & Queues

- [ ] Event naming: `domain.entity.action`
- [ ] Job naming: `domain.action`
- [ ] Idempotent job design
- [ ] Payload includes: eventId, correlationId, traceId, actorId, timestamp
- [ ] DLQ configured for async queues

Reference: `docs/backend/queue-contract.md`, `docs/standards/events/event-contract.md`

---

## Severity Classification

| Severity | Examples | Action |
|----------|----------|--------|
| **Critical** | Layer violation, missing RBAC, hard delete, security hole | Must fix before merge |
| **Major** | Missing test, missing page state, no soft-delete filter | Must fix before merge |
| **Minor** | Naming inconsistency, missing JSDoc | Fix or document |
| **Info** | Style suggestion | Optional |

---

## Review Output Template

```markdown
## Engineering Review: [feature/branch]

### Critical Issues (must fix)
- [ ] [issue description + file:line]

### Major Issues (must fix)
- [ ] [issue description]

### Minor Issues
- [ ] [issue description]

### Passed Checks
- [x] Layer isolation
- [x] Database standards
- [x] API contract
- [x] RBAC guards
- [x] UI page states

### Verdict: [PASS / FAIL — fix critical/major before merge]
```

---

## After Review

- **PASS** → proceed to **gstack-qa**
- **FAIL** → fix issues → re-run review → do not skip to QA
