# GitHub MCP API

Canonical tool names for the Teknovo Multi-Agent Platform.

## Authentication

Credentials load from Teknovo secret store:

- Linux: `/root/.config/teknovo/secrets/github.env`
- Windows: `%USERPROFILE%\.config\teknovo\secrets\github.env`

Required key: `GITHUB_TOKEN`

Optional env: `GITHUB_OWNER` (default owner for repo operations)

## Tools

| Tool | Description |
|------|-------------|
| `create_repository` | Create a new repository |
| `create_branch` | Create branch from existing branch |
| `create_issue` | Create an issue |
| `create_pull_request` | Create a pull request |
| `list_pull_requests` | List pull requests |
| `commit_changes` | Commit files via Git API |
| `create_release` | Create a release |
| `repository_analysis` | Repo metadata, languages, open PRs/issues |

### Legacy aliases

`repo_create`, `pr_create`, `pr_list`, `issue_create`, `issue_list`, `pr_merge`, `repo_list`, `workflow_list`, `workflow_dispatch` remain available for backward compatibility.

## Examples

### create_branch

```json
{
  "repo": "teknovo-erp",
  "branch": "feature/login",
  "from_branch": "main"
}
```

### commit_changes

```json
{
  "repo": "teknovo-erp",
  "branch": "feature/login",
  "message": "feat(auth): add login form",
  "files": [
    { "path": "src/login.tsx", "content": "export default function Login() {}" }
  ]
}
```

### repository_analysis

```json
{
  "owner": "teknovo",
  "repo": "teknovo-erp"
}
```

## Security

- Tokens are never logged in plaintext
- No force-push or git config mutation
- Pair with `security-reviewer` before write operations on production repos
