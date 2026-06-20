# Teknovo AI Platform — Master Index

**Single source of truth:** `.cursor/` — all skills, rules, registries, gates, runtime, and docs live here.

## Quick Start

1. Read `.cursor/docs/AGENTS.md` — agent contract and workflow
2. Read `.cursor/docs/EXECUTION.md` — implementation and deploy gates
3. Load skills: `python .cursor/runtime/load-skills.py --autoload`
4. Load memory: `python .cursor/runtime/load-memory.py`

## Structure

| Path | Purpose |
|------|---------|
| `.cursor/skills/` | 53+ Cursor skills (`**/SKILL.md`) — see `.cursor/skills/INDEX.md` |
| `.cursor/rules/` | 7 Cursor rule files (`*.mdc`) |
| `.cursor/registry/` | Skill, agent, and MCP registries (YAML) |
| `.cursor/orchestrator/` | Multi-agent orchestrator (JS + config) |
| `.cursor/design-system/` | Design tokens, typography, components |
| `.cursor/gates/` | Taste, assurance, security, quality, execution gates |
| `.cursor/runtime/` | `load-skills.py`, `load-memory.py`, bootstrap scripts |
| `.cursor/mcp/` | MCP servers (Cloudflare) |
| `.cursor/docs/` | AGENTS, EXECUTION, AI docs, memory artifacts |

## Registries

| File | Role |
|------|------|
| `.cursor/registry/skill-registry.yaml` | Canonical skill orchestration |
| `.cursor/registry/agent-registry.yaml` | Agent → skill mapping |
| `.cursor/registry/agents.yaml` | Platform agent definitions |
| `.cursor/registry/mcp-registry.yaml` | MCP tool registry |
| `.cursor/registry/legacy-registry.yaml` | Backward-compat autoload index |

## Gates

| Gate | Path | Registry |
|------|------|----------|
| Taste | `.cursor/gates/taste/` | `taste-registry.yaml` |
| Assurance | `.cursor/gates/assurance/` | `assurance-registry.yaml` |
| Security | `.cursor/gates/security/` | `security-registry.yaml` |
| Quality | `.cursor/gates/quality/` | `quality-registry.yaml` |
| Execution | `.cursor/gates/execution/` | `execution-registry.yaml` |

## Rules

| Rule | Path |
|------|------|
| Product | `.cursor/rules/01-product.mdc` |
| UI/UX | `.cursor/rules/02-uiux.mdc` |
| Engineering | `.cursor/rules/03-engineering.mdc` |
| Testing | `.cursor/rules/04-testing.mdc` |
| DevOps | `.cursor/rules/05-devops.mdc` |
| GitHub | `.cursor/rules/06-github.mdc` |
| Cloudflare | `.cursor/rules/07-cloudflare.mdc` |

## Runtime Commands

```bash
python .cursor/runtime/load-skills.py --bundle pre-implementation
python .cursor/runtime/load-skills.py --trigger "RBAC permission"
python .cursor/runtime/load-memory.py --include-taste --include-security
python .cursor/runtime/load-skills.py --validate
```

## Docs

- Skill inventory: `.cursor/docs/ai/skill-inventory.md`
- Skill governance: `.cursor/docs/ai/skill-governance.md`
- Platform architecture: `.cursor/docs/platform/ARCHITECTURE.md`
- Memory artifacts: `.cursor/docs/memory/`
