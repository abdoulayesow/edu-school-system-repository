/**
 * Fix native modules for Linux platforms (CI, Vercel, etc.)
 *
 * The package-lock.json may be created on Windows and miss Linux binaries
 * for native modules like lightningcss and @tailwindcss/oxide.
 *
 * This script runs as postinstall to ensure correct binaries are installed.
 * Uses npm rebuild (memory-efficient) instead of rm + npm install.
 */

const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const platform = os.platform();

// Only run on Linux (CI, Vercel, Docker, etc.)
if (platform !== 'linux') {
  console.log(`[fix-native-modules] Skipping on ${platform} (only runs on Linux)`);
  process.exit(0);
}

// Skip on Vercel - they handle platform-specific binaries correctly
// Running npm commands during postinstall causes OOM on Vercel's 8GB build machines
if (process.env.VERCEL) {
  console.log('[fix-native-modules] Skipping on Vercel (native binaries installed correctly)');
  process.exit(0);
}

console.log('[fix-native-modules] Detected Linux platform, rebuilding native modules...');

const modulesToFix = ['lightningcss', '@tailwindcss/oxide'];
const modulesToRebuild = [];

// Check which modules exist and need rebuilding
for (const moduleName of modulesToFix) {
  const modulePath = path.join(__dirname, '..', 'node_modules', moduleName);
  if (fs.existsSync(modulePath)) {
    modulesToRebuild.push(moduleName);
  } else {
    console.log(`[fix-native-modules] ${moduleName} not found, skipping`);
  }
}

if (modulesToRebuild.length === 0) {
  console.log('[fix-native-modules] No modules to rebuild');
  process.exit(0);
}

// Rebuild all modules in a single command (more memory efficient)
try {
  console.log(`[fix-native-modules] Rebuilding: ${modulesToRebuild.join(', ')}`);
  execSync(`npm rebuild ${modulesToRebuild.join(' ')}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });
  console.log('[fix-native-modules] ✓ Rebuild completed successfully');
} catch (error) {
  console.error('[fix-native-modules] ✗ Rebuild failed:', error.message);
  // Don't exit with error - the build might still work
}

console.log('[fix-native-modules] Done');
