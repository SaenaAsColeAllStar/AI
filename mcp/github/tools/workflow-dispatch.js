/**
 * MCP tool: workflow_dispatch
 */

import {
  validateEnv,
  workflowDispatchSchema,
  formatZodError,
  toolError,
  toolSuccess,
  resolveOwner,
} from '../lib/validation.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { logger } from '../lib/logger.js';

export const name = 'workflow_dispatch';

export const definition = {
  name,
  description: 'Dispatch a GitHub Actions workflow run.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string' },
      repo: { type: 'string' },
      workflow_id: { type: ['string', 'number'], description: 'Workflow ID or filename' },
      ref: { type: 'string', description: 'Git ref (branch or tag)' },
      inputs: { type: 'object', additionalProperties: { type: 'string' } },
    },
    required: ['repo', 'workflow_id', 'ref'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/github-client.js').GitHubClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = workflowDispatchSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const owner = resolveOwner(parsed.data, envCheck.env);
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Dispatching workflow', {
      owner,
      repo: parsed.data.repo,
      workflow_id: parsed.data.workflow_id,
      ref: parsed.data.ref,
    });
    const result = await client.dispatchWorkflow({ ...parsed.data, owner });
    return toolSuccess(result ?? { dispatched: true });
  } catch (err) {
    const message =
      err instanceof GitHubApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to dispatch workflow';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof GitHubApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
