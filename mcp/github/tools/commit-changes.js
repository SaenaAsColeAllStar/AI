/**
 * MCP tool: commit_changes
 */

import {
  validateEnv,
  commitChangesSchema,
  formatZodError,
  toolError,
  toolSuccess,
  resolveOwner,
} from '../lib/validation.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { logger } from '../lib/logger.js';

export const name = 'commit_changes';

export const definition = {
  name,
  description: 'Commit file changes to a branch via GitHub Git API.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string' },
      repo: { type: 'string' },
      branch: { type: 'string' },
      message: { type: 'string' },
      files: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            content: { type: 'string' },
          },
          required: ['path', 'content'],
        },
      },
    },
    required: ['repo', 'branch', 'message', 'files'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/github-client.js').GitHubClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = commitChangesSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const owner = resolveOwner(parsed.data, envCheck.env);
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Committing changes', {
      owner,
      repo: parsed.data.repo,
      branch: parsed.data.branch,
      fileCount: parsed.data.files.length,
    });
    const result = await client.commitChanges({ ...parsed.data, owner });
    return toolSuccess(result);
  } catch (err) {
    const message = err instanceof GitHubApiError ? err.message : 'Failed to commit changes';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof GitHubApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
