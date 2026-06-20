# Teknovo GitHub MCP — API Reference

## Tools

| Tool | Description |
|------|-------------|
| `repo_list` | List repositories for user or org |
| `repo_create` | Create a repository |
| `pr_list` | List pull requests |
| `pr_create` | Create a pull request |
| `pr_merge` | Merge a pull request |
| `issue_list` | List issues |
| `issue_create` | Create an issue |
| `workflow_list` | List GitHub Actions workflows |
| `workflow_dispatch` | Trigger a workflow run |

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Yes | PAT or fine-grained token |
| `GITHUB_OWNER` | No | Default org/user for repo operations |

## Response Format

All tools return JSON via MCP text content:

```json
{ "success": true, "data": { } }
```

Errors:

```json
{ "success": false, "error": "message", "details": { } }
```
