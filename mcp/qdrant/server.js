#!/usr/bin/env node
/**
 * Teknovo Qdrant MCP Server
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

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });
configureLogger({});

export async function discoverTools(toolsDir = join(__dirname, 'tools')) {
  const files = readdirSync(toolsDir).filter((f) => f.endsWith('.js'));
  /** @type {Map<string, { definition: object, handler: Function }>} */
  const tools = new Map();
  for (const file of files) {
    const mod = await import(pathToFileURL(join(toolsDir, file)).href);
    const toolName = mod.name ?? mod.default?.name;
    const definition = mod.definition ?? mod.default?.definition;
    const handler = mod.handler ?? mod.default?.handler;
    if (toolName && definition && typeof handler === 'function') {
      tools.set(toolName, { definition, handler });
    }
  }
  return tools;
}

export function createMcpServer(tools) {
  const server = new Server(
    { name: 'teknovo-qdrant-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Array.from(tools.values()).map((t) => t.definition),
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request) =>
    handleToolCall(tools, request.params.name, request.params.arguments ?? {})
  );
  return server;
}

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
  logger.info('Starting teknovo-qdrant-mcp', { toolCount: tools.size });
  await createMcpServer(tools).connect(new StdioServerTransport());
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((err) => {
    logger.error('Fatal server error', { error: err instanceof Error ? err.message : String(err) });
    process.exit(1);
  });
}
