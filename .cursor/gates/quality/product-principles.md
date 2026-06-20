# Product Excellence Principles â€” Teknovo Impeccable Architect

> **Scope**: Every feature proposal, PRD section, module expansion, and scope change  
> **Authority**: Pillar 1 â€” Chief Product Designer; Master PRD (`docs/prd/master/master-prd.md`)  
> **Reject threshold**: Complexity without measurable value

---

## Purpose

Teknovo ERP serves schools with daily operational workflows â€” PPDB admissions, academic records, finance billing, CBT exams, WhatsApp notifications. Product decisions must reduce staff workload and increase data trust, not accumulate features for feature parity.

Every proposal is evaluated against four dimensions before design or code begins.

---

## Evaluation Dimensions

### 1. User Value

**Question**: Does this solve a real, recurring problem for a named persona?

| Persona | Example high-value problems |
|---------|----------------------------|
| Admin sekolah | Bulk PPDB verification, tunggakan visibility, rapor export |
| Bendahara | Tagihan generation, kuitansi audit trail, cash book reconciliation |
| Guru | Absensi cepat, input nilai batch, jadwal kelas |
| Orang tua | Status PPDB, tagihan, notifikasi WA |
| Siswa (CBT) | Ujian tanpa gangguan, hasil transparan |

**Pass criteria**:
- Problem stated in user language, not technical language
- Success metric defined (time saved, error rate reduced, conversion improved)
- Workflow fits existing ERP mental model â€” not a standalone mini-app

**Reject when**:
- "Nice to have" with no operator pain point
- Feature duplicates an existing module path (e.g., second dashboard for same data)
- Request is "because competitor X has it" without school context

**Teknovo example â€” REJECT**:
> Add a social feed for teachers to share announcements.

No measurable operational value; WA Sender and Communication module already cover broadcast. Adds moderation burden and navigation noise.

**Teknovo example â€” APPROVE**:
> PPDB bulk document verification with side-by-side preview.

Reduces admin time during peak admission; measurable (applications verified per hour).

---

### 2. Business Value

**Question**: Does this support retention, conversion, compliance, or operational efficiency for Teknovo and the school?

| Value type | Signal |
|------------|--------|
| Retention | Reduces churn risk for a core module (Finance, PPDB) |
| Conversion | Improves landing â†’ demo â†’ contract funnel |
| Compliance | Supports Dapodik, audit, or financial reporting requirements |
| Efficiency | Cuts support tickets or manual workarounds |

**Pass criteria**:
- Tied to a module in Master PRD or an approved module PRD
- Revenue or cost impact estimable (even qualitatively)
- Does not fragment product identity (one ERP, not ten tools)

**Reject when**:
- Scope expands Teknovo into unrelated verticals without strategy
- Custom one-off for a single school that should be configuration, not code
- Feature increases support surface without corresponding demand

---

### 3. Complexity

**Question**: What is the true cost to build, integrate, and explain?

Score each factor 1 (low) â€“ 5 (high):

| Factor | 1 | 5 |
|--------|---|---|
| Domains touched | Single (e.g., Finance only) | 3+ bounded contexts |
| New permissions | Reuses existing RBAC | New permission tree + nav nodes |
| Data model | Extends existing table | New aggregate + cross-domain FKs |
| UI surface | One PageShell page | New nav section + modals + wizards |
| Integrations | Internal API only | External gateway + webhooks |

**Rule**: Total score > 15 requires explicit Chief Product Designer + Chief Architect sign-off.

**Reject when**:
- Complexity score high but user value score low
- Same outcome achievable via reporting read model or existing CRUD extension
- "Configurable" alternative exists (feature flag, school setting, template)

---

### 4. Long-Term Maintenance Cost

**Question**: Who maintains this in year two â€” and what breaks when requirements shift?

| Maintenance driver | Risk |
|--------------------|------|
| Hard-coded business rules | Every school wants exceptions |
| Cross-domain coupling | PPDB change breaks Finance invoice |
| Unowned data | No clear domain owner in data-ownership matrix |
| UI one-offs | Custom sidebar, non-PageShell layout |
| Missing tests | Regression on every release |

**Pass criteria**:
- Domain owner documented
- Events/API boundaries defined if cross-module
- Test plan covers critical path + RBAC matrix row
- Documentation path identified (`docs/domain/`, module PRD)

**Reject when**:
- One-off UI pattern that bypasses sidebar + PageShell
- Logic duplicated across modules instead of shared service or event
- No rollback or feature-flag strategy for risky launches

---

## Feature Proposal Template

Use before brainstorming or PRD drafting:

```markdown
## Feature Proposal: [Name]

### Problem (User Value)
- Persona:
- Current pain:
- Success metric:

### Business Value
- Module:
- PRD reference:
- Retention / conversion / compliance impact:

### Complexity Score
| Factor | Score (1-5) | Notes |
|--------|-------------|-------|
| Domains | | |
| RBAC | | |
| Data model | | |
| UI | | |
| Integrations | | |
| **Total** | | |

### Maintenance
- Domain owner:
- Cross-domain events/APIs:
- Test + doc plan:

### Decision
- [ ] Proceed to design
- [ ] Defer â€” reason:
- [ ] Reject â€” reason:
```

---

## Integration with Workflow

| Phase | Action |
|-------|--------|
| Brainstorming | Score proposal; reject weak ideas before design doc |
| PRD drafting | Each requirement must cite user + business value |
| Planning | Plan must reference complexity score if total > 10 |
| Review | `.cursor/gates/quality/review-checklist.md` â€” Product section |
| Ship | No feature ships without documented success metric or acceptance criteria |

**Related**: `.cursor/gates/quality/quality-gates.md`, `.cursor/gates/quality/self-critique.md`, `.cursor/skills/teknovo-ux-architecture/SKILL.md`
