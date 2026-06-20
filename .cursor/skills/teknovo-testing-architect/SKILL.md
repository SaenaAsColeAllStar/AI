---
name: teknovo-testing-architect
description: Write, configure, and execute test cases across the codebase to meet target coverage matrices.
---

# Teknovo Testing Architect Skill

Use this skill when designing test cases, configuring test infrastructure, or auditing coverage scores.

**Reference**: `docs/standards/testing/testing-standard.md`

---

## Test Framework Stack

| Layer | Framework | Config |
|-------|-----------|--------|
| Unit tests | Vitest | `vitest.config.ts` |
| Integration tests | Vitest + test PostgreSQL | `vitest.integration.config.ts` |
| Component tests | Vitest + Testing Library | Same as unit |
| E2E tests | Playwright | `playwright.config.ts` |

---

## Coverage Matrices

| Module Type | Minimum Coverage | Rationale |
|-------------|-----------------|-----------|
| Global baseline | **70%** | All code |
| Global target | **80%** | Engineering goal |
| Auth modules | **90%** | Security-critical |
| Finance modules | **90%** | Money-critical |
| Payment processing | **95%** | Transaction-critical |
| CBT exam engine | **95%** | Academic integrity |

---

## Test Types by Layer

### Unit Tests (Service Layer)

```typescript
// class.service.test.ts
describe('ClassService', () => {
  describe('create', () => {
    it('should reject duplicate class name in same academic year', async () => {
      mockRepo.findByName.mockResolvedValue(existingClass);
      await expect(service.create(validDto)).rejects.toThrow(ValidationError);
    });

    it('should publish class.created event on success', async () => {
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.insert.mockResolvedValue(newClass);
      await service.create(validDto);
      expect(mockEventBus.publish).toHaveBeenCalledWith('class.created', expect.any(Object));
    });
  });
});
```

- Mock repository and external dependencies
- Test business logic, validations, event publishing
- One describe block per service method

### Integration Tests (Repository Layer)

```typescript
// class.repository.test.ts
describe('ClassRepository', () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  afterEach(async () => {
    await rollbackTestTransaction();
  });

  it('should exclude soft-deleted classes from findAll', async () => {
    await repo.softDelete(classId);
    const results = await repo.findAll({ academicYearId });
    expect(results).not.toContainEqual(expect.objectContaining({ id: classId }));
  });
});
```

- Use real test database with transactional rollback
- Test CRUD, filters, pagination, soft deletes
- Never mock the database

### E2E Tests (Critical Flows)

Mandatory E2E coverage:

| Flow | Priority | Roles Tested |
|------|----------|-------------|
| Login / logout | P0 | All |
| PPDB registration | P0 | ORANG_TUA |
| Payment processing | P0 | TU, ORANG_TUA |
| Exam submission | P0 | SISWA, GURU |
| Report card generation | P1 | GURU, SISWA |
| Class CRUD | P1 | ADMIN_KURIKULUM |
| Student enrollment | P1 | ADMIN_KESISWAAN |

Invoke **gstack-browser-testing** for E2E execution.

---

## Test Plan Template

For each feature, define:

```markdown
## Test Plan: [Feature Name]

### Unit Tests
| Service Method | Scenario | Expected |
|----------------|----------|----------|
| create | valid input | returns created entity |
| create | duplicate name | throws ValidationError |
| create | missing required field | throws ValidationError |

### Integration Tests
| Repository Method | Scenario | Expected |
|-------------------|----------|----------|
| findAll | active records | excludes soft-deleted |
| findAll | pagination | returns correct page |

### E2E Tests
| Flow | Steps | Expected |
|------|-------|----------|
| Create class | login → navigate → fill form → submit | success toast, class in list |
```

---

## Running Tests

```bash
# Unit tests
pnpm test -- --run

# Integration tests
pnpm test:integration -- --run

# Coverage report
pnpm test:coverage

# E2E tests
pnpm test:e2e

# Specific module
pnpm test -- --run src/modules/academic/
```

---

## Test Infrastructure

### Mock DB Transactions

```typescript
// test/helpers/db-transaction.ts
export async function withTestTransaction(fn: () => Promise<void>) {
  await db.transaction(async (tx) => {
    await fn();
    throw new RollbackError(); // always rollback
  }).catch(e => {
    if (!(e instanceof RollbackError)) throw e;
  });
}
```

### Test Fixtures

- Factory functions for each domain entity
- Seed scripts for E2E test database
- Role-based test user accounts

---

## Review Checklist

- [ ] Service layer has unit tests (TDD — written before implementation)
- [ ] Repository layer has integration tests
- [ ] Critical flows have E2E tests
- [ ] Coverage meets module threshold
- [ ] Tests are deterministic (no flaky tests)
- [ ] No `any` types in test files
- [ ] Test data cleaned up after runs
- [ ] Soft-delete behavior tested explicitly

---

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|-----------------|
| Test implementation details | Test behavior and public interfaces |
| Mock the database in integration tests | Use real test DB with rollback |
| Skip tests for "simple" logic | All service methods get tests |
| Shared mutable test state | Isolated fixtures per test |
| `.skip` or `.only` committed | Remove before PR |
