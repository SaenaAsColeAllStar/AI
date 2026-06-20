#!/usr/bin/env node
/**
 * Teknovo Cloudflare MCP Server
 * Automatic tool discovery from tools/ directory.
 */

import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import dotenv from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { configureLogger, logger } from './lib/logger.js';
import { loadCloudflareSecrets } from '../shared/secrets.js';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, '.env') });
loadCloudflareSecrets();

try {
  const config = JSON.parse(readFileSync(join(__dirname, 'config', 'cloudflare.json'), 'utf8'));
  configureLogger(config.logging ?? {});
} catch {
  configureLogger({});
}

/**
 * Discover and load all tool modules from tools/ directory.
 * @returns {Promise<Map<string, { definition: object, handler: Function }>>}
 */
export async function discoverTools(toolsDir = join(__dirname, 'tools')) {
  const files = readdirSync(toolsDir).filter((f) => f.endsWith('.js'));
  /** @type {Map<string, { definition: object, handler: Function }>} */
  const tools = new Map();

  for (const file of files) {
    const modulePath = pathToFileURL(join(toolsDir, file)).href;
    try {
      const mod = await import(modulePath);
      const toolName = mod.name ?? mod.default?.name;
      const definition = mod.definition ?? mod.default?.definition;
      const handler = mod.handler ?? mod.default?.handler;

      if (!toolName || !definition || typeof handler !== 'function') {
        logger.warn('Skipping invalid tool module', { file });
        continue;
      }

      tools.set(toolName, { definition, handler });
      logger.debug('Discovered tool', { name: toolName, file });
    } catch (err) {
      logger.warn('Failed to load tool module', {
        file,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return tools;
}

/**
 * Create and configure MCP server instance.
 * @param {Map<string, { definition: object, handler: Function }>} tools
 */
export function createMcpServer(tools) {
  const server = new Server(
    {
      name: 'teknovo-cloudflare-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Array.from(tools.values()).map((t) => t.definition),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) =>
    handleToolCall(tools, request.params.name, request.params.arguments ?? {})
  );

  return server;
}

/**
 * Handle a tool call (exported for testing).
 * @param {Map<string, { definition: object, handler: Function }>} tools
 * @param {string} toolName
 * @param {Record<string, unknown>} [args]
 */
export async function handleToolCall(tools, toolName, args = {}) {
  const tool = tools.get(toolName);

  if (!tool) {
    return {
      isError: true,
      content: [{ type: 'text', text: JSON.stringify({ success: false, error: `Unknown tool: ${toolName}` }) }],
    };
  }

  try {
    return await tool.handler(args);
  } catch (err) {
    logger.error('Unhandled tool error', {
      tool: toolName,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: err instanceof Error ? err.message : 'Internal tool error',
          }),
        },
      ],
    };
  }
}

async function main() {
  const tools = await discoverTools();
  logger.info('Starting teknovo-cloudflare-mcp', { toolCount: tools.size });

  const server = createMcpServer(tools);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  main().catch((err) => {
    logger.error('Fatal server error', { error: err instanceof Error ? err.message : String(err) });
    process.exit(1);
  });
}
