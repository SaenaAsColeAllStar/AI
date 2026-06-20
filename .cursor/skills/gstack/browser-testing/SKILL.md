---
name: gstack-browser-testing
description: Execute E2E automated test suites using Playwright/Vitest for real browser user flow validation.
---

# Browser Testing Skill

Use this skill for end-to-end user flow validation in a real browser. Complements unit/integration tests with actual UI interaction.

Modeled after [GStack /qa browser testing](https://github.com/garrytan/gstack) with Teknovo Playwright standards.

---

## When to Activate

- UI pages or flows were modified
- QA phase requires E2E validation
- User asks for Playwright or browser tests
- Trigger words: E2E, Playwright, browser test, page interaction

---

## Setup Requirements

- Playwright installed in monorepo
- Test database seeded with fixture data
- Application running (dev server or staging URL)
- Test user accounts for each role (SUPER_ADMIN, GURU, SISWA, etc.)

Reference: `docs/standards/testing/testing-standard.md`

---

## E2E Test Protocol

### 1. Critical Flows (Always Test)

| Flow | Roles | Key Assertions |
|------|-------|----------------|
| Login | All | Redirect to dashboard, session cookie set |
| PPDB Registration | ORANG_TUA | Form validation, payment redirect |
| Payment | TU, ORANG_TUA | Amount correct, receipt generated |
| Exam (CBT) | SISWA, GURU | Timer, submission, grading |
| Report Card | GURU, SISWA, ORANG_TUA | PDF download, grade display |

### 2. Page State Tests

For each new page, verify in browser:

```typescript
// Example Playwright test structure
test('shows loading state while fetching', async ({ page }) => {
  await page.goto('/academic/classes');
  await expect(page.locator('[data-testid="skeleton"]')).toBeVisible();
  await expect(page.locator('[data-testid="class-table"]')).toBeVisible();
});

test('shows empty state when no data', async ({ page }) => {
  // seed empty database
  await page.goto('/academic/classes');
  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
});

test('shows permission denied for unauthorized role', async ({ page }) => {
  await loginAs(page, 'SISWA');
  await page.goto('/academic/classes/create');
  await expect(page.locator('[data-testid="permission-denied"]')).toBeVisible();
});
```

### 3. Interaction Tests

- [ ] Form submission with valid data → success toast
- [ ] Form submission with invalid data → inline errors
- [ ] Table pagination → correct page data
- [ ] Table search/filter → filtered results
- [ ] Bulk action → confirmation dialog → success
- [ ] Modal open/close → no state leak
- [ ] Navigation → breadcrumb updates correctly

### 4. Responsive Tests

- [ ] Desktop: sidebar visible, full table
- [ ] Mobile: drawer navigation, responsive table/card view
- [ ] No horizontal scroll on mobile viewport

---

## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e e2e/academic/classes.spec.ts

# Run with UI mode for debugging
pnpm test:e2e --ui

# Run against staging URL
PLAYWRIGHT_BASE_URL=https://staging.erp.domain.sch.id pnpm test:e2e
```

---

## Test Data Management

- Use factory functions for test fixtures
- Seed database before each test suite
- Clean up after tests (soft-delete test records)
- Never use production data in E2E tests

---

## Browser Testing Output

```markdown
## Browser Test Report

| Test File | Tests | Passed | Failed |
|-----------|-------|--------|--------|
| e2e/login.spec.ts | 5 | 5 | 0 |
| e2e/academic/classes.spec.ts | 8 | 7 | 1 |

### Failures
- `shows empty state when no data` — empty state component missing data-testid

### Screenshots
- [attached on failure]
```

---

## After Browser Testing

- All pass → report to **gstack-qa** as E2E evidence
- Failures → invoke **superpowers-systematic-debugging** with screenshot/trace
