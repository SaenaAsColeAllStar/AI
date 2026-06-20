/**
 * MCP tool: repo_list
 */

import {
  validateEnv,
  repoListSchema,
  formatZodError,
  toolError,
  toolSuccess,
} from '../lib/validation.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { logger } from '../lib/logger.js';

export const name = 'repo_list';

export const definition = {
  name,
  description: 'List GitHub repositories for the authenticated user or organization.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string', description: 'Organization owner (omit for user repos)' },
      type: { type: 'string', enum: ['all', 'owner', 'public', 'private', 'member'] },
      per_page: { type: 'number', description: 'Results per page (max 100)' },
      page: { type: 'number', description: 'Page number' },
    },
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/github-client.js').GitHubClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = repoListSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    const owner = parsed.data.owner ?? envCheck.env.defaultOwner ?? undefined;
    logger.info('Listing repositories', { owner: owner ?? 'authenticated-user' });
    const result = await client.listRepos({ ...parsed.data, owner });
    return toolSuccess(result);
  } catch (err) {
    const message = err instanceof GitHubApiError ? err.message : 'Failed to list repositories';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof GitHubApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
