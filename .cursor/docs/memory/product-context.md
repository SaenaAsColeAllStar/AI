# Product Context — Teknovo Vision & Modules

> **Source**: `README.md`, `.cursor/docs/ai/repository-analysis.md`, domain skills, `teknovo-chief-product-designer`, `teknovo-prd-generator`  
> **Teknovo-V2 canonical PRD**: `docs/prd/master/master-prd.md` (not in AI repo)  
> **Last updated**: 2026-06-20

---

## Teknovo Vision

**Teknovo** is an enterprise-grade **school ERP platform** for Indonesian schools (SD/SMP/SMA/SMK). It unifies admissions, academic operations, computer-based testing, finance/billing, and WhatsApp communication into a single domain-driven system.

### Product Positioning

| Aspect | Description |
|--------|-------------|
| Target users | School administrators, teachers, finance staff, applicants, parents |
| Market | Indonesian schools — PPDB workflows, SPP billing, national exam patterns |
| Design philosophy | Enterprise ERP clarity over generic SaaS dashboards; avoid "AI-ish" template UIs |
| AI workstation | Teknovo AI SuperStack enables autonomous development with architectural guardrails |

### Design Anti-Pattern: "AI-ish" Design

The Chief Product Designer skill explicitly detects and rejects:
- Generic gradient dashboards without school context
- Template SaaS layouts unrelated to ERP workflows
- Orphan features without PRD traceability
- Navigation that breaks Domain → Module → Page hierarchy

---

## ERP Module Map

### Core Platform Modules

| Module | Subdomain | Skill | Primary Users |
|--------|-----------|-------|---------------|
| **Portal / Landing** | `portal.*` | teknovo-landing-page | Public, prospective students |
| **PPDB** | `ppdb.*` | teknovo-ppdb | Applicants, admission staff |
| **ERP / Academic** | `erp.*` | teknovo-academic | Teachers, academic admin |
| **CBT** | `cbt.*` | teknovo-cbt | Students, proctors, exam admin |
| **Finance** | `finance.*` | teknovo-finance | Finance staff, parents (payments) |
| **WA Sender** | `wa.*` | teknovo-communication | Admin, automated notifications |
| **Reporting** | Cross-domain | teknovo-reporting | Leadership, admin dashboards |
| **API** | `api.*` | teknovo-api-architect | All clients |

---

## Module Summaries

### Portal & Landing Page

- Public marketing site, school information, news
- Admissions funnel entry point → PPDB
- SEO, Lighthouse performance, conversion CTAs
- Aceternity UI for public surfaces; ERP uses shadcn/ui

### PPDB (Penerimaan Peserta Didik Baru)

**Business concepts**:
- Applicant registration waves
- Document upload and verification queues
- Selection and pengumuman (announcement)
- Registrasi ulang (re-registration)
- Registration payments before Student entity exists

**Key rule**: Applicant ≠ Student until acceptance event.

### ERP / Academic

**Business concepts**:
- Academic years and semesters
- Classes, subjects, teacher assignments
- Schedules and attendance
- Assessments, grades, report cards (rapor)
- Hub domain — CBT, Finance, Reporting consume academic data

### CBT (Computer Based Testing)

**Business concepts**:
- Question banks and item types
- Exam sessions and participant enrollment
- Live proctoring and attempt monitoring
- Immutable published results
- Appeals workflow for result corrections

### Finance

**Business concepts**:
- Fee types and billing plans (SPP, activities)
- Student bills (tagihan) and arrears (tunggakan)
- Payment processing and receipts (kuitansi)
- Cash books (buku kas)
- Immutable posted transactions

**Indonesian terms**: tagihan, pembayaran, kuitansi, tunggakan, kas

### WA Sender (WhatsApp Communication)

**Business concepts**:
- WhatsApp device registration
- Approved message templates
- Campaign broadcasts
- Event-triggered notifications (payment reminders, PPDB results, exam schedules)
- Delivery tracking with retry/DLQ

**Key rule**: Event-driven only — no polling other domains.

### Reporting

**Business concepts**:
- Read-only dashboards and analytics
- PDF export for school reports
- Scheduled report generation
- No write-back to source domains

---

## Key Business Concepts

### School Operations Context

| Concept | Description |
|---------|-------------|
| Tahun ajaran | Academic year driving entity scoping |
| Semester | Half-year period within academic year |
| Kelas | Class/homeroom grouping |
| Rapor | Report card — formal grade summary |
| SPP | School fee (monthly tuition) |
| PPDB wave | Admission intake period |

### User Personas (RBAC-Aligned)

| Persona | Primary Modules |
|---------|-----------------|
| School Admin | All modules — full RBAC |
| Academic Staff | ERP, CBT scheduling |
| Teacher (GURU) | Assigned classes, attendance, grades |
| Finance Staff | Finance, payment reports |
| PPDB Verifier | PPDB verification queue |
| Applicant/Parent | Portal, PPDB, payment portal |
| Proctor | CBT monitoring |

---

## Product Workflow Gates

Before any feature ships:

1. **Product Design Analysis** — PRD alignment, user journeys, IA
2. **Architecture Impact Analysis** — DB, API, RBAC, folders
3. **Implementation** — layer-by-layer with TDD
4. **Deployment Impact Analysis** — CI, Cloudflare, migrations

---

## Conversion Funnel (Public → Enrolled Student)

```text
portal.domain.sch.id (awareness)
    → ppdb.domain.sch.id (registration)
    → verification + selection
    → registrasi ulang + payment
    → ppdb.applicant.accepted event
    → Student created in Student Domain
    → erp.domain.sch.id (enrolled student operations)
```

---

## Integration Points

| Integration | Skill | Examples |
|-------------|-------|----------|
| Payment gateways | teknovo-integration-architect | Midtrans, Xendit |
| WhatsApp providers | teknovo-communication | Template API, webhooks |
| Legacy school data | teknovo-data-migration | Excel import, ETL |
| Third-party APIs | teknovo-integration-architect | Webhooks, OAuth |

---

## Success Metrics (Product)

| Metric | Target |
|--------|--------|
| PPDB registration completion rate | Tracked per wave |
| Payment collection (tunggakan reduction) | Finance dashboards |
| CBT exam completion without data loss | Attempt preservation |
| WA delivery success rate | >99% after retries |
| Page state completeness | 100% of ERP pages |

---

## Primary PRD References (Teknovo-V2)

| Document | Path |
|----------|------|
| Master PRD | `docs/prd/master/master-prd.md` |
| Landing page PRD | `docs/prd/ui-ux/landing-page-*.md` |
| Domain PRDs | `docs/domain/**`, `docs/prd/**` |

PRD drafting: **teknovo-prd-generator** · PRD review: **teknovo-chief-product-designer**
