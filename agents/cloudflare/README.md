# Platform Cloudflare Agent

Cloudflare Pages, DNS, domain attach, SSL verify, and production deploy.

## Contract Files

| File | Purpose |
|------|---------|
| `agent.yaml` | Discovery metadata |
| `config.yaml` | Skills, MCPs, triggers |
| `capabilities.yaml` | Capabilities and skill references |
| `workflow.yaml` | Deploy patterns |
| `system-prompt.md` | Runtime prompt |
| `AGENT.md` | Full specification |

## Handler

```js
import { handleCloudflareTask } from './index.js';
```

## MCP

Integrates with `mcp/cloudflare/server.js` via cloudflare-mcp.
