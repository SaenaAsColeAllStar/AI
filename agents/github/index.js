/**
 * Platform GitHub agent hooks.
 * Integrates with mcp/github via github-mcp.
 */

/**
 * @param {{ task: object, config: object | null, mcps: object[], skills: object[], agentId?: string }} ctx
 */
export async function handleGitHubTask(ctx) {
  const githubMcp = (ctx.mcps ?? []).find((m) => m.id === 'github-mcp');

  return {
    agentId: 'platform-github',
    status: 'ready',
    capabilities: [
      'repository',
      'pull-requests',
      'releases',
      'issues',
      'projects',
      'actions',
    ],
    recommendedSkills: ctx.config?.skills?.required ?? [],
    recommendedMcps: githubMcp
      ? ['github-mcp']
      : (ctx.mcps ?? []).map((m) => m.id),
    mcpServer: 'mcp/github/server.js',
    task: ctx.task,
  };
}

export default { handleGitHubTask };
