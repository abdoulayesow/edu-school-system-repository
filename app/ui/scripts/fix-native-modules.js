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

// Install ONLY the specific Linux binary packages, not the umbrella packages.
// This avoids npm's tree reconciliation which removes other packages.
const linuxBinaries = [
  'lightningcss-linux-x64-gnu',
  '@tailwindcss/oxide-linux-x64-gnu'
];

try {
  console.log(`[fix-native-modules] Installing Linux binaries: ${linuxBinaries.join(', ')}`);
  // Use --no-save --ignore-scripts to minimize side effects
  execSync(`npm install ${linuxBinaries.join(' ')} --no-save --ignore-scripts`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
  });
  console.log('[fix-native-modules] ✓ Linux binaries installed successfully');
} catch (error) {
  console.error('[fix-native-modules] ✗ Install failed:', error.message);
  process.exit(1);
}

console.log('[fix-native-modules] Done');
