import { validateEnv, createClient, QdrantApiError } from '../lib/qdrant-client.js';
import { toolError, toolSuccess } from '../lib/validation.js';
import { logger } from '../lib/logger.js';

export const name = 'collection_list';

export const definition = {
  name,
  description: 'List Qdrant vector collections.',
  inputSchema: { type: 'object', properties: {} },
};

export async function handler(_args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    const result = await client.listCollections();
    return toolSuccess(result);
  } catch (err) {
    const message = err instanceof QdrantApiError ? err.message : 'Failed to list collections';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof QdrantApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
