/**
 * Platform backend agent hooks.
 */

/**
 * @param {{ task: object, config: object | null, mcps: object[], skills: object[] }} ctx
 */
export async function handleBackendTask(ctx) {
  return {
    agentId: 'platform-backend',
    status: 'ready',
    capabilities: ['nodejs', 'typescript', 'rest', 'database', 'rbac', 'auth'],
    recommendedSkills: ctx.config?.skills?.required ?? [],
    recommendedMcps: (ctx.mcps ?? []).map((m) => m.id),
    task: ctx.task,
  };
}

export default { handleBackendTask };
