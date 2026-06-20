# Static Analysis Strategy — Teknovo Assurance Engineering System

> **When**: Plan static analysis section; enforce on PR and pre-deploy  
> **Stack**: Nuxt 4, TypeScript strict, Cloudflare Workers, Drizzle, pnpm monorepo, Python ai-agent  
> **Pair with**: `.cursor/gates/assurance/insecure-defaults.md`, `.cursor/gates/quality/engineering-principles.md`

---

## Purpose

Static analysis catches **classes of bugs humans and AI repeat** — RBAC bypass, SQL injection patterns, secret leaks, type holes — before runtime. Assurance defines **which tools run when**, with Teknovo-specific rules, not ad-hoc lint fixes at PR time.

---

## Tool Matrix

| Tool | Scope | When | Owner |
|------|-------|------|-------|
| **TypeScript** `tsc --noEmit` | All TS packages | Every PR | CI required |
| **ESLint** | Portal, API, packages | Every PR | CI required |
| **Prettier** | Formatted repos | Pre-commit | CI check |
| **Semgrep** | Security + Teknovo rules | PR + nightly | Assurance-defined ruleset |
| **CodeQL** | GitHub Advanced Security | PR to main | Security team / DevOps |
| **pnpm audit** | Dependency CVEs | PR + weekly | CI |
| **gitleaks / trufflehog** | Secret scan | Pre-commit + CI | DevOps |
| **drizzle-kit check** | Schema drift | Migration PRs | CI |
| **Playwright** | E2E critical paths | Pre-merge | QA |
| **Vitest** | Unit/integration | Every PR | CI |
| **Ruff/mypy** (Python) | ai-agent runtime | Python changes | CI |

---

## Semgrep Strategy (Teknovo Rules)

Maintain rules under `.semgrep/` or `.cursor/gates/security/semgrep/` (when created). Priority rules:

### RBAC & Tenancy

```yaml
# Conceptual — implement as Semgrep rule
- id: teknovo-missing-rbac-guard
  message: New controller method without permission decorator/guard
  pattern: ...
  severity: ERROR

- id: teknovo-client-school-id
  message: school_id taken from request body — use session context
  pattern: ...
  severity: ERROR
```

### Layer Violations

```yaml
- id: teknovo-controller-repository
  message: Controller must not import repository directly
  pattern: ...
  severity: ERROR

- id: teknovo-cross-module-repo
  message: Cross-module repository import forbidden
  pattern: ...
  severity: ERROR
```

### Security

```yaml
- id: teknovo-hardcoded-secret
  pattern: /(api[_-]?key|secret|password)\s*=\s*['"][^'"]+['"]/
  severity: ERROR

- id: teknovo-cors-wildcard
  pattern: cors.*origin.*\*
  severity: WARNING
```

### Data

```yaml
- id: teknovo-hard-delete
  message: Use soft delete pattern
  pattern: .delete(  # with table context
  severity: WARNING
```

### Cloudflare Workers

```yaml
- id: teknovo-worker-sync-loop
  message: Long sync loop in Worker request handler
  pattern: ...
  severity: WARNING
```

---

## CodeQL Strategy

Enable for GitHub repo when available:

| Query suite | Focus |
|-------------|-------|
| `security-and-quality` | Default PR |
| Custom | JWT misuse, injection in raw SQL strings |

Priority paths:
- `apps/api/**` — auth, payment, PPDB, CBT
- `packages/auth/**`
- `workers/**`

---

## ESLint Teknovo Extensions

Beyond default `@typescript-eslint`:

| Rule intent | Example |
|-------------|---------|
| Ban `any` | `@typescript-eslint/no-explicit-any`: error |
| Ban `ts-ignore` | `@typescript-eslint/ban-ts-comment` |
| Import boundaries | eslint-plugin-boundaries for module layers |
| No console in prod | `no-console` warn in app code |

---

## Per-Change Analysis Plan

Include in plan / PR:

```markdown
## Static Analysis Plan — [Feature]

| Change type | Tools run | New rules needed? |
|-------------|-----------|-------------------|
| New API routes | tsc, eslint, semgrep rbac | No |
| New dependency | pnpm audit, license | Yes — dep review |
| Migration | drizzle-kit, semgrep hard-delete | No |
| Worker handler | semgrep worker-sync | Maybe |
| GitHub Action | actionlint, pin SHA review | Yes |
```

---

## CI Pipeline Order (Recommended)

```text
1. Secret scan (gitleaks)
2. pnpm install --frozen-lockfile
3. tsc --noEmit (affected packages)
4. eslint
5. vitest (unit)
6. semgrep --config .semgrep/
7. pnpm audit (fail on critical)
8. [merge] playwright (E2E)
9. [deploy] CodeQL + full audit
```

Use Turborepo/pnpm filters for affected packages in monorepo.

---

## Nuxt 4 / Frontend

| Check | Tool |
|-------|------|
| Vue SFC types | vue-tsc |
| a11y | eslint-plugin-vuejs-accessibility (if enabled) |
| Bundle secrets | semgrep + manual review env usage |
| Client RBAC only | semgrep + differential reviewer |

---

## Cloudflare Workers / D1

| Check | Tool |
|-------|------|
| Wrangler config secrets | gitleaks; manual review |
| SQL in strings | semgrep sql-injection |
| Unbounded D1 select | Custom semgrep |

---

## Python ai-agent Runtime

| Check | Tool |
|-------|------|
| Type safety | mypy on `ai-agent/` |
| Lint | ruff |
| YAML load | Avoid unsafe yaml.load |

---

## Failure Policy

| Severity | CI behavior |
|----------|-------------|
| Critical Semgrep/CodeQL | Block merge |
| High audit CVE | Block unless documented exception |
| ESLint error | Block merge |
| Warning | Track; fix within sprint |

Assurance Sign-Off requires static analysis plan for the feature. `gstack-ship` requires CI green.

---

## Integration

| Phase | Action |
|-------|--------|
| Planning | Document which tools apply |
| PR | Differential reviewer checks CI config in diff |
| Ship | Second opinion verifies no disabled checks |

---

## Related

- `.cursor/gates/assurance/dependency-review.md`
- `.cursor/gates/assurance/insecure-defaults.md`
- `agents/differential-reviewer.md`
- `teknovo-security-review` skill
- `superpowers-verification-before-completion`
