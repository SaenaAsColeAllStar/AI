---
name: gstack-qa
description: Conduct functional and boundary validation on feature implementations with evidence-based test results.
---

# QA Skill

Use this skill for functional verification and boundary condition testing after eng-review passes.

Modeled after [GStack /qa](https://github.com/garrytan/gstack) with Teknovo testing standards.

---

## When to Activate

- After **gstack-eng-review** passes
- Before shipping or creating PR
- User asks for functional verification or QA testing
- Autoload: true

---

## QA Protocol

### 1. Automated Test Suite

Run and capture output:

```bash
pnpm tsc --noEmit                    # Type safety
pnpm lint                            # Code quality
pnpm test -- --run                   # Unit + integration
pnpm test:coverage                   # Coverage thresholds
pnpm build                           # Build integrity
```

### 2. Functional Test Matrix

For each new feature, verify:

| Scenario | Expected | Actual | Pass? |
|----------|----------|--------|-------|
| Happy path — create | 201 + data returned | | |
| Happy path — read list | 200 + paginated data | | |
| Happy path — update | 200 + updated data | | |
| Happy path — soft delete | 200 + deleted_at set | | |
| Empty data | Empty state UI shown | | |
| Invalid input | 422 + validation errors | | |
| Unauthorized | 401 response | | |
| Forbidden (wrong role) | 403 response | | |
| Not found | 404 response | | |
| Duplicate/conflict | 409 response | | |

### 3. Boundary Conditions

- [ ] Empty string inputs rejected by Zod
- [ ] Max length inputs handled
- [ ] Special characters in text fields
- [ ] Pagination: page 0, page beyond total, limit 0
- [ ] Concurrent requests (no race conditions)
- [ ] Soft-deleted records not returned in lists
- [ ] Soft-deleted records not updatable

### 4. RBAC Matrix Verification

For each new permission:

| Role | Can Access? | Verified? |
|------|------------|-----------|
| SUPER_ADMIN | Yes | |
| Relevant ADMIN | Yes/No | |
| GURU | Yes/No | |
| SISWA | Yes/No | |
| ORANG_TUA | Yes/No | |
| Unauthorized role | 403 | |

### 5. UI State Verification

For each new page:

- [ ] **Loading**: skeleton/spinner shown during fetch
- [ ] **Empty**: friendly message + CTA (if permitted)
- [ ] **Error**: error card with retry button
- [ ] **Success**: toast/alert on mutation
- [ ] **Permission**: lock screen for unauthorized users

---

## Critical Flow E2E

These flows require Playwright E2E (invoke **gstack-browser-testing**):

- Login / authentication
- PPDB registration
- Payment processing
- Exam submission (CBT)
- Report card generation

---

## QA Output Template

```markdown
## QA Report: [feature name]

### Automated Tests
| Suite | Result |
|-------|--------|
| TypeScript | ✅/❌ |
| Lint | ✅/❌ |
| Unit tests | ✅ X/X |
| Integration | ✅ X/X |
| Coverage | ✅ X% |
| Build | ✅/❌ |

### Functional Tests
| Scenario | Result |
|----------|--------|
| [scenario] | ✅/❌ |

### RBAC Tests
| Role | Result |
|------|--------|
| [role] | ✅/❌ |

### UI States
| State | Result |
|-------|--------|
| Loading | ✅/❌ |
| Empty | ✅/❌ |
| Error | ✅/❌ |
| Success | ✅/❌ |
| Permission | ✅/❌ |

### Verdict: [PASS / FAIL]
```

---

## After QA

- **PASS** → proceed to **gstack-ship** or **superpowers-finishing-development-branch**
- **FAIL** → invoke **superpowers-systematic-debugging** → fix → re-run QA

Reference: `docs/standards/testing/testing-standard.md`
