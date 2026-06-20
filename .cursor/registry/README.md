# Teknovo Registry Architecture

Central orchestration layer for the Teknovo AI SuperStack — skill discovery, agent mapping, and MCP integration tracking.

## Files

| File | Purpose |
|------|---------|
| `skill-registry.yaml` | **Single source of truth** — 97 skills with layer, priority, triggers, dependencies, conflicts |
| `agent-registry.yaml` | Maps 20+ agents (Pillars, reviewers, GStack, Cursor runtime) to skill sets |
| `mcp-registry.yaml` | MCP servers — permissions, risk levels, configured vs planned |
| `agents.yaml` | **Platform split** — orchestrator + frontend/backend/devops/testing + reviewers |
| `skills.yaml` | Platform skills index → `skill-registry.yaml` |
| `mcp.yaml` | Platform MCP index — tools, secret paths, risk levels |

## Quick Start

```bash
# Validate registry integrity (paths, layers, dependencies)
python .cursor/runtime/load-skills.py --validate

# List skills per layer
python .cursor/runtime/load-skills.py --list-layers

# Resolve skills by user intent keywords
python .cursor/runtime/load-skills.py --trigger "RBAC permission"

# Load a workflow bundle
python .cursor/runtime/load-skills.py --bundle pre-implementation

# Load autoload set
python .cursor/runtime/load-skills.py --autoload --format json
```

Combine with .cursor/docs/memory/.cursor/gates/taste/quality loaders:

```bash
python .cursor/runtime/load-memory.py --include-taste --taste-bundle pre-feature
python .cursor/runtime/load-memory.py --include-quality --quality-bundle pre-ship
python .cursor/runtime/load-skills.py --bundle pre-implementation
```

## Relationship to Legacy Registry

`.cursor/registry/legacy-registry.yaml` remains for **backward compatibility**. It declares:

```yaml
orchestration:
  canonical: .cursor/registry/skill-registry.yaml
```

New skills must be added to `.cursor/registry/skill-registry.yaml` first. Legacy autoload IDs should stay in sync with canonical `autoload` list.

## Layer Order

```text
foundation → memory → product → ux → architecture → engineering
  → security → assurance → deployment → automation → review → mcp
```

## Precedence

```text
AGENTS.md > ADR > PRD > Teknovo Skills > Security > Assurance > Impeccable > Taste > External
```

See `.cursor/docs/ai/skill-governance.md` for conflict rules and how to add skills.

## Sub-Registries

Domain-specific bundles remain in:

- `.cursor/gates/taste/taste-registry.yaml`
- `.cursor/gates/quality/quality-registry.yaml`
- `.cursor/gates/security/security-registry.yaml`
- `.cursor/docs/memory/memory-registry.yaml`
- `.cursor/gates/assurance/assurance-registry.yaml`

The central registry **mirrors** all skill IDs and cross-references these files under `sub_registries`.

## Schema Extension

To add skill #98+, copy an existing block in `skill-registry.yaml` → `skills`, fill all required fields, validate, update `.cursor/docs/ai/skill-inventory.md`.

Optional fields for scale:

- `status: planned` — registered but file not yet created
- `role: pillar-1|pillar-2|pillar-3` — Three Pillars only
- `category` — legacy lifecycle hint (planning, implementation, review)

## Documentation

- Inventory: `.cursor/docs/ai/skill-inventory.md`
- Governance: `.cursor/docs/ai/skill-governance.md`
- Master rules: `AGENTS.md`
