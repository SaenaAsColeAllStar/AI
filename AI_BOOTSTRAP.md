# AI Bootstrap — Teknovo Workstation Installer

One-command install for the **COLEALLSTAR × TEKNOVO AI Workstation** on a fresh Linux GPU server (Clore Cloud).

---

## Quick Install

```bash
git clone <your-repo-url>
cd <repo>
bash bootstrap/install.sh
```

No additional manual configuration is required for the core stack. The installer is **idempotent** — safe to re-run after failures or GPU instance replacement.

---

## What Gets Installed

| Phase | Script | Purpose |
|-------|--------|---------|
| 0 | `bootstrap/compatibility.sh` | OS, RAM, disk, GPU, Python, Node checks |
| 1 | `bootstrap/install-runtime.sh` | Git, curl, Node 18+, Python 3.10+, PyYAML |
| 2 | `bootstrap/install-ollama.sh` | Ollama server + API verification |
| 3 | `bootstrap/install-model.sh` | `qwen2.5-coder:32b` model pull |
| 4 | `bootstrap/install-opencode.sh` | OpenCode CLI + Ollama provider config |
| 5 | `bootstrap/install-skills.sh` | Verify skills, memory, taste, quality, security layers |
| 6 | `bootstrap/build-memory.sh` | Refresh memory artifacts |
| 7 | `bootstrap/build-registries.sh` | Generate/validate `registry/*.yaml` |
| 8 | _(repo)_ | MCP templates under `mcp/` |
| 9 | _(repo)_ | Documentation (this file and siblings) |
| 10 | `bootstrap/verify.sh` | Full verification gate |
| 11 | _(design)_ | Recovery via re-running `install.sh` |
| 12 | `bootstrap/status.sh` | Final status screen |

---

## Minimum Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| OS | Ubuntu 22.04/24.04 (Linux) | Same |
| RAM | 16 GB | 32 GB+ for Qwen 32B |
| Disk (free) | 50 GB | 80 GB+ |
| Python | 3.10+ | 3.11+ |
| Node.js | 18+ | 20 LTS |
| GPU | Optional | NVIDIA RTX 3090 or better |

Compatibility report written to: `docs/ai/compatibility-report.md`

---

## Run Individual Phases

Each script is independently runnable:

```bash
bash bootstrap/compatibility.sh
bash bootstrap/install-runtime.sh
bash bootstrap/install-ollama.sh
bash bootstrap/install-model.sh
bash bootstrap/install-opencode.sh
bash bootstrap/install-skills.sh
bash bootstrap/build-memory.sh
bash bootstrap/build-registries.sh
bash bootstrap/verify.sh
bash bootstrap/status.sh
```

---

## Logs

Install logs: `.bootstrap/logs/install-YYYYMMDD-HHMMSS.log`

---

## Windows

See `bootstrap/install.ps1` — full stack targets Linux. Use WSL2 or remote GPU server for inference.

---

## After Install

```bash
cd <repo>
opencode
```

Test prompt:

```text
Read AGENTS.md and summarize the 12-step workflow.
```

Expected model indicator: `qwen2.5-coder:32b`

---

## [PLANNED] Manual Steps

| Item | Why |
|------|-----|
| GitHub SSH key | Clone/push Teknovo V2 private repos |
| MCP tokens | GitHub, Cloudflare — see `mcp/*/README.md` |
| Model download time | ~20GB, 15–60 min depending on bandwidth |
| Teknovo V2 clone | Separate product repo — not part of workstation bootstrap |

See [AI_RECOVERY.md](AI_RECOVERY.md) for full recovery and credential setup.

---

## Related Docs

| Document | Description |
|----------|-------------|
| [AI_RUNTIME.md](AI_RUNTIME.md) | Daily usage — Ollama, OpenCode, memory |
| [AI_DEPLOY.md](AI_DEPLOY.md) | Deployment reference (legacy steps consolidated) |
| [AI_RECOVERY.md](AI_RECOVERY.md) | GPU expiry recovery |
| [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md) | Workstation architecture overview |
