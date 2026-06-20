/**
 * Read-only PostgreSQL client for Teknovo MCP.
 */

import pg from 'pg';
import { z } from 'zod';
import { logger } from './logger.js';

const { Pool } = pg;

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
});

/** @type {pg.Pool | null} */
let pool = null;

const READONLY_PATTERN = /^\s*(SELECT|WITH|SHOW|EXPLAIN(\s+\(ANALYZE\s*,?\s*BUFFERS\s*\))?|DESCRIBE)\b/i;
const BLOCKED_PATTERN = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|COPY\s+\S+\s+FROM)\b/i;

/**
 * @param {NodeJS.ProcessEnv} [env]
 */
export function validateEnv(env = process.env) {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    return {
      ok: false,
      error: 'DATABASE_URL is required. Copy .env.example to .env.',
      missing: result.error.issues.map((i) => i.path.join('.')),
    };
  }
  return { ok: true, env: { connectionString: result.data.DATABASE_URL } };
}

/**
 * @param {{ connectionString: string }} env
 * @param {{ pool?: pg.Pool }} [options]
 */
export function getPool(env, options = {}) {
  if (options.pool) return options.pool;
  if (!pool) {
    pool = new Pool({
      connectionString: env.connectionString,
      max: 5,
      statement_timeout: 30000,
      query_timeout: 30000,
      application_name: 'teknovo-postgres-mcp',
    });
  }
  return pool;
}

export function resetPool() {
  if (pool) {
    pool.end().catch(() => {});
    pool = null;
  }
}

/**
 * Validate SQL is read-only.
 * @param {string} sql
 */
export function assertReadOnly(sql) {
  const trimmed = sql.trim();
  if (BLOCKED_PATTERN.test(trimmed)) {
    throw new Error('Only read-only queries are allowed (SELECT, WITH, EXPLAIN, SHOW)');
  }
  if (!READONLY_PATTERN.test(trimmed)) {
    throw new Error('Query must start with SELECT, WITH, EXPLAIN, SHOW, or DESCRIBE');
  }
  if (trimmed.includes(';') && trimmed.indexOf(';') < trimmed.length - 1) {
    throw new Error('Multiple statements are not allowed');
  }
}

/**
 * @param {string} sql
 * @param {unknown[]} [params]
 * @param {{ pool?: pg.Pool, connectionString?: string }} [options]
 */
export async function runQuery(sql, params = [], options = {}) {
  assertReadOnly(sql);
  const envCheck = validateEnv();
  if (!envCheck.ok) throw new Error(envCheck.error);

  const db = getPool(envCheck.env, options);
  logger.debug('Executing read-only query', { sql: sql.slice(0, 80) });
  const result = await db.query(sql, params);
  return {
    rowCount: result.rowCount,
    fields: result.fields?.map((f) => ({ name: f.name, dataTypeID: f.dataTypeID })),
    rows: result.rows,
  };
}

/**
 * @param {string} [schemaName]
 * @param {{ pool?: pg.Pool }} [options]
 */
export async function listTables(schemaName = 'public', options = {}) {
  return runQuery(
    `SELECT table_schema, table_name, table_type
     FROM information_schema.tables
     WHERE table_schema = $1
     ORDER BY table_name`,
    [schemaName],
    options
  );
}

/**
 * @param {string} table
 * @param {string} [schemaName]
 * @param {{ pool?: pg.Pool }} [options]
 */
export async function describeTable(table, schemaName = 'public', options = {}) {
  const columns = await runQuery(
    `SELECT column_name, data_type, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2
     ORDER BY ordinal_position`,
    [schemaName, table],
    options
  );

  const constraints = await runQuery(
    `SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
     FROM information_schema.table_constraints tc
     LEFT JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
     WHERE tc.table_schema = $1 AND tc.table_name = $2`,
    [schemaName, table],
    options
  );

  return { table, schema: schemaName, columns: columns.rows, constraints: constraints.rows };
}
