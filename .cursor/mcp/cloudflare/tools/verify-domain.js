/**
 * MCP tool: domain_verify
 */

import {
  validateEnv,
  domainVerifySchema,
  formatZodError,
  toolError,
  toolSuccess,
} from '../lib/validation.js';
import { createClient, CloudflareApiError } from '../lib/cloudflare-client.js';
import { logger } from '../lib/logger.js';

export const name = 'domain_verify';

export const definition = {
  name,
  description:
    'Check or trigger verification for a custom domain attached to a Cloudflare Pages project. Returns current verification status.',
  inputSchema: {
    type: 'object',
    properties: {
      project_name: { type: 'string', description: 'Pages project name' },
      domain: { type: 'string', description: 'Custom domain to verify' },
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

  const parsed = domainVerifySchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Verifying custom domain', {
      project: parsed.data.project_name,
      domain: parsed.data.domain,
    });

    let statusResult;
    try {
      statusResult = await client.getDomainStatus(parsed.data.project_name, parsed.data.domain);
    } catch (getErr) {
      if (getErr instanceof CloudflareApiError && getErr.details?.status === 404) {
        return toolError('Domain not found on project. Use domain_attach first.', {
          project: parsed.data.project_name,
          domain: parsed.data.domain,
        });
      }
      throw getErr;
    }

    const current = statusResult.result ?? statusResult;
    if (current?.status === 'active') {
      return toolSuccess({ status: 'active', domain: parsed.data.domain, verified: true, details: current });
    }

    const verifyResult = await client.verifyDomain(parsed.data.project_name, parsed.data.domain);
    const updated = verifyResult.result ?? verifyResult;

    return toolSuccess({
      status: updated?.status ?? 'pending',
      domain: parsed.data.domain,
      verified: updated?.status === 'active',
      details: updated,
    });
  } catch (err) {
    const message = err instanceof CloudflareApiError ? err.message : 'Failed to verify domain';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof CloudflareApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
