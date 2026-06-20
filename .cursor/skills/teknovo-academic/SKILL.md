---
name: teknovo-academic
description: Academic domain specialist — teachers, subjects, classes, schedules, attendance, assessments, grades, and report cards for Teknovo ERP.
---

# Teknovo Academic Domain Skill

Use this skill for **Academic Affairs**: teachers, subjects, academic years, semesters, classes, schedules, attendance, assessments, grades, and report cards.

**Differentiation**: Academic is the **hub of teaching activity** — CBT, Finance (class-based billing), and Reporting consume it. Unlike generic backend work, enforce academic-year-driven rules and teacher assignment boundaries.

---

## When to Activate

- Class management, schedules, attendance, grading, report cards
- Teacher assignments, subject configuration
- Academic year / semester transitions
- Trigger examples: "akademik", "kelas", "absensi", "nilai", "rapor", "jadwal", "guru", "academic module"

---

## Primary Documentation

| Document | Path |
|----------|------|
| Academic Domain | `docs/domain/academic-domain.md` |
| Student Domain | `docs/domain/student-domain.md` |
| Data ownership | `docs/architecture/data-ownership-matrix.md` |
| Event catalog | `docs/architecture/domain-event-catalog.md` |
| RBAC matrix | `docs/.cursor/gates/security/rbac-matrix.md` |

Subdomain: `erp.domain.sch.id` (core ERP) · Schema: `academic`

---

## Domain Principles

### Academic Year Driven

- Most entities scoped to active academic year + semester
- Year rollover is explicit workflow — not implicit date change

### Teacher Assignment Scope

- Teachers operate only on assigned classes/subjects
- RBAC + service-layer checks — not UI-only hiding

### Student Membership

- Class membership references Student Domain
- Academic owns enrollment in class, not canonical student profile

### Audit First

- Grade changes, attendance corrections post-lock require audit + permission

---

## Aggregate Roots

Teacher · Subject · Academic Year · Semester · Class · Class Membership · Teaching Assignment · Schedule · Attendance · Assessment · Grade · Report Card

---

## Key Workflows

### Academic Year Rollover

```text
Close Active Year → Archive Read-only → Open New Year → Promote Classes → Reassign Teachers
```

Coordinate with **teknovo-data-migration** for bulk promotions.

### Attendance

- States per session: present, absent, late, excused
- Events: `academic.attendance.recorded`, `academic.attendance.absent` → WA optional

### Grading & Report Card

```text
Assessment → Grade Entry → Review → Lock → Report Card Generate → Publish
```

Locked grades immutable — corrections via official amendment workflow.

---

## Events

| Event | Subscribers |
|-------|-------------|
| `academic.year.opened` | Reporting, Finance (fee rules) |
| `academic.attendance.absent` | **teknovo-communication** |
| `academic.reportcard.published` | WA, Reporting |

---

## RBAC Checklist

- [ ] Teacher scoped to assignments
- [ ] Admin vs academic staff separation
- [ ] Parent/student read-only views where applicable
- [ ] Grade lock permission distinct from grade entry

---

## Handoff Matrix

| Task | Skill |
|------|-------|
| CBT exam linkage | **teknovo-cbt** |
| Class-based billing | **teknovo-finance** |
| Dashboards/exports | **teknovo-reporting** |
| UX for complex forms | **teknovo-ui-ux-specialist** |

---

## Mandatory Output Template

```markdown
## Academic Domain Analysis: [feature]

### Academic Year Scope
- Year: [ ]
- Semester: [ ]

### Entities Touched
- [aggregates]

### Teacher/Class Scope Rules
- [ ]

### Workflow / State Machine
[ ]

### Events
- Published: [ ]
- Subscribers: [ ]

### RBAC
- [permissions]

### Test Cases
- [ ] Year scoping enforced
- [ ] Teacher cannot access unassigned class
- [ ] Grade lock immutability

### Verdict: [ready / blocked]
```
