# Deployment Mode â€” Execution System V2

> **Registry**: `.cursor/gates/execution/execution-registry.yaml` â†’ `deployment_mode`  
> **Skill**: `.cursor/skills/teknovo-cloudflare-stack/SKILL.md`  
> **Spec**: `.cursor/docs/ai/AI_EXECUTION_SYSTEM.md`

---

## Principle

When deployment is requested, **execute** the full pipeline. Do not respond with instructions-only mode when tools and credentials are available.

---

## Workflow

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Build  â”‚â”€â”€â–¶â”‚  Test   â”‚â”€â”€â–¶â”‚ Fix failures â”‚â”€â”€â–¶â”‚ Deploy  â”‚â”€â”€â–¶â”‚ Verify DNS + HTTPS  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                  â”‚                â–²
                  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   self-heal (max 10 retries)
```

---

## Step 1 â€” Build

```bash
npm install   # or pnpm install
npm run build # project-specific
```

On failure: `.cursor/gates/execution/failure-recovery.md` (Node/TS recovery).

---

## Step 2 â€” Test

```bash
npm test
# or: npm run test:e2e, vitest, playwright â€” per project
```

On failure: inspect failures â†’ fix implementation â†’ rerun until pass.

---

## Step 3 â€” Fix Failures (Self-Heal)

Apply automatic recovery before deploy:

- Max **10 retries** per failing step
- No user handoff for recoverable errors
- Do not deploy with failing build or tests

---

## Step 4 â€” Deploy

### Cloudflare Pages (MCP)

Prerequisites:

- Secrets in `%USERPROFILE%\.config\teknovo\secrets\cloudflare.env` (Windows) or `/root/.config/teknovo/secrets/cloudflare.env` (Linux)
- MCP server: `.cursor/mcp/cloudflare/`

| Step | MCP Tool / Action |
|------|-------------------|
| List projects | `pages_list_projects` |
| Create project (if new) | `pages_create_project` |
| Deploy | `pages_deploy` |
| Attach domain | `domain_attach` |
| Get deployment | `pages_get_deployment` |

### DNS (when required)

| Tool | Use |
|------|-----|
| `dns_list_records` | Inspect zone |
| `dns_create_record` | Add record |
| `dns_update_record` | Fix record |

Use Secret Store â€” never hardcode API tokens.

---

## Step 5 â€” Verify Deployment

Confirm:

- Deployment status = success (Pages dashboard or `pages_get_deployment`)
- Expected branch / environment
- Deployment URL reachable (HTTP 200)

---

## Step 6 â€” Verify DNS

| Check | Method |
|-------|--------|
| Record exists | `dns_list_records` or `domain_verify` |
| Propagation | `domain_verify` MCP tool |
| Correct target | CNAME / A matches Pages hostname |

Retry DNS fixes (record create/update) up to retry limit.

---

## Step 7 â€” Verify HTTPS

| Check | Pass criteria |
|-------|---------------|
| TLS certificate | Valid, not expired |
| HTTPS URL | `https://<domain>` returns 200 |
| Redirect | HTTP â†’ HTTPS if required |

Use `domain_verify` and curl/fetch against live URL.

---

## Completion Output

Return **only after** verification succeeds:

| Field | Description |
|-------|-------------|
| `deployment_url` | Live Pages or app URL |
| `deployment_status` | success / failed + detail |
| `dns_status` | verified / pending / failed |
| `https_status` | valid / invalid / pending |

Example summary:

```text
deployment_url: https://erp.school.sch.id
deployment_status: success
dns_status: verified
https_status: valid
```

Do not stop before DNS and HTTPS verification complete (or retry limit with clear blocker).

---

## Auto-Deploy Triggers

When user intent includes:

- "deploy ke cloudflare"
- "deploy ke smk.ctos.web.id"
- "deploy to production/staging"

â†’ Start this workflow immediately if credentials exist.  
â†’ If secrets missing: fail safely, list required env file path (no token values).

---

## Gates Before Production Deploy

Execution mode runs build/test/deploy automatically; Teknovo **ship gates** still apply for production ERP:

- Security pre-deploy review (`.cursor/gates/security/security-gates.md`)
- Assurance / differential review on PR
- Pillar 3 Deployment Impact Analysis

For workstation MCP demos and infra deploys, execution workflow above is sufficient unless user specifies production ERP.

---

## Cross-References

| Doc | Purpose |
|-----|---------|
| `.cursor/mcp/cloudflare/README.md` | MCP setup |
| `docs/SECRET_STORE.md` | Credentials |
| `docs/infrastructure/deployment-standard.md` | Teknovo deploy standard |
| `AI_DEPLOY.md` | Workstation deploy |
| `.cursor/gates/execution/failure-recovery.md` | Retry on failure |
