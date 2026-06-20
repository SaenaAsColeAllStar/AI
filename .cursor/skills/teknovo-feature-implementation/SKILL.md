---
name: teknovo-feature-implementation
description: Implement end-to-end features systematically across the database, repository, service, controller, and UI layers.
---

# Teknovo Feature Implementation Skill

Use this skill when developing any new user feature. Proceed **layer-by-layer** — never skip layers or implement UI before backend is tested.

---

## Implementation Order

```text
Database → Repository → Service → Controller → API Contract → UI Page
```

Each layer must be complete and tested before proceeding to the next.

---

## Layer 1: Database

**Skill**: `teknovo-database-architect`

1. Define Drizzle schema in domain schema file
2. Include all audit columns (UUID v7, timestamps, soft delete)
3. Generate migration: `pnpm drizzle-kit generate`
4. Review SQL migration before applying
5. Apply: `pnpm drizzle-kit migrate`

**Reference**: `docs/standards/database/database-standard.md`, `docs/database/drizzle-contract.md`

---

## Layer 2: Repository

**Skill**: `teknovo-backend-development`

1. Create `<domain>.repository.ts` (private to module)
2. Implement CRUD with soft-delete filters on all reads
3. Use Drizzle query builder — no raw SQL unless justified
4. Return typed entities, not raw DB rows
5. Write integration tests with transactional rollback

```typescript
// Pattern: all reads filter soft deletes
const results = await db
  .select()
  .from(table)
  .where(and(eq(table.id, id), isNull(table.deletedAt)));
```

**Reference**: `docs/backend/repository-contract.md`

---

## Layer 3: Service

**Skill**: `teknovo-backend-development`, `superpowers-test-driven-development`

1. Create `<domain>.service.ts` (exported from module)
2. Implement business logic, validations, transactions
3. Call repository methods — never query DB directly
4. Throw typed exceptions: `ValidationError`, `UnauthorizedError`, `NotFoundError`
5. Publish domain events via BullMQ where applicable
6. Write unit tests FIRST (Red-Green-Refactor)

**Reference**: `docs/backend/service-contract.md`

---

## Layer 4: Controller

**Skill**: `teknovo-api-architect`, `teknovo-rbac-architect`

1. Create `<domain>.controller.ts`
2. Define Zod schemas for request validation
3. Apply RBAC guards: `@UseGuards(PermissionsGuard)` + `@RequirePermissions()`
4. Call service methods — never repository
5. Wrap responses in standard envelope: `{ success, message, data }`
6. Add OpenAPI/Swagger decorators

```typescript
@Post()
@UseGuards(PermissionsGuard)
@RequirePermissions('academic.attendance.create')
async create(@Body() body: CreateAttendanceDto) {
  const parsed = createAttendanceSchema.parse(body);
  const result = await this.attendanceService.create(parsed);
  return { success: true, message: 'Attendance recorded', data: result };
}
```

**Reference**: `docs/standards/api/api-contract.md`

---

## Layer 5: UI Page

**Skill**: `teknovo-ui-ux`

1. Create page in `apps/portal/pages/` or component in `packages/ui/`
2. Structure: PageShell → PageHeader → PageContent → PageFooter
3. Implement all 5 page states
4. Use TanStack Query for data fetching
5. Validate forms with Zod (shared schema with backend)
6. Conditional rendering based on RBAC permissions
7. Phosphor icons only

**Reference**: `docs/standards/design-system/design-system-contract.md`

---

## Cross-Cutting Requirements

Every feature must also address:

| Concern | Skill | Check |
|---------|-------|-------|
| Domain ownership | teknovo-domain-management | Tables owned by correct domain |
| RBAC | teknovo-rbac-architect | Permissions on API + UI |
| Events | teknovo-backend-development | Domain events published |
| Audit | teknovo-database-architect | Audit log on mutations |
| Tests | teknovo-testing-architect | Coverage meets threshold |

---

## Feature Completion Checklist

- [ ] Database schema with migration
- [ ] Repository with integration tests
- [ ] Service with unit tests (TDD)
- [ ] Controller with Zod + RBAC
- [ ] UI with 5 page states
- [ ] Domain events published (if cross-domain impact)
- [ ] RBAC matrix updated
- [ ] eng-review passed
- [ ] QA passed with evidence

---

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|-----------------|
| Build UI first | Database → Repository → Service → Controller → UI |
| Skip repository tests | Integration tests mandatory |
| Skip service tests | Unit tests mandatory (TDD) |
| Controller calls repository | Controller → Service → Repository |
| Hard delete in service | Soft delete via repository |
| UI in apps/ instead of packages/ui | Shared components in packages/ui |
