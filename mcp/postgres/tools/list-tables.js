import { validateEnv, listTables } from '../lib/postgres-client.js';
import { listTablesSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';

export const name = 'list_tables';

export const definition = {
  name,
  description: 'List tables in a PostgreSQL schema.',
  inputSchema: {
    type: 'object',
    properties: {
      schema: { type: 'string', description: 'Schema name (default: public)' },
    },
  },
};

export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = listTablesSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const result = await listTables(parsed.data.schema ?? 'public', ctx);
    return toolSuccess(result);
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'Failed to list tables');
  }
}

export default { name, definition, handler };
