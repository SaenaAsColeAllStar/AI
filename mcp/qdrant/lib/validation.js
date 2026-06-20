/**
 * Validation helpers for Qdrant MCP.
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

export const searchSchema = z.object({
  collection: z.string().min(1),
  vector: z.array(z.number()),
  limit: z.number().int().positive().max(100).optional(),
  score_threshold: z.number().optional(),
  filter: z.record(z.unknown()).optional(),
});

export const upsertSchema = z.object({
  collection: z.string().min(1),
  points: z.array(
    z.object({
      id: z.union([z.string(), z.number()]),
      vector: z.array(z.number()),
      payload: z.record(z.unknown()).optional(),
    })
  ).min(1),
});
