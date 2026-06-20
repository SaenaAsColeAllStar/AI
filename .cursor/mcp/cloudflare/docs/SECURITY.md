# Teknovo Cloudflare MCP — Security

## Threat Model

| Threat | Impact | Mitigation |
|--------|--------|------------|
| API token exfiltration via logs | Full account/zone mutation | Shared `mcp/shared/logger.js` masks tokens, keys, and truncates IDs |
| Token in git | Persistent credential leak | Teknovo secret store outside repo; `.env.example` has placeholders only |
| Secret store world-readable | Host credential theft | `chmod 600` on `*.env`, `chmod 700` on secrets directory |
| Over-privileged token | Blast radius on compromise | Least-privilege scopes documented in API.md |
| Unauthorized DNS change | Traffic hijack, phishing | Zone-scoped token; RBAC on agent deploy sessions |
| Unauthorized Pages deploy | Supply chain / defacement | Security reviewer APPROVE before deploy-session bundle |
| MCP tool injection | Arbitrary Cloudflare API calls | Zod validation on all tool inputs |
| Rate-limit abuse | API lockout / cost | Built-in 429 retry with backoff |

## Secret Management

1. **Storage**: Credentials in Teknovo secret store (`/root/.config/teknovo/secrets/` or `%USERPROFILE%\.config\teknovo\secrets\`) — never in code, config JSON, README, tests, or git.
2. **Loader**: `mcp/shared/secrets.js` — returns masked summaries; internal API use via `getCloudflareApiEnv()`.
3. **Transport**: Cloudflare API over HTTPS only (`api.cloudflare.com`).
4. **MCP stdio**: Tokens loaded at server startup — not passed in tool arguments.
5. **Rotation**: Rotate tokens every 90 days or immediately on suspected compromise.

### Secret Store Files

| File | Keys |
|------|------|
| `cloudflare.env` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID` |

Validation in `lib/validation.js` fails closed — tools return structured errors without API calls when credentials are missing.

## Token Lifecycle

1. Create least-privilege token in Cloudflare Dashboard
2. Write to secret store file (never commit)
3. Restart MCP server or reload secrets
4. Verify with `pages_list_projects` (read) before write operations
5. Revoke old token after successful rotation
6. Audit Cloudflare audit logs

## Least Privilege Token Template

| Permission | Access |
|------------|--------|
| Account → Cloudflare Pages | Edit |
| Account → Account Settings | Read |
| Zone → DNS | Edit |
| Zone → Zone | Read |

Scope to Teknovo account and target school zone only.

Do **not** grant Workers Scripts Edit, Account Firewall Edit, or Zero Trust Admin unless separately required.

## Agent Session Controls

Per `.cursor/registry/mcp-registry.yaml`:

- **deploy-session** bundle includes `cloudflare-mcp`
- Requires `security-reviewer` APPROVE before write operations
- Pair with `teknovo-devops-engineer` skill

## Logging and Audit

- Structured JSON logs to stderr (stdio MCP compatibility)
- Mask: Bearer tokens, env vars, fields named `token`, `secret`, `password`, `apiKey`
- Truncate `accountId` and `zoneId` in log metadata
- Do not log full API response bodies in production (`logging.level: warn`)

Cloudflare Dashboard → Audit Logs records DNS changes, Pages deployments, and domain attachments.

## Incident Response

If token is leaked:

1. Revoke token immediately in Cloudflare Dashboard
2. Review audit logs for unauthorized changes
3. Rotate all related secrets on the host
4. Run `gstack-investigate` per `teknovo-incident-response` skill

## References

- `docs/SECRET_STORE.md` — secret architecture
- `.cursor/mcp/cloudflare/docs/SECRET_STORE.md` — MCP integration
- `.cursor/gates/security/cloudflare-security.md`
- `.cursor/gates/security/ai-agent-security.md`
- `.cursor/registry/mcp-registry.yaml`
