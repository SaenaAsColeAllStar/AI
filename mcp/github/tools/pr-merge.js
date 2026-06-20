/**
 * MCP tool: pr_merge
 */

import {
  validateEnv,
  prMergeSchema,
  formatZodError,
  toolError,
  toolSuccess,
  resolveOwner,
} from '../lib/validation.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { logger } from '../lib/logger.js';

export const name = 'pr_merge';

export const definition = {
  name,
  description: 'Merge a pull request using merge, squash, or rebase.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string' },
      repo: { type: 'string' },
      pull_number: { type: 'number' },
      merge_method: { type: 'string', enum: ['merge', 'squash', 'rebase'] },
      commit_title: { type: 'string' },
      commit_message: { type: 'string' },
    },
    required: ['repo', 'pull_number'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/github-client.js').GitHubClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = prMergeSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const owner = resolveOwner(parsed.data, envCheck.env);
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Merging pull request', {
      owner,
      repo: parsed.data.repo,
      pull_number: parsed.data.pull_number,
    });
    const result = await client.mergePullRequest({ ...parsed.data, owner });
    return toolSuccess(result);
  } catch (err) {
    const message =
      err instanceof GitHubApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to merge pull request';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof GitHubApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
