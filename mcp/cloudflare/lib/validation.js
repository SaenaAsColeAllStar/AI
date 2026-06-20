/**
 * Environment and input validation for Cloudflare MCP.
 */

import { z } from 'zod';
import { logger } from './logger.js';

/** @typedef {{ apiToken: string, accountId: string, zoneId: string }} CloudflareEnv */

const envSchema = z.object({
  CLOUDFLARE_API_TOKEN: z.string().min(1, 'CLOUDFLARE_API_TOKEN is required'),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1, 'CLOUDFLARE_ACCOUNT_ID is required'),
  CLOUDFLARE_ZONE_ID: z.string().min(1, 'CLOUDFLARE_ZONE_ID is required'),
});

/**
 * Validate required environment variables.
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ ok: true, env: CloudflareEnv } | { ok: false, error: string, missing: string[] }}
 */
export function validateEnv(env = process.env) {
  const result = envSchema.safeParse(env);
  if (result.success) {
    return {
      ok: true,
      env: {
        apiToken: result.data.CLOUDFLARE_API_TOKEN,
        accountId: result.data.CLOUDFLARE_ACCOUNT_ID,
        zoneId: result.data.CLOUDFLARE_ZONE_ID,
      },
    };
  }

  const missing = result.error.issues.map((i) => i.path.join('.'));
  const error = `Missing or invalid Cloudflare credentials: ${missing.join(', ')}. Copy .env.example to .env and set values.`;

  logger.warn('Environment validation failed', { missing });

  return { ok: false, error, missing };
}

/**
 * Format Zod errors into a readable string.
 * @param {import('zod').ZodError} error
 * @returns {string}
 */
export function formatZodError(error) {
  return error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
}

/**
 * Safe MCP tool error response.
 * @param {string} message
 * @param {Record<string, unknown>} [details]
 */
export function toolError(message, details = {}) {
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify({ success: false, error: message, ...details }, null, 2),
      },
    ],
  };
}

/**
 * Safe MCP tool success response.
 * @param {unknown} data
 */
export function toolSuccess(data) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ success: true, data }, null, 2),
      },
    ],
  };
}

export const dnsRecordTypes = z.enum([
  'A',
  'AAAA',
  'CNAME',
  'TXT',
  'MX',
  'NS',
  'SRV',
  'CAA',
]);

export const pagesCreateSchema = z.object({
  name: z.string().min(1).max(128),
  production_branch: z.string().optional(),
  build_command: z.string().optional(),
  destination_dir: z.string().optional(),
  root_dir: z.string().optional(),
});

export const pagesDeploySchema = z.object({
  project_name: z.string().min(1),
  branch: z.string().optional(),
});

export const pagesListSchema = z.object({
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().max(100).optional(),
});

export const pagesDeploymentSchema = z.object({
  project_name: z.string().min(1),
  deployment_id: z.string().min(1),
});

export const dnsCreateSchema = z.object({
  type: dnsRecordTypes,
  name: z.string().min(1),
  content: z.string().min(1),
  ttl: z.number().int().min(1).optional(),
  proxied: z.boolean().optional(),
  priority: z.number().int().optional(),
  comment: z.string().optional(),
});

export const dnsUpdateSchema = z.object({
  record_id: z.string().min(1),
  type: dnsRecordTypes.optional(),
  name: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  ttl: z.number().int().min(1).optional(),
  proxied: z.boolean().optional(),
  priority: z.number().int().optional(),
  comment: z.string().optional(),
});

export const dnsListSchema = z.object({
  type: dnsRecordTypes.optional(),
  name: z.string().optional(),
  content: z.string().optional(),
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().max(100).optional(),
});

export const domainAttachSchema = z.object({
  project_name: z.string().min(1),
  domain: z.string().min(1),
});

export const domainVerifySchema = z.object({
  project_name: z.string().min(1),
  domain: z.string().min(1),
});
