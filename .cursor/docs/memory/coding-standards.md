# Coding Standards — Teknovo

> **Source**: `AGENTS.md`, `.cursor/docs/AGENTS.md`, `teknovo-backend-development`, `teknovo-api-architect`, `teknovo-database-architect`, `teknovo-repository-governance` skills  
> **Teknovo-V2 canonical**: `docs/standards/coding/coding-standard.md`  
> **Last updated**: 2026-06-20

---

## Layer Isolation (Mandatory)

```text
Request → Controller → Service → Repository → Database
```

| Layer | Responsibility | Forbidden |
|-------|----------------|-----------|
| **Controller** | Zod validation, route handling, response envelope | Direct DB/repository access |
| **Service** | Business logic, transactions, event publishing | Raw SQL/ORM queries |
| **Repository** | Drizzle CRUD, filtering, pagination | Cross-module export |
| **Database** | PostgreSQL 17+ via Drizzle | Public port exposure |

**Cross-module rule**: Only **Services** exported across modules. Repositories are **private**.

---

## TypeScript Rules

| Rule | Requirement |
|------|-------------|
| Strict types | No `any`, no `ts-ignore` |
| Validation | Zod at controller layer for all payloads |
| No placeholders | Never write `// TODO: implement later` |
| No dump files | Forbidden: `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts`, `temp.ts` |

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files & directories | kebab-case | `academic-calendar/` |
| Vue/React components | PascalCase | `ClassListTable.vue` |
| TypeScript files | kebab-case | `class.service.ts` |
| Variables & functions | camelCase | `getActiveClasses()` |
| Constants | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Database tables | snake_case | `student_attendances` |
| API routes | kebab-case | `/api/v1/student-guardians` |
| Permissions | dot.notation | `academic.class.create` |
| Domain events | dot.notation | `student.created` |

---

## Database Standards

| Rule | Requirement |
|------|-------------|
| Engine | PostgreSQL 17+ |
| Primary keys | UUID v7 — auto-increment **forbidden** |
| Audit columns | `id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` |
| Deletes | Soft only via `deleted_at` — hard deletes forbidden |
| FK default | ON DELETE RESTRICT |
| Indexes | Partial on `deleted_at`, FK columns, query patterns |
| Migrations | Generated via drizzle-kit — no manual prod edits |
| Access | Private via `127.0.0.1` only |

---

## API Contract

All routes prefixed `/api/v1/` with kebab-case resources.

### Success Response (HTTP 200/201)

```json
{
  "success": true,
  "message": "Success message details",
  "data": {}
}
```

### Error Response (HTTP 4xx/5xx)

```json
{
  "success": false,
  "message": "Error classification description",
  "errors": []
}
```

### Paginated List

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "data": [],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

**Rules**:
- Zod validation at controller layer
- Permission guard on every route
- Standard JSON envelope required

---

## Module File Structure

```text
apps/<app>/src/modules/<domain>/
├── <domain>.module.ts
├── <domain>.controller.ts
├── <domain>.service.ts
├── <domain>.repository.ts      # PRIVATE
├── <domain>.events.ts
├── <domain>.dto.ts
├── <domain>.mapper.ts
├── <domain>.policy.ts
├── schemas/<domain>.schema.ts
└── __tests__/
    ├── <domain>.service.test.ts
    └── <domain>.repository.test.ts
```

---

## RBAC Standards

| Rule | Requirement |
|------|-------------|
| Permission format | `domain.resource.action` |
| Coverage | Every route, menu, API, action button mapped |
| Guards | No orphan permissions or unguarded routes |
| Nav mapping | Sidebar nodes linked to permissions |

---

## Testing Standards

| Type | Tool | Target |
|------|------|--------|
| Unit | Vitest | Services, repositories |
| Integration | Vitest + mock DB | Repository layer |
| E2E | Playwright | User flows, 5 page states |
| Coverage baseline | 70%+ | Enforced via teknovo-testing-architect |

**TDD**: Red-Green-Refactor enforced for business logic via `superpowers-test-driven-development`.

---

## Queue & Event Standards

| Aspect | Standard |
|--------|----------|
| Engine | BullMQ + Redis |
| Event naming | `domain.entity.action` |
| Idempotency | Required |
| Retries | 3 with DLQ |
| Tracing | Correlation/trace IDs on all jobs |

---

## Forbidden Actions

- Create folders without architectural justification
- Create tables without PRD reference
- Create endpoints without permission guards
- Create pages missing any of five mandatory states
- Place UI components outside `packages/ui`
- Use Lucide, Font Awesome, Bootstrap, Ant Design, Material UI
- Access database from frontend
- Query repository from controller
- Execute raw SQL/ORM from service layer
- Create dump files

---

## Verification Commands (Before Ship)

```bash
tsc --noEmit          # Type check
# lint per project config
# vitest run
# playwright test
```

Load `superpowers-verification-before-completion` — evidence over claims.

---

## Implementation Order

```text
Database → Repository → Service → Controller → UI
```

Load `teknovo-feature-implementation` for layer-by-layer delivery.
