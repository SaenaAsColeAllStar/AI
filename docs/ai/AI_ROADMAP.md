# AI Workstation Roadmap

Development roadmap for the **Teknovo AI SuperStack Workstation**.

**Last updated**: 2026-06-20

---

## Milestones Overview

```text
M1: Workstation Setup ──────────── ✅ Complete
    │
M2: Automated Testing Rig ──────── 🔲 Next
    │
M3: Local LLM Integration ──────── 🔲 Planned
    │
M4: Production Deployment ──────── 🔲 Planned
    │
M5: Domain Module Skills ───────── 🔲 Future
```

---

## M1: Workstation Setup ✅

**Status**: Complete

**Deliverables**:
- [x] Master agent rules (`AGENTS.md`, `.agents/AGENTS.md`)
- [x] Agent skill registry (`.agents/registry.yaml`) with autoload, triggers, categories
- [x] 11 Superpowers skills (methodology)
- [x] 6 GStack skills (sprint loop)
- [x] 13 Teknovo Enterprise skills (architectural standards)
- [x] AI documentation suite (`docs/ai/*`)
- [x] Repository analysis with domain/architecture maps
- [x] Workstation deploy guide (`AI_DEPLOY.md`)

---

## M2: Automated Testing Rig

**Target**: Q3 2026

**Goals**:
- Playwright container runtime for headless browser QA
- Automatic coverage audit tracking scripts
- Standardized mock DB transactions for isolated repository tests
- CI integration: run skill-triggered QA on every PR

**New Skills**:
- `superpowers-dispatching-parallel-agents` — concurrent subagent dispatch
- `teknovo-finance-module` — billing/payment domain rules
- `teknovo-ppdb-module` — admission domain rules

**Tasks**:
- [ ] Docker Compose profile for Playwright + PostgreSQL test DB
- [ ] Coverage report script integrated with `teknovo-testing-architect` thresholds
- [ ] Mock transaction factory for Drizzle repository tests
- [ ] GitHub Action: autoload skills → run QA phase on PR

---

## M3: Local LLM Integration

**Target**: Q4 2026

**Goals**:
- Ollama server running Qwen2.5-Coder 32B on RTX 3090 x2
- OpenCode CLI wired to registry autoload
- Session caching in Redis to reduce token usage
- Skill-aware prompt injection at session start

**Tasks**:
- [ ] Validate `AI_DEPLOY.md` on production GPU workstation
- [ ] OpenCode config with skill bootstrap hook
- [ ] Redis session cache for doc/skill context
- [ ] Benchmark: local Qwen vs cloud model on Teknovo tasks

---

## M4: Production Workstation Deployment

**Target**: Q1 2027

**Goals**:
- Secure SSH + Cloudflare Tunnel mapping local dev servers
- Backup recovery for agent config and skill versions
- 99.9% uptime compliance for workstation services

**New Skills**:
- `gstack-cso` — Chief Security Officer OWASP/STRIDE audit
- `gstack-investigate` — Root cause investigation methodology

**Tasks**:
- [ ] Cloudflare Tunnel config for staging access
- [ ] Hourly backup of `.agents/` and skill versions
- [ ] Health check endpoint for Ollama + OpenCode services
- [ ] Team mode: auto-update skills via git pull (GStack pattern)

---

## M5: Domain Module Skills

**Target**: Q2 2027

**Goals**:
- Specialized skills for each Teknovo subdomain
- Deep integration with domain PRDs and data dictionaries

**New Skills**:
- `teknovo-cbt-module` — exam engine, proctoring, question banks
- `teknovo-wa-module` — WhatsApp templates, campaigns, delivery logs
- `teknovo-reporting` — report generation, PDF export, scheduling
- `teknovo-academic-module` — classes, grading, scheduling, attendance

---

## Success Metrics

| Metric | M1 Baseline | M2 Target | M4 Target |
|--------|-------------|-----------|-----------|
| Skills available | 30 | 33 | 38 |
| Autoload skills | 18 | 18 | 20 |
| PRs passing QA first try | — | 70% | 90% |
| Agent sessions skipping planning | — | 0% | 0% |
| Test coverage (enforced) | — | 70% | 80% |
| Mean time to feature (plan → ship) | — | baseline | -40% |

---

## Integration with Teknovo-V2

| Step | Action | Owner |
|------|--------|-------|
| 1 | Symlink `.agents/` from ai repo into Teknovo-V2 | DevOps |
| 2 | Copy `AGENTS.md` to Teknovo-V2 root | DevOps |
| 3 | Update Teknovo-V2 CI to reference skill QA phase | CI |
| 4 | Train team on 12-phase workflow | Engineering Lead |
| 5 | Run first retro using `gstack-retro` skill | Team |
