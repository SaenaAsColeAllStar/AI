# Quality Gates — Teknovo Impeccable Architect

> **Rule**: A feature is not complete until all mandatory gates pass with evidence  
> **Checklist**: `.cursor/gates/quality/review-checklist.md`

---

## Gate Order

Gates run in sequence. Skipping a gate blocks ship.

**Prerequisite**: Taste gates (`.cursor/gates/taste/taste-gates.md`), **Assurance Review** (`.cursor/gates/assurance/review-workflow.md`), **Execution branch safety** (`.cursor/gates/execution/branch-policy.md` — verify feature branch before code), and **Security pre-implementation review** (`.cursor/gates/security/security-gates.md`) must pass before implementation.

```text
┌─────────────────────┐
│ 0. Taste (scope)    │  Before architecture — what to build
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 0.3 Assurance       │  Before implementation — requirements & risks verified
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 0.5 Security Review │  Before implementation — safe to build
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 1. Architecture     │  Before migrations, new modules, API contracts
│    Review           │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 2. UX Review        │  Before UI implementation
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 3. RBAC Review      │  Before merge (permissions + nav + guards)
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 4. Testing Review   │  Before PR approval
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 5. Documentation    │  Before merge
│    Review           │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ 6. Deployment       │  Before staging/production
│    Review           │
└─────────────────────┘
```

Product review (`.cursor/gates/quality/product-principles.md`) runs **before** Architecture — during brainstorming and PRD — but is not repeated as a separate ship gate if PRD sign-off exists.

---

## Gate 0 — Assurance Review

**When**: After taste gates and plan complete; before implementation

**Owner**: Assurance agents (`agents/requirement-clarifier.md`, `agents/context-builder.md`, `agents/second-opinion-reviewer.md`)

**Required artifact**: Assurance Sign-Off in plan (`.cursor/gates/assurance/review-workflow.md`)

**Pass criteria**:
- Requirement clarifications resolved or deferred with owner
- Context checklist complete (ADR, PRD, standards cited)
- Risk register and sharp edges scan attached
- Insecure defaults scan complete
- Second opinion on high-risk scope

**Skills / docs**: `.cursor/gates/assurance/assurance-principles.md`, `.cursor/gates/assurance/review-workflow.md`, `.cursor/gates/assurance/risk-analysis.md`

**Blocks**: Implementation, migrations, new routes

---

## Gate Definitions

### 1. Architecture Review

**When**: Before database migrations, new bounded contexts, cross-domain integrations

**Owner**: Chief Architect (`teknovo-chief-architect`)

**Required artifact**: Architecture Impact Analysis

**Pass criteria**:
- Domain ownership documented
- Layer isolation verified
- API/RBAC/schema in plan
- No cross-module repository imports

**Skills**: `teknovo-chief-architect`, `teknovo-database-architect`, `teknovo-api-architect`, `gstack-eng-review`

**Checklist sections**: 3 (Architecture), 4 (Database), 5 (API)

---

### 2. UX Review

**When**: After IA/wireframe; before first UI commit; again pre-release

**Owner**: UI/UX Specialist + Chief Product Designer for strategic pages

**Pass criteria**:
- Sidebar path ≤ 3 levels
- PageShell + 5 page states
- Design taste score < 6 AI-ish threshold
- Phosphor + tokens only

**Skills**: `teknovo-ui-ux-specialist`, `teknovo-chief-product-designer`, `teknovo-ui-ux`

**Checklist sections**: 2 (UX)

**Artifacts**: `.cursor/gates/quality/ux-principles.md`, `.cursor/gates/quality/design-taste.md`

---

### 3. RBAC Review

**When**: Before merge — any new route, menu, or action

**Owner**: RBAC Architect (`teknovo-rbac-architect`) + Security Reviewer for authorization gaps

**Pass criteria**:
- Permissions in `domain.resource.action` format
- Role matrix updated
- API guard + UI gate aligned
- Permission denied state implemented
- `.cursor/gates/security/rbac-security.md` checklist pass

**Checklist sections**: 9 (RBAC), 5.3 (API permissions), `.cursor/gates/security/review-checklist.md` §2

---

### 3.5 Security Review (Mandatory)

**When**: Before implementation (Gate 1), before deploy (Gate 2), before production (Gate 3)

**Owner**: Security Reviewer (`agents/security-reviewer.md`)

**Pass criteria**:
- Risk Level assessed; no open Critical findings
- Attack surface documented
- Mitigation plan for High items
- Verdict: APPROVE or APPROVE WITH CONDITIONS

**Artifacts**: `.cursor/gates/security/security-gates.md`, `.cursor/gates/security/review-checklist.md`

**Skills**: `teknovo-security-review`, `agents/security-reviewer.md`

**Blocks**: Implementation, merge (if auth/API/data gaps), deploy without pre-deploy APPROVE

---

### 4. Testing Review

**When**: Before PR request and merge

**Owner**: Testing Architect + QA

**Pass criteria**:
- Service tests for business logic
- E2E for critical flow
- `tsc`, lint, coverage evidence
- `superpowers-verification-before-completion` satisfied

**Skills**: `teknovo-testing-architect`, `gstack-qa`, `gstack-browser-testing`, `superpowers-test-driven-development`

**Checklist sections**: 10 (Testing)

---

### 5. Documentation Review

**When**: Before merge

**Pass criteria**:
- API contract updated if endpoints changed
- RBAC matrix updated
- Plan/design docs for non-trivial features
- Module or domain docs if behavior changed

**Checklist sections**: 11 (Documentation)

---

### 6. Deployment Review

**When**: Before staging/production release

**Owner**: DevOps Engineer (Pillar 3)

**Required artifact**: Deployment Impact Analysis

**Pass criteria**:
- CI green
- Migration order documented
- Rollback defined
- Env/infra changes documented

**Skills**: `teknovo-devops-engineer`, `gstack-ship`, `teknovo-cloudflare-stack`

**Checklist sections**: 8 (Deployment)

**Blocks**: Production deploy without QA evidence and deployment analysis

---

## GStack Mapping

| Quality gate | GStack skill | Phase |
|--------------|--------------|-------|
| Security (pre-deploy) | `gstack-ship` (blocked until APPROVE) | Ship |
| Architecture + Engineering | `gstack-eng-review` | Review |
| Testing | `gstack-qa`, `gstack-browser-testing` | QA |
| Deployment | `gstack-ship` | Ship |
| Post-ship | `gstack-cso`, `gstack-retro` | Communicate / learn |

Eng-review covers layers and standards; it does **not** replace UX or Product gates.

---

## Self-Critique Gate (Mandatory)

Before declaring any gate passed or task complete, run `.cursor/gates/quality/self-critique.md`. Failure on self-critique reopens the relevant gate.

---

## Gate Bypass Policy

**No bypass** for Critical checklist items.

Emergency production hotfix (SEV-1):
1. Minimal fix with Architecture + Security verbal sign-off
2. Full gate completion within 48 hours
3. Document in `.cursor/docs/memory/lessons-learned.md`

Invoke `teknovo-incident-response` for SEV-1 path.

---

## Registry & Automation

- Artifact index: `.cursor/gates/quality/quality-registry.yaml`
- Review agent: `agents/impeccable-reviewer.md`
- Runtime load: `python .cursor/runtime/load-memory.py --include-quality`

---

## Quick Status Template

```markdown
## Quality Gates — [Feature]

| Gate | Status | Evidence |
|------|--------|----------|
| Assurance | ☐ | Assurance Sign-Off in plan |
| Architecture | ☐ | link to analysis |
| UX | ☐ | screenshot / IA doc |
| RBAC | ☐ | matrix diff |
| Testing | ☐ | CI run URL |
| Documentation | ☐ | doc paths |
| Deployment | ☐ | deploy analysis |
| Execution completion | ☐ | build + test + lint evidence (`.cursor/gates/execution/execution-registry.yaml`) |
| Self-critique | ☐ | completed |
```
