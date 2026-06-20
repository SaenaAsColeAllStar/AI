# Teknovo Secret Store

Centralized credential storage for Teknovo MCP servers and AI workstation automation. Secrets live **outside the git repository** on the host filesystem.

## Architecture

```text
┌──────────────────────┐
│  MCP Server (stdio)  │
└──────────┬───────────┘
           │ loadCloudflareSecrets()
           │ loadGithubSecrets()
           │ loadOpenRouterSecrets()
           ▼
┌──────────────────────────────────────────────┐
│  mcp/shared/secrets.js                       │
│  - resolveSecretsDir()                       │
│  - parse .env files                          │
│  - mask tokens in returned summaries         │
│  - get*ApiEnv() for internal API use only    │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│  Secret store (never in git)                 │
│  /root/.config/teknovo/secrets/   (Linux prod)│
│  ~/.config/teknovo/secrets/       (dev)       │
└──────────────────────────────────────────────┘
```

## Secret File Locations

| Platform | Path |
|----------|------|
| Linux production | `/root/.config/teknovo/secrets/` |
| Windows dev | `%USERPROFILE%\.config\teknovo\secrets\` |
| macOS / Linux dev | `~/.config/teknovo/secrets/` |

Override with `TEKNOVO_SECRETS_DIR` when needed.

### Required Files

| File | Keys |
|------|------|
| `cloudflare.env` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID` |
| `github.env` | `GITHUB_TOKEN` |
| `openrouter.env` | `OPENROUTER_API_KEY` |

Example `cloudflare.env` (placeholders only — never commit real values):

```bash
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ZONE_ID=
```

## Load Order

1. Teknovo secret store (`*.env` files above)
2. Process environment (Cursor MCP `env` block or shell)
3. Optional local `.cursor/mcp/cloudflare/.env` (development fallback only)

Tools **fail closed** when credentials are missing — no API calls with empty tokens.

## Masking Policy

- Public loader return: `{ token: "***MASKED***", configured: true, accountId, zoneId }`
- Internal API use: `getCloudflareApiEnv()`, `getGithubToken()`, `getOpenRouterApiKey()`
- Logs: `mcp/shared/logger.js` masks tokens, API keys, and truncates account/zone IDs

## Secure Deployment

1. Create secret directory on workstation or CI runner host
2. Set file permissions `600` on each `*.env` file
3. Restrict directory to deploy user (`chmod 700`)
4. Configure MCP server without embedding secrets in `mcp.json` — use secret store or host env
5. Run `security-reviewer` APPROVE before deploy-session MCP bundle

## Token Rotation

1. Create new Cloudflare/GitHub/OpenRouter credential with same least-privilege scopes
2. Update the corresponding `*.env` file in secret store
3. Restart MCP server or call loader with `forceReload: true` in automation
4. Verify read operation (`pages_list_projects`) before write operations
5. Revoke old credential in provider dashboard
6. Review provider audit logs for anomalies

## Backup

- **Do not** backup secret files to git, cloud drives, or ticket systems
- Use encrypted host backup (e.g. encrypted volume snapshot) if disaster recovery requires it
- Document which keys exist — not their values — in runbooks

## Permission Model

| Role | Secret store access | MCP write tools |
|------|---------------------|-----------------|
| Developer workstation | Own user `.config/teknovo/secrets/` | After security review |
| CI deploy runner | `/root/.config/teknovo/secrets/` read-only | Deploy session only |
| Agent (default) | Read via MCP loader | Blocked without APPROVE |

Cloudflare token scopes: Pages Edit, DNS Edit, Zone Read — scoped to target account and zone only.

## References

- `mcp/shared/secrets.js` — loader implementation
- `.cursor/mcp/cloudflare/docs/SECRET_STORE.md` — Cloudflare MCP integration
- `.cursor/registry/mcp-registry.yaml` — MCP activation and secret paths
- `.cursor/gates/security/cloudflare-security.md` — Teknovo security gates

**Never commit actual secrets to this repository.**
