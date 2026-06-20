# Domain Knowledge â€” Teknovo School ERP

> **Source**: `.cursor/docs/ai/repository-analysis.md`, domain skills in `.cursor/skills/teknovo-{finance,ppdb,cbt,academic,communication,reporting}/`  
> **Last updated**: 2026-06-20  
> **Refresh policy**: Manual when domain skills or Teknovo-V2 domain docs change

---

## Domain-Driven Design Overview

Teknovo is structured around **subdomain-driven functional modules**. Each bounded context owns its data; cross-domain communication uses **domain events** (BullMQ + Redis), never direct cross-repository access.

### Event System

| Aspect | Standard |
|--------|----------|
| Engine | BullMQ + Redis |
| Event naming | `domain.entity.action` |
| Job naming | `domain.action` |
| Requirements | Idempotency, 3 retries, DLQ, correlation/trace IDs |

---

## Subdomain Map

| Subdomain | Host | Primary Purpose |
|-----------|------|-----------------|
| Portal | `portal.domain.sch.id` | Public landing, admissions funnel, school overview, news |
| PPDB | `ppdb.domain.sch.id` | Student admission â€” applicants, registration, verification, selection |
| ERP | `erp.domain.sch.id` | Core school management â€” academics, classes, grading, attendance |
| CBT | `cbt.domain.sch.id` | Computer-based testing â€” exams, question banks, proctoring |
| Finance | `finance.domain.sch.id` | Billing plans, student payments, receipts, cash books |
| WA | `wa.domain.sch.id` | WhatsApp notifications â€” templates, campaigns, delivery logs |
| API | `api.domain.sch.id` | Centralized REST API under `/api/v1` |

---

## Database Schema Ownership

| Schema | Owner Domain | Key Entities |
|--------|--------------|--------------|
| `auth` | Auth | Users, roles, sessions |
| `student` | Student | Student profiles, guardians |
| `academic` | Academic | Classes, subjects, schedules, grades, attendance |
| `finance` | Finance | Bills, payments, receipts, cash books |
| `cbt` | CBT | Question banks, exams, attempts, results |
| `wa` | Communication | Devices, templates, campaigns, messages |
| `ppdb` | PPDB | Applicants, registrations, verification, selection |
| `audit` | System | Audit trails |
| `master` | Master | School config, academic years |
| `system` | System | Platform configuration |

---

## Domain Modules (Detailed)

### 1. Academic Domain

**Skill**: `teknovo-academic` Â· **Schema**: `academic` Â· **Subdomain**: `erp.domain.sch.id`

**Purpose**: Teachers, subjects, classes, schedules, attendance, assessments, grades, report cards.

**Principles**:
- Academic year + semester scoped entities
- Teacher assignment boundaries enforced in service layer
- Class membership references Student Domain by ID
- Grade/attendance corrections post-lock require audit + permission

**Consumers**: CBT (subjects), Finance (class-based billing), Reporting (read models)

---

### 2. PPDB Domain (Penerimaan Peserta Didik Baru)

**Skill**: `teknovo-ppdb` Â· **Schema**: `ppdb` Â· **Subdomain**: `ppdb.domain.sch.id`

**Purpose**: Applicant registration, document verification, selection, announcement, re-registration.

**Principles**:
- **Applicant First** â€” entity is Applicant, not Student, until acceptance
- Student created only on `ppdb.applicant.accepted` event â†’ Student Domain handler
- Selection/verification history preserved with audit
- Registration payments follow PPDB lifecycle first; Finance may consume events

**Key Event**: `ppdb.applicant.accepted` â†’ triggers Student creation

---

### 3. CBT Domain (Computer Based Testing)

**Skill**: `teknovo-cbt` Â· **Schema**: `cbt` Â· **Subdomain**: `cbt.domain.sch.id`

**Purpose**: Question banks, exam sessions, attempts, proctoring, immutable results.

**Principles**:
- Exams link to Academic Subject by ID reference only
- Attempts and answers never hard-deleted
- Published results immutable â€” corrections via official appeal workflow
- Proctor actions (start, submit, tab-switch) logged

---

### 4. Finance Domain

**Skill**: `teknovo-finance` Â· **Schema**: `finance` Â· **Subdomain**: `finance.domain.sch.id`

**Purpose**: Fee types, billing rules, student bills, payments, receipts, cash books, arrears (tunggakan).

**Principles**:
- **Financial history is immutable** â€” corrections via reversal/adjustment entries
- Posted transactions never hard-deleted; soft delete only for drafts
- Student owned by Student Domain â€” reference by ID only
- PPDB registration payments owned by PPDB lifecycle first

**Payment states**: `draft â†’ pending â†’ paid | failed | cancelled`

**Key events**: `finance.payment.completed`, `finance.payment.failed`

---

### 5. Communication Domain (WhatsApp / WA Sender)

**Skill**: `teknovo-communication` Â· **Schema**: `wa` Â· **Subdomain**: `wa.domain.sch.id` Â· **Port**: 4001

**Purpose**: WhatsApp devices, templates, campaigns, message delivery, notification queues.

**Principles**:
- **Event driven** â€” react to domain events, no polling other domains' databases
- **No business ownership** â€” resolve contacts via read API or event payload IDs
- **Template first** â€” every outbound message uses approved template
- Delivery states: `queued â†’ sent â†’ delivered | read | failed`
- Failed messages: retry + DLQ; never silent drop

**Key events**: `wa.message.sent`, `wa.message.failed`

---

### 6. Reporting Domain

**Skill**: `teknovo-reporting` Â· **Schema**: read models across domains

**Purpose**: Dashboards, analytics, PDF export, scheduled reports.

**Principles**:
- **Read-only** â€” no write-back to source domains
- Read models fed by domain events or scheduled ETL
- PDF reports stored in R2 (`teknovo-reports` bucket)

---

### 7. Student Domain

**Referenced by**: Academic, Finance, PPDB, WA

**Purpose**: Canonical student profiles and guardians.

**Principle**: Other domains reference Student by ID only â€” never duplicate canonical records.

---

## Cross-Domain Data Ownership Rules

| Entity | Owner | Others May |
|--------|-------|------------|
| Student | Student Domain | Reference by ID |
| Applicant | PPDB Domain | â€” until accepted |
| Class, Academic Year | Academic Domain | Reference by ID |
| Bill, Payment | Finance Domain | Consume events |
| Exam, Attempt | CBT Domain | Academic consumes subject refs |
| WA Message | WA Domain | Triggered by events |

**Forbidden**: Direct cross-module repository access. Use domain events via `teknovo-domain-management`.

---

## Permission Naming Convention

Format: `domain.resource.action`

Examples:
- `academic.class.create`
- `finance.bill.read`
- `ppdb.applicant.verify`
- `cbt.exam.publish`

Every route, menu item, and action button must map to a permission.

---

## RBAC Access Layers

Reference: `docs/standards/rbac/rbac-standard.md`, `docs/.cursor/gates/security/rbac-matrix.md`

Permissions align with navigation personas defined in Product Design Analysis. UI must render Permission state when role lacks access.

---

## Domain Skill Trigger Keywords

| Domain | Indonesian / English Triggers |
|--------|------------------------------|
| Finance | tagihan, pembayaran, kuitansi, tunggakan, billing, payment |
| PPDB | PPDB, pendaftaran, calon siswa, seleksi, registrasi ulang, admission |
| CBT | CBT, ujian online, bank soal, proctoring, hasil ujian, exam |
| Academic | akademik, kelas, absensi, nilai, rapor, jadwal, guru |
| WA | WhatsApp, WA template, campaign, notifikasi, broadcast, pesan WA |
| Reporting | report, dashboard, analytics, export PDF, laporan, read model |

---

## Primary Teknovo-V2 Domain Documentation

| Domain | Path |
|--------|------|
| Finance | `docs/domain/finance-domain.md` |
| PPDB | `docs/domain/ppdb-domain.md` |
| CBT | `docs/domain/cbt-domain.md` |
| Academic | `docs/domain/academic-domain.md` |
| WA | `docs/domain/wa-domain.md` |
| Student | `docs/domain/student-domain.md` |
| Data ownership | `docs/architecture/data-ownership-matrix.md` |
| Event catalog | `docs/architecture/domain-event-catalog.md` |
