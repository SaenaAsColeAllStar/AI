---
name: teknovo-cbt
description: CBT domain specialist — question banks, exams, attempts, proctoring, grading, and immutable results for Teknovo computer-based testing.
---

# Teknovo CBT Domain Skill

Use this skill for **Computer Based Testing**: question banks, questions, exam sessions, participants, attempts, answers, results, and exam monitoring.

**Differentiation**: CBT consumes Academic Domain (subjects, classes) but owns exam integrity rules — attempt preservation and immutable published results are stricter than generic CRUD.

---

## When to Activate

- Question bank management, exam scheduling, student exam UI
- Proctoring, attempt recovery, result publication
- CBT monitoring dashboards
- Trigger examples: "CBT", "ujian online", "bank soal", "proctoring", "exam engine", "hasil ujian"

---

## Primary Documentation

| Document | Path |
|----------|------|
| CBT Domain | `docs/domain/cbt-domain.md` |
| Academic Domain (consumer) | `docs/domain/academic-domain.md` |
| Data ownership | `docs/architecture/data-ownership-matrix.md` |
| Event catalog | `docs/architecture/domain-event-catalog.md` |
| RBAC matrix | `docs/.cursor/gates/security/rbac-matrix.md` |

Subdomain: `cbt.domain.sch.id` · Schema: `cbt`

---

## Domain Principles (Non-Negotiable)

### Academic Driven

- Every exam links to Subject from Academic Domain (ID reference only)
- No local copy of subject metadata without sync strategy

### Attempt Preservation

- Answers and attempts must not be hard-deleted
- Abandon/resume flows preserve partial attempts with audit

### Immutable Result

- Published results cannot be edited — corrections via official appeal workflow with audit trail

### Audit First

- Exam start, submit, tab-switch (if monitored), proctor actions logged

---

## Aggregate Roots

Question Bank · Question · Exam Session · Exam Participant · Exam Attempt · Exam Answer · Exam Result · Exam Monitoring · Exam Log

---

## Key Workflows

### Exam Lifecycle

```text
Create Exam Session → Assign Participants → Start Attempt → Answer Questions → Submit → Auto/Manual Grade → Publish Results
```

### Question Bank

- Question types: multiple choice, essay, etc. — validate per domain spec
- Versioning: editing question after use in live exam requires new revision, not in-place mutation

### Proctoring & Monitoring

- Real-time participant status (in_progress, submitted, disconnected)
- Proctor actions: extend time, force submit, flag incident — all audited
- High-stakes exams: consider **teknovo-performance-engineer** for concurrent attempt load

### Grading

- Objective: automatic on submit
- Subjective: manual grading queue with rubric
- Partial scoring rules in service layer — not controller

---

## Events

| Event | Purpose |
|-------|---------|
| `cbt.exam.scheduled` | Notify participants (WA) |
| `cbt.attempt.started` | Monitoring, audit |
| `cbt.attempt.submitted` | Trigger grading job |
| `cbt.result.published` | Reporting, parent notification |

Jobs: `cbt.grade-attempt`, `cbt.generate-result-report`

---

## RBAC Checklist

- [ ] Teacher: manage banks/exams for assigned subjects only
- [ ] Student: attempt only own active sessions
- [ ] Proctor: monitoring without edit access to answers
- [ ] Admin: publish results — separate from grade permission

---

## UI Requirements

- Exam taker UI: timer, question navigation, autosave indicators
- Offline/disconnect: Error state with resume guidance
- Loading state during submit — prevent double submit (idempotency key)
- Results page: Permission state if not yet published

---

## Handoff Matrix

| Task | Skill |
|------|-------|
| Subject/class linkage | **teknovo-academic** |
| Exam reminders | **teknovo-communication** |
| Result PDF/export | **teknovo-reporting** |
| Load testing | **teknovo-performance-engineer** |
| Anti-cheat security review | **teknovo-security-review** |

---

## Mandatory Output Template

```markdown
## CBT Domain Analysis: [exam/feature]

### Academic Dependencies
- Subject ID: [reference pattern]
- Class/Participant source: [ ]

### Exam Session Config
- Duration, question count, shuffle rules: [ ]

### Attempt State Machine
[diagram]

### Immutability Rules
- Pre-publish edits allowed: [ ]
- Post-publish policy: [ ]

### API Endpoints
| Method | Route | Permission |

### Monitoring & Audit
- Logged actions: [ ]

### Test Cases
- [ ] Full attempt → submit → grade → publish
- [ ] Disconnect/resume
- [ ] Immutable published result
- [ ] Concurrent attempts load

### Verdict: [ready / blocked]
```
