/**
 * Platform Cloudflare agent hooks.
 * Integrates with mcp/cloudflare via cloudflare-mcp.
 */

/**
 * @param {{ task: object, config: object | null, mcps: object[], skills: object[], agentId?: string }} ctx
 */
export async function handleCloudflareTask(ctx) {
  const cloudflareMcp = (ctx.mcps ?? []).find((m) => m.id === 'cloudflare-mcp');

  return {
    agentId: 'platform-cloudflare',
    status: 'ready',
    capabilities: [
      'pages-deploy',
      'dns-management',
      'domain-attach',
      'ssl-verify',
      'workers',
      'd1',
      'r2',
      'tunnel',
    ],
    recommendedSkills: ctx.config?.skills?.required ?? [],
    recommendedMcps: cloudflareMcp
      ? ['cloudflare-mcp']
      : (ctx.mcps ?? []).map((m) => m.id),
    mcpServer: 'mcp/cloudflare/server.js',
    task: ctx.task,
  };
}

export default { handleCloudflareTask };
