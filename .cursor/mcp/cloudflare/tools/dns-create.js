/**
 * MCP tool: dns_create_record
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  validateEnv,
  dnsCreateSchema,
  formatZodError,
  toolError,
  toolSuccess,
} from '../lib/validation.js';
import { createClient, CloudflareApiError } from '../lib/cloudflare-client.js';
import { logger } from '../lib/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, '..', 'config', 'cloudflare.json'), 'utf8'));

export const name = 'dns_create_record';

export const definition = {
  name,
  description: 'Create a DNS record in the configured Cloudflare zone (A, AAAA, CNAME, TXT, etc.).',
  inputSchema: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV', 'CAA'] },
      name: { type: 'string', description: 'Record name (e.g. erp, api, @)' },
      content: { type: 'string', description: 'Record content / target' },
      ttl: { type: 'number', description: 'TTL in seconds (1 = auto)' },
      proxied: { type: 'boolean', description: 'Enable Cloudflare proxy (orange cloud)' },
      priority: { type: 'number', description: 'Priority for MX/SRV records' },
      comment: { type: 'string', description: 'Optional record comment' },
    },
    required: ['type', 'name', 'content'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/cloudflare-client.js').CloudflareClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = dnsCreateSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  const record = {
    type: parsed.data.type,
    name: parsed.data.name,
    content: parsed.data.content,
    ttl: parsed.data.ttl ?? config.dns?.defaultTtl ?? 1,
    proxied: parsed.data.proxied ?? config.dns?.defaultProxied ?? true,
  };

  if (parsed.data.priority !== undefined) record.priority = parsed.data.priority;
  if (parsed.data.comment) record.comment = parsed.data.comment;

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Creating DNS record', { type: record.type, name: record.name });
    const result = await client.createDnsRecord(record);
    return toolSuccess(result.result ?? result);
  } catch (err) {
    const message = err instanceof CloudflareApiError ? err.message : 'Failed to create DNS record';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof CloudflareApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
