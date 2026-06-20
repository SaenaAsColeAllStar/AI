---
name: teknovo-repository-governance
description: Enforce Monorepo structure, folder contracts, naming conventions, and forbid dump files.
---

# Teknovo Repository Governance Skill

Use this skill when auditing files, naming folders, organizing monorepo dependencies, or reviewing architecture impact.

**Reference**: `docs/architecture/folder-contract.md`, `docs/adr/ADR-001-monorepo.md`, `docs/adr/package-ownership.md`

---

## Monorepo Layout

```text
Teknovo-V2/
├── apps/
│   └── portal/                 # Nuxt.js web application
│       └── src/
│           ├── modules/        # Domain modules (backend)
│           └── pages/          # Nuxt pages (frontend routes)
├── packages/
│   └── ui/                     # Shared UI components ONLY
├── docs/                       # Standards, ADRs, PRDs
├── drizzle/                    # Migrations
└── pnpm-workspace.yaml
```

**Rules**:
- Applications in `apps/` — never in root
- Shared packages in `packages/` — never in apps
- UI components in `packages/ui/` — never in apps directly
- Documentation in `docs/` — never scattered

---

## Naming Standards

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

## Module Structure

Each backend module in `apps/portal/src/modules/<domain>/`:

```text
<domain>/
├── <domain>.module.ts
├── <domain>.controller.ts
├── <domain>.service.ts
├── <domain>.repository.ts      # PRIVATE — not exported
├── <domain>.events.ts
├── <domain>.dto.ts
├── <domain>.mapper.ts
├── <domain>.policy.ts
├── schemas/
│   └── <domain>.schema.ts      # Drizzle schema
└── __tests__/
    ├── <domain>.service.test.ts
    └── <domain>.repository.test.ts
```

---

## Forbidden Patterns

### Dump Files (Strictly Forbidden)
- `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts`, `temp.ts`
- Instead: name contextually (`class-mapper.ts`, `date-formatter.ts`)
- Or: place in shared package (`packages/shared-utils/`)

### Layer Violations
- Controller importing repository
- Service executing raw SQL/ORM
- Repository exported from module
- Frontend accessing database directly

### Component Placement
- UI components outside `packages/ui/`
- Domain logic in page components
- Business logic in Vue composables (belongs in service layer)

---

## Dependency Rules

| From | Can Import | Cannot Import |
|------|-----------|---------------|
| Controller | Service, DTO | Repository, Drizzle |
| Service | Repository, Events | Controller, UI |
| Repository | Drizzle schema | Service, Controller |
| UI (packages/ui) | Shared types, API client | Backend modules |
| UI (pages) | packages/ui, composables | Repository, Drizzle |

Cross-module: only import **Services** from other modules, never repositories.

Reference: `docs/adr/package-ownership.md`

---

## File Size Limits

| Element | Max Lines |
|---------|----------|
| Component file | 300 |
| Function/method | 50 |
| Service file | 400 |
| Repository file | 300 |

If exceeded, extract into focused sub-files.

---

## Governance Review Checklist

- [ ] All files use kebab-case naming
- [ ] No dump files present
- [ ] Components in `packages/ui/`
- [ ] Module files follow standard structure
- [ ] No layer violations in imports
- [ ] Cross-module imports are Service-only
- [ ] File sizes within limits
- [ ] New folders have architectural justification
- [ ] pnpm workspace dependencies correct

---

## New Folder Justification

Before creating a new folder, document:

1. Why existing structure doesn't fit
2. Which ADR or folder-contract section applies
3. What module/domain owns this folder
4. Alternative structures considered and rejected

If no justification → use existing structure.
