/**
 * MCP tool: list_pull_requests — canonical alias for pr_list
 */

import * as prList from './pr-list.js';

export const name = 'list_pull_requests';

export const definition = {
  ...prList.definition,
  name: 'list_pull_requests',
  description: 'List pull requests for a repository.',
};

export const handler = prList.handler;
export default { name, definition, handler };
