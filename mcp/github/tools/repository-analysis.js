/**
 * MCP tool: repository_analysis
 */

import {
  validateEnv,
  repositoryAnalysisSchema,
  formatZodError,
  toolError,
  toolSuccess,
  resolveOwner,
} from '../lib/validation.js';
import { createClient, GitHubApiError } from '../lib/github-client.js';
import { logger } from '../lib/logger.js';

export const name = 'repository_analysis';

export const definition = {
  name,
  description: 'Analyze a repository — metadata, languages, open PRs and issues.',
  inputSchema: {
    type: 'object',
    properties: {
      owner: { type: 'string' },
      repo: { type: 'string' },
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

  const parsed = repositoryAnalysisSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const owner = resolveOwner(parsed.data, envCheck.env);
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Analyzing repository', { owner, repo: parsed.data.repo });
    const result = await client.analyzeRepository({ ...parsed.data, owner });
    return toolSuccess(result);
  } catch (err) {
    const message = err instanceof GitHubApiError ? err.message : 'Failed to analyze repository';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof GitHubApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
