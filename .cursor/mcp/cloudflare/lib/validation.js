/**
 * Environment and input validation for Cloudflare MCP.
 */

import { z } from 'zod';
import {
  loadCloudflareSecrets,
  getCloudflareApiEnv,
} from '../../shared/secrets.js';
import {
  formatZodError,
  toolError,
  toolSuccess,
} from '../../shared/validation.js';
import { logger } from './logger.js';

/** @typedef {{ apiToken: string, accountId: string, zoneId: string }} CloudflareEnv */

const envSchema = z.object({
  CLOUDFLARE_API_TOKEN: z.string().min(1, 'CLOUDFLARE_API_TOKEN is required'),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1, 'CLOUDFLARE_ACCOUNT_ID is required'),
  CLOUDFLARE_ZONE_ID: z.string().min(1, 'CLOUDFLARE_ZONE_ID is required'),
});

/**
 * Load credentials from Teknovo secret store, then validate process.env.
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ ok: true, env: CloudflareEnv, source: 'secret-store' | 'environment' } | { ok: false, error: string, missing: string[] }}
 */
export function validateEnv(env = process.env) {
  loadCloudflareSecrets();

  const fromStore = getCloudflareApiEnv();
  if (fromStore) {
    return { ok: true, env: fromStore, source: 'secret-store' };
  }

  const result = envSchema.safeParse(env);
  if (result.success) {
    return {
      ok: true,
      env: {
        apiToken: result.data.CLOUDFLARE_API_TOKEN,
        accountId: result.data.CLOUDFLARE_ACCOUNT_ID,
        zoneId: result.data.CLOUDFLARE_ZONE_ID,
      },
      source: 'environment',
    };
  }

  const missing = result.error.issues.map((i) => i.path.join('.'));
  const secretStoreHint =
    'Configure /root/.config/teknovo/secrets/cloudflare.env (Linux) or %USERPROFILE%\\.config\\teknovo\\secrets\\cloudflare.env (Windows).';
  const error = `Missing or invalid Cloudflare credentials: ${missing.join(', ')}. ${secretStoreHint}`;

  logger.warn('Environment validation failed', { missing });

  return { ok: false, error, missing };
}

export { formatZodError, toolError, toolSuccess };

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
