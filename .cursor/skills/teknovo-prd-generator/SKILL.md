---
name: teknovo-prd-generator
description: Generate comprehensive Product Requirement Documents (PRDs) containing exact module boundaries and goals.
---

# Teknovo PRD Generator Skill

Use this skill when generating new module specifications or refining existing product requirements.

> **Differentiation**:
> - **teknovo-prd-generator** (this skill) — *generates* and *drafts* module PRDs from template
> - **teknovo-chief-product-designer** — *reviews*, *aligns*, and *approves* PRDs against master PRD, journeys, and IA (Pillar 1 gate)
> - After draft complete → hand off to **teknovo-chief-product-designer** for PRD alignment before **teknovo-chief-architect**

**Reference**: `docs/prd/master/master-prd.md`, domain PRDs in `docs/prd/` and `docs/domain/`

---

## PRD Template

Save to `docs/prd/<domain>/<module-name>-prd.md`:

```markdown
# [Module Name] PRD
Version: 1.0
Status: Draft | Review | Approved
Domain: [auth | student | academic | finance | cbt | wa | ppdb]
Owner: [domain owner]

---

## 1. Product Vision
[What problem this module solves, for whom, and why now]

## 2. Goals & Success Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| [metric] | [target] | [how measured] |

## 3. User Roles & Permissions
| Role | Access Level | Key Actions |
|------|-------------|-------------|
| SUPER_ADMIN | Full | ... |
| [role] | [level] | ... |

New permissions required:
- `domain.resource.action` — [description]

## 4. Functional Requirements

### 4.1 [Feature Group]
- FR-001: [requirement with acceptance criteria]
- FR-002: [requirement with acceptance criteria]

### 4.2 [Feature Group]
- FR-003: ...

## 5. Non-Functional Requirements
| Requirement | Target |
|-------------|--------|
| Page load time | < 2 seconds |
| Concurrent users | 500+ |
| API response time | < 200ms p95 |
| Uptime | 99.9% |
| Test coverage | 70%+ (90%+ finance/auth) |

## 6. Architecture

### 6.1 Database Schema
| Table | Schema | Owner Domain | Key Fields |
|-------|--------|-------------|------------|
| [table] | [schema] | [domain] | [fields] |

### 6.2 API Endpoints
| Method | Route | Permission | Description |
|--------|-------|------------|-------------|
| GET | /api/v1/... | domain.resource.read | ... |

### 6.3 Domain Events
| Event | Publisher | Consumers |
|-------|-----------|-----------|
| domain.entity.action | [domain] | [consumers] |

### 6.4 UI Pages
| Page | Route | Permission | States Required |
|------|-------|------------|-----------------|
| [page] | /domain/module | domain.resource.read | All 5 |

## 7. Dependencies
| Dependency | Type | Notes |
|------------|------|-------|
| [module] | Required/Optional | [why] |

## 8. Out of Scope
- [Explicitly excluded features]

## 9. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| [risk] | [H/M/L] | [plan] |

## 10. Acceptance Criteria
- [ ] All FR items implemented
- [ ] RBAC permissions seeded
- [ ] All 5 page states on every page
- [ ] Coverage meets domain threshold
- [ ] Domain events published
- [ ] Audit logs on mutations
```

---

## PRD Generation Workflow

1. **Read master PRD** — `docs/prd/master/master-prd.md`
2. **Identify domain** — check `docs/architecture/data-ownership-matrix.md`
3. **Check existing domain docs** — `docs/domain/<domain>-domain.md`
4. **Define boundaries** — what this module owns vs consumes
5. **Map permissions** — `domain.resource.action` for every action
6. **Define events** — what this module publishes and subscribes to
7. **Write PRD** using template above
8. **Self-review** — no placeholders, no contradictions, focused scope
9. **Transition** — invoke **superpowers-brainstorming** for design refinement

---

## PRD Quality Rules

- Every functional requirement has acceptance criteria
- Every API endpoint has a permission mapping
- Every table has a domain owner
- Out of scope section is mandatory (YAGNI)
- No tables created without domain ownership justification
- Reference existing ADRs for architectural constraints

---

## Domain PRD References

| Domain | Existing Doc |
|--------|-------------|
| Auth | `docs/domain/auth-domain.md` |
| Student | `docs/domain/student-domain.md` |
| Academic | `docs/domain/academic-domain.md` |
| Finance | `docs/domain/finance-domain.md` |
| CBT | `docs/domain/cbt-domain.md` |
| PPDB | `docs/domain/ppdb-domain.md` |
| WA | `docs/domain/wa-domain.md` |
| Landing | `docs/prd/ui-ux/landing-page-prd.md` |

---

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|-----------------|
| PRD without permission mapping | Every action needs `domain.resource.action` |
| PRD spanning multiple domains | Split into domain-specific PRDs |
| Vague requirements ("should be fast") | Specific metrics (< 2s, 500 users) |
| Missing out-of-scope section | Explicit YAGNI boundaries |
| Table owned by wrong domain | Check data-ownership-matrix first |

---

## Skill Transitions

| After This Skill... | Invoke |
|---------------------|--------|
| PRD draft complete | teknovo-chief-product-designer (PRD alignment) |
| PRD gaps from alignment | Revise PRD, then re-run chief-product-designer |
| PRD approved | teknovo-chief-architect (Architecture Impact Analysis) |
| Strategic blocker | gstack-office-hours |
