/* eslint-disable no-console */
const fs = require("fs")
const path = require("path")
const { spawnSync } = require("child_process")

function copySchema() {
  const src = path.join(__dirname, "..", "..", "db", "prisma", "schema.prisma")
  const destDir = path.join(__dirname, "..", "prisma")
  const dest = path.join(destDir, "schema.prisma")

  if (!fs.existsSync(src)) {
    throw new Error(`Prisma schema not found at ${src}`)
  }

  fs.mkdirSync(destDir, { recursive: true })
  fs.copyFileSync(src, dest)
  console.log(`[prisma-generate] Copied schema to ${dest}`)
}

function runPrismaGenerate() {
  // IMPORTANT: In this monorepo, npm workspaces may hoist @prisma/client to the repo root.
  // Next.js will then resolve @prisma/client from the workspace root node_modules.
  // So we must run `prisma generate` with cwd=repo root to generate into that same location.

  const repoRoot = path.join(__dirname, "..", "..", "..")

  const schemaPath = path.join(repoRoot, "app", "ui", "prisma", "schema.prisma")

  // Use npm exec so the repo-root toolchain resolves the prisma CLI consistently.
  // On Windows, spawnSync('npm.cmd', ...) can fail with EINVAL in some Node setups,
  // so we invoke it through cmd.exe.
  const npmArgs = [
    "exec",
    "--",
    "prisma",
    "generate",
    "--schema",
    // Use a relative path from repo root for consistency across shells.
    "app/ui/prisma/schema.prisma",
  ]

  const command = process.platform === "win32" ? "cmd.exe" : "npm"
  const args = process.platform === "win32" ? ["/d", "/s", "/c", "npm", ...npmArgs] : npmArgs

  const result = spawnSync(command, args, {
    stdio: "inherit",
    cwd: repoRoot,
  })

  if (result.error) {
    console.error("[prisma-generate] Failed to run prisma:", result.error)
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

copySchema()
runPrismaGenerate()
