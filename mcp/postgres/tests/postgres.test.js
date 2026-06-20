/**
 * Postgres MCP tests.
 */

import { describe, it, expect, afterEach, beforeEach } from '@jest/globals';
import {
  validateEnv,
  assertReadOnly,
  runQuery,
  listTables,
  describeTable,
  resetPool,
} from '../lib/postgres-client.js';
import { toolError, toolSuccess } from '../lib/validation.js';
import { discoverTools, handleToolCall } from '../server.js';
import queryTool from '../tools/query.js';

describe('validation helpers', () => {
  it('toolError and toolSuccess work', () => {
    expect(toolError('x').isError).toBe(true);
    expect(toolSuccess({}).content[0].text).toContain('success');
  });
});

describe('assertReadOnly', () => {
  it('allows SELECT queries', () => {
    expect(() => assertReadOnly('SELECT 1')).not.toThrow();
    expect(() => assertReadOnly('WITH cte AS (SELECT 1) SELECT * FROM cte')).not.toThrow();
    expect(() => assertReadOnly('EXPLAIN SELECT 1')).not.toThrow();
  });

  it('blocks write queries', () => {
    expect(() => assertReadOnly('INSERT INTO t VALUES (1)')).toThrow();
    expect(() => assertReadOnly('DELETE FROM t')).toThrow();
    expect(() => assertReadOnly('DROP TABLE t')).toThrow();
  });

  it('blocks multiple statements', () => {
    expect(() => assertReadOnly('SELECT 1; SELECT 2')).toThrow('Multiple statements');
  });
});

describe('validateEnv', () => {
  const saved = process.env.DATABASE_URL;

  afterEach(() => {
    if (saved) process.env.DATABASE_URL = saved;
    else delete process.env.DATABASE_URL;
    resetPool();
  });

  it('requires DATABASE_URL', () => {
    delete process.env.DATABASE_URL;
    expect(validateEnv().ok).toBe(false);
  });

  it('accepts DATABASE_URL', () => {
    process.env.DATABASE_URL = 'postgresql://localhost/test';
    expect(validateEnv().ok).toBe(true);
  });
});

describe('mock pool operations', () => {
  afterEach(() => resetPool());

  const mockPool = {
    query: async (sql, params) => ({
      rowCount: 1,
      fields: [{ name: 'id', dataTypeID: 23 }],
      rows: [{ id: 1 }],
    }),
  };

  beforeEach(() => {
    process.env.DATABASE_URL = 'postgresql://localhost/test';
  });

  it('runQuery with mock pool', async () => {
    const result = await runQuery('SELECT 1', [], { pool: mockPool });
    expect(result.rows).toEqual([{ id: 1 }]);
  });

  it('listTables with mock pool', async () => {
    const result = await listTables('public', { pool: mockPool });
    expect(result.rowCount).toBe(1);
  });

  it('describeTable with mock pool', async () => {
    const result = await describeTable('users', 'public', { pool: mockPool });
    expect(result.table).toBe('users');
  });

  it('query tool validates env', async () => {
    delete process.env.DATABASE_URL;
    const result = await queryTool.handler({ sql: 'SELECT 1' });
    expect(result.isError).toBe(true);
  });

  it('query tool runs with mock pool', async () => {
    process.env.DATABASE_URL = 'postgresql://localhost/test';
    const result = await queryTool.handler({ sql: 'SELECT 1' }, { pool: mockPool });
    expect(result.content[0].text).toContain('"success": true');
  });
});

describe('server', () => {
  it('discovers three tools', async () => {
    const tools = await discoverTools();
    expect(tools.size).toBe(3);
  });

  it('handleToolCall rejects unknown tool', async () => {
    const tools = await discoverTools();
    const result = await handleToolCall(tools, 'missing');
    expect(result.isError).toBe(true);
  });
});
