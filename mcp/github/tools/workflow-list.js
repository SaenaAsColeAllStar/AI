/**
 * MCP tool: workflow_list
 */

import {
  validateEnv,
  workflowListSchema,
  formatZodError,
  toolError,
  toolSuccess,
  resolveOwner,
} from '../lib/validation.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { logger } from '../lib/logger.js';

export const name = 'workflow_list';

export const definition = {
  name,
  description: 'List GitHub Actions workflows for a repository.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string' },
      repo: { type: 'string' },
      per_page: { type: 'number' },
      page: { type: 'number' },
    },
    required: ['repo'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/github-client.js').GitHubClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = workflowListSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const owner = resolveOwner(parsed.data, envCheck.env);
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Listing workflows', { owner, repo: parsed.data.repo });
    const result = await client.listWorkflows({ ...parsed.data, owner });
    return toolSuccess(result);
  } catch (err) {
    const message =
      err instanceof GitHubApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to list workflows';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof GitHubApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
