# Platform DevOps Agent

Docker, CI/CD, deployment verification, rollback, and pipeline orchestration.

## Contract Files

See `agent.yaml`, `capabilities.yaml`, `workflow.yaml`, `system-prompt.md`, and `AGENT.md`.

## Handler

```js
import { handleDevopsTask } from './index.js';
```

## Delegates

- Cloudflare-specific deploy → `platform-cloudflare`
- GitHub PR/release → `platform-github`
