/**
 * MCP tool: create_repository — canonical alias for repo_create
 */

import * as repoCreate from './repo-create.js';

export const name = 'create_repository';

export const definition = {
  ...repoCreate.definition,
  name: 'create_repository',
  description: 'Create a new GitHub repository under the user or organization.',
};

export const handler = repoCreate.handler;
export default { name, definition, handler };
