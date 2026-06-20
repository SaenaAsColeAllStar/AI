---
name: teknovo-rbac-architect
description: Design, implement, and audit Role-Based Access Control (RBAC) permissions across API endpoints and UI routes.
---

# Teknovo RBAC Architect Skill

Use this skill when defining roles, permissions, protecting endpoints, or showing/hiding UI navigation menus.

**Reference**: `docs/standards/rbac/rbac-standard.md`, `docs/.cursor/gates/security/rbac-matrix.md`

---

## Core Principle

> No route. No menu. No API. No action may exist without permission mapping.

RBAC is mandatory at all 5 access layers.

---

## Roles

| Role | Scope |
|------|-------|
| `SUPER_ADMIN` | Full system access |
| `ADMIN_SEKOLAH` | School settings, overall operations |
| `ADMIN_KESISWAAN` | Student management, discipline, attendance |
| `ADMIN_KURIKULUM` | Academics, classes, grading, scheduling |
| `TU` | General school administration, registry |
| `GURU` | Grade input, attendance entry, own schedules |
| `SISWA` | Exam attempts, card view, personal reports |
| `ORANG_TUA` | Monitor student progress, attendance, billing |

---

## 5 Access Layers

| Layer | Implementation | Example |
|-------|---------------|---------|
| 1. Menu Visibility | Conditional sidebar rendering | Hide "Finance" menu for GURU |
| 2. Route Access | Frontend route guard | Redirect SISWA from `/finance/*` |
| 3. API Access | Controller permission guard | `@RequirePermissions('finance.bill.read')` |
| 4. Action Access | Button/control visibility | Hide "Delete" if no permission |
| 5. Data Ownership | Service-level filtering | GURU sees only own classes |

---

## Permission Format

```text
domain.resource.action
```

Examples:
- `student.read`, `student.create`, `student.update`, `student.delete`
- `academic.class.create`, `academic.grade.input`
- `finance.bill.read`, `finance.payment.create`
- `cbt.exam.start`, `cbt.result.publish`

---

## API Layer Implementation

```typescript
@Controller('api/v1/academic/classes')
@UseGuards(AuthGuard, PermissionsGuard)
export class ClassController {
  @Post()
  @RequirePermissions('academic.class.create')
  async create(@Body() body: CreateClassDto) { ... }

  @Get()
  @RequirePermissions('academic.class.read')
  async list(@Query() query: ListClassesDto) { ... }

  @Delete(':id')
  @RequirePermissions('academic.class.delete')
  async softDelete(@Param('id') id: string) { ... }
}
```

---

## UI Layer Implementation

### Route Guard
```typescript
// middleware or route meta
{ path: '/academic/classes', meta: { permission: 'academic.class.read' } }
```

### Menu Visibility
```vue
<NavItem v-if="hasPermission('academic.class.read')" to="/academic/classes">
  Classes
</NavItem>
```

### Action Button
```vue
<button v-if="hasPermission('academic.class.create')" @click="openCreate">
  Add Class
</button>
```

### Permission Denied State (Layer 5)
```vue
<PermissionDenied v-if="!hasPermission('academic.class.read')"
  message="You don't have access to view classes." />
```

---

## RBAC Verification Checklist

For every new feature:

- [ ] Permissions defined in `domain.resource.action` format
- [ ] Permissions seeded in migration or seed script
- [ ] Controller guards on ALL endpoints (including GET)
- [ ] Frontend route guard configured
- [ ] Menu items conditionally rendered
- [ ] Action buttons conditionally rendered
- [ ] Permission denied page state implemented
- [ ] `docs/.cursor/gates/security/rbac-matrix.md` updated
- [ ] Test: unauthorized role returns 403
- [ ] Test: authorized role returns 200

---

## Data Ownership (Layer 5)

Service layer must filter data by ownership:

| Role | Data Scope |
|------|-----------|
| SUPER_ADMIN | All data |
| ADMIN_* | All data within their domain |
| GURU | Own classes, own students, own schedules |
| SISWA | Own records only |
| ORANG_TUA | Linked student records only |

Implement in service layer, not controller or repository.

---

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|-----------------|
| Public endpoint "temporarily" | Add permission guard immediately |
| Hide button but leave API open | Guard both UI and API |
| Hardcode role checks (`if role === 'GURU'`) | Use permission checks |
| Skip GET endpoint guards | All HTTP methods need guards |
| Permission in frontend only | Backend guard is authoritative |
