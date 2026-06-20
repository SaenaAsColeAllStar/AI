/**
 * Postgres tool coverage tests.
 */

import { describe, it, expect, afterEach, beforeEach } from '@jest/globals';
import { resetPool, validateEnv } from '../lib/postgres-client.js';
import { formatZodError, toolError, toolSuccess } from '../lib/validation.js';
import { configureLogger, logger } from '../lib/logger.js';
import queryTool from '../tools/query.js';
import listTablesTool from '../tools/list-tables.js';
import describeTableTool from '../tools/describe-table.js';
import { z } from 'zod';

describe('validation and logger', () => {
  it('helpers work', () => {
    const schema = z.object({ x: z.string() });
    const r = schema.safeParse({});
    if (r.success) throw new Error('fail');
    expect(formatZodError(r.error)).toContain('x');
    expect(toolError('e').isError).toBe(true);
    expect(toolSuccess({}).content[0].text).toContain('success');
  });

  it('logger methods', () => {
    configureLogger({ level: 'debug' });
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    configureLogger({ level: 'info' });
  });
});

describe('postgres tools with mock pool', () => {
  const mockPool = {
    query: async (sql) => ({
      rowCount: 1,
      fields: [{ name: 'table_name', dataTypeID: 25 }],
      rows:
        sql.includes('information_schema.tables')
          ? [{ table_schema: 'public', table_name: 'users', table_type: 'BASE TABLE' }]
          : sql.includes('table_constraints')
            ? [{ constraint_name: 'pk', constraint_type: 'PRIMARY KEY', column_name: 'id' }]
            : [{ column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null }],
    }),
  };

  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://localhost/test';
    resetPool();
  });

  afterEach(() => resetPool());

  it('list_tables tool', async () => {
    const result = await listTablesTool.handler({ schema: 'public' }, { pool: mockPool });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('describe_table tool', async () => {
    const result = await describeTableTool.handler({ table: 'users', schema: 'public' }, { pool: mockPool });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('query tool with limit injection', async () => {
    const result = await queryTool.handler({ sql: 'SELECT 1', limit: 5 }, { pool: mockPool });
    expect(result.content[0].text).toContain('"success": true');
  });

  it('tools fail without DATABASE_URL', async () => {
    delete process.env.DATABASE_URL;
    resetPool();
    expect((await listTablesTool.handler({})).isError).toBe(true);
  });

  it('describe_table validates input', async () => {
    expect((await describeTableTool.handler({})).isError).toBe(true);
  });

  it('validateEnv missing url', () => {
    delete process.env.DATABASE_URL;
    expect(validateEnv().ok).toBe(false);
  });
});
