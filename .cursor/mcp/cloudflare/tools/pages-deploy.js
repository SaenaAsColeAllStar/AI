/**
 * MCP tool: pages_deploy
 */

import {
  validateEnv,
  pagesDeploySchema,
  formatZodError,
  toolError,
  toolSuccess,
} from '../lib/validation.js';
import { createClient, CloudflareApiError } from '../lib/cloudflare-client.js';
import { logger } from '../lib/logger.js';

export const name = 'pages_deploy';

export const definition = {
  name,
  description:
    'Trigger a Cloudflare Pages deployment for an existing project. Use after build artifacts are ready or for branch-based deploys.',
  inputSchema: {
    type: 'object',
    properties: {
      project_name: { type: 'string', description: 'Existing Pages project name' },
      branch: { type: 'string', description: 'Branch to deploy (optional)' },
    },
    required: ['project_name'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/cloudflare-client.js').CloudflareClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = pagesDeploySchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  const body = {};
  if (parsed.data.branch) {
    body.branch = parsed.data.branch;
  }

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Deploying Pages project', { project: parsed.data.project_name });
    const result = await client.deployPagesProject(parsed.data.project_name, body);
    return toolSuccess(result.result ?? result);
  } catch (err) {
    const message = err instanceof CloudflareApiError ? err.message : 'Failed to deploy Pages project';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof CloudflareApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
