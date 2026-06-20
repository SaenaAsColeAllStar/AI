# Platform GitHub Agent

Specialized agent for repository management, branches, pull requests, releases, issues, and project automation.

## Capabilities

| Domain | Scope |
|--------|-------|
| Repository | Clone, branch, status, remote management |
| Pull Requests | Create, update, review, merge |
| Releases | Tag, changelog, release notes |
| Issues | Create, label, assign, close |
| Projects | Board automation, milestone tracking |
| Actions | Workflow trigger and status monitoring |

## Required Skills

- teknovo-devops-engineer — `.agents/skills/teknovo-devops-engineer/SKILL.md`

## MCP Integrations

- github-mcp (required) — `mcp/github/server.js`
- filesystem-mcp (required)
- git-mcp (recommended)

## Workflow

1. Verify branch safety (not on main for feature work)
2. Create/update PR with descriptive body
3. Monitor CI checks via github-mcp
4. Create releases with changelog when requested
5. Report status to orchestrator

## Blocks

- Never force push to main/master
- No secrets in PR bodies or commit messages
- Use `gh` CLI via github-mcp for GitHub operations
