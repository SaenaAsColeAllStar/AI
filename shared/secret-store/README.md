# Teknovo Secret Store

Platform-level wrappers around `mcp/shared/secrets.js`.

## Paths

| Environment | Directory |
|-------------|-----------|
| Linux production | `/root/.config/teknovo/secrets/` |
| Windows / dev | `%USERPROFILE%\.config\teknovo\secrets\` |
| Override | `TEKNOVO_SECRETS_DIR` |

## Files

| File | Required keys |
|------|---------------|
| `cloudflare.env` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID` |
| `github.env` | `GITHUB_TOKEN` |
| `openrouter.env` | `OPENROUTER_API_KEY` |

## Usage

```js
import { loadAllSecrets, getSecretStoreStatus } from '@teknovo/secret-store';

const status = getSecretStoreStatus();
const secrets = loadAllSecrets();
```

Never commit secret files. Tokens are masked in logs.
