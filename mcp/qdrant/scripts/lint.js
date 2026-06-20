#!/usr/bin/env node
import { readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
/** @type {string[]} */
const files = [
  join(root, 'server.js'),
  ...readdirSync(join(root, 'lib')).filter((f) => f.endsWith('.js')).map((f) => join(root, 'lib', f)),
  ...readdirSync(join(root, 'tools')).filter((f) => f.endsWith('.js')).map((f) => join(root, 'tools', f)),
];
let failed = false;
for (const file of files) {
  try {
    execSync(`node --check "${file}"`, { stdio: 'pipe' });
    console.error(`OK ${relative(root, file)}`);
  } catch {
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
