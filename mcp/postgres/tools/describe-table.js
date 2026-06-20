import { validateEnv, describeTable } from '../lib/postgres-client.js';
import { describeTableSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';

export const name = 'describe_table';

export const definition = {
  name,
  description: 'Describe columns and constraints for a PostgreSQL table.',
  inputSchema: {
    type: 'object',
    properties: {
      table: { type: 'string', description: 'Table name' },
      schema: { type: 'string', description: 'Schema name (default: public)' },
    },
    required: ['table'],
  },
};

export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = describeTableSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const result = await describeTable(parsed.data.table, parsed.data.schema ?? 'public', ctx);
    return toolSuccess(result);
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'Failed to describe table');
  }
}

export default { name, definition, handler };
