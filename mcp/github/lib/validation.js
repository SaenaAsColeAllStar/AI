/**
 * Environment and input validation for GitHub MCP.
 */

import { z } from 'zod';
import { logger } from './logger.js';

const envSchema = z.object({
  GITHUB_TOKEN: z.string().min(1, 'GITHUB_TOKEN is required'),
  GITHUB_OWNER: z.string().optional(),
});

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function validateEnv(env = process.env) {
  const result = envSchema.safeParse(env);
  if (result.success) {
    return {
      ok: true,
      env: {
        token: result.data.GITHUB_TOKEN,
        defaultOwner: result.data.GITHUB_OWNER ?? null,
      },
    };
  }

  const missing = result.error.issues.map((i) => i.path.join('.'));
  const error = `Missing or invalid GitHub credentials: ${missing.join(', ')}. Copy .env.example to .env and set GITHUB_TOKEN.`;
  logger.warn('Environment validation failed', { missing });
  return { ok: false, error, missing };
}

/**
 * @param {import('zod').ZodError} error
 */
export function formatZodError(error) {
  return error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
}

/**
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

export const ownerRepoSchema = z.object({
  owner: z.string().min(1).optional(),
  repo: z.string().min(1),
});

export const repoListSchema = z.object({
  owner: z.string().min(1).optional(),
  type: z.enum(['all', 'owner', 'public', 'private', 'member']).optional(),
  per_page: z.number().int().positive().max(100).optional(),
  page: z.number().int().positive().optional(),
});

export const repoCreateSchema = z.object({
  owner: z.string().min(1).optional(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  private: z.boolean().optional(),
  auto_init: z.boolean().optional(),
});

export const prListSchema = z.object({
  owner: z.string().min(1).optional(),
  repo: z.string().min(1),
  state: z.enum(['open', 'closed', 'all']).optional(),
  per_page: z.number().int().positive().max(100).optional(),
  page: z.number().int().positive().optional(),
});

export const prCreateSchema = z.object({
  owner: z.string().min(1).optional(),
  repo: z.string().min(1),
  title: z.string().min(1),
  head: z.string().min(1),
  base: z.string().min(1),
  body: z.string().optional(),
  draft: z.boolean().optional(),
});

export const prMergeSchema = z.object({
  owner: z.string().min(1).optional(),
  repo: z.string().min(1),
  pull_number: z.number().int().positive(),
  merge_method: z.enum(['merge', 'squash', 'rebase']).optional(),
  commit_title: z.string().optional(),
  commit_message: z.string().optional(),
});

export const issueListSchema = z.object({
  owner: z.string().min(1).optional(),
  repo: z.string().min(1),
  state: z.enum(['open', 'closed', 'all']).optional(),
  labels: z.string().optional(),
  per_page: z.number().int().positive().max(100).optional(),
  page: z.number().int().positive().optional(),
});

export const issueCreateSchema = z.object({
  owner: z.string().min(1).optional(),
  repo: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional(),
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
});

export const workflowListSchema = z.object({
  owner: z.string().min(1).optional(),
  repo: z.string().min(1),
  per_page: z.number().int().positive().max(100).optional(),
  page: z.number().int().positive().optional(),
});

export const workflowDispatchSchema = z.object({
  owner: z.string().min(1).optional(),
  repo: z.string().min(1),
  workflow_id: z.union([z.string().min(1), z.number().int().positive()]),
  ref: z.string().min(1),
  inputs: z.record(z.string()).optional(),
});

/**
 * Resolve owner from args or env default.
 * @param {{ owner?: string }} args
 * @param {{ defaultOwner: string | null }} env
 */
export function resolveOwner(args, env) {
  const owner = args.owner ?? env.defaultOwner;
  if (!owner) {
    throw new Error('owner is required (pass in arguments or set GITHUB_OWNER)');
  }
  return owner;
}
