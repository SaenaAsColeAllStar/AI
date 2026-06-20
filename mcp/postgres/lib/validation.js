/**
 * Validation helpers for Postgres MCP.
 */

import { z } from 'zod';

export function formatZodError(error) {
  return error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
}

export function toolError(message, details = {}) {
  return {
    isError: true,
    content: [{ type: 'text', text: JSON.stringify({ success: false, error: message, ...details }, null, 2) }],
  };
}

export function toolSuccess(data) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ success: true, data }, null, 2) }],
  };
}

export const querySchema = z.object({
  sql: z.string().min(1),
  params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  limit: z.number().int().positive().max(1000).optional(),
});

export const describeTableSchema = z.object({
  table: z.string().min(1),
  schema: z.string().optional(),
});

export const listTablesSchema = z.object({
  schema: z.string().optional(),
});
