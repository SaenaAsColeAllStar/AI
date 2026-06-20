/**
 * MCP tool: read_file
 */

import { validateEnv } from '../lib/path-guard.js';
import { readFileSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';
import { readFile } from '../lib/fs-ops.js';

export const name = 'read_file';

export const definition = {
  name,
  description: 'Read a file within TEKNOVO_WORKSPACE.',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Relative path within workspace' },
      encoding: { type: 'string', enum: ['utf8', 'base64'] },
    },
    required: ['path'],
  },
};

export async function handler(args) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error);

  const parsed = readFileSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const content = readFile(parsed.data.path, parsed.data.encoding ?? 'utf8');
    return toolSuccess({ path: parsed.data.path, content, encoding: parsed.data.encoding ?? 'utf8' });
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'Failed to read file');
  }
}

export default { name, definition, handler };
