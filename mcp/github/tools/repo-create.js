/**
 * MCP tool: repo_create
 */

import {
  validateEnv,
  repoCreateSchema,
  formatZodError,
  toolError,
  toolSuccess,
  resolveOwner,
} from '../lib/validation.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { logger } from '../lib/logger.js';

export const name = 'repo_create';

export const definition = {
  name,
  description: 'Create a new GitHub repository under the user or organization.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string', description: 'Organization owner (omit for user repo)' },
      name: { type: 'string', description: 'Repository name' },
      description: { type: 'string', description: 'Repository description' },
      private: { type: 'boolean', description: 'Create as private repo' },
      auto_init: { type: 'boolean', description: 'Initialize with README' },
    },
    required: ['name'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/github-client.js').GitHubClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = repoCreateSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const owner = parsed.data.owner ?? envCheck.env.defaultOwner ?? undefined;
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Creating repository', { name: parsed.data.name, owner: owner ?? 'user' });
    const result = await client.createRepo({ ...parsed.data, owner: owner ?? '' });
    return toolSuccess(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes('owner is required')) {
      return toolError(err.message);
    }
    const message = err instanceof GitHubApiError ? err.message : 'Failed to create repository';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof GitHubApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
