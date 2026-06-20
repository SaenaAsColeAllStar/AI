/**
 * MCP tool: pages_get_deployment
 */

import {
  validateEnv,
  pagesDeploymentSchema,
  formatZodError,
  toolError,
  toolSuccess,
} from '../lib/validation.js';
import { createClient, CloudflareApiError } from '../lib/cloudflare-client.js';
import { logger } from '../lib/logger.js';

export const name = 'pages_get_deployment';

export const definition = {
  name,
  description: 'Get details and status of a specific Cloudflare Pages deployment.',
  inputSchema: {
    type: 'object',
    properties: {
      project_name: { type: 'string', description: 'Pages project name' },
      deployment_id: { type: 'string', description: 'Deployment ID' },
    },
    required: ['project_name', 'deployment_id'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/cloudflare-client.js').CloudflareClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = pagesDeploymentSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Fetching Pages deployment', {
      project: parsed.data.project_name,
      deploymentId: parsed.data.deployment_id,
    });
    const result = await client.getPagesDeployment(
      parsed.data.project_name,
      parsed.data.deployment_id
    );
    return toolSuccess(result.result ?? result);
  } catch (err) {
    const message = err instanceof CloudflareApiError ? err.message : 'Failed to get deployment';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof CloudflareApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
