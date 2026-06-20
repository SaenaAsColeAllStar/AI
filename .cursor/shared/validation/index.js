/**
 * Platform validation — Zod schemas and MCP response helpers.
 */

import { z } from 'zod';
export { z };
export {
  formatZodError,
  toolError,
  toolSuccess,
  maskCredentialSummary,
} from '../../mcp/shared/validation.js';

export const taskSchema = z.object({
  id: z.string().min(1).optional(),
  description: z.string().min(1),
  domain: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  parallel: z.boolean().optional(),
});

export const agentRouteSchema = z.object({
  agentId: z.string().min(1),
  score: z.number().min(0),
  matchedKeywords: z.array(z.string()),
});

export const workflowStepSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  action: z.function(),
  retries: z.number().int().min(0).max(10).optional(),
  timeoutMs: z.number().int().positive().optional(),
});

/**
 * @param {import('zod').ZodSchema} schema
 * @param {unknown} data
 */
export function validateOrThrow(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(message);
  }
  return result.data;
}
