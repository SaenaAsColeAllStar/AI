# RBAC Security â€” Teknovo Security System

> **Scope**: Role hierarchy, permission mapping, route guards, endpoint authorization, UI visibility  
> **Aligns with**: `docs/standards/rbac/rbac-standard.md`, `.cursor/skills/teknovo-rbac-architect/SKILL.md`, `AGENTS.md`  
> **Reject**: Missing authorization, role escalation, permission leaks

---

## Core Rule

> **No route. No menu. No API. No action may exist without permission mapping.**

RBAC is the primary authorization control for Teknovo. Security treats **frontend-only hiding** as a vulnerability â€” backend guards are authoritative.

---

## Role Hierarchy

Roles are **not** a substitute for permissions. Use permissions for checks; roles bundle permissions for assignment.

| Role | Scope | Security notes |
|------|-------|----------------|
| `SUPER_ADMIN` | Cross-school platform ops | Minimal count; MFA recommended; full audit |
| `ADMIN_SEKOLAH` | Single school all domains | Cannot access other schools' data |
| `ADMIN_KESISWAAN` | Student lifecycle, discipline | No finance write unless granted |
| `ADMIN_KURIKULUM` | Academic, classes, grades | Grade publish is separate permission |
| `TU` | Registry, general admin | Often overlaps read; writes scoped |
| `GURU` | Own classes, attendance, grade input | **Strict data ownership** |
| `SISWA` | Self records, CBT attempts | No peer data via ID enumeration |
| `ORANG_TUA` | Linked children only | Guardian link verified server-side |

**Reject**: Hardcoded `if (role === 'ADMIN_SEKOLAH')` for feature access â€” use `hasPermission('domain.resource.action')`.

---

## Permission Format

```text
domain.resource.action
```

Examples:

| Permission | Endpoint / UI |
|------------|---------------|
| `ppdb.applicant.verify` | POST verify applicant; button on PPDB detail |
| `finance.bill.read` | GET bills; Finance menu item |
| `finance.payment.create` | POST payment â€” **high risk** |
| `cbt.exam.start` | Start attempt; SISWA only with ownership |
| `academic.grade.input` | GURU scoped to assigned classes |

Seed permissions in migrations; update `docs/.cursor/gates/security/rbac-matrix.md` on every change.

---

## Five Access Layers (All Required)

| Layer | Implementation | Security failure mode |
|-------|----------------|----------------------|
| 1. Menu visibility | Sidebar `v-if="hasPermission(...)"` | Information disclosure (low) â€” still fix |
| 2. Route access | Nuxt middleware / route meta | Direct URL access bypass |
| 3. API access | Controller `@RequirePermissions` | **Critical** â€” data mutation/theft |
| 4. Action access | Button visibility | UX confusion; pairs with layer 3 |
| 5. Data ownership | Service filters by `school_id`, class, student link | **Critical** â€” horizontal privilege escalation |

### Layer 5 â€” Data Ownership (Mandatory)

| Role | Filter rule |
|------|-------------|
| SUPER_ADMIN | Platform scope only where explicitly designed |
| ADMIN_* | `WHERE school_id = ctx.schoolId` |
| GURU | Assigned `class_id` / `subject_id` only |
| SISWA | `WHERE student_id = ctx.studentId` |
| ORANG_TUA | `WHERE student_id IN ctx.linkedStudentIds` |

Implement in **service layer**, not controller or repository alone.

---

## Route Guards

### API (authoritative)

```typescript
@Controller('api/v1/ppdb/applicants')
@UseGuards(AuthGuard, PermissionsGuard)
export class ApplicantController {
  @Patch(':id/verify')
  @RequirePermissions('ppdb.applicant.verify')
  async verify(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.applicantService.verify(id, user);
  }
}
```

**Verify**: GET endpoints have guards â€” listing applicants without `ppdb.applicant.read` is a leak.

### Frontend (defense in depth)

```typescript
{ path: '/ppdb/applicants', meta: { permission: 'ppdb.applicant.read' } }
```

Show **Permission** page state when guard fails â€” never blank screen or silent redirect loop.

---

## Endpoint Authorization Checklist

For each new endpoint:

| # | Check | Critical |
|---|-------|----------|
| R1 | Permission string in `domain.resource.action` format | Yes |
| R2 | Guard on controller class or method | Yes |
| R3 | Permission seeded and in RBAC matrix | Yes |
| R4 | Service enforces ownership/tenancy | Yes |
| R5 | 403 returned for unauthorized (not 404 hiding) | Yes |
| R6 | Integration test: wrong role â†’ 403 | Yes |
| R7 | UI route + menu + action aligned | Yes |

**Policy on 404 vs 403**: Use 403 for authenticated users lacking permission; 404 only when resource truly absent **and** enumeration must be prevented (document per endpoint).

---

## UI Visibility Rules

| Rule | Example |
|------|---------|
| Nav derived from permission-filtered tree | Finance hidden for GURU |
| Destructive actions need delete permission | Soft delete button |
| Bulk actions need elevated permission | Bulk WA campaign |
| Export/download needs read + export permission | `finance.bill.export` |
| Cross-module links respect target permission | Link to CBT result only if `cbt.result.read` |

---

## Reject: Role Escalation & Permission Leaks

| Vulnerability | Scenario | Mitigation |
|---------------|----------|------------|
| **Horizontal escalation** | GURU A views GURU B's class grades | Service filter by assignment |
| **Vertical escalation** | SISWA POSTs admin user create | Deny by default; no public admin routes |
| **IDOR** | Change `studentId` in URL to peer UUID | Ownership check on every read/write |
| **Permission accumulation** | Role edit adds permissions without review | RBAC matrix diff in Security Review |
| **Stale session** | Demoted user retains old JWT claims | Short TTL + permission refresh from DB |
| **Wildcard overgrant** | `finance.*` on TU role | Explicit grants only |

---

## PPDB Example â€” Verification Flow

```text
Persona: ADMIN_KESISWAAN verifies PPDB applicant document
Permission: ppdb.applicant.verify
API: PATCH /api/v1/ppdb/applicants/:id/verify
Service: verify school_id matches; applicant in verifiable state
UI: Verify button on applicant detail; route /ppdb/applicants/:id
Audit: log verifier user_id, timestamp, previous/new status
```

Missing any layer â†’ **BLOCK** in Security Review.

---

## Finance Example â€” Payment Creation

High-risk mutation â€” require:

- `finance.payment.create` permission
- Idempotency key for duplicate submission
- Service validates bill belongs to same `school_id`
- Audit log append-only
- Rate limit 30 mutations/min/user

---

## Testing Requirements

| Test | Expectation |
|------|-------------|
| Unauthorized role | HTTP 403 |
| Wrong school context | Empty set or 403 â€” never other school rows |
| Missing permission in JWT | 403 after AuthGuard |
| Authorized role | 200 with scoped data only |

---

## Related

- Principles: `.cursor/gates/security/security-principles.md`
- Checklist: `.cursor/gates/security/review-checklist.md` â€” Authorization section
- Skill: `teknovo-rbac-architect`, `teknovo-security-review`
- Agent: `agents/security-reviewer.md`
