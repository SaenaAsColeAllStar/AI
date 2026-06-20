/**
 * MCP tool: create_pull_request — canonical alias for pr_create
 */

import * as prCreate from './pr-create.js';

export const name = 'create_pull_request';

export const definition = {
  ...prCreate.definition,
  name: 'create_pull_request',
  description: 'Create a pull request.',
};

export const handler = prCreate.handler;
export default { name, definition, handler };
