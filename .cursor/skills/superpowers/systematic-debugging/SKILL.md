---
name: superpowers-systematic-debugging
description: Execute systematic, evidence-based debugging cycles when code fails or reports errors. Never guess-and-check.
---

# Systematic Debugging Skill

Use this skill when resolving compile errors, failing tests, or runtime bugs. **Avoid random guess-and-check code changes.**

Adapted from [Superpowers systematic-debugging](https://github.com/obra/superpowers) — 4-phase root cause process.

---

## When to Activate

- Compile or TypeScript errors
- Failing unit, integration, or E2E tests
- Runtime exceptions or 500 errors
- Unexpected behavior reported by user
- Trigger words: bug, error, fail, stacktrace, crash, exception, debug

---

## 4-Phase Debugging Cycle

### Phase 1: Isolate & Observe

1. Read the **full error message**, logs, and stack trace
2. Locate the **exact file and line** where failure occurs
3. Identify which layer failed: Controller, Service, Repository, Database, UI
4. Check recent changes (`git diff`, `git log -5`)
5. Do NOT change any code yet

### Phase 2: Reproduce

1. Write a **minimal failing test case** or command that reproduces consistently
2. Confirm the failure is deterministic (same error every time)
3. Document reproduction steps:
   ```markdown
   ## Reproduction
   1. Run: `pnpm test src/modules/academic/attendance.service.test.ts`
   2. Expected: pass
   3. Actual: ValidationError at line 42
   ```

### Phase 3: Hypothesize & Fix

1. Formulate a **single hypothesis** explaining the root cause
2. Make the **minimal modification** to resolve it
3. Common Teknovo root causes:
   - Missing `deleted_at IS NULL` filter in repository query
   - Controller accessing repository directly (layer violation)
   - Missing Zod validation on request payload
   - Missing RBAC guard on new endpoint
   - UUID v7 not generated for new record
   - Missing audit columns in schema migration

### Phase 4: Verify

1. Run reproduction test — confirm it passes
2. Run full test suite — confirm no regressions
3. Run `tsc --noEmit` — confirm no type errors
4. If fix didn't work, return to Phase 1 with new observations

---

## Teknovo-Specific Debugging

| Symptom | Likely Cause | Check |
|---------|-------------|-------|
| 403 on new endpoint | Missing RBAC permission | `@RequirePermissions()` decorator |
| Empty list returned | Soft-delete filter missing | `where(isNull(table.deletedAt))` |
| Type error on DTO | Zod schema mismatch | Controller input validation |
| Migration fails | Missing audit columns | `database-standard.md` checklist |
| Event not processed | Missing correlationId | BullMQ job payload |
| UI shows blank page | Missing loading/error state | 5 page states checklist |

---

## Forbidden During Debugging

- Adding `console.log` in production layers (use structured logging)
- Changing unrelated code "while you're here"
- Disabling tests to make them pass
- Using `any` or `ts-ignore` to suppress errors
- Hard deleting records to "fix" data issues

---

## Trace Async Failures

For BullMQ job failures, inspect:

- `jobId`, `correlationId`, `traceId` in payload
- Dead Letter Queue entries
- Redis connection status
- Retry count and backoff timing

---

## Completion

After fix verified → invoke **superpowers-verification-before-completion** before declaring resolved.
