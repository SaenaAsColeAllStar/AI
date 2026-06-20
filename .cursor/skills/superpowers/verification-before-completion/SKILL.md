---
name: superpowers-verification-before-completion
description: Perform comprehensive quality checks, linting, building, and test runs before declaring any task complete. Evidence over claims.
---

# Verification Before Completion Skill

Use this skill before declaring ANY task complete. **Evidence over claims** — never say "should work" or "looks good" without test output.

Adapted from [Superpowers verification-before-completion](https://github.com/obra/superpowers).

---

## When to Activate

- About to say "done", "complete", "finished"
- Before creating a PR or merge request
- After fixing a bug (confirm fix with evidence)
- Trigger words: done, complete, finish task, verify

---

## Mandatory Verification Checklist

Run ALL applicable checks and capture output:

### 1. Type Safety
```bash
pnpm tsc --noEmit
```
**Pass criteria**: Zero errors

### 2. Linting
```bash
pnpm lint
```
**Pass criteria**: Zero errors on changed files

### 3. Unit Tests (Service Layer)
```bash
pnpm test -- --run src/modules/<domain>/
```
**Pass criteria**: All tests pass

### 4. Integration Tests (Repository Layer)
```bash
pnpm test:integration -- --run
```
**Pass criteria**: All tests pass

### 5. Coverage Check
```bash
pnpm test:coverage
```
**Pass criteria**:
- Global baseline: 70%+
- Auth/Finance modules: 90%+
- Payment modules: 95%+

### 6. Build
```bash
pnpm build
```
**Pass criteria**: Build succeeds without errors

### 7. E2E (if UI changed)
```bash
pnpm test:e2e
```
**Pass criteria**: Critical user flows pass

---

## Evidence Format

Present verification results as:

```markdown
## Verification Evidence

| Check | Command | Result |
|-------|---------|--------|
| TypeScript | `pnpm tsc --noEmit` | ✅ 0 errors |
| Lint | `pnpm lint` | ✅ 0 warnings |
| Unit tests | `pnpm test --run` | ✅ 42/42 passed |
| Coverage | `pnpm test:coverage` | ✅ 78.3% (target: 70%) |
| Build | `pnpm build` | ✅ success |
```

---

## If Any Check Fails

1. Do NOT declare complete
2. Invoke **superpowers-systematic-debugging**
3. Fix the issue
4. Re-run ALL checks
5. Only then declare complete

---

## Teknovo Standards Spot-Check

Even if tests pass, verify manually:

- [ ] No `any` or `ts-ignore` in changed files
- [ ] No controller → repository direct access
- [ ] All new tables have UUID v7 + audit columns
- [ ] All queries filter `deleted_at IS NULL`
- [ ] All new endpoints have RBAC guards
- [ ] All new pages have 5 states (Loading, Empty, Error, Success, Permission)
- [ ] No Lucide/Bootstrap/Font Awesome icons
- [ ] No dump files created (`utils.ts`, `helpers.ts`)

---

## Completion Statement

Only after all checks pass:

> Task complete. All verification checks passed with evidence above.

Never use: "should work", "I believe this is fixed", "looks correct".
