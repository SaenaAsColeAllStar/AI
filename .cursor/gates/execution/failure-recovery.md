# Failure Recovery — Execution System V2

> **Authority**: Mandatory when any command, build, test, or deploy step fails  
> **Registry**: `.cursor/gates/execution/execution-registry.yaml` → `retry_policies`  
> **Spec**: `.cursor/docs/ai/AI_EXECUTION_SYSTEM.md`

---

## Core Rule

**Failure is not a stopping condition. Failure is a debugging task.**

When exit code ≠ 0:

1. Do **not** stop and return the error to the user.
2. Do **not** ask the user to fix recoverable issues.
3. Read output → inspect logs → read files → fix → retry.
4. Repeat until success or **10 automatic retries** (whichever comes first).

---

## Self-Healing Loop

```text
run command
    ↓
exit code == 0? ──yes──▶ continue pipeline
    ↓ no
read stderr / stdout
    ↓
identify root cause
    ↓
read affected files
    ↓
apply minimal fix
    ↓
retry (attempt + 1)
    ↓
attempt < 10? ──yes──▶ run command
    ↓ no
report blocked status with last error + fixes attempted
```

---

## Node.js Recovery

### npm install fails

| Step | Action |
|------|--------|
| 1 | Read full npm error output |
| 2 | Open and validate `package.json` (JSON syntax) |
| 3 | Repair malformed JSON if present |
| 4 | Check lockfile consistency (`package-lock.json` / `pnpm-lock.yaml`) |
| 5 | Resolve peer dependency conflicts (semver, overrides, `--legacy-peer-deps` as last resort) |
| 6 | Retry `npm install` |

### npm run build fails

| Step | Action |
|------|--------|
| 1 | Capture build log (first error often root cause) |
| 2 | Open failing file(s) at reported line |
| 3 | Repair code (imports, syntax, config) |
| 4 | Retry build |

### Dependency conflict

- Inspect conflicting package versions in lockfile and `package.json`.
- Align versions or add documented overrides.
- Retry install — do not leave conflict unresolved.

---

## TypeScript Recovery

When `tsc`, `tsc --noEmit`, or build-time TS fails:

1. Parse compiler error list (file, line, code).
2. Fix types, imports, and strict-mode violations in source — not `@ts-ignore`.
3. Retry until zero errors.

**Do not stop while TypeScript errors remain.**

---

## Test Recovery

When unit, integration, or E2E tests fail:

1. Read failure message and stack trace.
2. Distinguish **bug in implementation** vs **outdated test** (fix implementation first).
3. Repair code; rerun the smallest failing subset, then full suite.
4. Do not stop while tests are failing.

---

## Lint Recovery

When ESLint / Biome / project linter fails:

1. Read rule ID and file location.
2. Fix code to satisfy rule (prefer fix over disable).
3. Retry lint.

---

## Deploy Recovery

When deploy or MCP tool call fails:

1. Read API error body (Cloudflare, GitHub, etc.).
2. Verify secrets loaded from secret store (not missing token).
3. Fix config, build output path, or API payload.
4. Retry deploy step.
5. Re-run DNS/HTTPS verification after successful deploy.

Cross-ref: `.cursor/gates/execution/deployment-mode.md`

---

## Bootstrap / Workstation Recovery

For Ollama, model, or install failures — use workstation recovery, not ad-hoc guessing:

| Issue | Action |
|-------|--------|
| Install interrupted | `bash .cursor/runtime/bootstrap/recover.sh` |
| Ollama down | `bash .cursor/runtime/bootstrap/start-ollama.sh` |
| Model missing | `bash .cursor/runtime/bootstrap/install-model.sh` |
| Full reset | `AI_RECOVERY.md` |

---

## When to Escalate (After 10 Retries)

Report to user only when:

- 10 retries exhausted with documented attempts, **or**
- Missing secret/credential that cannot be generated locally, **or**
- External service outage confirmed, **or**
- User must make a product/architecture decision

Include: last error, files modified, retry count, suggested human action (one line).

---

## Cross-References

| Doc | Purpose |
|-----|---------|
| `.cursor/docs/ai/AI_EXECUTION_SYSTEM.md` | Full V2 spec |
| `.cursor/docs/EXECUTION.md` | Agent bootstrap |
| `AI_RECOVERY.md` | Workstation restore |
| `.cursor/gates/quality/self-critique.md` | Pre-completion verification |
