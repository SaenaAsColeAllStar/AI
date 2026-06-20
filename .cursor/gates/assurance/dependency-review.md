# Dependency & Supply Chain Review — Teknovo Assurance Engineering System

> **When**: New npm/pnpm packages, Python deps, GitHub Actions, MCP servers, external repos  
> **Inspired by**: Supply chain risk auditing methodology  
> **Pair with**: `.cursor/gates/assurance/static-analysis.md`, `.cursor/gates/security/security-principles.md`

---

## Purpose

Every dependency is **untrusted code** running in Teknovo's school ERP, Cloudflare edge, CI pipeline, or AI workstation. Assurance reviews trustworthiness, maintenance, security posture, and viability before adoption.

---

## Scope

| Source | Examples | Review trigger |
|--------|----------|----------------|
| **NPM/pnpm** | New package in `apps/portal`, `packages/*` | Any new production dependency |
| **Python** | `.cursor/runtime`, scripts | New pip/poetry dep |
| **GitHub Actions** | Third-party actions in `.github/workflows` | New or version bump of external action |
| **MCP integrations** | Cursor MCP servers | New server or expanded permissions |
| **External repos** | Git submodules, vendored code | Any import outside monorepo |
| **Cloudflare** | Workers bindings, WASM modules | New binding or binary |

DevDependencies: lighter review unless they run in CI with secrets or publish artifacts.

---

## Review Template

```markdown
## Dependency Review — [name@version]

| Field | Value |
|-------|-------|
| **Purpose** | Why needed; what native/alternative rejected |
| **Registry** | npm / PyPI / GitHub |
| **License** | MIT / Apache-2.0 / ... (OSI approved?) |
| **Maintainer** | Org vs individual; bus factor |
| **Last release** | Date; release cadence |
| **Downloads / stars** | Popularity signal (not sole criterion) |
| **Known CVEs** | `pnpm audit` / OSV result |
| **Transitive risk** | Notable heavy deps |
| **Teknovo stack fit** | Nuxt 4 / Workers / Drizzle compatible? |
| **Verdict** | APPROVE | APPROVE WITH CONDITIONS | REJECT |
```

---

## Trustworthiness Criteria

### APPROVE when

- OSI-approved license compatible with Teknovo distribution
- Active maintenance (release within 12 months or LTS track)
- No unresolved Critical CVE without mitigation
- Clear security contact or responsive maintainer
- Used by reputable projects OR small focused scope with readable source
- Pin version in lockfile; no floating ranges in production

### APPROVE WITH CONDITIONS when

- Minor CVE with fix available → upgrade in same PR
- Single maintainer but widely audited (document risk acceptance)
- Required for one feature → isolate behind adapter; plan removal path

### REJECT when

- Unknown maintainer + minified single-file publish
- Copyleft incompatible with deployment model (evaluate case-by-case)
- Unresolved Critical/High CVE
- Deprecated package with no migration path
- Requests excessive permissions (MCP filesystem shell, network exfil)
- Duplicates existing monorepo capability without measurable benefit

---

## Teknovo-Specific Supply Chain Risks

### Monorepo (pnpm)

| Check | Action |
|-------|--------|
| Duplicate libs | Prefer `@teknovo/*` internal packages |
| Postinstall scripts | Review `preinstall`/`postinstall` in new deps |
| Lockfile integrity | Commit `pnpm-lock.yaml`; no `--no-frozen-lockfile` in CI prod |
| Workspace protocol | Use `workspace:*` for internal refs |

### Cloudflare Workers

| Check | Action |
|-------|--------|
| Node API compatibility | Verify `nodejs_compat` need |
| Bundle size | Avoid heavy crypto/UI libs on edge |
| WASM provenance | Build from source; pin hash |

### GitHub Actions

| Check | Action |
|-------|--------|
| Pin to SHA | `uses: org/action@abc123...` not `@v4` |
| Token permissions | Least privilege `permissions:` block |
| Fork PR safety | No unsafe `pull_request_target` patterns |
| Third-party action | Prefer `actions/*`, Cloudflare official, or audited |

### MCP (Cursor / Ollama workstation)

| Check | Action |
|-------|--------|
| Tool scope | Read-only vs write vs deploy |
| Network access | Justify external calls |
| Secret access | No prod credentials in MCP config |
| Vendor | Document in `.cursor/docs/memory/lessons-learned.md` |

### Ollama / AI runtime

| Check | Action |
|-------|--------|
| Model source | Official registry vs unknown GGUF |
| Python deps for agents | Pin in requirements; audit quarterly |

---

## Review Workflow

1. **Identify** — `pnpm why <pkg>` or diff lockfile
2. **Justify** — Decision log entry: why not built-in?
3. **Scan** — `pnpm audit`, OSV, license checker
4. **Read** — Skim source for network/exfil/postinstall
5. **Record** — Dependency Review template in PR
6. **Monitor** — Add to quarterly audit list in plan or `.cursor/docs/memory/lessons-learned.md`

---

## CI Integration

```bash
# Local pre-PR
pnpm audit --audit-level=moderate
pnpm licenses list  # if configured

# Python
pip audit  # or pip-audit tool
```

GitHub Actions should fail on Critical audit findings for production workspaces.

---

## Emergency / Hotfix

New dep in SEV-1 hotfix:
- Verbal APPROVE WITH CONDITIONS
- Full dependency review within 48 hours
- Document in PR post-merge

---

## Integration

| Document | Role |
|----------|------|
| `.cursor/gates/assurance/static-analysis.md` | SAST for vendored patterns |
| `.cursor/gates/assurance/decision-validation.md` | Alternatives considered |
| `agents/differential-reviewer.md` | Lockfile diff review |
| `teknovo-devops-engineer` | CI Action approval |

---

## Related

- `.cursor/gates/assurance/review-workflow.md`
- `.cursor/gates/assurance/insecure-defaults.md`
- `.cursor/gates/security/security-principles.md`
