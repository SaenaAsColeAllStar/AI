/**
 * MCP tool: pr_list
 */

import {
  validateEnv,
  prListSchema,
  formatZodError,
  toolError,
  toolSuccess,
  resolveOwner,
} from '../lib/validation.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { logger } from '../lib/logger.js';

export const name = 'pr_list';

export const definition = {
  name,
  description: 'List pull requests for a repository.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      state: { type: 'string', enum: ['open', 'closed', 'all'] },
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

  const parsed = prListSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const owner = resolveOwner(parsed.data, envCheck.env);
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Listing pull requests', { owner, repo: parsed.data.repo });
    const result = await client.listPullRequests({ ...parsed.data, owner });
    return toolSuccess(result);
  } catch (err) {
    const message =
      err instanceof GitHubApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to list pull requests';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof GitHubApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
