# Teknovo AI Platform

**Canonical platform:** `.cursor/` — read [`.cursor/INDEX.md`](.cursor/INDEX.md)

## Bootstrap

1. **Agent contract** → `.cursor/docs/AGENTS.md`
2. **Execution gates** → `.cursor/docs/EXECUTION.md`
3. **Skills** → `.cursor/skills/INDEX.md`
4. **Registries** → `.cursor/registry/skill-registry.yaml`

## Runtime

```bash
python .cursor/runtime/load-skills.py --autoload
python .cursor/runtime/load-memory.py
```

All skills, rules, gates, orchestrator, MCP, and design-system artifacts live under `.cursor/`.
