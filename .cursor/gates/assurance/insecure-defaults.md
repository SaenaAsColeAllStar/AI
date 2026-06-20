# Insecure Defaults Review — Teknovo Assurance Engineering System

> **When**: Before Security gate; proactive audit during Assurance Review  
> **Cross-ref**: `.cursor/gates/security/security-principles.md`, `.cursor/gates/security/api-security.md`, `.cursor/gates/security/rbac-security.md`  
> **Distinction**: Assurance finds gaps early; Security layer enforces policy

---

## Purpose

Insecure defaults are **safe-looking configurations that expose data or enable abuse** when developers or AI agents move fast. Assurance scans plans and diffs for defaults that violate Teknovo security posture **before** code merges.

This is proactive audit. Security gates apply mandatory policy. Both must pass.

---

## Scan Categories

### 1. Missing Validation

| Default failure | Teknovo example | Required fix |
|-----------------|-----------------|--------------|
| No Zod on controller | Raw body to service | Zod schema at controller |
| Trust client IDs | `school_id` from form | Derive from session/context |
| Optional auth | `@Public()` on write | Explicit guard + ADR |
| File type not checked | Upload any extension | Allowlist + magic bytes |
| Size limit absent | 500MB PDF to R2 | Max size in API + Worker |

### 2. Missing Auth / RBAC

| Default failure | Teknovo example | Required fix |
|-----------------|-----------------|--------------|
| Route without permission | New PPDB export | `ppdb.applicant.export` |
| Menu visible to all | Finance link for SISWA | Nav RBAC matrix |
| Guard only in Nuxt middleware | Direct API call works | Backend guard |
| Default role = admin in seed | Dev convenience | Least privilege seed |
| Missing Permission page state | Blank screen on 403 | Page state implemented |

### 3. Weak Defaults

| Default failure | Teknovo example | Required fix |
|-----------------|---------------|--------------|
| JWT long TTL | 30-day token | Short access + refresh |
| CORS `*` | Portal + API | Explicit origins |
| Rate limit disabled | Login brute force | Cloudflare + app limit |
| Error exposes stack | 500 with trace | Generic message + log id |
| Log includes PII | WA phone in info log | Redact structured fields |
| Presigned URL long TTL | 7-day doc link | Minutes + RBAC check |

### 4. Hardcoded Credentials

| Default failure | Location | Required fix |
|-----------------|----------|--------------|
| API key in source | Worker script | Secrets binding |
| DB URL in repo | `.env` committed | `.env.example` only |
| Test password in E2E | Committed Playwright | CI secret |
| Ollama admin open | LAN bind 0.0.0.0 | Localhost + tunnel |
| MCP token in config | Cursor settings | Env var |

### 5. Unsafe Configurations

| Default failure | Teknovo example | Required fix |
|-----------------|-----------------|--------------|
| R2 bucket public | Student documents | Private + presigned |
| D1 prod from local wrangler | Wrong data | Env separation |
| GitHub Action `pull_request_target` unsafe | Untrusted fork | Restrict workflow |
| `--no-verify` commit habit | Hook bypass | Document prohibition |
| Debug mode in prod | `DEBUG=*` | Env-gated logging |

---

## Insecure Defaults Checklist

Run against plan and PR diff:

```markdown
## Insecure Defaults Scan

### Validation
- [ ] All new endpoints have Zod schemas
- [ ] IDs from trusted context, not client body
- [ ] File uploads validated (type, size)

### Auth / RBAC
- [ ] New routes in RBAC matrix
- [ ] Backend guard on every HTTP method
- [ ] UI permission gate matches API

### Defaults
- [ ] No wildcard CORS
- [ ] Rate limits on auth + expensive endpoints
- [ ] Errors sanitized for client

### Secrets
- [ ] No secrets in diff
- [ ] `.env.example` updated without values
- [ ] CI uses secret store

### Infra
- [ ] R2/D1/Worker env separation documented
- [ ] GitHub Actions pinned (SHA) for third-party

**Verdict**: PASS | BLOCK
```

---

## Assurance vs Security Layer

| Aspect | Assurance (`insecure-defaults.md`) | Security (`.cursor/gates/security/*`) |
|--------|-----------------------------------|-------------------------|
| Timing | During plan + pre-implementation | Mandatory before code + pre-deploy |
| Tone | Proactive audit, ask "what did we miss?" | Policy enforcement |
| Output | Scan worksheet in plan | Security Review sign-off |
| Overlap | Identifies gaps | Defines required controls |

Workflow: Assurance scan → fix plan → Security gate → implementation

---

## AI Agent Specific Defaults

| Risk | Mitigation |
|------|------------|
| Agent adds `@Public()` for testing | Differential reviewer blocks |
| Agent commits `.env` | Pre-commit + assurance scan |
| Agent disables ESLint rule | Require justification in PR |
| Agent uses `any` to unblock | Strict types — no bypass |
| Agent deploys without gates | `gstack-ship` blocked |

Reference: `.cursor/gates/security/ai-agent-security.md` (when present)

---

## Automatic BLOCK Patterns

```text
❌ New write endpoint without permission in plan
❌ school_id from request body on multi-tenant route
❌ Secret string added to tracked file
❌ GET list without pagination limit
❌ Hard delete on financial or CBT result table
❌ CORS * on production API
❌ Client-only auth check for sensitive action
```

---

## Integration

| Next step | Document |
|-----------|----------|
| Security policy detail | `.cursor/gates/security/security-principles.md` |
| API controls | `.cursor/gates/security/api-security.md` |
| RBAC | `.cursor/gates/security/rbac-security.md` |
| Differential review | `agents/differential-reviewer.md` |
| Static analysis | `.cursor/gates/assurance/static-analysis.md` |

---

## Related

- `.cursor/gates/assurance/sharp-edges.md`
- `.cursor/gates/assurance/review-workflow.md`
- `.cursor/gates/security/security-gates.md`
