/**
 * MCP tool: dns_list_records
 */

import {
  validateEnv,
  dnsListSchema,
  formatZodError,
  toolError,
  toolSuccess,
} from '../lib/validation.js';
import { createClient, CloudflareApiError } from '../lib/cloudflare-client.js';
import { logger } from '../lib/logger.js';

export const name = 'dns_list_records';

export const definition = {
  name,
  description: 'List DNS records in the configured Cloudflare zone with optional filters.',
  inputSchema: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV', 'CAA'] },
      name: { type: 'string', description: 'Filter by record name' },
      content: { type: 'string', description: 'Filter by record content' },
      page: { type: 'number', description: 'Page number' },
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

  const parsed = dnsListSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Listing DNS records', { filters: parsed.data });
    const result = await client.listDnsRecords(parsed.data);
    return toolSuccess(result.result ?? result);
  } catch (err) {
    const message = err instanceof CloudflareApiError ? err.message : 'Failed to list DNS records';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof CloudflareApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
