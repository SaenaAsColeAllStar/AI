/**
 * Shared validation helpers for Teknovo MCP tool responses.
 */

/**
 * Format Zod errors into a readable string.
 * @param {import('zod').ZodError} error
 * @returns {string}
 */
export function formatZodError(error) {
  return error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
}

/**
 * Safe MCP tool error response.
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
 * Safe MCP tool success response.
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

/**
 * Mask sensitive fields before returning credential summaries to callers.
 * @param {Record<string, unknown>} data
 * @returns {Record<string, unknown>}
 */
export function maskCredentialSummary(data) {
  /** @type {Record<string, unknown>} */
  const out = { ...data };
  for (const key of Object.keys(out)) {
    const lower = key.toLowerCase();
    if (lower.includes('token') || lower.includes('secret') || lower.includes('key')) {
      out[key] = '***MASKED***';
    }
  }
  return out;
}
