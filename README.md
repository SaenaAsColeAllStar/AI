# Teknovo AI SuperStack

Enterprise-grade autonomous AI development workstation for [Teknovo V2](https://github.com/SaenaAsColeAllStar/teknovo).

Combines [Superpowers](https://github.com/obra/superpowers) methodology, [GStack](https://github.com/garrytan/gstack) sprint operations, and Teknovo architectural standards into a unified agent skill system.

---

## Structure

```text
Teknovo AI SuperStack
├── Teknovo Rules (AGENTS.md, PRD, ADR, Database, UI/UX Standards)
├── Superpowers (11 skills — brainstorming, planning, TDD, debugging, code-review)
├── GStack (6 skills — office-hours, eng-review, qa, ship, retro, browser-testing)
├── Teknovo Skills (13 skills — rbac, database, api, security, ui-ux, backend, domain)
└── Runtime (Ollama, OpenCode, Qwen 32B, Repository Awareness)
```

---

## Quick Start

1. Read `AGENTS.md` — master agent rules and 12-step workflow
2. Browse `.agents/registry.yaml` — skill autoload and triggers
3. See `docs/ai/AI_SKILLS_CATALOG.md` — complete skill index
4. Deploy to Teknovo-V2: copy or symlink `.agents/` and `AGENTS.md`
5. Setup runtime: see `AI_DEPLOY.md`

---

## Workflow

```text
Discovery → Planning → Architecture → Database → API → RBAC → UI → Tests → Code → Review → QA → Ship
```

Agents must never skip planning or generate code before analysis.

---

## Documentation

| Document | Description |
|----------|-------------|
| [AGENTS.md](AGENTS.md) | Master agent bootstrap |
| [docs/ai/repository-analysis.md](docs/ai/repository-analysis.md) | Repository and domain maps |
| [docs/ai/AI_ARCHITECTURE.md](docs/ai/AI_ARCHITECTURE.md) | System architecture |
| [docs/ai/AI_WORKFLOW.md](docs/ai/AI_WORKFLOW.md) | 12-phase workflow detail |
| [docs/ai/AI_SKILLS_CATALOG.md](docs/ai/AI_SKILLS_CATALOG.md) | All 30 skills indexed |
| [docs/ai/AI_AGENT_LIFECYCLE.md](docs/ai/AI_AGENT_LIFECYCLE.md) | Agent state machine |
| [docs/ai/AI_ROADMAP.md](docs/ai/AI_ROADMAP.md) | Milestone roadmap |
| [AI_DEPLOY.md](AI_DEPLOY.md) | Workstation setup guide |

---

## Skills Count

- **Superpowers**: 11 methodological skills
- **GStack**: 6 sprint-loop skills
- **Teknovo Enterprise**: 13 domain/architecture skills
- **Total**: 30 skills

---

## License

MIT — fork, improve, make it yours.
