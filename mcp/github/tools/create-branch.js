/**
 * MCP tool: create_branch
 */

import {
  validateEnv,
  branchCreateSchema,
  formatZodError,
  toolError,
  toolSuccess,
  resolveOwner,
} from '../lib/validation.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { logger } from '../lib/logger.js';

export const name = 'create_branch';

export const definition = {
  name,
  description: 'Create a new branch from an existing branch.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string' },
      repo: { type: 'string' },
      branch: { type: 'string', description: 'New branch name' },
      from_branch: { type: 'string', description: 'Source branch (default: main)' },
    },
    required: ['repo', 'branch'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/github-client.js').GitHubClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = branchCreateSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const owner = resolveOwner(parsed.data, envCheck.env);
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Creating branch', { owner, repo: parsed.data.repo, branch: parsed.data.branch });
    const result = await client.createBranch({ ...parsed.data, owner });
    return toolSuccess(result);
  } catch (err) {
    const message = err instanceof GitHubApiError ? err.message : 'Failed to create branch';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof GitHubApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
