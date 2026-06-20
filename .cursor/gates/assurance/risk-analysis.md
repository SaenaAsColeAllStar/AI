# Risk Analysis — Teknovo Assurance Engineering System

> **When**: Plan draft complete; before Assurance Sign-Off  
> **Pair with**: `.cursor/gates/assurance/decision-validation.md`, `.cursor/gates/assurance/sharp-edges.md`  
> **Output**: Risk register in plan document with mitigations and test evidence

---

## Purpose

Risk analysis converts assumptions into **named, scored, mitigated risks**. Senior auditors do not accept "we'll be careful" — they require likelihood, impact, owner, and verification plan.

---

## Risk Register Template

Copy into `docs/plans/*-plan.md`:

```markdown
## Risk Register

| ID | Risk | Domain | L×I | Mitigation | Test evidence | Owner | Status |
|----|------|--------|-----|------------|---------------|-------|--------|
| R1 | ... | PPDB | H×H | ... | Integration test X | ... | Open |
```

**Scoring**:
- **Likelihood**: L (Low), M (Medium), H (High)
- **Impact**: L (Low), M (Medium), H (High)
- **Priority**: H×H and H×M block implementation until mitigated or accepted

---

## Domain Risk Catalog (Teknovo)

Use as checklist — not every item applies every feature.

### PPDB / Admission

| Risk | Why it matters | Typical mitigation |
|------|----------------|-------------------|
| Quota race | Two applicants accepted over capacity | Transaction + row lock; idempotent accept |
| Document PII leak | KTP/akte exposed via wrong presigned URL | R2 private bucket; short TTL; RBAC on download |
| Selection rule ambiguity | Tie-break undefined → legal dispute | PRD rule + audit log of decision inputs |
| Re-registration window | Partial state leaves orphan records | State machine; compensating job |

### CBT / Exams

| Risk | Why it matters | Typical mitigation |
|------|----------------|-------------------|
| Timer drift | Student loses time unfairly | Server-authoritative end time |
| Answer loss on disconnect | Retake dispute | Autosave + idempotent PATCH |
| Question leak | Bank soal exposed before exam | Separate permissions; shuffle at start |
| Grade tampering | Post-submit score change | Immutable result row; audit trail |

### Finance

| Risk | Why it matters | Typical mitigation |
|------|----------------|-------------------|
| Rounding errors | Parent trust; audit failure | Integer minor units; explicit rounding rule |
| Double payment | Duplicate receipt | Idempotency key on payment API |
| Partial allocation | Wrong tagihan marked paid | Service-layer allocation with transaction |
| Report vs ledger mismatch | Finance staff rework | Read model rebuild job; reconciliation test |

### Academic

| Risk | Why it matters | Typical mitigation |
|------|----------------|-------------------|
| Grade publish before lock | Wrong rapor sent | Publish gate + permission |
| Cross-school data | Tenancy breach | `school_id` filter in service layer |
| Bulk import corruption | Wrong student IDs | Dry-run import; rollback migration |

### Communication (WhatsApp)

| Risk | Why it matters | Typical mitigation |
|------|----------------|-------------------|
| PII in template | WA provider retention | Template review; no full names in logs |
| Rate limit / ban | School cannot notify | Queue + backoff; provider caps |
| Wrong recipient | Privacy incident | Confirm step for bulk; audit log |

### Cloudflare / Infrastructure

| Risk | Why it matters | Typical mitigation |
|------|----------------|-------------------|
| D1 migration order | Prod deploy failure | Staged migration; rollback script |
| Secret in wrangler.toml | Credential leak | Secrets via dashboard/CI; never commit |
| Worker cold start timeout | CBT submit fails | Timeout budget; queue heavy work |
| R2 public bucket misconfig | Document leak | Default private; presigned only |

### RBAC / Multi-tenant

| Risk | Why it matters | Typical mitigation |
|------|----------------|-------------------|
| UI-only permission | Direct API bypass | Backend guard on every method |
| Missing school scope | Cross-tenant read | Service ownership filter |
| Permission sprawl | Unmaintainable matrix | `domain.resource.action` convention |

### AI Workstation / Agents

| Risk | Why it matters | Typical mitigation |
|------|----------------|-------------------|
| Agent commits secrets | Repo compromise | Pre-commit hooks; assurance scan |
| MCP over-permission | Unintended file/deploy access | Tool allowlist; human approval on ship |
| Plan without context | Wrong module patterns | Context builder mandatory |

---

## Analysis Workflow

### Step 1: Identify change surface

List what changes: schema, API, UI, infra, dependencies, permissions.

### Step 2: Brainstorm failures

Ask: *What happens if this fails at 2 AM during PPDB peak?*

### Step 3: Score and prioritize

Focus mitigation on H×H and H×M. L×L items → backlog.

### Step 4: Map mitigations to layers

| Layer | Mitigation type |
|-------|-----------------|
| Database | Constraints, indexes, soft delete |
| Service | Transactions, idempotency, tenancy |
| API | Validation, rate limits, RBAC |
| UI | Error states, confirm destructive actions |
| CI | Tests, static analysis |
| Ops | Rollback, monitoring, alerts |

### Step 5: Define test evidence

Each Major+ risk needs **automated or scripted** verification:

```markdown
### R3 — Double payment on retry
- **Mitigation**: Idempotency-Key header + unique constraint
- **Evidence**: `apps/api/tests/finance/payment-idempotency.test.ts`
- **Manual**: Postman collection step 7 (duplicate submit)
```

---

## Risk Acceptance

When mitigation is deferred:

```markdown
## Risk Acceptance — R7

- **Risk**: ...
- **Reason deferred**: ...
- **Accepted by**: [name/role]
- **Expiry**: YYYY-MM-DD
- **Follow-up ticket**: ...
```

Unaccepted H×H risks **block** Assurance Sign-Off.

---

## Integration

| Phase | Action |
|-------|--------|
| Planning | Initial register in plan |
| Pre-implementation | All Critical/Major mitigations planned |
| PR | Differential reviewer verifies risk tests in diff |
| QA | `gstack-qa` executes evidence plan |
| Ship | Second opinion confirms no new H×H risks |

---

## Related

- `.cursor/gates/assurance/decision-validation.md`
- `.cursor/gates/assurance/sharp-edges.md`
- `.cursor/gates/assurance/review-workflow.md`
- `agents/differential-reviewer.md`
