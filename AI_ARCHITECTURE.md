# AI Architecture — Workstation Overview

High-level architecture for the **COLEALLSTAR × TEKNOVO AI Workstation** — the self-contained agent development environment deployable via `bash bootstrap/install.sh`.

> Detailed SuperStack layers: [docs/ai/AI_ARCHITECTURE.md](docs/ai/AI_ARCHITECTURE.md)

---

## System Diagram

```text
                    ┌─────────────────────────────────────┐
                    │     COLEALLSTAR × TEKNOVO           │
                    │        AI WORKSTATION v1.0          │
                    └──────────────────┬──────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
  ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
  │  Bootstrap  │              │   Runtime   │              │  Knowledge  │
  │  install.sh │              │ Ollama+Code │              │   Layers    │
  └──────┬──────┘              └──────┬──────┘              └──────┬──────┘
         │                            │                            │
    phases 0-12                  Qwen 32B                   memory/
         │                       OpenCode                    taste/
         ▼                            │                     quality/
  verify.sh + status.sh               │                    security/
                                      ▼                    assurance/
                              ┌───────────────┐
                              │ Target Repos  │
                              │ (Teknovo V2)  │
                              └───────────────┘
```

---

## Bootstrap Pipeline

```text
banner.sh
    → compatibility.sh (gate)
    → install-runtime.sh
    → install-ollama.sh
    → install-model.sh
    → install-opencode.sh
    → install-skills.sh
    → build-memory.sh
    → build-registries.sh
    → [mcp/ + docs in repo]
    → verify.sh
    → status.sh
```

Properties:

- **Idempotent** — each phase checks before mutating
- **Recoverable** — re-run `install.sh` after GPU replacement
- **Logged** — `.bootstrap/logs/`

---

## Knowledge Layers

| Layer | Directory | Registry | Precedence |
|-------|-----------|----------|------------|
| Rules | `AGENTS.md`, `.agents/` | `.agents/registry.yaml` | Highest (ADR/PRD) |
| Memory | `memory/` | `memory/memory-registry.yaml` | Context |
| Taste | `taste/` | `taste/taste-registry.yaml` | Before quality |
| Security | `security/` | `security/security-registry.yaml` | Pre-implementation |
| Quality | `quality/` | `quality/quality-registry.yaml` | Pre-ship |
| Assurance | `assurance/` | `assurance/assurance-registry.yaml` | Review |
| Index | `registry/` | `skill/agent/mcp-registry.yaml` | Tooling |

Loader: `ai-agent/runtime/load-memory.py`

---

## Skills Architecture

```text
.agents/skills/
├── superpowers/     (11) — methodology
├── gstack/          (8)  — sprint loop
└── teknovo-*/       (29) — enterprise domains
```

48 skills total. Canonical triggers in `.agents/registry.yaml`; workstation index in `registry/skill-registry.yaml`.

---

## MCP Integration (Phase 8)

```text
mcp/
├── github/       — PR/issues (token required)
├── cloudflare/   — edge infra (token required)
├── filesystem/   — sandboxed paths
└── git/          — local repo ops
```

Placeholder configs only — no credentials in git. See `registry/mcp-registry.yaml`.

---

## Runtime Boundaries

| Component | Scope | Out of scope |
|-----------|-------|----------------|
| Ollama | Local inference | Production Teknovo API |
| OpenCode | Agent CLI | Cursor desktop install |
| Bootstrap | Workstation stack | Teknovo V2 app deploy |
| Memory | Workstation context | Live production DB |

Teknovo V2 deployment: `AI_DEPLOY.md`, `.agents/skills/teknovo-devops-engineer/`

---

## Three Pillars + Gates

```text
Taste → Pillar 1 (Product) → Pillar 2 (Architect) → Security
  → Implementation → Quality → Security (pre-deploy) → Pillar 3 (DevOps)
```

See `AGENTS.md` for full workflow.

---

## File Contract

| Path | Role |
|------|------|
| `bootstrap/` | Installer scripts |
| `ai-agent/runtime/` | Memory loader + refresh |
| `scripts/refresh-memory.sh` | Memory regeneration |
| `registry/` | Aggregated YAML indexes |
| `mcp/` | MCP server templates |
| `docs/ai/` | Deep architecture docs |

---

## Version

**Workstation**: 1.0  
**Bootstrap**: phases 0–12  
**Model default**: `qwen2.5-coder:32b`
