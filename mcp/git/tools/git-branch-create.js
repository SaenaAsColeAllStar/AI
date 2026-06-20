import { validateEnv, runGit } from '../lib/git-runner.js';
import { gitBranchCreateSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';

export const name = 'git_branch_create';

export const definition = {
  name,
  description: 'Create a new git branch.',
  inputSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Branch name' },
      start_point: { type: 'string', description: 'Start point ref' },
      checkout: { type: 'boolean', description: 'Checkout after create' },
    },
    required: ['name'],
  },
};

export async function handler(args) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error);

  const parsed = gitBranchCreateSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    const cmd = ['branch', parsed.data.name];
    if (parsed.data.start_point) cmd.push(parsed.data.start_point);
    const output = runGit(cmd);
    if (parsed.data.checkout) {
      runGit(['checkout', parsed.data.name]);
    }
    return toolSuccess({ output, branch: parsed.data.name });
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'git branch create failed');
  }
}

export default { name, definition, handler };
