# Execution Bootstrap — Read After AGENTS.md

> **Full spec**: `.cursor/docs/ai/AI_EXECUTION_SYSTEM.md`  
> **Registry**: `.cursor/gates/execution/execution-registry.yaml`

Agents in **execution mode** load this file immediately after `AGENTS.md` / `.cursor/docs/AGENTS.md`.

---

## Model: qwen3:32b (Required)

| Required | `qwen3:32b` (pinned in `.cursor/runtime/bootstrap/install.lock.yaml`) |
| Forbidden | `qwen2.5-coder` |

If active model ≠ `qwen3:32b`:

1. **Warn** the user immediately.
2. **Stop** implementation until model is corrected.
3. Reference `AI_RUNTIME.md` and `.cursor/runtime/bootstrap/install-model.sh`.

---

## Execute — Do Not Plan

When Principal Architect or user requests execution:

- **Use tools** — shell, read, write, edit, grep, glob, task, skill, MCP.
- **Never** output instructions the agent could run.
- **Never** output implementation plans, TODO lists, or "next steps".
- **Complete the work**, then return status only.

---

## Failure Recovery (10 Retries Max)

On any command failure (exit code ≠ 0):

1. Read error → inspect logs → read files → fix → retry.
2. Repeat until success or **10 automatic retries** exhausted.
3. **Do not** stop after first failure.
4. **Do not** ask the user to fix recoverable errors.

Detail: `.cursor/gates/execution/failure-recovery.md`

---

## Branch Safety (Before Implementation)

```bash
git branch --show-current
```

| Current branch | Action |
|----------------|--------|
| `main` / `master` | Create + checkout `feature/<scope>` |
| Feature branch | Proceed |

- **Never commit to `main`** for user projects or feature work.
- **Never push to `main`** automatically.
- **Never merge** automatically.

Detail: `.cursor/gates/execution/branch-policy.md`

---

## Secret Store Paths

Secrets live **outside git**:

| OS | Directory |
|----|-----------|
| Linux (prod) | `/root/.config/teknovo/secrets/` |
| Windows / dev | `%USERPROFILE%\.config\teknovo\secrets\` |

Files: `cloudflare.env`, `github.env`, `openrouter.env`  
Loader: `mcp/shared/secrets.js` · Doc: `docs/SECRET_STORE.md`

Never hardcode, commit, or log credentials.

---

## Deployment

When deploy is requested: **execute** build → test → fix → deploy → verify DNS/HTTPS.

Do not respond with instructions-only mode when credentials and tools exist.

Detail: `.cursor/gates/execution/deployment-mode.md` · Skill: `teknovo-cloudflare-stack`

---

## Completion

Stop only when build, tests, and validation pass. Return:

- Files created / modified
- Commands executed (summary)
- Final status

**Execution is mandatory. Failure recovery is mandatory.**
