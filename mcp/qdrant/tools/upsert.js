import { validateEnv, createClient, QdrantApiError } from '../lib/qdrant-client.js';
import { upsertSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';
import { logger } from '../lib/logger.js';

export const name = 'upsert';

export const definition = {
  name,
  description: 'Upsert vector points into a Qdrant collection.',
  inputSchema: {
    type: 'object',
    properties: {
      collection: { type: 'string', description: 'Collection name' },
      points: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: ['string', 'number'] },
            vector: { type: 'array', items: { type: 'number' } },
            payload: { type: 'object' },
          },
          required: ['id', 'vector'],
        },
      },
    },
    required: ['collection', 'points'],
  },
};

export async function handler(args, ctx = {}) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error, { missing: envCheck.missing });

  const parsed = upsertSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const client = ctx.client ?? createClient(envCheck.env);
    const result = await client.upsert(parsed.data.collection, parsed.data.points);
    return toolSuccess(result ?? { upserted: parsed.data.points.length });
  } catch (err) {
    const message = err instanceof QdrantApiError ? err.message : 'Upsert failed';
    logger.error(message, { error: err instanceof Error ? err.message : String(err) });
    return toolError(message, err instanceof QdrantApiError ? { details: err.details } : {});
  }
}

export default { name, definition, handler };
