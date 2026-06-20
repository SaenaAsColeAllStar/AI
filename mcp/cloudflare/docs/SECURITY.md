# Teknovo Cloudflare MCP — Security

## Threat Model

| Threat | Impact | Mitigation |
|--------|--------|------------|
| API token exfiltration via logs | Full account/zone mutation | Token masking in `lib/logger.js`; never log request headers |
| Token in git | Persistent credential leak | `.env` only; `.env.example` has placeholders |
| Over-privileged token | Blast radius on compromise | Least-privilege scopes documented in API.md |
| Unauthorized DNS change | Traffic hijack, phishing | Zone-scoped token; RBAC on agent deploy sessions |
| Unauthorized Pages deploy | Supply chain / defacement | Security reviewer APPROVE before deploy-session bundle |
| MCP tool injection | Arbitrary Cloudflare API calls | Zod validation on all tool inputs |
| Rate-limit abuse | API lockout / cost | Built-in 429 retry with backoff |

## Secret Management

1. **Storage**: Credentials live only in environment variables or OS secret store — never in code, config JSON, or git.
2. **Transport**: Cloudflare API over HTTPS only (`api.cloudflare.com`).
3. **MCP stdio**: Tokens passed via Cursor MCP `env` block or shell environment — not in tool arguments.
4. **Rotation**: Rotate tokens every 90 days or immediately on suspected compromise.

### Required Environment Variables

```bash
CLOUDFLARE_API_TOKEN=   # Never commit
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ZONE_ID=
```

Validation in `lib/validation.js` fails closed — tools return structured errors without API calls when vars are missing.

## Token Rotation Procedure

1. Create new API token in Cloudflare Dashboard with same least-privilege scopes.
2. Update workstation `.env` and Cursor MCP config.
3. Verify with `pages_list_projects` (read) before write operations.
4. Revoke old token in Dashboard.
5. Audit recent Cloudflare audit logs for anomalies.

## Least Privilege Token Template

Create a **Custom Token** with:

| Permission | Access |
|------------|--------|
| Account → Cloudflare Pages | Edit |
| Account → Account Settings | Read |
| Zone → DNS | Edit |
| Zone → Zone | Read |

Scope to:
- **Account**: Teknovo account only
- **Zone**: Target school domain zone only

Do **not** grant:
- Workers Scripts Edit (unless separate MCP needed)
- Account Firewall Edit
- Zero Trust Admin

## Agent Session Controls

Per `registry/mcp-registry.yaml`:

- **deploy-session** bundle includes `teknovo-cloudflare-mcp`
- Requires `security-reviewer` APPROVE before write operations
- Pair with `teknovo-devops-engineer` skill

## Logging Policy

- Structured JSON logs to stderr (stdio MCP compatibility)
- Mask: Bearer tokens, `CLOUDFLARE_API_TOKEN`, fields named `token`, `secret`, `password`
- Do not log full API response bodies in production (`logging.level: warn`)

## Audit Trail

Cloudflare Dashboard → Audit Logs records:
- DNS record changes
- Pages deployments
- Domain attachments

Correlate MCP operations with audit entries during incident response.

## Incident Response

If token is leaked:

1. Revoke token immediately in Cloudflare Dashboard
2. Review audit logs for unauthorized changes
3. Rotate all related secrets (R2, tunnel tokens if shared workstation)
4. Run `gstack-investigate` per `teknovo-incident-response` skill

## References

- `security/cloudflare-security.md`
- `security/ai-agent-security.md`
- `registry/mcp-registry.yaml`
