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

// On Vercel, skip during postinstall - will run in build command instead
// Running npm install during postinstall causes OOM, but after install completes it's fine
const isPostInstall = !process.env.FIX_NATIVE_MODULES_BUILD;
if (process.env.VERCEL && isPostInstall) {
  console.log('[fix-native-modules] Skipping during postinstall on Vercel (will run in build)');
  process.exit(0);
}

console.log('[fix-native-modules] Detected Linux platform, fixing native modules...');

// Include all CSS-related packages to prevent npm from removing dependencies
// when installing native modules (npm tree reconciliation can remove packages)
const modulesToFix = [
  'lightningcss',
  '@tailwindcss/oxide',
  '@tailwindcss/postcss',
  'tailwindcss',
  'postcss'
];

// Reinstall modules to get correct platform binaries
// npm rebuild doesn't help when binaries are missing from package-lock.json
try {
  console.log(`[fix-native-modules] Installing: ${modulesToFix.join(', ')}`);
  // Use --legacy-peer-deps to minimize tree changes
  execSync(`npm install ${modulesToFix.join(' ')} --no-save --legacy-peer-deps`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });
  console.log('[fix-native-modules] ✓ Native modules installed successfully');
} catch (error) {
  console.error('[fix-native-modules] ✗ Install failed:', error.message);
  process.exit(1);
}

console.log('[fix-native-modules] Done');
