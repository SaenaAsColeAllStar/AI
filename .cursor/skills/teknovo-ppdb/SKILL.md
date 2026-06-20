---
name: teknovo-ppdb
description: PPDB domain specialist — student admission, applicant registration, verification, selection, announcement, and re-registration workflows for Teknovo.
---

# Teknovo PPDB Domain Skill

Use this skill for **PPDB (Penerimaan Peserta Didik Baru)** — applicants, registrations, documents, verification, selection, admission waves, and registration payments.

**Differentiation**: PPDB creates Students only after acceptance; never conflate Applicant with Student. Unlike **teknovo-finance**, registration payments follow PPDB lifecycle rules first.

---

## When to Activate

- Admission portal, applicant forms, verification queues
- Selection results, pengumuman, registrasi ulang
- PPDB payment steps (before Student exists)
- Trigger examples: "PPDB", "pendaftaran", "calon siswa", "seleksi", "admission", "registrasi ulang"

---

## Primary Documentation

| Document | Path |
|----------|------|
| PPDB Domain | `docs/domain/ppdb-domain.md` |
| Master PRD | `docs/prd/master/master-prd.md` |
| Data ownership | `docs/architecture/data-ownership-matrix.md` |
| Event catalog | `docs/architecture/domain-event-catalog.md` |
| RBAC matrix | `docs/.cursor/gates/security/rbac-matrix.md` |

Subdomain: `ppdb.domain.sch.id` · Public portal funnels may start at `portal.domain.sch.id`

---

## Domain Principles (Non-Negotiable)

### Applicant First

- Before acceptance: entity is **Applicant**, not Student
- No Student record during open registration

### No Student Creation During Registration

- Student aggregate created only on **accepted + confirmed** status transition
- Event: `ppdb.applicant.accepted` → Student Domain handler

### Historical Preservation

- Selection history, verification decisions, document versions retained
- Status changes append audit — no silent overwrite

### Audit First

- Every verification/selection decision: actor, timestamp, reason

---

## Aggregate Roots

Applicant · Registration · Application Document · Verification · Selection Result · Registration Payment · Admission Wave

---

## Key Workflows

### Registration Funnel

```text
Admission Wave Open → Applicant Registers → Upload Documents → Verification → Selection → Announcement → Re-registration → Student Created
```

### Verification Queue

- States: `submitted → under_review → verified | rejected | needs_revision`
- Rejection requires reason code + optional note
- Document types validated per wave configuration

### Selection & Announcement

- Selection results immutable after publish
- Announcement triggers WA notifications (**teknovo-communication**)
- Failed applicants retain historical record (soft delete only if policy allows)

### Registration Payment

- Owned by PPDB until Student creation
- Finance events consumed after student billing begins
- Idempotent payment callbacks via **teknovo-integration-architect**

---

## Events

| Event | Subscriber |
|-------|------------|
| `ppdb.registration.submitted` | WA (confirmation), Audit |
| `ppdb.applicant.verified` | Internal notifications |
| `ppdb.selection.published` | WA (results), Reporting |
| `ppdb.applicant.accepted` | Student Domain (create student) |
| `ppdb.registration.paid` | Finance (if applicable) |

---

## RBAC Checklist

- [ ] Public applicant routes vs staff verification routes separated
- [ ] Verifier cannot modify selection after publish
- [ ] Admin wave configuration guarded by `ppdb.wave.manage`
- [ ] Applicant sees only own data (tenant + applicant scope)

---

## UI Requirements

- Public registration: mobile-first, progressive disclosure, document upload states
- Staff dashboard: verification queue, bulk actions with audit
- All 5 page states; Empty state for zero pending verifications
- Landing page CTAs align with **teknovo-landing-page** if on portal subdomain

---

## Handoff Matrix

| Task | Skill |
|------|-------|
| Product/UX for admission funnel | **teknovo-chief-product-designer** |
| Student record creation rules | **teknovo-domain-management** |
| Payment gateway | **teknovo-integration-architect** |
| Bulk legacy applicant import | **teknovo-data-migration** |
| Result notifications | **teknovo-communication** |
| E2E admission flow | **gstack-browser-testing** |

---

## Mandatory Output Template

```markdown
## PPDB Domain Analysis: [feature/wave]

### Wave Configuration
- Academic year: [ ]
- Quotas: [ ]
- Document requirements: [ ]

### Applicant Lifecycle
[State diagram]

### Student Creation Trigger
- Event: [ ]
- Preconditions: [ ]

### API Endpoints
| Method | Route | Permission | Public/Staff |

### Events
- Published: [ ]
- Subscribers: [ ]

### Audit Points
- [decision points requiring audit]

### Test Cases
- [ ] Register → verify → select → accept → student exists
- [ ] Reject path preserves history
- [ ] No student before acceptance

### Verdict: [ready / blocked]
```
