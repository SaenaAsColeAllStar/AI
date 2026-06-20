# Decision Validation — Teknovo Assurance Engineering System

> **When**: Plan draft complete; before Assurance Sign-Off  
> **Pair with**: `agents/requirement-clarifier.md`, `agents/second-opinion-reviewer.md`  
> **Goal**: Every significant decision is explicit, challenged, and traceable

---

## Purpose

Decision validation prevents **implicit choices** — the most common source of rework in ERP projects. If the plan does not document *why* a path was chosen, assurance treats the decision as **unverified**.

---

## Decision Log Template

```markdown
## Decision Log

| ID | Decision | Alternatives considered | Rationale | Assumptions | Reversible? |
|----|----------|-------------------------|-----------|-------------|-------------|
| D1 | Use single `payments` table | Separate cash/card tables | Simpler reporting | Max 2 payment methods in v1 | Yes — migration |
```

---

## Validation Checklist

### 1. Assumption Register

List every assumption. Mark status:

| Assumption | Source | Verified? | If wrong, impact |
|------------|--------|-----------|------------------|
| PPDB quota is per jurusan | PRD §4.2 | ✅ PRD cite | Wrong accept logic |
| Cloudflare D1 sufficient for CBT peak | ADR-014 | ❌ Unknown | Latency at scale |

**Block** if Critical-path assumption is unverified without risk acceptance.

### 2. Alternative Analysis (≥2 for non-trivial)

Non-trivial = migrations, cross-domain, new permissions, infra, financial logic.

For each decision answer:

1. What is the **simplest** alternative? (YAGNI / taste alignment)
2. Why was it rejected or deferred?
3. What would trigger revisiting this decision?

**Teknovo example — PPDB verification**:

| Alternative | Pros | Cons | Verdict |
|-------------|------|------|---------|
| Manual admin verify only | Simple | Does not scale | Reject for v1 |
| Auto OCR KTP | Fast UX | Cost, error rate | Defer v2 |
| Staff checklist + doc upload | Proven, auditable | More clicks | **Choose** |

### 3. Standards Alignment

Each decision must cite applicable standard:

| Decision area | Cite |
|---------------|------|
| Schema | `docs/standards/database/database-standard.md`, ADR |
| API shape | `docs/standards/api/api-contract.md` |
| Permissions | `docs/standards/rbac/rbac-standard.md` |
| UI pattern | `docs/standards/design-system/design-system-contract.md` |
| Domain ownership | `docs/architecture/data-ownership-matrix.md` |

Missing citation → **Major** finding unless justified in decision log.

### 4. Reversibility

| Class | Requirement |
|-------|-------------|
| **One-way door** (schema, public API) | ADR or Architecture Impact Analysis required |
| **Two-way door** (feature flag, config) | Document rollback steps |
| **Financial / CBT result** | Immutable design; no silent rewrite |

### 5. Conflict Resolution

When PRD, user request, and .cursor/gates/taste/security conflict:

```markdown
## Conflict — C1

- **PRD says**: ...
- **User/stakeholder says**: ...
- **Taste/security says**: ...
- **Resolution**: ...
- **Approver**: Pillar 1 / Pillar 2 / human
```

Unresolved Critical conflict → **BLOCK**.

---

## Questions Senior Auditors Ask

Use in plan review and second opinion:

1. **Why not config?** — School settings vs new code path
2. **Why not existing module?** — PPDB list vs new dashboard API
3. **Why now?** — v1 scope vs deferred v2
4. **Who owns the data?** — Write path domain owner named
5. **What breaks if we're wrong?** — Link to risk register ID
6. **What evidence proves this works?** — Test name or CI job

---

## Decision Categories (Teknovo)

### Architecture

- Monolith module vs microservice (default: monolith module)
- Sync API vs queue event (default: event for cross-domain)
- Shared table vs domain table (default: domain ownership)

### Data

- UUID v7 PK (mandatory — not a decision)
- Soft delete (mandatory)
- JSON column vs normalized (justify JSON with query pattern)

### API

- REST resource naming
- Pagination cursor vs offset (default: cursor for large lists)
- Bulk endpoint vs batch job

### UI

- PageShell list+detail vs wizard (default: PageShell; no modal wizards)
- Inline edit vs separate form

### Infrastructure

- Worker vs Node backend for endpoint (cite ADR)
- R2 vs DB blob for documents (default: R2)

---

## Pass / Fail Criteria

| Verdict | Criteria |
|---------|----------|
| **PASS** | All one-way doors documented; Critical assumptions verified; alternatives recorded |
| **PASS WITH NOTES** | Minor assumption gaps with owners |
| **BLOCK** | Implicit major decision; unverified Critical assumption; unresolved conflict |

---

## Integration

| Agent / Skill | Role |
|---------------|------|
| `agents/requirement-clarifier.md` | Surfaces ambiguities before decisions finalized |
| `agents/context-builder.md` | Supplies ADR/PRD citations |
| `agents/second-opinion-reviewer.md` | Challenges decision log |
| `superpowers-writing-plans` | Plan must include Decision Log section |
| `teknovo-chief-architect` | Validates architecture one-way doors |

---

## Related

- `.cursor/gates/assurance/risk-analysis.md`
- `.cursor/gates/assurance/assurance-principles.md`
- `.cursor/gates/assurance/review-workflow.md`
