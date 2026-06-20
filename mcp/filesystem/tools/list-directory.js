/**
 * MCP tool: list_directory
 */

import { validateEnv } from '../lib/path-guard.js';
import { listDirectorySchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';
import { listDirectory } from '../lib/fs-ops.js';

export const name = 'list_directory';

export const definition = {
  name,
  description: 'List directory contents within TEKNOVO_WORKSPACE.',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Relative directory path (default: workspace root)' },
      recursive: { type: 'boolean' },
      max_depth: { type: 'number', description: 'Max recursion depth (0-10)' },
    },
  },
};

export async function handler(args) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error);

  const parsed = listDirectorySchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const entries = listDirectory(parsed.data.path ?? '.', {
      recursive: parsed.data.recursive ?? false,
      maxDepth: parsed.data.max_depth,
    });
    return toolSuccess({ entries, count: entries.length });
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'Failed to list directory');
  }
}

export default { name, definition, handler };
