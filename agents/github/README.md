# Platform GitHub Agent

Repository, branch, PR, releases, issues, and project automation.

## Contract Files

See `agent.yaml`, `capabilities.yaml`, `workflow.yaml`, `system-prompt.md`, and `AGENT.md`.

## Handler

```js
import { handleGitHubTask } from './index.js';
```

## MCP

Integrates with `mcp/github/server.js` via github-mcp.
