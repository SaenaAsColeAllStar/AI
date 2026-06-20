# AI Recovery — Workstation Restore

Full recovery from a fresh Clore Cloud GPU instance using **only git clone + install.sh**.

---

## Standard Recovery

When a GPU rental expires or the server is rebuilt:

```bash
git clone <your-repo-url>
cd AI
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
| Ollama service | systemd or nohup fallback if systemd absent |
| Model | Skip if in `ollama list`, `/api/tags`, or `/v1/models` |
| OpenCode | Skip if CLI exists |
| OpenCode config | Skip if file exists (use `INSTALL_FORCE_OPENCODE_CONFIG=1` to overwrite) |
| Memory | Regenerate repo-map; preserve manual artifacts |
| Registries | Generate only if missing |

## Self-Healing Recovery

After a failed install, the bootstrap saves progress to `.bootstrap/state.json`. Resume without redoing completed phases:

```bash
bash bootstrap/recover.sh
```

Or explicitly:

```bash
bash bootstrap/install.sh --recover
```

To force a full reinstall (clears checkpoint):

```bash
bash bootstrap/install.sh --reset
```

Re-run the full installer safely (also works, but may repeat work):

```bash
bash bootstrap/install.sh
```

Or run individual phases (see [AI_BOOTSTRAP.md](AI_BOOTSTRAP.md)).

---

## Partial Recovery

| Failure point | Fix |
|---------------|-----|
| Any phase | `bash bootstrap/recover.sh` (resumes from checkpoint) |
| Preflight / compatibility | Fix RAM/disk/OS/internet, re-run `bash bootstrap/preflight.sh` |
| Runtime deps | `bash bootstrap/install-runtime.sh` |
| Ollama down | `bash bootstrap/install-ollama.sh` (waits up to 360s for API) |
| Model missing | `bash bootstrap/install-model.sh` |
| OpenCode broken | `bash bootstrap/install-opencode.sh` |
| Memory stale | `bash bootstrap/build-memory.sh` |
| Verification fail | Read output of `bash bootstrap/verify.sh` |

---

## Container / Cloud Notes

- **Docker / Clore / Vast / RunPod**: Preflight detects container environment; no systemd or desktop assumed.
- **Root user**: Installer runs without `${SUDO}` when uid=0 (common in GPU containers).
- **No GPU**: Install continues with CPU fallback; preflight warns in `docs/ai/compatibility-report.md`.

---

## What Is NOT Auto-Restored

| Item | Recovery action | Doc |
|------|-----------------|-----|
| GitHub SSH key | `ssh-keygen -t ed25519` → add to GitHub | [PLANNED] |
| GitHub PAT (MCP) | Create token → `export GITHUB_PERSONAL_ACCESS_TOKEN` | `mcp/github/README.md` |
| Cloudflare token | Dashboard → API token | `mcp/cloudflare/README.md` |
| Teknovo V2 clone | `git clone git@github.com:.../teknovo.git` | `AI_DEPLOY.md` §9 |
| Cursor IDE | Install on local machine | N/A |
| Browser dev mode | `INSTALL_BROWSER_DEV=1 bash bootstrap/install.sh --browser-dev` | `AI_BOOTSTRAP.md` |

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
=================================
COLEALLSTAR
          X
TEKNOVO
=================================
✓ Runtime
✓ Python
✓ Node 22
✓ Git
✓ Ollama
✓ Qwen2.5-Coder 32B
✓ OpenCode
✓ Registry
✓ Skills
✓ Memory
✓ Validation
AI WORKSTATION READY
```

---

## Disaster Checklist

- [ ] `git clone` workstation repo
- [ ] `bash bootstrap/install.sh` completes without error
- [ ] `bootstrap/verify.sh` exits 0
- [ ] `curl http://127.0.0.1:11434/api/tags` shows qwen2.5-coder:32b
- [ ] `curl http://127.0.0.1:11434/v1/models` lists qwen2.5-coder:32b
- [ ] `opencode --version` works
- [ ] `opencode models` includes `ollama-local/qwen2.5-coder:32b`
- [ ] [PLANNED] SSH key added to GitHub
- [ ] [PLANNED] MCP tokens exported in shell profile
- [ ] [PLANNED] Teknovo V2 repo cloned to `/workspace/teknovo`

---

## Logs and Evidence

```bash
ls -lt .bootstrap/logs/
tail -100 .bootstrap/logs/install-*.log
cat .bootstrap/reports/final-report.md
cat .bootstrap/state.json
cat docs/ai/compatibility-report.md
```

Append lessons to `memory/lessons-learned.md` after significant recovery events.
