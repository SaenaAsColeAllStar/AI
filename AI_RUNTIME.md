# AI Runtime — Daily Workstation Usage

How to use the Teknovo AI Workstation after bootstrap completes.

---

## Stack Overview

```text
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  OpenCode   │────▶│    Ollama    │────▶│ qwen2.5-coder   │
│  (CLI/IDE)  │     │  :11434      │     │ 32B             │
└─────────────┘     └──────────────┘     └─────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ AGENTS.md · .agents/skills · memory/ · taste/ · quality/ │
└──────────────────────────────────────────────────────────┘
```

---

## Ollama

### Service status

```bash
curl http://127.0.0.1:11434/api/tags
ollama list
```

### Start / restart

```bash
sudo systemctl start ollama    # if systemd unit exists
# or
ollama serve
```

### Test generation

```bash
curl http://127.0.0.1:11434/api/generate -d '{
  "model": "qwen2.5-coder:32b",
  "prompt": "Hello",
  "stream": false
}'
```

### CPU fallback

If no GPU is detected, Ollama runs on CPU. Expect significantly slower inference for the 32B model.

---

## OpenCode

### Configuration

Default config: `~/.config/opencode/opencode.jsonc`

Created by `bootstrap/install-opencode.sh` with local Ollama provider:

- Base URL: `http://127.0.0.1:11434/v1`
- Model: `ollama-local/qwen2.5-coder:32b`

### Launch

```bash
cd /path/to/workstation-repo
opencode
```

### Verify version

```bash
opencode --version
```

---

## Memory Loader

Load full workstation context:

```bash
python3 ai-agent/runtime/load-memory.py
python3 ai-agent/runtime/load-memory.py --format json
python3 ai-agent/runtime/load-memory.py --include-taste --include-quality --include-security
```

Refresh auto-generated artifacts:

```bash
bash scripts/refresh-memory.sh
```

---

## Skills

| Registry | Path |
|----------|------|
| Skill triggers | `.agents/registry.yaml` |
| Workstation index | `registry/skill-registry.yaml` |
| Memory | `memory/memory-registry.yaml` |
| Taste | `taste/taste-registry.yaml` |
| Quality | `quality/quality-registry.yaml` |
| Security | `security/security-registry.yaml` |
| Assurance | `assurance/assurance-registry.yaml` |

Skills live under `.agents/skills/` (superpowers, gstack, teknovo-*).

---

## MCP Servers

Templates only — configure before use:

| Server | Path | Credentials |
|--------|------|-------------|
| GitHub | `mcp/github/` | `GITHUB_PERSONAL_ACCESS_TOKEN` |
| Cloudflare | `mcp/cloudflare/` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |
| Filesystem | `mcp/filesystem/` | Path allowlist |
| Git | `mcp/git/` | Local repos; SSH for remote |

Index: `registry/mcp-registry.yaml`

---

## Agent Workflow

Follow `AGENTS.md` — never skip planning:

```text
Discovery → Planning → Taste → Pillar 1 → Architecture → Pillar 2
  → Security → UI → Tests → Code → Review → QA → Security (pre-deploy) → Ship → Pillar 3
```

---

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Ollama not responding | `bash bootstrap/install-ollama.sh` |
| Model missing | `bash bootstrap/install-model.sh` |
| OpenCode wrong model | Check `~/.config/opencode/opencode.jsonc` |
| Memory load warnings | `bash bootstrap/build-memory.sh` |
| Full reset | `bash bootstrap/install.sh` |

Logs: `.bootstrap/logs/`

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | Ollama API base |
| `OLLAMA_MODEL` | `qwen2.5-coder:32b` | Default model tag |
