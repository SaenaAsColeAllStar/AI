/**
 * MCP tool: dns_update_record
 */

import {
  validateEnv,
  dnsUpdateSchema,
  formatZodError,
  toolError,
  toolSuccess,
} from '../lib/validation.js';
import { createClient, CloudflareApiError } from '../lib/cloudflare-client.js';
import { logger } from '../lib/logger.js';

export const name = 'dns_update_record';

export const definition = {
  name,
  description: 'Update an existing DNS record in the configured Cloudflare zone.',
  inputSchema: {
    type: 'object',
    properties: {
      record_id: { type: 'string', description: 'DNS record ID' },
      type: { type: 'string', enum: ['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV', 'CAA'] },
      name: { type: 'string', description: 'Record name' },
      content: { type: 'string', description: 'Record content / target' },
      ttl: { type: 'number', description: 'TTL in seconds' },
      proxied: { type: 'boolean', description: 'Enable Cloudflare proxy' },
      priority: { type: 'number', description: 'Priority for MX/SRV records' },
      comment: { type: 'string', description: 'Optional record comment' },
    },
    required: ['record_id'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/cloudflare-client.js').CloudflareClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = dnsUpdateSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  const { record_id, ...fields } = parsed.data;
  if (Object.keys(fields).length === 0) {
    return toolError('At least one field to update must be provided');
  }

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Updating DNS record', { recordId: record_id });
    const result = await client.updateDnsRecord(record_id, fields);
    return toolSuccess(result.result ?? result);
  } catch (err) {
    const message = err instanceof CloudflareApiError ? err.message : 'Failed to update DNS record';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof CloudflareApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
