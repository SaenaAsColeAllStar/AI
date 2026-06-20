/**
 * MCP tool: domain_attach
 */

import {
  validateEnv,
  domainAttachSchema,
  formatZodError,
  toolError,
  toolSuccess,
} from '../lib/validation.js';
import { createClient, CloudflareApiError } from '../lib/cloudflare-client.js';
import { logger } from '../lib/logger.js';

export const name = 'domain_attach';

export const definition = {
  name,
  description:
    'Attach a custom domain to a Cloudflare Pages project. Returns verification instructions if DNS is not yet configured.',
  inputSchema: {
    type: 'object',
    properties: {
      project_name: { type: 'string', description: 'Pages project name' },
      domain: { type: 'string', description: 'Custom domain (e.g. erp.school.sch.id)' },
    },
    required: ['project_name', 'domain'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/cloudflare-client.js').CloudflareClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = domainAttachSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Attaching custom domain', {
      project: parsed.data.project_name,
      domain: parsed.data.domain,
    });
    const result = await client.attachDomain(parsed.data.project_name, parsed.data.domain);
    return toolSuccess(result.result ?? result);
  } catch (err) {
    const message = err instanceof CloudflareApiError ? err.message : 'Failed to attach domain';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof CloudflareApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
