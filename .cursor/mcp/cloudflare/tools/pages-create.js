/**
 * MCP tool: pages_create_project
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  validateEnv,
  pagesCreateSchema,
  formatZodError,
  toolError,
  toolSuccess,
} from '../lib/validation.js';
import { createClient, CloudflareApiError } from '../lib/cloudflare-client.js';
import { logger } from '../lib/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, '..', 'config', 'cloudflare.json'), 'utf8'));

export const name = 'pages_create_project';

export const definition = {
  name,
  description:
    'Create a new Cloudflare Pages project with optional build configuration for Next.js or static sites.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Project name (unique within account)' },
      production_branch: { type: 'string', description: 'Production branch (default: main)' },
      build_command: { type: 'string', description: 'Build command (e.g. npm run build)' },
      destination_dir: { type: 'string', description: 'Output directory (e.g. .next, dist, out)' },
      root_dir: { type: 'string', description: 'Monorepo root subdirectory' },
    },
    required: ['name'],
  },
};

/**
 * @param {Record<string, unknown>} args
 * @param {{ client?: import('../lib/cloudflare-client.js').CloudflareClient }} [ctx]
 */
export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = pagesCreateSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  const defaults = config.pages?.defaultBuildConfig ?? {};
  const body = {
    name: parsed.data.name,
    production_branch: parsed.data.production_branch ?? config.pages?.defaultProductionBranch ?? 'main',
    build_config: {
      build_command: parsed.data.build_command ?? defaults.build_command ?? 'npm run build',
      destination_dir: parsed.data.destination_dir ?? defaults.destination_dir ?? 'dist',
      root_dir: parsed.data.root_dir ?? defaults.root_dir ?? '',
    },
  };

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    logger.info('Creating Pages project', { name: parsed.data.name });
    const result = await client.createPagesProject(body);
    return toolSuccess(result.result ?? result);
  } catch (err) {
    const message = err instanceof CloudflareApiError ? err.message : 'Failed to create Pages project';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof CloudflareApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
