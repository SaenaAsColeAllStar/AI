/**
 * MCP tool: issue_create
 */

import {
  validateEnv,
  issueCreateSchema,
  formatZodError,
  toolError,
  toolSuccess,
  resolveOwner,
} from '../lib/validation.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { logger } from '../lib/logger.js';

export const name = 'issue_create';

export const definition = {
  name,
  description: 'Create a GitHub issue.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string' },
      repo: { type: 'string' },
      title: { type: 'string' },
      body: { type: 'string' },
      labels: { type: 'array', items: { type: 'string' } },
      assignees: { type: 'array', items: { type: 'string' } },
    },
    required: ['repo', 'title'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/github-client.js').GitHubClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = issueCreateSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const owner = resolveOwner(parsed.data, envCheck.env);
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Creating issue', { owner, repo: parsed.data.repo, title: parsed.data.title });
    const result = await client.createIssue({ ...parsed.data, owner });
    return toolSuccess(result);
  } catch (err) {
    const message =
      err instanceof GitHubApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to create issue';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof GitHubApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
