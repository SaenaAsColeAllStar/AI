# Teknovo AI Workstation — Windows Bootstrap Stub

> **Target platform**: Linux (Ubuntu 22.04/24.04 on Clore Cloud GPU servers)

This repository's production installer is **`bootstrap/install.sh`** (bash).  
Windows development machines can clone and edit the repo, but the full AI workstation stack (Ollama, Qwen 32B, OpenCode) is designed for Linux GPU servers.

## What works on Windows

- Edit skills, memory, quality, taste, security, and assurance artifacts
- Run memory refresh (PowerShell):

```powershell
.\scripts\refresh-memory.ps1
```

- Load memory context:

```powershell
python ai-agent/runtime/load-memory.py
```

## Full workstation install (Linux)

On a fresh Clore Cloud GPU server:

```bash
git clone <your-repo-url>
cd <repo>
bash bootstrap/install.sh
```

## WSL2 (optional partial install)

If using WSL2 Ubuntu with sufficient RAM (32GB+ recommended for Qwen 32B):

```bash
cd /mnt/c/path/to/repo
bash bootstrap/install.sh
```

GPU passthrough in WSL requires NVIDIA drivers on Windows host and CUDA in WSL.

## Manual steps [PLANNED on Windows]

| Item | Status |
|------|--------|
| Ollama for Windows | Install from https://ollama.com if needed |
| Qwen 32B model | `ollama pull qwen2.5-coder:32b` (~20GB) |
| OpenCode | `npm install -g opencode-ai` |
| MCP GitHub token | Manual — see `mcp/github/README.md` |

## Documentation

- [AI_BOOTSTRAP.md](../AI_BOOTSTRAP.md) — primary install guide
- [AI_RECOVERY.md](../AI_RECOVERY.md) — recovery procedures
- [AI_RUNTIME.md](../AI_RUNTIME.md) — daily usage
