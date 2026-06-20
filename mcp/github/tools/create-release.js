/**
 * MCP tool: create_release
 */

import {
  validateEnv,
  releaseCreateSchema,
  formatZodError,
  toolError,
  toolSuccess,
  resolveOwner,
} from '../lib/validation.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { logger } from '../lib/logger.js';

export const name = 'create_release';

export const definition = {
  name,
  description: 'Create a GitHub release for a repository.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string' },
      repo: { type: 'string' },
      tag_name: { type: 'string' },
      name: { type: 'string' },
      body: { type: 'string' },
      draft: { type: 'boolean' },
      prerelease: { type: 'boolean' },
      target_commitish: { type: 'string' },
    },
    required: ['repo', 'tag_name'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/github-client.js').GitHubClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = releaseCreateSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const owner = resolveOwner(parsed.data, envCheck.env);
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Creating release', { owner, repo: parsed.data.repo, tag: parsed.data.tag_name });
    const result = await client.createRelease({ ...parsed.data, owner });
    return toolSuccess(result);
  } catch (err) {
    const message = err instanceof GitHubApiError ? err.message : 'Failed to create release';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof GitHubApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
