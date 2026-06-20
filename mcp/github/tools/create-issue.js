/**
 * MCP tool: create_issue — canonical alias for issue_create
 */

import * as issueCreate from './issue-create.js';

export const name = 'create_issue';

export const definition = {
  ...issueCreate.definition,
  name: 'create_issue',
  description: 'Create a GitHub issue.',
};

export const handler = issueCreate.handler;
export default { name, definition, handler };
