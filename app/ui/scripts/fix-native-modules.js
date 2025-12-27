/**
 * Fix native modules for Linux platforms (CI, Vercel, etc.)
 *
 * The package-lock.json may be created on Windows and miss Linux binaries
 * for native modules like lightningcss and @tailwindcss/oxide.
 *
 * This script runs as postinstall to ensure correct binaries are installed.
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

console.log('[fix-native-modules] Detected Linux platform, checking native modules...');

const modulesToFix = ['lightningcss', '@tailwindcss/oxide'];

for (const moduleName of modulesToFix) {
  const modulePath = path.join(__dirname, '..', 'node_modules', moduleName);

  if (fs.existsSync(modulePath)) {
    console.log(`[fix-native-modules] Reinstalling ${moduleName} for Linux...`);
    try {
      // Remove the existing module
      execSync(`rm -rf "${modulePath}"`, { stdio: 'inherit' });
      // Reinstall it
      execSync(`npm install ${moduleName}`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });
      console.log(`[fix-native-modules] ✓ ${moduleName} reinstalled successfully`);
    } catch (error) {
      console.error(`[fix-native-modules] ✗ Failed to reinstall ${moduleName}:`, error.message);
    }
  } else {
    console.log(`[fix-native-modules] ${moduleName} not found in node_modules, skipping`);
  }
}

console.log('[fix-native-modules] Done');
