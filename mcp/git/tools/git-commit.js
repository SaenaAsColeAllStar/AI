import { validateEnv, runGit } from '../lib/git-runner.js';
import { gitCommitSchema, formatZodError, toolError, toolSuccess } from '../lib/validation.js';

export const name = 'git_commit';

export const definition = {
  name,
  description: 'Stage paths and create a git commit.',
  inputSchema: {
    type: 'object',
    properties: {
      message: { type: 'string', description: 'Commit message' },
      paths: { type: 'array', items: { type: 'string' }, description: 'Paths to stage (default: all)' },
    },
    required: ['message'],
  },
};

export async function handler(args) {
  const envCheck = validateEnv();
  if (!envCheck.ok) return toolError(envCheck.error);

  const parsed = gitCommitSchema.safeParse(args);
  if (!parsed.success) return toolError(formatZodError(parsed.error));

  try {
    if (parsed.data.paths?.length) {
      runGit(['add', '--', ...parsed.data.paths]);
    } else {
      runGit(['add', '-A']);
    }
    const output = runGit(['commit', '-m', parsed.data.message]);
    return toolSuccess({ output });
  } catch (err) {
    return toolError(err instanceof Error ? err.message : 'git commit failed');
  }
}

export default { name, definition, handler };
