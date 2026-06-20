/**
 * Validation helpers for Git MCP.
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

export const gitDiffSchema = z.object({
  staged: z.boolean().optional(),
  path: z.string().optional(),
});

export const gitLogSchema = z.object({
  max_count: z.number().int().positive().max(100).optional(),
  oneline: z.boolean().optional(),
});

export const gitCommitSchema = z.object({
  message: z.string().min(1),
  paths: z.array(z.string()).optional(),
});

export const gitPushSchema = z.object({
  remote: z.string().optional(),
  branch: z.string().optional(),
  set_upstream: z.boolean().optional(),
});

export const gitBranchCreateSchema = z.object({
  name: z.string().min(1),
  start_point: z.string().optional(),
  checkout: z.boolean().optional(),
});
