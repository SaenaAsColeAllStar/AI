---
name: superpowers-test-driven-development
description: Apply Test-Driven Development (TDD) methods to enforce code reliability and meet coverage targets.
---

# Test-Driven Development Skill

Use this skill during implementation of business logic. Enforce **RED-GREEN-REFACTOR** cycle. Write tests first, always.

Adapted from [Superpowers test-driven-development](https://github.com/obra/superpowers).

---

## When to Activate

- Writing service layer business logic
- Writing repository integration tests
- User asks to write tests or mentions TDD
- During **superpowers-executing-plans** for service/repository tasks

---

## RED-GREEN-REFACTOR Cycle

### RED: Write a Failing Test

1. Write the test for the expected behavior
2. Run it — confirm it **fails** for the right reason
3. If test passes immediately, the behavior already exists or test is wrong

```typescript
// attendance.service.test.ts
describe('AttendanceService.recordAttendance', () => {
  it('should reject duplicate attendance for same student on same date', async () => {
    await expect(
      service.recordAttendance({ studentId, date, status: 'present' })
    ).rejects.toThrow(ValidationError);
  });
});
```

### GREEN: Write Minimal Code

1. Write the **smallest amount of code** to make the test pass
2. Run test — confirm it **passes**
3. Do not add features beyond what the test requires (YAGNI)

### REFACTOR: Clean Up

1. Improve code structure without changing behavior
2. Run tests — confirm they **still pass**
3. Extract helpers only if genuinely reused (no premature abstraction)

---

## Coverage Targets (Teknovo)

| Module Type | Minimum Coverage |
|-------------|-----------------|
| Global baseline | 70% |
| Auth modules | 90% |
| Finance modules | 90% |
| Payment processing | 95% |

Reference: `docs/standards/testing/testing-standard.md`

---

## Test Types by Layer

| Layer | Test Type | Framework | Location |
|-------|-----------|-----------|----------|
| Service | Unit test | Vitest | `*.service.test.ts` |
| Repository | Integration test | Vitest + test DB | `*.repository.test.ts` |
| Controller | Integration test | Vitest + supertest | `*.controller.test.ts` |
| UI | Component test | Vitest + Testing Library | `*.spec.ts` |
| E2E | End-to-end | Playwright | `e2e/*.spec.ts` |

---

## Critical Flows Requiring E2E

Always write E2E tests for:

- Login / authentication
- PPDB registration
- Payment processing
- Exam submission (CBT)
- Report card generation

---

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|-----------------|
| Write code first, test later | RED first — test before implementation |
| Test implementation details | Test behavior and public interfaces |
| Mock everything | Integration tests for repository with real DB |
| Skip test because "it's simple" | Simple logic still gets a test |
| Delete failing test to green CI | Fix the code or fix the test |
| `any` in test files | Strict types in tests too |

---

## Delete Code Written Before Tests

If you wrote implementation code before tests exist:

1. **Delete the implementation code**
2. Write the failing test (RED)
3. Re-implement minimally (GREEN)
4. Refactor

This is non-negotiable for service layer business logic.

---

## Verification

After TDD cycle complete for a module:

```bash
pnpm test -- --run src/modules/<domain>/
pnpm test:coverage -- src/modules/<domain>/
```

Confirm coverage meets module threshold before proceeding.
