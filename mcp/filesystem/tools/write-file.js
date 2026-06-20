/**
 * MCP tool: write_file
 */

import { validateEnv } from '../lib/path-guard.js';
import { writeFileSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';
import { writeFile } from '../lib/fs-ops.js';

export const name = 'write_file';

export const definition = {
  name,
  description: 'Write a file within TEKNOVO_WORKSPACE.',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      content: { type: 'string' },
      encoding: { type: 'string', enum: ['utf8', 'base64'] },
      create_dirs: { type: 'boolean', description: 'Create parent directories if missing' },
    },
    required: ['path', 'content'],
  },
};

export async function handler(args) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error);

  const parsed = writeFileSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const result = writeFile(parsed.data.path, parsed.data.content, {
      encoding: parsed.data.encoding ?? 'utf8',
      createDirs: parsed.data.create_dirs ?? true,
    });
    return toolSuccess(result);
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'Failed to write file');
  }
}

export default { name, definition, handler };
