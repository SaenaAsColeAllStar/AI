# Cloudflare MCP — Secret Store Integration

The Cloudflare MCP server loads credentials via `mcp/shared/secrets.js` before handling tool calls.

## Startup

`server.js` calls `loadCloudflareSecrets()` on boot. Each tool validates credentials through `lib/validation.js` → `getCloudflareApiEnv()`.

## Secret File

Path (production):

```text
/root/.config/teknovo/secrets/cloudflare.env
```

Windows development:

```text
%USERPROFILE%\.config\teknovo\secrets\cloudflare.env
```

Required keys:

```bash
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ZONE_ID=
```

## Cursor MCP Configuration

Prefer secret store over inline tokens in `mcp.json`:

```json
{
  "mcpServers": {
    "teknovo-cloudflare": {
      "command": "node",
      "args": [".cursor/mcp/cloudflare/server.js"]
    }
  }
}
```

Optional override:

```json
"env": {
  "TEKNOVO_SECRETS_DIR": "C:/Users/you/.config/teknovo/secrets"
}
```

## Verification

```bash
cd mcp/cloudflare
npm test
```

Secret loader tests: `tests/secrets.test.js`

## See Also

- Repository root: `docs/SECRET_STORE.md`
- Security: `docs/SECURITY.md`
