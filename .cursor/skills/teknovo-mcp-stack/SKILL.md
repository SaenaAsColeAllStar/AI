---
name: teknovo-mcp-stack
description: Orchestrate Teknovo MCP servers â€” Cloudflare, GitHub, filesystem, git, PostgreSQL, and Qdrant â€” for deploy, dev, and investigation workflows.
---

# Teknovo MCP Stack Skill

Use this skill when coordinating multiple MCP servers in a single agent session.

**Registry**: `.cursor/registry/mcp-registry.yaml`  
**Config template**: `mcp/mcp-config.template.json`  
**Index**: `mcp/README.md`

---

## Server Selection

| Intent | MCP Servers | Skill Bundle |
|--------|-------------|--------------|
| Daily coding | filesystem, git | `dev-session` |
| Deploy to Cloudflare | cloudflare, github, git, filesystem | `deploy-session` |
| Create PR | github, git | deploy-session subset |
| DB schema inspect | postgres | `investigate-session` |
| RAG / semantic search | qdrant | optional |
| DNS / Pages deploy | cloudflare | deploy-session |

---

## Orchestration Patterns

### Deploy workflow

```text
1. filesystem/read_file + shell â†’ verify build config
2. shell â†’ npm run build && npm test
3. cloudflare/pages_list_projects â†’ check project exists
4. cloudflare/pages_create_project OR pages_deploy
5. cloudflare/domain_attach â†’ cloudflare/domain_verify
6. github/pr_create â†’ ship PR
```

### PR workflow

```text
1. git/git_status + git/git_diff â†’ review changes
2. git/git_commit â†’ stage and commit (user-requested only)
3. git/git_push â†’ push branch (no force)
4. github/pr_create â†’ open PR
5. github/workflow_list â†’ github/workflow_dispatch (if needed)
```

### Investigation workflow

```text
1. postgres/list_tables â†’ postgres/describe_table
2. postgres/query â†’ read-only SELECT / EXPLAIN
3. qdrant/search â†’ semantic doc retrieval
```

---

## MCP Server Reference

### teknovo-cloudflare-mcp (`.cursor/mcp/cloudflare/`)

| Tool | Purpose |
|------|---------|
| `pages_create_project` | Create Pages project |
| `pages_deploy` | Deploy to Pages |
| `pages_list_projects` | List projects |
| `pages_get_deployment` | Deployment status |
| `dns_create_record` | Create DNS record |
| `dns_update_record` | Update DNS record |
| `dns_list_records` | List DNS records |
| `domain_attach` | Attach custom domain |
| `domain_verify` | Verify domain |

See `.cursor/skills/teknovo-cloudflare-stack/SKILL.md` for deploy sequence.

### teknovo-github-mcp (`mcp/github/`)

| Tool | Purpose |
|------|---------|
| `repo_list` | List repositories |
| `repo_create` | Create repository |
| `pr_list` | List pull requests |
| `pr_create` | Create pull request |
| `pr_merge` | Merge pull request |
| `issue_list` | List issues |
| `issue_create` | Create issue |
| `workflow_list` | List workflows |
| `workflow_dispatch` | Trigger workflow |

### teknovo-filesystem-mcp (`mcp/filesystem/`)

Scoped to `TEKNOVO_WORKSPACE`. Path traversal blocked.

| Tool | Purpose |
|------|---------|
| `read_file` | Read file |
| `write_file` | Write file |
| `list_directory` | List directory |
| `search_files` | Glob-like search |
| `file_info` | File metadata |

### teknovo-git-mcp (`mcp/git/`)

Scoped to git repo root. Force push blocked.

| Tool | Purpose |
|------|---------|
| `git_status` | Status |
| `git_diff` | Diff |
| `git_log` | Log |
| `git_commit` | Commit |
| `git_push` | Push |
| `git_branch_list` | List branches |
| `git_branch_create` | Create branch |

### teknovo-postgres-mcp (`mcp/postgres/`)

Read-only. DDL/DML blocked.

| Tool | Purpose |
|------|---------|
| `query` | SELECT / EXPLAIN |
| `list_tables` | List tables |
| `describe_table` | Column metadata |

### teknovo-qdrant-mcp (`mcp/qdrant/`)

| Tool | Purpose |
|------|---------|
| `collection_list` | List collections |
| `search` | Vector search |
| `upsert` | Upsert points |

---

## Security Gates

| Risk | Servers | Requirement |
|------|---------|-------------|
| critical | cloudflare | `security-reviewer` APPROVE before writes |
| high | github, postgres | Least-privilege tokens; read-only DB |
| medium | filesystem, git, qdrant | Workspace/repo scoping |

Never hardcode tokens. Use `.env` files excluded from git.

---

## Cursor Setup

1. Copy `mcp/mcp-config.template.json` to `.cursor/mcp.json`
2. Adjust absolute paths for your workstation
3. Set environment variables in OS or Cursor env
4. Restart Cursor to load MCP servers

---

## Anti-Patterns

| Anti-Pattern | Correct Approach |
|--------------|-----------------|
| Cloudflare write without security review | Run security-reviewer first |
| Production DB write via MCP | Use Drizzle migrations; MCP read-only |
| Force push via git MCP | Blocked by design â€” explicit user + different tool |
| Path escape via filesystem MCP | Blocked by path-guard |
| PII in Qdrant vectors | Isolate collections; no PII |
