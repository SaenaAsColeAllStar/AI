# Teknovo GitHub MCP

Model Context Protocol server for GitHub repository, PR, issue, and workflow automation.

## Quick Start

```bash
cd mcp/github
cp .env.example .env
npm install
npm test
npm start
```

## Tools

### Canonical (Platform)

| Tool | Description |
|------|-------------|
| `create_repository` | Create repository |
| `create_branch` | Create branch from existing branch |
| `create_issue` | Create issue |
| `create_pull_request` | Create pull request |
| `list_pull_requests` | List pull requests |
| `commit_changes` | Commit file changes via Git API |
| `create_release` | Create release |
| `repository_analysis` | Analyze repo metadata and activity |

### Legacy

| Tool | Description |
|------|-------------|
| `repo_list` | List repositories |
| `repo_create` | Create repository (alias) |
| `pr_list` | List pull requests (alias) |
| `pr_create` | Create pull request (alias) |
| `pr_merge` | Merge pull request |
| `issue_list` | List issues |
| `issue_create` | Create issue (alias) |
| `workflow_list` | List workflows |
| `workflow_dispatch` | Dispatch workflow |

Secrets load from Teknovo secret store (`github.env`). See [docs/API.md](docs/API.md) for schemas.

## Cursor Configuration

```json
{
  "teknovo-github": {
    "command": "node",
    "args": ["c:/Users/fajar/Downloads/AI/mcp/github/server.js"],
    "env": {
      "GITHUB_TOKEN": "${env:GITHUB_TOKEN}",
      "GITHUB_OWNER": "${env:GITHUB_OWNER}"
    }
  }
}
```

## License

MIT
