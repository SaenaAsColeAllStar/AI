/**
 * Platform testing agent hooks.
 */

/**
 * @param {{ task: object, config: object | null, mcps: object[], skills: object[] }} ctx
 */
export async function handleTestingTask(ctx) {
  return {
    agentId: 'platform-testing',
    status: 'ready',
    capabilities: ['unit', 'integration', 'e2e', 'build-verify', 'performance', 'security', 'lighthouse'],
    recommendedSkills: ctx.config?.skills?.required ?? [],
    recommendedMcps: (ctx.mcps ?? []).map((m) => m.id),
    task: ctx.task,
  };
}

export default { handleTestingTask };
