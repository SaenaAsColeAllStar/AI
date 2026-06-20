/**
 * MCP tool: search_files
 */

import { validateEnv } from '../lib/path-guard.js';
import { searchFilesSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';
import { searchFiles } from '../lib/fs-ops.js';

export const name = 'search_files';

export const definition = {
  name,
  description: 'Search files by glob-like pattern within TEKNOVO_WORKSPACE.',
  inputSchema: {
    type: 'object',
    properties: {
      pattern: { type: 'string', description: 'Glob-like pattern (* and ? supported)' },
      path: { type: 'string', description: 'Search root relative path' },
      max_results: { type: 'number', description: 'Maximum results (default 100)' },
    },
    required: ['pattern'],
  },
};

export async function handler(args) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error);

  const parsed = searchFilesSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const matches = searchFiles(
      parsed.data.pattern,
      parsed.data.path ?? '.',
      parsed.data.max_results ?? 100
    );
    return toolSuccess({ matches, count: matches.length });
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'Failed to search files');
  }
}

export default { name, definition, handler };
