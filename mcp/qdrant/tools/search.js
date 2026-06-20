import { validateEnv, createClient, QdrantApiError } from '../lib/qdrant-client.js';
import { searchSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';
import { logger } from '../lib/logger.js';

export const name = 'search';

export const definition = {
  name,
  description: 'Search vectors in a Qdrant collection.',
  inputSchema: {
    type: 'object',
    properties: {
      collection: { type: 'string', description: 'Collection name' },
      vector: { type: 'array', items: { type: 'number' }, description: 'Query vector' },
      limit: { type: 'number', description: 'Max results (default 10)' },
      score_threshold: { type: 'number', description: 'Minimum score threshold' },
      filter: { type: 'object', description: 'Qdrant filter object' },
    },
    required: ['collection', 'vector'],
  },
};

export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = searchSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    const result = await client.search(parsed.data.collection, parsed.data.vector, {
      limit: parsed.data.limit,
      score_threshold: parsed.data.score_threshold,
      filter: parsed.data.filter,
    });
    return toolSuccess(result);
  } catch (err) {
    const message = err instanceof QdrantApiError ? err.message : 'Search failed';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof QdrantApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
