/**
 * Platform frontend agent hooks.
 */

/**
 * @param {{ task: object, config: object | null, mcps: object[], skills: object[] }} ctx
 */
export async function handleFrontendTask(ctx) {
  return {
    agentId: 'platform-frontend',
    status: 'ready',
    capabilities: ['next.js', 'react', 'tailwind', 'ui', 'seo', 'a11y', 'landing'],
    recommendedSkills: ctx.config?.skills?.required ?? [],
    recommendedMcps: (ctx.mcps ?? []).map((m) => m.id),
    task: ctx.task,
  };
}

export default { handleFrontendTask };
