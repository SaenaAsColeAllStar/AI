# AI Recovery — Workstation Restore

Full recovery from a fresh Clore Cloud GPU instance using **only git clone + install.sh**.

---

## Standard Recovery

When a GPU rental expires or the server is rebuilt:

```bash
git clone <your-repo-url>
cd <repo>
bash bootstrap/install.sh
```

**Expected restore time**: 15–45 minutes (dominated by model download).

Everything version-controlled (skills, AGENTS.md, memory, docs) restores from git. Runtime components (Ollama, model weights, OpenCode) reinstall automatically.

---

## Idempotency

All bootstrap scripts check before installing:

| Component | Idempotent behavior |
|-----------|---------------------|
| apt packages | Skip if installed |
| Ollama | Skip if binary exists |
| Model | Skip if in `ollama list` |
| OpenCode | Skip if CLI exists |
| OpenCode config | Skip if file exists |
| Memory | Regenerate repo-map; preserve manual artifacts |
| Registries | Generate only if missing |

Re-run the full installer safely:

```bash
bash bootstrap/install.sh
```

Or run individual phases (see [AI_BOOTSTRAP.md](AI_BOOTSTRAP.md)).

---

## Partial Recovery

| Failure point | Fix |
|---------------|-----|
| Compatibility | Fix RAM/disk/OS, re-run `bootstrap/compatibility.sh` |
| Runtime deps | `bash bootstrap/install-runtime.sh` |
| Ollama down | `bash bootstrap/install-ollama.sh` |
| Model missing | `bash bootstrap/install-model.sh` |
| OpenCode broken | `bash bootstrap/install-opencode.sh` |
| Memory stale | `bash bootstrap/build-memory.sh` |
| Verification fail | Read output of `bash bootstrap/verify.sh` |

---

## What Is NOT Auto-Restored

| Item | Recovery action | Doc |
|------|-----------------|-----|
| GitHub SSH key | `ssh-keygen -t ed25519` → add to GitHub | [PLANNED] |
| GitHub PAT (MCP) | Create token → `export GITHUB_PERSONAL_ACCESS_TOKEN` | `mcp/github/README.md` |
| Cloudflare token | Dashboard → API token | `mcp/cloudflare/README.md` |
| Teknovo V2 clone | `git clone git@github.com:.../teknovo.git` | `AI_DEPLOY.md` §9 |
| Cursor IDE | Install on local machine | N/A |

---

## GitHub SSH [PLANNED]

```bash
ssh-keygen -t ed25519 -C "workstation@clore" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
# Add to GitHub → Settings → SSH Keys
ssh -T git@github.com
```

---

## Verify Recovery

```bash
bash bootstrap/verify.sh
bash bootstrap/status.sh
```

Expected final screen:

```text
====================================
COLEALLSTAR × TEKNOVO
AI WORKSTATION
====================================
Environment: READY
Ollama: READY
Qwen2.5-Coder: READY
OpenCode: READY
Memory: READY
Skills: READY
Registry: READY
MCP: READY
Recovery: PASS
====================================
```

---

## Disaster Checklist

- [ ] `git clone` workstation repo
- [ ] `bash bootstrap/install.sh` completes without error
- [ ] `bootstrap/verify.sh` exits 0
- [ ] `curl http://127.0.0.1:11434/api/tags` shows qwen2.5-coder:32b
- [ ] `opencode --version` works
- [ ] [PLANNED] SSH key added to GitHub
- [ ] [PLANNED] MCP tokens exported in shell profile
- [ ] [PLANNED] Teknovo V2 repo cloned to `/workspace/teknovo`

---

## Logs and Evidence

```bash
ls -lt .bootstrap/logs/
tail -100 .bootstrap/logs/install-*.log
cat docs/ai/compatibility-report.md
```

Append lessons to `memory/lessons-learned.md` after significant recovery events.
