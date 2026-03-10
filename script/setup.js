#!/usr/bin/env node

import { copyFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '..');
const configsDir = resolve(rootDir, '.configs');
const defaultsDir = resolve(configsDir, 'defaults');
const force = process.argv.includes('--force');

if (!existsSync(defaultsDir)) {
  console.error('Missing defaults directory: .configs/defaults');
  process.exit(1);
}

const files = readdirSync(defaultsDir).filter((fileName) => {
  const sourcePath = resolve(defaultsDir, fileName);
  return statSync(sourcePath).isFile();
});

if (files.length === 0) {
  console.error('No default config files found in .configs/defaults');
  process.exit(1);
}

const created = [];
const updated = [];
const skipped = [];

for (const fileName of files) {
  const sourcePath = resolve(defaultsDir, fileName);
  const targetPath = resolve(configsDir, fileName);
  const targetExists = existsSync(targetPath);

  if (targetExists && !force) {
    skipped.push(fileName);
    continue;
  }

  copyFileSync(sourcePath, targetPath);

  if (targetExists) {
    updated.push(fileName);
  } else {
    created.push(fileName);
  }
}

console.log(`Initialized configs from ${defaultsDir}`);
console.log(`Created: ${created.length}`);
console.log(`Updated: ${updated.length}`);
console.log(`Skipped: ${skipped.length}`);

if (created.length > 0) {
  console.log(`Created files: ${created.join(', ')}`);
}

if (updated.length > 0) {
  console.log(`Updated files: ${updated.join(', ')}`);
}

if (skipped.length > 0) {
  console.log(`Skipped files (already exist): ${skipped.join(', ')}`);
}
