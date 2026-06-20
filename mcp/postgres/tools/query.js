import { validateEnv, runQuery } from '../lib/postgres-client.js';
import { querySchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';

export const name = 'query';

export const definition = {
  name,
  description: 'Execute a read-only SQL query (SELECT, WITH, EXPLAIN, SHOW only).',
  inputSchema: {
    type: 'object',
    properties: {
      sql: { type: 'string', description: 'Read-only SQL query' },
      params: { type: 'array', items: {}, description: 'Parameterized query values' },
      limit: { type: 'number', description: 'Max rows to return (informational)' },
    },
    required: ['sql'],
  },
};

export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = querySchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    let sql = parsed.data.sql;
    if (parsed.data.limit && !/\blimit\b/i.test(sql)) {
      sql = `${sql.replace(/;\s*$/, '')} LIMIT ${parsed.data.limit}`;
    }
    const result = await runQuery(sql, parsed.data.params ?? [], ctx);
    return toolSuccess(result);
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'Query failed');
  }
}

export default { name, definition, handler };
