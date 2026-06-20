# Platform Backend Agent

Node/TypeScript REST APIs, database migrations, RBAC, and authentication.

## Contract Files

See `agent.yaml`, `capabilities.yaml`, `workflow.yaml`, `system-prompt.md`, and `AGENT.md`.

## Handler

```js
import { handleBackendTask } from './index.js';
```

## Layer Order

Database → Repository → Service → Controller
