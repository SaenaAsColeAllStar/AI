#!/usr/bin/env node
import { readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sharedRoot = join(root, '..', 'shared');

/** @type {string[]} */
const files = [
  join(root, 'server.js'),
  join(root, 'lib', 'cloudflare-client.js'),
  join(root, 'lib', 'pages-api.js'),
  join(root, 'lib', 'dns-api.js'),
  join(root, 'lib', 'domain-api.js'),
  join(root, 'lib', 'validation.js'),
  join(root, 'lib', 'logger.js'),
  join(sharedRoot, 'secrets.js'),
  join(sharedRoot, 'logger.js'),
  join(sharedRoot, 'validation.js'),
  ...readdirSync(join(root, 'tools'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => join(root, 'tools', f)),
];

let failed = false;
for (const file of files) {
  try {
    execSync(`node --check "${file}"`, { stdio: 'pipe' });
    console.error(`OK ${relative(join(root, '..'), file)}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL ${relative(join(root, '..'), file)}: ${err instanceof Error ? err.message : err}`);
  }
}

process.exit(failed ? 1 : 0);
