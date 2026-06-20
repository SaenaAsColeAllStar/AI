# AI Bootstrap — Teknovo Workstation Installer

One-command install for the **COLEALLSTAR × TEKNOVO AI Workstation** on a fresh Linux GPU server (Clore Cloud, Vast.ai, RunPod, or Docker).

---

## Quick Install

```bash
git clone <your-repo-url>
cd AI
bash bootstrap/install.sh
```

No additional manual configuration is required for the core stack. The installer is **idempotent**, **self-healing**, and **container-aware** — safe to re-run after failures or GPU instance replacement.

```bash
# Resume after failure (uses .bootstrap/state.json checkpoint)
bash bootstrap/recover.sh
# or
bash bootstrap/install.sh --recover

# Force full reinstall (clears checkpoint)
bash bootstrap/install.sh --reset

# Optional browser dev mode (code-server + Open WebUI)
INSTALL_BROWSER_DEV=1 bash bootstrap/install.sh --browser-dev
```

---

## What Gets Installed

| Phase | Script | Purpose |
|-------|--------|---------|
| 0 | `bootstrap/preflight.sh` | OS, RAM, disk, internet, container, GPU, Python, Node, Docker — writes `docs/ai/compatibility-report.md` |
| 1 | `bootstrap/install-runtime.sh` | Git, curl, wget, Node 22+, Python 3.10+, PyYAML |
| 2 | `bootstrap/install-ollama.sh` | Ollama server (systemd → tmux → screen → nohup) + API health wait (360s) |
| 3 | `bootstrap/install-model.sh` | `qwen3:32b` pull + verify via `/api/tags` and `/v1/models` (from lock file) |
| 4 | `bootstrap/install-opencode.sh` | OpenCode CLI + Ollama provider config + `opencode models` validation |
| 5 | `bootstrap/install-skills.sh` | Verify skills, memory, taste, quality, security layers |
| 6 | `bootstrap/build-memory.sh` | Refresh memory artifacts |
| 7 | `bootstrap/build-registries.sh` | Generate/validate `registry/*.yaml` |
| 8 | _(repo)_ | MCP templates under `mcp/` |
| 9 | _(repo)_ | Documentation (this file and siblings) |
| 10 | `bootstrap/verify.sh` | Full verification gate + `.bootstrap/reports/final-report.md` |
| 11 | `bootstrap/status.sh` | Final status screen |
| _(opt)_ | `bootstrap/install-browser-dev.sh` | code-server + Open WebUI + Cloudflare tunnel templates |

`bootstrap/compatibility.sh` delegates to `preflight.sh` for backward compatibility.

---

## Known Compatibility

### OpenCode 1.17.8

Tested Models:

| Model                            | Status                                          |
| -------------------------------- | ----------------------------------------------- |
| qwen2.5-coder:32b                | Tool-call generation only, execution unreliable |
| qwen3:32b                        | Fully compatible                                |
| qwen3:32b + Ollama               | Recommended                                     |
| qwen3:32b + OpenCode Build Agent | Production Ready                                |

For local agent execution, use `qwen3:32b` as default model (pinned in `bootstrap/install.lock.yaml`).

---

## Minimum Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| OS | Ubuntu 22.04/24.04 (Linux) | Same |
| RAM | 16 GB | 32 GB+ for Qwen 32B |
| Disk (free) | 50 GB | 80 GB+ |
| Python | 3.10+ | 3.11+ |
| Node.js | 22+ (from install.lock.yaml) | 22 LTS |
| GPU | Optional | NVIDIA RTX 3090 or better |

**Version priority**: `bootstrap/install.lock.yaml` → environment variables → built-in defaults.

Compatibility report written to: `docs/ai/compatibility-report.md` (generated at preflight, before install phases).

---

## GPU Detection

Priority order (never fails install if tools missing):

1. `nvidia-smi` (NVIDIA)
2. `rocm-smi` (AMD)
3. `lspci` (PCI scan — warns if missing, continues)
4. `lshw` (fallback)

CPU inference is used when no GPU is detected.

---

## Container / Cloud Providers

Preflight detects:

- Docker (`/.dockerenv`, cgroup)
- Clore / Vast / RunPod environment hints
- systemd absence → Ollama uses priority chain: tmux session → screen session → nohup (`bash bootstrap/start-ollama.sh`)
- root user → `${SUDO}` disabled (no broken `sudo -E | bash` pipes)

---

## Run Individual Phases

Each script is independently runnable:

```bash
bash bootstrap/preflight.sh
bash bootstrap/install-runtime.sh
bash bootstrap/install-ollama.sh
bash bootstrap/start-ollama.sh          # manual Ollama restart (systemd/tmux/screen/nohup)
tmux attach -t ollama                   # inspect Ollama tmux session (containers)
bash bootstrap/install-model.sh
bash bootstrap/install-opencode.sh
bash bootstrap/install-skills.sh
bash bootstrap/build-memory.sh
bash bootstrap/build-registries.sh
bash bootstrap/verify.sh
bash bootstrap/status.sh
bash bootstrap/install-browser-dev.sh   # optional
```

---

## Logs and Reports

| Path | Purpose |
|------|---------|
| `.bootstrap/logs/install-YYYYMMDD-HHMMSS.log` | Timestamped install log (all phases) |
| `.bootstrap/logs/ollama.log` | Ollama serve log (non-root); `/root/ollama.log` on root/Clore |
| `.bootstrap/reports/final-report.md` | Verification results after Phase 10 |
| `.bootstrap/state.json` | Checkpoint for recovery mode |
| `docs/ai/compatibility-report.md` | Preflight compatibility report |

Shared libraries: `bootstrap/lib/` (`privilege.sh`, `yaml.sh`, `logging.sh`, `prereqs.sh`, `state.sh`, `gpu.sh`, `ollama.sh`, `ollama-start.sh`)

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `INSTALL_BROWSER_DEV=1` | Install optional browser dev stack after core install |
| `INSTALL_FORCE_OPENCODE_CONFIG=1` | Overwrite `~/.config/opencode/opencode.jsonc` |
| `TEKNOVO_NODE_MAJOR` | Override Node major (only if not pinned in lock file) |
| `TEKNOVO_OLLAMA_MODEL` | Override model (only if not pinned in lock file) |
| `OLLAMA_HOST` | Ollama API base URL (default `http://127.0.0.1:11434`) |

---

## Windows

See `bootstrap/install.ps1` — full stack targets Linux. Use WSL2 or remote GPU server for inference.

---

## After Install

Expected status screen:

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
✓ Model qwen3:32b
✓ OpenCode
✓ Registry
✓ Skills
✓ Memory
✓ Validation
AI WORKSTATION READY
```

```bash
cd AI
opencode
```

Test prompt:

```text
Read AGENTS.md and summarize the 12-step workflow.
```

Expected model indicator: `qwen3:32b`

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
