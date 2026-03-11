#!/usr/bin/env node

import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '..');
const configsDir = resolve(rootDir, '.configs');
const defaultsDir = resolve(configsDir, 'defaults');
const secretsDir = resolve(rootDir, '.secrets');
const force = process.argv.includes('--force');
const localMongoPassword = 'password';

function generateSecretKey() {
  return randomBytes(32).toString('hex');
}

function setupConfigs() {
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
}

function setupSecrets() {
  if (!existsSync(secretsDir)) {
    console.error('Missing secrets directory: .secrets');
    process.exit(1);
  }

  const encryptionSecretFile = 'encryption.cipher.secret-key';
  const mongoPasswordFile = 'mongo.client.auth-password';
  const oauthSecretFile = 'oauth2.google.client-secret';

  const encryptionSecretPath = resolve(secretsDir, encryptionSecretFile);
  const mongoPasswordPath = resolve(secretsDir, mongoPasswordFile);
  const oauthSecretPath = resolve(secretsDir, oauthSecretFile);

  writeFileSync(encryptionSecretPath, `${generateSecretKey()}\n`, 'utf-8');

  const created = [encryptionSecretFile];
  const updated = [];
  const skipped = [];

  if (!existsSync(mongoPasswordPath)) {
    writeFileSync(mongoPasswordPath, `${localMongoPassword}\n`, 'utf-8');
    created.push(mongoPasswordFile);
  } else if (force) {
    writeFileSync(mongoPasswordPath, `${localMongoPassword}\n`, 'utf-8');
    updated.push(mongoPasswordFile);
  } else {
    skipped.push(mongoPasswordFile);
  }

  if (!existsSync(oauthSecretPath)) {
    writeFileSync(oauthSecretPath, '', 'utf-8');
    created.push(oauthSecretFile);
  } else if (force) {
    writeFileSync(oauthSecretPath, '', 'utf-8');
    updated.push(oauthSecretFile);
  } else {
    skipped.push(oauthSecretFile);
  }

  console.log(`Initialized secrets in ${secretsDir}`);
  console.log(`Created: ${created.length}`);
  console.log(`Updated: ${updated.length}`);
  console.log(`Skipped: ${skipped.length}`);

  if (created.length > 0) {
    console.log(`Created/rotated files: ${created.join(', ')}`);
  }

  if (updated.length > 0) {
    console.log(`Updated files: ${updated.join(', ')}`);
  }

  if (skipped.length > 0) {
    console.log(`Skipped files (already exist): ${skipped.join(', ')}`);
  }
}

setupConfigs();
console.log('');
setupSecrets();
