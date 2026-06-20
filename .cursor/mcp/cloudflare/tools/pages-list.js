/**
 * MCP tool: pages_list_projects
 */

import {
  validateEnv,
  pagesListSchema,
  formatZodError,
  toolError,
  toolSuccess,
} from '../lib/validation.js';
import { createClient, CloudflareApiError } from '../lib/cloudflare-client.js';
import { logger } from '../lib/logger.js';

export const name = 'pages_list_projects';

export const definition = {
  name,
  description: 'List all Cloudflare Pages projects in the configured account.',
  inputSchema: {
    type: 'object',
    properties: {
      page: { type: 'number', description: 'Page number for pagination' },
      per_page: { type: 'number', description: 'Results per page (max 100)' },
    },
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/cloudflare-client.js').CloudflareClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = pagesListSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Listing Pages projects');
    const result = await client.listPagesProjects(parsed.data);
    return toolSuccess(result.result ?? result);
  } catch (err) {
    const message = err instanceof CloudflareApiError ? err.message : 'Failed to list Pages projects';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof CloudflareApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
