# Branch Policy â€” Execution System V2

> **Registry**: `.cursor/gates/execution/execution-registry.yaml` â†’ `branch_policy`  
> **Spec**: `.cursor/docs/ai/AI_EXECUTION_SYSTEM.md`

---

## Protected Branches

| Branch | Status |
|--------|--------|
| `main` | Protected â€” AI infrastructure only via reviewed merge |
| `master` | Protected (legacy alias) |

**Forbidden on protected branches**:

- Direct commits for feature work or user projects
- Direct push without review
- Automatic merge by agents

---

## Pre-Implementation Check (Mandatory)

Before writing code, creating files, or running migrations:

```bash
git branch --show-current
```

| Result | Action |
|--------|--------|
| `main` or `master` | Create feature branch and checkout |
| `feature/*` or other | Proceed on current branch |

### Create feature branch

```bash
git checkout -b feature/<scope>
```

Use kebab-case scope matching the work unit.

---

## Feature Branch Naming

**Prefix**: `feature/`

| Example | Use case |
|---------|----------|
| `feature/cloudflare-mcp` | MCP server work |
| `feature/github-mcp` | GitHub MCP |
| `feature/smk-teknovo-landing` | School landing page |
| `feature/ppdb-system` | PPDB module |
| `feature/sarpras-system` | Sarpras module |
| `feature/cbt-system` | CBT module |
| `feature/ai-execution-system-v2` | Execution system itself |

Other prefixes (`fix/`, `chore/`, `docs/`) are allowed when they match team convention, but **never** commit feature work directly to `main`.

---

## Repository Roles

### AI infrastructure repository (this repo)

`main` holds:

- Bootstrap, runtime, skills, MCP, registry, memory, architecture docs

Infra changes still use **feature branches** â†’ commit â†’ PR â†’ human merge.

### User / school projects

- Never implement on `main` of this repo unless explicitly infra-related.
- Prefer separate clone or worktree for large deliverables.

---

## Worktree Strategy

Isolate parallel or large projects from the primary working tree:

```bash
# From primary clone
git worktree add ../teknovo-ppdb feature/ppdb-system
cd ../teknovo-ppdb
```

| Pattern | When |
|---------|------|
| Single feature | Feature branch in primary clone |
| Large project | Dedicated worktree |
| Parallel features | One worktree per branch |
| Infra + project | Infra in primary; project in worktree |

Remove when done:

```bash
git worktree remove ../teknovo-ppdb
```

Skill: `.cursor/skills/superpowers/using-git-worktrees/SKILL.md`

---

## Commit Rules

- Commit on **feature branch** only.
- Format: `feat(scope): description` (see `.cursor/gates/execution/execution-registry.yaml` â†’ `git_rules`).
- Stage only relevant files â€” never secrets or `.env`.
- **Do not push** unless user requests.
- **Do not merge** to `main` automatically.

---

## Agent Checklist

Before first file edit in a session:

- [ ] Current branch checked
- [ ] Not on `main` / `master` for feature work
- [ ] Feature branch created if needed
- [ ] Commit target is feature branch

Before session end (if committing):

- [ ] All changes on feature branch
- [ ] No secrets staged
- [ ] Conventional commit message

---

## Cross-References

| Doc | Purpose |
|-----|---------|
| `.cursor/docs/EXECUTION.md` | Bootstrap |
| `.cursor/docs/ai/AI_EXECUTION_SYSTEM.md` | Full spec |
| `AGENTS.md` | Master workflow |
| `.cursor/gates/execution/failure-recovery.md` | Retry on git hook failures |
