/**
 * Platform devops agent hooks.
 */

/**
 * @param {{ task: object, config: object | null, mcps: object[], skills: object[] }} ctx
 */
export async function handleDevopsTask(ctx) {
  return {
    agentId: 'platform-devops',
    status: 'ready',
    capabilities: ['docker', 'cicd', 'cloudflare', 'github-actions', 'deploy', 'rollback'],
    recommendedSkills: ctx.config?.skills?.required ?? [],
    recommendedMcps: (ctx.mcps ?? []).map((m) => m.id),
    task: ctx.task,
  };
}

export default { handleDevopsTask };
