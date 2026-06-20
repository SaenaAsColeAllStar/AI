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

| Tool | Description |
|------|-------------|
| `repo_list` | List repositories |
| `repo_create` | Create repository |
| `pr_list` | List pull requests |
| `pr_create` | Create pull request |
| `pr_merge` | Merge pull request |
| `issue_list` | List issues |
| `issue_create` | Create issue |
| `workflow_list` | List workflows |
| `workflow_dispatch` | Dispatch workflow |

See [docs/API.md](docs/API.md) for schemas.

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
