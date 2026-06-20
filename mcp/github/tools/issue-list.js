/**
 * MCP tool: issue_list
 */

import {
  validateEnv,
  issueListSchema,
  formatZodError,
  toolError,
  toolSuccess,
  resolveOwner,
} from '../lib/validation.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { logger } from '../lib/logger.js';

export const name = 'issue_list';

export const definition = {
  name,
  description: 'List issues for a repository.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string' },
      repo: { type: 'string' },
      state: { type: 'string', enum: ['open', 'closed', 'all'] },
      labels: { type: 'string', description: 'Comma-separated label names' },
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

  const parsed = issueListSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const owner = resolveOwner(parsed.data, envCheck.env);
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Listing issues', { owner, repo: parsed.data.repo });
    const result = await client.listIssues({ ...parsed.data, owner });
    return toolSuccess(result);
  } catch (err) {
    const message =
      err instanceof GitHubApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to list issues';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof GitHubApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
