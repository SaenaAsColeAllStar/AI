# Platform Frontend Agent

Specialized agent for Next.js, React, Tailwind CSS, UI, SEO, accessibility, and landing pages.

## Contract Files

| File | Purpose |
|------|---------|
| `agent.yaml` | Discovery metadata |
| `config.yaml` | Skills, MCPs, triggers |
| `capabilities.yaml` | Capabilities and skill references |
| `workflow.yaml` | Handoff patterns |
| `system-prompt.md` | Runtime prompt |
| `AGENT.md` | Full specification |

## Handler

```js
import { handleFrontendTask } from './index.js';
```

## Handoff

After UI implementation, hand off to `platform-testing` for E2E verification.
