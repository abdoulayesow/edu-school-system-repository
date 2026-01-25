#!/usr/bin/env node
/**
 * Conditionally generate Prisma client only if schema has changed
 * This saves ~7 seconds on builds when schema is unchanged
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const SCHEMA_PATH = path.join(__dirname, '../../db/prisma/schema.prisma');
const HASH_FILE = path.join(__dirname, '../../db/.prisma-schema-hash');
const PRISMA_CLIENT_PATH = path.join(__dirname, '../../../node_modules/@prisma/client');

function getFileHash(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (err) {
    return null;
  }
}

function shouldRegenerate() {
  // Always regenerate if Prisma client doesn't exist
  if (!fs.existsSync(PRISMA_CLIENT_PATH)) {
    console.log('Prisma client not found, generating...');
    return true;
  }

  const currentHash = getFileHash(SCHEMA_PATH);
  const previousHash = fs.existsSync(HASH_FILE)
    ? fs.readFileSync(HASH_FILE, 'utf8').trim()
    : null;

  if (currentHash !== previousHash) {
    console.log('Schema changed, regenerating Prisma client...');
    return true;
  }

  console.log('Schema unchanged, skipping Prisma generation (saves ~7s)');
  return false;
}

try {
  if (shouldRegenerate()) {
    // Run Prisma generate from the db directory
    const dbPath = path.join(__dirname, '../../db');
    const isWindows = process.platform === 'win32';
    const cmd = isWindows
      ? `cd /d "${dbPath}" && npx prisma generate`
      : `cd "${dbPath}" && npx prisma generate`;

    execSync(cmd, {
      stdio: 'inherit',
      shell: true
    });

    // Save new hash
    const newHash = getFileHash(SCHEMA_PATH);
    if (newHash) {
      fs.writeFileSync(HASH_FILE, newHash);
    }
  }
} catch (error) {
  console.error('Prisma generation failed:', error.message);
  process.exit(1);
}
