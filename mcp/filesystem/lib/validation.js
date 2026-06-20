/**
 * Validation helpers for Filesystem MCP.
 */

import { z } from 'zod';

/**
 * @param {import('zod').ZodError} error
 */
export function formatZodError(error) {
  return error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
}

/**
 * @param {string} message
 * @param {Record<string, unknown>} [details]
 */
export function toolError(message, details = {}) {
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify({ success: false, error: message, ...details }, null, 2),
      },
    ],
  };
}

/**
 * @param {unknown} data
 */
export function toolSuccess(data) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ success: true, data }, null, 2),
      },
    ],
  };
}

export const readFileSchema = z.object({
  path: z.string().min(1),
  encoding: z.enum(['utf8', 'base64']).optional(),
});

export const writeFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  encoding: z.enum(['utf8', 'base64']).optional(),
  create_dirs: z.boolean().optional(),
});

export const listDirectorySchema = z.object({
  path: z.string().optional(),
  recursive: z.boolean().optional(),
  max_depth: z.number().int().min(0).max(10).optional(),
});

export const searchFilesSchema = z.object({
  pattern: z.string().min(1),
  path: z.string().optional(),
  max_results: z.number().int().positive().max(500).optional(),
});

export const fileInfoSchema = z.object({
  path: z.string().min(1),
});
