/**
 * MCP tool: file_info
 */

import { validateEnv } from '../lib/path-guard.js';
import { fileInfoSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';
import { fileInfo } from '../lib/fs-ops.js';

export const name = 'file_info';

export const definition = {
  name,
  description: 'Get metadata for a file or directory within TEKNOVO_WORKSPACE.',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string' },
    },
    required: ['path'],
  },
};

export async function handler(args) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error);

  const parsed = fileInfoSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const info = fileInfo(parsed.data.path);
    return toolSuccess(info);
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'Failed to get file info');
  }
}

export default { name, definition, handler };
